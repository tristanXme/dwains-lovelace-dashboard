"""Cleanup for entities retired by Dwains Dashboard."""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

LATEST_VERSION_ENTITY_ID = "sensor.dwains_dashboard_latest_version"
LATEST_VERSION_UNIQUE_ID = "dwains-dashboard-latest-version"
# The update entity checked a server of the original author; HACS reports
# new versions itself.
UPDATE_UNIQUE_ID = "dwains-dashboard-update"

RETIRED_ENTITIES = (
    ("sensor", LATEST_VERSION_UNIQUE_ID),
    ("update", UPDATE_UNIQUE_ID),
)


async def async_remove_retired_entities(hass: HomeAssistant) -> None:
    """Remove registry metadata and residual states of retired entities."""

    registry = er.async_get(hass)
    entity_ids = {
        entry.entity_id
        for entry in list(registry.entities.values())
        if entry.platform == DOMAIN
        and (entry.domain, entry.unique_id) in RETIRED_ENTITIES
    }

    configured_entry = registry.async_get(LATEST_VERSION_ENTITY_ID)
    if configured_entry is not None and (
        configured_entry.platform == DOMAIN
        or configured_entry.unique_id == LATEST_VERSION_UNIQUE_ID
    ):
        entity_ids.add(configured_entry.entity_id)

    for entity_id in entity_ids:
        registry.async_remove(entity_id)
        hass.states.async_remove(entity_id)

    # Also clear a state left behind by an older loaded platform. It is safe to
    # do this independently of the registry because this entity id belongs to
    # the retired Dwains Dashboard sensor.
    hass.states.async_remove(LATEST_VERSION_ENTITY_ID)

    if entity_ids:
        _LOGGER.info(
            "Removed retired Dwains Dashboard entities: %s",
            ", ".join(sorted(entity_ids)),
        )
