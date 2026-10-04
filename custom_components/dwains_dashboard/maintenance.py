"""Keep dashboard configuration in sync with the entity and area registries."""

from __future__ import annotations

import logging
import os
from collections.abc import Callable
from datetime import datetime

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er

from .configuration_runtime import get_configuration_runtime
from .maintenance_files import OrphanReport, find_orphans, remove_orphans, rename_entity

_LOGGER = logging.getLogger(__name__)

CONFIGS_PATH = "dwains-dashboard/configs"
BACKUPS_PATH = "dwains-dashboard/backups"
MAX_LISTED_ENTRIES = 25
ORPHAN_LOCATIONS = {
    "entities": "entities.yaml",
    "entity_cards": "cards/entities/",
    "entity_popups": "cards/entities_popup/",
    "settings_entities": "settings.yaml",
    "areas": "areas.yaml",
    "area_card_folders": "cards/areas/",
}
RELOAD_EVENTS = (
    "dwains_dashboard_config_reload",
    "dwains_dashboard_homepage_card_reload",
    "dwains_dashboard_devicespage_card_reload",
)


@callback
def _existence_checks(
    hass: HomeAssistant,
) -> tuple[Callable[[str], bool], Callable[[str], bool]]:
    """Snapshot known ids in the event loop for use in the executor.

    An entity exists while it is in the registry (also when disabled or its
    integration is not loaded) or has a state (YAML entities without
    unique_id are not in the registry).
    """
    entities = set(er.async_get(hass).entities) | set(hass.states.async_entity_ids())
    areas = set(ar.async_get(hass).areas)
    return entities.__contains__, areas.__contains__


async def async_find_orphans(hass: HomeAssistant) -> OrphanReport:
    """Return the current orphan report."""
    entity_exists, area_exists = _existence_checks(hass)
    return await hass.async_add_executor_job(
        find_orphans, hass.config.path(CONFIGS_PATH), entity_exists, area_exists
    )


def orphan_description_placeholders(report: OrphanReport) -> dict[str, str]:
    """Counts plus one markdown line per id with its affected files.

    Example line: "- `light.lamp` – entities.yaml, cards/entities/".
    """
    locations: dict[str, list[str]] = {}
    for kind, names in report.as_dict().items():
        for name in names:
            locations.setdefault(name, []).append(ORPHAN_LOCATIONS[kind])
    lines = [f"- `{name}` – {', '.join(files)}" for name, files in locations.items()]
    listed = "\n".join(lines[:MAX_LISTED_ENTRIES])
    if len(lines) > MAX_LISTED_ENTRIES:
        listed += f"\n- … +{len(lines) - MAX_LISTED_ENTRIES}"
    return {
        "count": str(report.total),
        "entities": str(len(report.entities)),
        "cards": str(len(report.entity_cards) + len(report.entity_popups)),
        "areas": str(len(report.areas) + len(report.area_card_folders)),
        "settings": str(len(report.settings_entities)),
        "items": listed,
    }


def _notify_dashboard(hass: HomeAssistant) -> None:
    get_configuration_runtime(hass).clear_cache()
    from .load_dashboard import invalidate_dashboard_cache

    invalidate_dashboard_cache(hass)
    for event_type in RELOAD_EVENTS:
        hass.bus.async_fire(event_type)


async def async_remove_orphans(hass: HomeAssistant) -> tuple[int, str]:
    """Remove orphaned entries after backing them up.

    The report is computed again here, so nothing is removed that came back
    since it was shown. Returns the number of removed entries and the backup
    folder relative to the config directory.
    """
    runtime = get_configuration_runtime(hass)
    async with runtime.mutation_lock:
        report = await async_find_orphans(hass)
        backup = os.path.join(
            BACKUPS_PATH, f"cleanup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        )
        removed = await hass.async_add_executor_job(
            remove_orphans,
            hass.config.path(CONFIGS_PATH),
            report,
            hass.config.path(backup),
        )
    if removed:
        _LOGGER.info("Removed %d orphaned dashboard entries, backup in %s", removed, backup)
        _notify_dashboard(hass)
    return removed, backup


async def _async_rename(hass: HomeAssistant, old_entity_id: str, new_entity_id: str) -> None:
    runtime = get_configuration_runtime(hass)
    async with runtime.mutation_lock:
        changed = await hass.async_add_executor_job(
            rename_entity, hass.config.path(CONFIGS_PATH), old_entity_id, new_entity_id
        )
    if changed:
        _LOGGER.info(
            "Moved dashboard settings from %s to %s", old_entity_id, new_entity_id
        )
        _notify_dashboard(hass)


@callback
def async_setup_maintenance(hass: HomeAssistant) -> CALLBACK_TYPE:
    """Follow entity id changes; returns a callback that stops it."""

    @callback
    def entity_registry_updated(event: Event[er.EventEntityRegistryUpdatedData]) -> None:
        data = event.data
        old_entity_id = data.get("old_entity_id")
        if (
            data["action"] == "update"
            and old_entity_id
            and old_entity_id != data["entity_id"]
        ):
            hass.async_create_task(
                _async_rename(hass, old_entity_id, data["entity_id"]),
                "dwains_dashboard entity rename",
            )

    return hass.bus.async_listen(
        er.EVENT_ENTITY_REGISTRY_UPDATED, entity_registry_updated
    )
