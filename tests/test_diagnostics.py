"""Diagnostics download."""

from pytest_homeassistant_custom_component.components.diagnostics import (
    get_diagnostics_for_config_entry,
)

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component


async def test_diagnostics_reports_orphaned_configuration(
    hass: HomeAssistant, setup_dashboard, hass_client, config_path
) -> None:
    assert await async_setup_component(hass, "diagnostics", {})
    configs = config_path("dwains-dashboard/configs")
    (configs / "cards" / "entities").mkdir(parents=True)
    (configs / "entities.yaml").write_text(
        "light.present:\n  hidden: true\nlight.removed:\n  favorite: true\n"
    )
    (configs / "cards" / "entities" / "light.removed.yaml").write_text("type: tile\n")
    hass.states.async_set("light.present", "on")

    diagnostics = await get_diagnostics_for_config_entry(hass, hass_client, setup_dashboard)

    assert diagnostics["versions"]["integration"]
    assert diagnostics["counts"]["entities"] == 2
    assert diagnostics["orphaned"]["entities"] == ["light.removed"]
    assert diagnostics["orphaned"]["entity_cards"] == ["light.removed"]
    assert "type" not in str(diagnostics)  # card contents are not exported
