"""Setup, dashboard registration and unload."""

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntryDisabler, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.setup import async_setup_component


async def test_setup_registers_dashboard(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    """The panel exists and the dashboard YAML renders all built-in views."""
    assert setup_dashboard.state is ConfigEntryState.LOADED
    assert frontend.async_panel_exists(hass, "dwains-dashboard")

    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "lovelace/config", "url_path": "dwains-dashboard"}
    )
    response = await client.receive_json()
    assert response["success"], response
    paths = [view["path"] for view in response["result"]["views"]]
    assert paths[:2] == ["home", "devices"]

    await client.send_json_auto_id({"type": "lovelace/info"})
    await client.receive_json()


async def test_unload_removes_panel(hass: HomeAssistant, setup_dashboard) -> None:
    """Unloading removes the sidebar panel and no repair is raised."""
    assert await hass.config_entries.async_unload(setup_dashboard.entry_id)
    await hass.async_block_till_done()
    assert not frontend.async_panel_exists(hass, "dwains-dashboard")
    assert not ir.async_get(hass).async_get_issue(
        "dwains_dashboard", "restart_required"
    )


async def test_disable_raises_restart_repair(
    hass: HomeAssistant, setup_dashboard
) -> None:
    """Disabling the entry asks for a restart to drop the static resources."""
    await hass.config_entries.async_set_disabled_by(
        setup_dashboard.entry_id, ConfigEntryDisabler.USER
    )
    await hass.async_block_till_done()
    assert not frontend.async_panel_exists(hass, "dwains-dashboard")
    assert ir.async_get(hass).async_get_issue("dwains_dashboard", "restart_required")


async def test_yaml_configuration_is_rejected_gracefully(hass: HomeAssistant) -> None:
    """A leftover v2 `dwains_dashboard:` YAML key does not break startup."""
    assert await async_setup_component(hass, "http", {})
    assert await async_setup_component(
        hass, "dwains_dashboard", {"dwains_dashboard": {"active": True}}
    )


async def test_config_flow_single_instance(hass: HomeAssistant) -> None:
    """The user flow creates one entry and aborts afterwards."""
    assert await async_setup_component(hass, "http", {})
    result = await hass.config_entries.flow.async_init(
        "dwains_dashboard", context={"source": "user"}
    )
    assert result["type"] == "create_entry"
    assert result["title"] == "Dwains Dashboard"
    await hass.async_block_till_done()

    result = await hass.config_entries.flow.async_init(
        "dwains_dashboard", context={"source": "user"}
    )
    assert result["type"] == "abort"
    assert result["reason"] == "single_instance_allowed"


def test_versions_are_consistent() -> None:
    """const.VERSION, manifest.json and the built bundle agree."""
    import json
    from pathlib import Path

    from custom_components.dwains_dashboard.const import VERSION

    component = Path(__file__).resolve().parents[1] / "custom_components" / "dwains_dashboard"
    manifest = json.loads((component / "manifest.json").read_text())
    assert manifest["version"] == VERSION
    assert f"Version {VERSION}" in (component / "js" / "dwains-dashboard.js").read_text()
