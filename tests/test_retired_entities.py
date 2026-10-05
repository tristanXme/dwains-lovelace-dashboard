"""Entities the integration no longer provides are removed on setup."""

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component

DOMAIN = "dwains_dashboard"


async def test_setup_removes_the_retired_update_and_version_entities(
    hass: HomeAssistant,
) -> None:
    registry = er.async_get(hass)
    update = registry.async_get_or_create(
        "update", DOMAIN, "dwains-dashboard-update", suggested_object_id="dwains_dashboard_update"
    )
    sensor = registry.async_get_or_create(
        "sensor", DOMAIN, "dwains-dashboard-latest-version", suggested_object_id="dwains_dashboard_latest_version"
    )
    hass.states.async_set(update.entity_id, "off")
    unrelated = registry.async_get_or_create("update", "hacs", "dwains-dashboard-update")

    assert await async_setup_component(hass, "http", {})
    entry = MockConfigEntry(domain=DOMAIN, title="Dwains Dashboard")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert registry.async_get(update.entity_id) is None
    assert registry.async_get(sensor.entity_id) is None
    assert hass.states.get(update.entity_id) is None
    assert registry.async_get(unrelated.entity_id) is not None
    assert not hass.states.async_entity_ids("update")
