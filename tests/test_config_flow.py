"""Options flow writing settings.yaml."""

import yaml

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant


async def test_options_flow_saves_settings_and_keeps_other_keys(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    settings = config_path("dwains-dashboard/configs/settings.yaml")
    settings.parent.mkdir(parents=True, exist_ok=True)
    settings.write_text("custom_key: keep me\ndisable_clock: true\n")

    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    assert result["type"] == "menu"
    assert result["menu_options"] == [
        "settings", "cleanup", "export_settings", "import_settings"
    ]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "settings"}
    )
    assert result["type"] == "form"
    fields = {str(key) for key in result["data_schema"].schema}
    assert "area_sensor_device_classes" in fields
    # The sensors below the area name are chosen per area now.
    assert "area_sensor_entities" not in fields
    assert "area_binary_sensor_entities" not in fields

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "area_sensor_device_classes": ["temperature"],
            "area_binary_sensor_device_classes": ["window"],
            "disable_clock": False,
        },
    )
    assert result["type"] == "create_entry"
    await hass.async_block_till_done()

    saved = yaml.safe_load(settings.read_text())
    assert saved["area_sensor_device_classes"] == ["temperature"]
    assert saved["area_binary_sensor_device_classes"] == ["window"]
    assert "area_sensor_entities" not in saved
    assert saved["disable_clock"] is False
    assert saved["custom_key"] == "keep me"


async def test_options_flow_saves_status_bar_entries_and_masonry(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    settings = config_path("dwains-dashboard/configs/settings.yaml")
    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "settings"}
    )
    schema = {str(key): key for key in result["data_schema"].schema}
    # Never chosen: every entry is preselected, masonry stays on.
    assert "smoke" in schema["house_information_entries"].default()
    assert schema["disable_masonry"].default() is False

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "house_information_entries": ["person", "light", "smoke"],
            "disable_masonry": True,
        },
    )
    assert result["type"] == "create_entry"
    saved = yaml.safe_load(settings.read_text())
    assert saved["house_information_entries"] == ["person", "light", "smoke"]
    assert saved["disable_masonry"] is True

    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "settings"}
    )
    schema = {str(key): key for key in result["data_schema"].schema}
    assert schema["house_information_entries"].default() == ["person", "light", "smoke"]


async def test_sidebar_title_and_icon_apply_without_restart(
    hass: HomeAssistant, setup_dashboard
) -> None:
    panels = hass.data[frontend.DATA_PANELS]
    panel_count = len(panels)
    dashboard = hass.data["lovelace"].dashboards["dwains-dashboard"]
    updates = []
    hass.bus.async_listen(frontend.EVENT_PANELS_UPDATED, updates.append)

    async def save(**sidebar):
        result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
        result = await hass.config_entries.options.async_configure(
            result["flow_id"], {"next_step_id": "settings"}
        )
        result = await hass.config_entries.options.async_configure(
            result["flow_id"], user_input=sidebar
        )
        assert result["type"] == "create_entry"
        await hass.async_block_till_done()

    await save(sidepanel_title="Mein Zuhause", sidepanel_icon="mdi:home")
    panel = panels["dwains-dashboard"]
    assert setup_dashboard.options["sidepanel_title"] == "Mein Zuhause"
    assert (panel.sidebar_title, panel.sidebar_icon) == ("Mein Zuhause", "mdi:home")
    assert panel.component_name == "lovelace"
    assert panel.config == {"mode": "yaml"}
    # Same panel replaced in place: no second panel, same Lovelace dashboard.
    assert len(panels) == panel_count
    assert hass.data["lovelace"].dashboards["dwains-dashboard"] is dashboard
    assert (dashboard.config["title"], dashboard.config["icon"]) == ("Mein Zuhause", "mdi:home")
    assert len(updates) == 1

    # Saving again with the same values leaves the panel alone.
    await save(sidepanel_title="Mein Zuhause", sidepanel_icon="mdi:home")
    assert len(updates) == 1
    assert panels["dwains-dashboard"] is panel
