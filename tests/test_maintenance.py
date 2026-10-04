"""Renamed entities follow automatically; orphaned settings become a repair."""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path

import yaml
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from custom_components.dwains_dashboard.maintenance import (
    ORPHAN_ISSUE_ID,
    STARTUP_CHECK_DELAY,
    async_update_orphan_issue,
)

DOMAIN = "dwains_dashboard"


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def _read(path: Path):
    return yaml.safe_load(path.read_text())


async def test_renamed_entity_takes_its_settings_along(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "light", "test", "lamp-1", suggested_object_id="old_lamp"
    )
    assert entry.entity_id == "light.old_lamp"
    _write(configs / "entities.yaml", "light.old_lamp:\n  favorite: true\nlight.other:\n  hidden: true\n")
    _write(configs / "cards/entities/light.old_lamp.yaml", "type: tile\n")
    _write(configs / "cards/entities_popup/light.old_lamp.yaml", "type: entities\n")
    _write(
        configs / "settings.yaml",
        "area_binary_sensor_entities: [light.old_lamp]\nalarm_entity: light.old_lamp\n",
    )

    registry.async_update_entity("light.old_lamp", new_entity_id="light.new_lamp")
    await hass.async_block_till_done()

    entities = _read(configs / "entities.yaml")
    assert list(entities) == ["light.new_lamp", "light.other"]
    assert entities["light.new_lamp"] == {"favorite": True}
    assert (configs / "cards/entities/light.new_lamp.yaml").exists()
    assert not (configs / "cards/entities/light.old_lamp.yaml").exists()
    assert (configs / "cards/entities_popup/light.new_lamp.yaml").exists()
    settings = _read(configs / "settings.yaml")
    assert settings["area_binary_sensor_entities"] == ["light.new_lamp"]
    assert settings["alarm_entity"] == "light.new_lamp"


async def test_rename_never_overwrites_settings_of_the_new_id(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    registry = er.async_get(hass)
    registry.async_get_or_create("light", "test", "lamp-2", suggested_object_id="a")
    _write(configs / "entities.yaml", "light.a:\n  favorite: true\nlight.b:\n  hidden: true\n")
    _write(configs / "cards/entities/light.a.yaml", "type: tile\n")
    _write(configs / "cards/entities/light.b.yaml", "type: button\n")

    registry.async_update_entity("light.a", new_entity_id="light.b")
    await hass.async_block_till_done()

    assert _read(configs / "entities.yaml")["light.b"] == {"hidden": True}
    assert _read(configs / "cards/entities/light.b.yaml") == {"type": "button"}


def _orphan_fixture(hass: HomeAssistant, configs: Path) -> None:
    registry = er.async_get(hass)
    registry.async_get_or_create(
        "light", "test", "disabled", suggested_object_id="disabled",
        disabled_by=er.RegistryEntryDisabler.USER,
    )
    hass.states.async_set("sensor.yaml_only", "1")
    ar.async_get(hass).async_create("Kitchen")
    _write(
        configs / "entities.yaml",
        "light.disabled:\n  hidden: true\n"
        "sensor.yaml_only:\n  favorite: true\n"
        "light.gone:\n  favorite: true\n",
    )
    _write(configs / "cards/entities/light.gone.yaml", "type: tile\n")
    _write(configs / "cards/entities/sensor.yaml_only.yaml", "type: tile\n")
    _write(configs / "areas.yaml", "kitchen:\n  icon: mdi:fridge\nwhirlpool:\n  disabled: true\n")
    _write(configs / "cards/areas/whirlpool/markdown.yaml", "type: markdown\ncontent: x\n")
    _write(configs / "cards/areas/kitchen/markdown.yaml", "type: markdown\ncontent: x\n")
    _write(
        configs / "settings.yaml",
        "area_sensor_entities: [sensor.yaml_only, sensor.gone]\nweather_entity: weather.gone\n",
    )


async def test_orphan_rules_and_repair_issue(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    _orphan_fixture(hass, configs)
    issues = ir.async_get(hass)
    assert issues.async_get_issue(DOMAIN, ORPHAN_ISSUE_ID) is None

    # The check only runs once startup has settled.
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=STARTUP_CHECK_DELAY + 1))
    await hass.async_block_till_done()

    issue = issues.async_get_issue(DOMAIN, ORPHAN_ISSUE_ID)
    assert issue is not None
    assert issue.is_fixable
    # light.gone (setting + card), whirlpool (setting + card folder), sensor.gone
    assert issue.translation_placeholders == {"count": "5"}

    report = await async_update_orphan_issue(hass)
    assert report.as_dict() == {
        "entities": ["light.gone"],
        "entity_cards": ["light.gone"],
        "entity_popups": [],
        "settings_entities": ["sensor.gone"],
        "areas": ["whirlpool"],
        "area_card_folders": ["whirlpool"],
    }


async def test_fix_flow_backs_up_and_removes(
    hass: HomeAssistant, setup_dashboard, config_path, hass_client
) -> None:
    assert await async_setup_component(hass, "repairs", {})
    configs = config_path("dwains-dashboard/configs")
    _orphan_fixture(hass, configs)
    await async_update_orphan_issue(hass)

    client = await hass_client()
    response = await client.post(
        "/api/repairs/issues/fix", json={"handler": DOMAIN, "issue_id": ORPHAN_ISSUE_ID}
    )
    assert response.status == 200, await response.text()
    flow = await response.json()
    assert flow["step_id"] == "confirm"
    assert flow["description_placeholders"]["count"] == "5"
    assert "`light.gone` – entities.yaml, cards/entities/" in flow["description_placeholders"]["items"]
    assert "`whirlpool` – areas.yaml, cards/areas/" in flow["description_placeholders"]["items"]

    response = await client.post(f"/api/repairs/issues/fix/{flow['flow_id']}", json={})
    assert response.status == 200, await response.text()
    result = await response.json()
    assert result["type"] == "create_entry"
    await hass.async_block_till_done()

    entities = _read(configs / "entities.yaml")
    assert set(entities) == {"light.disabled", "sensor.yaml_only"}
    assert not (configs / "cards/entities/light.gone.yaml").exists()
    assert (configs / "cards/entities/sensor.yaml_only.yaml").exists()
    assert list(_read(configs / "areas.yaml")) == ["kitchen"]
    assert not (configs / "cards/areas/whirlpool").exists()
    assert (configs / "cards/areas/kitchen/markdown.yaml").exists()
    settings = _read(configs / "settings.yaml")
    assert settings["area_sensor_entities"] == ["sensor.yaml_only"]
    assert settings["weather_entity"] == "weather.gone"  # single choices stay

    backups = list(config_path("dwains-dashboard/backups").iterdir())
    assert len(backups) == 1
    backup = backups[0]
    assert "light.gone" in _read(backup / "entities.yaml")
    assert (backup / "cards/entities/light.gone.yaml").exists()
    assert (backup / "cards/areas/whirlpool/markdown.yaml").exists()
    assert "whirlpool" in _read(backup / "areas.yaml")

    assert ir.async_get(hass).async_get_issue(DOMAIN, ORPHAN_ISSUE_ID) is None


async def test_no_issue_without_orphans(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    ir.async_get(hass)
    await async_update_orphan_issue(hass)
    assert ir.async_get(hass).async_get_issue(DOMAIN, ORPHAN_ISSUE_ID) is None
