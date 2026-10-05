"""Renamed entities follow automatically; orphaned settings can be cleaned up."""

from __future__ import annotations

from pathlib import Path

import yaml

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir

from custom_components.dwains_dashboard.maintenance import async_find_orphans

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
    _write(configs / "areas.yaml", "living:\n  graph_entity: light.old_lamp\n  graph_hours: 24\n")

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
    assert _read(configs / "areas.yaml")["living"]["graph_entity"] == "light.new_lamp"


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


async def test_orphan_rules(hass: HomeAssistant, setup_dashboard, config_path) -> None:
    _orphan_fixture(hass, config_path("dwains-dashboard/configs"))
    report = await async_find_orphans(hass)
    assert report.as_dict() == {
        "entities": ["light.gone"],
        "entity_cards": ["light.gone"],
        "entity_popups": [],
        "settings_entities": ["sensor.gone"],
        "areas": ["whirlpool"],
        "area_card_folders": ["whirlpool"],
        "area_entities": [],
    }
    # No repair issue: the cleanup lives in the dashboard settings.
    assert not [
        issue for (domain, _), issue in ir.async_get(hass).issues.items() if domain == DOMAIN
    ]


async def _open_cleanup(hass: HomeAssistant, entry_id: str) -> dict:
    result = await hass.config_entries.options.async_init(entry_id)
    assert result["type"] == "menu"
    return await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "cleanup"}
    )


async def test_cleanup_in_dashboard_settings(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    _orphan_fixture(hass, configs)

    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    assert result["description_placeholders"] == {"orphans": "5"}

    result = await _open_cleanup(hass, setup_dashboard.entry_id)
    assert result["type"] == "form"
    assert result["step_id"] == "cleanup"
    placeholders = result["description_placeholders"]
    assert placeholders["count"] == "5"
    assert "`light.gone` – entities.yaml, cards/entities/" in placeholders["items"]
    assert "`whirlpool` – areas.yaml, cards/areas/" in placeholders["items"]

    # Without the confirmation nothing happens.
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"confirm": False}
    )
    assert result["errors"] == {"base": "confirm_required"}
    assert "light.gone" in _read(configs / "entities.yaml")

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"confirm": True}
    )
    assert result["type"] == "abort"
    assert result["reason"] == "cleanup_done"
    assert result["description_placeholders"]["removed"] == "5"
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
    assert result["description_placeholders"]["backup"].endswith(backup.name)
    assert "light.gone" in _read(backup / "entities.yaml")
    assert (backup / "cards/entities/light.gone.yaml").exists()
    assert (backup / "cards/areas/whirlpool/markdown.yaml").exists()
    assert "whirlpool" in _read(backup / "areas.yaml")
    # The options themselves are untouched by a cleanup.
    assert setup_dashboard.options == {}


async def test_cleanup_without_orphans(
    hass: HomeAssistant, setup_dashboard
) -> None:
    result = await _open_cleanup(hass, setup_dashboard.entry_id)
    assert result["type"] == "abort"
    assert result["reason"] == "nothing_to_clean"


async def test_area_sensor_lists_follow_renames_and_cleanup(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    ar.async_get(hass).async_create("Living")
    registry = er.async_get(hass)
    registry.async_get_or_create("sensor", "test", "t-1", suggested_object_id="old_temp")
    _write(
        configs / "areas.yaml",
        "living:\n  sensor_entities: [sensor.old_temp, sensor.gone]\n"
        "  binary_sensor_entities: [binary_sensor.gone_too]\n",
    )

    registry.async_update_entity("sensor.old_temp", new_entity_id="sensor.new_temp")
    await hass.async_block_till_done()
    assert _read(configs / "areas.yaml")["living"]["sensor_entities"] == [
        "sensor.new_temp",
        "sensor.gone",
    ]

    report = await async_find_orphans(hass)
    assert report.area_entities == ["binary_sensor.gone_too", "sensor.gone"]

    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "cleanup"}
    )
    assert "`sensor.gone` – areas.yaml" in result["description_placeholders"]["items"]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"confirm": True}
    )
    assert result["reason"] == "cleanup_done"
    living = _read(configs / "areas.yaml")["living"]
    assert living["sensor_entities"] == ["sensor.new_temp"]
    assert living["binary_sensor_entities"] == []
    backup = next(config_path("dwains-dashboard/backups").iterdir())
    assert "sensor.gone" in (backup / "areas.yaml").read_text()


async def test_global_area_sensor_lists_move_into_the_areas(
    hass: HomeAssistant, config_path
) -> None:
    from homeassistant.helpers import device_registry as dr
    from homeassistant.setup import async_setup_component
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    configs = config_path("dwains-dashboard/configs")
    living = ar.async_get(hass).async_create("Living")
    entry = MockConfigEntry(domain=DOMAIN, title="Dwains Dashboard")
    entry.add_to_hass(hass)
    devices = dr.async_get(hass)
    device = devices.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("test", "dev")}
    )
    devices.async_update_device(device.id, area_id=living.id)
    registry = er.async_get(hass)
    registry.async_get_or_create("sensor", "test", "t-1", suggested_object_id="temp")
    registry.async_update_entity("sensor.temp", area_id=living.id)
    registry.async_get_or_create(
        "binary_sensor", "test", "w-1", suggested_object_id="window", device_id=device.id
    )
    registry.async_get_or_create("sensor", "test", "x-1", suggested_object_id="nowhere")
    _write(
        configs / "settings.yaml",
        "area_sensor_entities: [sensor.temp, sensor.nowhere]\n"
        "area_binary_sensor_entities: [binary_sensor.window]\n"
        "disable_clock: true\n",
    )
    _write(configs / "areas.yaml", f"{living.id}:\n  icon: mdi:sofa\n")

    assert await async_setup_component(hass, "http", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    area = _read(configs / "areas.yaml")[living.id]
    assert area == {
        "icon": "mdi:sofa",
        "sensor_entities": ["sensor.temp"],
        "binary_sensor_entities": ["binary_sensor.window"],
    }
    settings = _read(configs / "settings.yaml")
    assert "area_sensor_entities" not in settings
    assert "area_binary_sensor_entities" not in settings
    assert settings["disable_clock"] is True
    backup = next(config_path("dwains-dashboard/backups").iterdir())
    assert "sensor.nowhere" in (backup / "settings.yaml").read_text()

    # Second start: nothing left to move, nothing written.
    before = (configs / "areas.yaml").read_text()
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert (configs / "areas.yaml").read_text() == before
    assert len(list(config_path("dwains-dashboard/backups").iterdir())) == 1
