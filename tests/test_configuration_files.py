"""Stray or broken files never take the whole configuration down."""

from __future__ import annotations

from pathlib import Path

from pytest_homeassistant_custom_component.components.diagnostics import (
    get_diagnostics_for_config_entry,
)

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.setup import async_setup_component

from custom_components.dwains_dashboard.configuration_files import load_configuration_files
from custom_components.dwains_dashboard.configuration_runtime import get_configuration_runtime

DOMAIN = "dwains_dashboard"


def _write(path: Path, text: str | bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(text, bytes):
        path.write_bytes(text)
    else:
        path.write_text(text)


def _configs(base: Path) -> Path:
    configs = base / "configs"
    _write(configs / "areas.yaml", "kitchen:\n  icon: mdi:fridge\n")
    _write(configs / "entities.yaml", "light.lamp: {favorite: true}\n")
    _write(configs / "cards/areas/kitchen/markdown.yaml", "type: markdown\n")
    _write(configs / "cards/areas/kitchen/empty.yaml", "")
    _write(configs / "cards/entities/light.lamp.yaml", "type: tile\n")
    _write(configs / "more_pages/energy/config.yaml", "name: Energy\nicon: mdi:flash\n")
    _write(configs / "more_pages/energy/page.yaml", "type: markdown\n")
    return configs


def test_stray_files_are_ignored(tmp_path: Path) -> None:
    configs = _configs(tmp_path)
    outside = tmp_path / "outside"
    _write(outside / "secret.yaml", "password: x\n")
    _write(configs / "cards/areas/.DS_Store", "finder")
    _write(configs / "cards/areas/notes.txt", "a plain file where folders are expected")
    _write(configs / "cards/areas/.hidden/markdown.yaml", "type: markdown\n")
    _write(configs / "cards/areas/kitchen/.DS_Store", "finder")
    _write(configs / "cards/entities/._light.lamp.yaml", "\x00\x01")
    _write(configs / "more_pages/.DS_Store", "finder")
    (configs / "cards/areas/linked").symlink_to(outside, target_is_directory=True)
    (configs / "cards/entities/light.secret.yaml").symlink_to(outside / "secret.yaml")

    snapshot = load_configuration_files(str(configs))
    assert snapshot["load_errors"] == []
    assert snapshot["area_cards"] == {"kitchen": {"empty.yaml": None, "markdown.yaml": {"type": "markdown"}}}
    assert snapshot["entity_cards"] == {"light.lamp": {"type": "tile"}}
    assert list(snapshot["more_pages"]) == ["energy"]


def test_broken_files_are_left_out_and_reported(tmp_path: Path) -> None:
    configs = _configs(tmp_path)
    _write(configs / "cards/areas/kitchen/broken.yaml", "type: [unclosed\n")
    _write(configs / "cards/entities/light.broken.yaml", "a: b: c\n")
    _write(configs / "devices.yaml", b"\xff\xfe not utf-8")
    _write(configs / "more_pages/broken/config.yaml", "name: Broken\n")
    _write(configs / "more_pages/broken/page.yaml", "cards: [\n")

    snapshot = load_configuration_files(str(configs))
    # Everything that can be read is still there.
    assert snapshot["areas"] == {"kitchen": {"icon": "mdi:fridge"}}
    assert snapshot["area_cards"]["kitchen"]["markdown.yaml"] == {"type": "markdown"}
    assert "broken.yaml" not in snapshot["area_cards"]["kitchen"]
    assert snapshot["entity_cards"] == {"light.lamp": {"type": "tile"}}
    assert snapshot["devices"] == {}
    assert list(snapshot["more_pages"]) == ["energy"]
    assert sorted(error["file"] for error in snapshot["load_errors"]) == [
        "cards/areas/kitchen/broken.yaml",
        "cards/entities/light.broken.yaml",
        "devices.yaml",
        "more_pages/broken/page.yaml",
    ]


async def test_broken_files_show_up_as_repair_and_in_diagnostics(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, hass_client, config_path
) -> None:
    configs = config_path("dwains-dashboard/configs")
    _write(configs / "areas.yaml", "kitchen:\n  icon: mdi:fridge\n")
    _write(configs / "cards/areas/.DS_Store", "finder")
    _write(configs / "cards/areas/kitchen/broken.yaml", "type: [unclosed\n")
    get_configuration_runtime(hass).clear_cache()

    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "dwains_dashboard/configuration/get"})
    response = await client.receive_json()
    assert response["success"], response
    assert response["result"]["areas"] == {"kitchen": {"icon": "mdi:fridge"}}
    assert "load_errors" not in response["result"]  # unchanged answer for the frontend

    issue = ir.async_get(hass).async_get_issue(DOMAIN, "broken_configuration_files")
    assert issue is not None
    assert "cards/areas/kitchen/broken.yaml" in issue.translation_placeholders["files"]

    assert await async_setup_component(hass, "diagnostics", {})
    diagnostics = await get_diagnostics_for_config_entry(hass, hass_client, setup_dashboard)
    assert [error["file"] for error in diagnostics["load_errors"]] == ["cards/areas/kitchen/broken.yaml"]

    # Fixed: the repair goes away with the next load.
    (configs / "cards/areas/kitchen/broken.yaml").write_text("type: markdown\n")
    get_configuration_runtime(hass).clear_cache()
    await client.send_json_auto_id({"type": "dwains_dashboard/configuration/get"})
    response = await client.receive_json()
    assert response["result"]["area_cards"]["kitchen"]["broken.yaml"] == {"type": "markdown"}
    assert ir.async_get(hass).async_get_issue(DOMAIN, "broken_configuration_files") is None
