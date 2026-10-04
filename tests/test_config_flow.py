"""Options flow writing settings.yaml."""

import yaml

from homeassistant.core import HomeAssistant


async def test_options_flow_saves_area_sensor_entities(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    settings = config_path("dwains-dashboard/configs/settings.yaml")
    settings.parent.mkdir(parents=True, exist_ok=True)
    settings.write_text("custom_key: keep me\ndisable_clock: true\n")

    result = await hass.config_entries.options.async_init(setup_dashboard.entry_id)
    assert result["type"] == "form"
    assert "area_sensor_entities" in result["data_schema"].schema

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "area_sensor_entities": ["sensor.living_room_temperature"],
            "area_binary_sensor_entities": ["binary_sensor.front_door"],
            "disable_clock": False,
        },
    )
    assert result["type"] == "create_entry"
    await hass.async_block_till_done()

    saved = yaml.safe_load(settings.read_text())
    assert saved["area_sensor_entities"] == ["sensor.living_room_temperature"]
    assert saved["area_binary_sensor_entities"] == ["binary_sensor.front_door"]
    assert saved["disable_clock"] is False
    assert saved["custom_key"] == "keep me"
