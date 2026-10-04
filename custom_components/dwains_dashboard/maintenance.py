"""Keep dashboard configuration in sync with the entity and area registries."""

from __future__ import annotations

import logging
import os
from collections.abc import Callable
from datetime import datetime

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_call_later

from .configuration_runtime import get_configuration_runtime
from .const import DOMAIN
from .maintenance_files import OrphanReport, find_orphans, remove_orphans, rename_entity

_LOGGER = logging.getLogger(__name__)

ORPHAN_ISSUE_ID = "orphaned_configuration"
CONFIGS_PATH = "dwains-dashboard/configs"
BACKUPS_PATH = "dwains-dashboard/backups"
# Integrations may still add entities shortly after startup; never judge
# entries as orphaned before that settled.
STARTUP_CHECK_DELAY = 120
RECHECK_DELAY = 30
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


async def async_update_orphan_issue(hass: HomeAssistant) -> OrphanReport | None:
    """Create or delete the repair issue to match the current configuration."""
    if not hass.is_running:
        return None
    report = await async_find_orphans(hass)
    if report.total:
        ir.async_create_issue(
            hass,
            DOMAIN,
            ORPHAN_ISSUE_ID,
            is_fixable=True,
            is_persistent=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=ORPHAN_ISSUE_ID,
            translation_placeholders={"count": str(report.total)},
        )
    else:
        ir.async_delete_issue(hass, DOMAIN, ORPHAN_ISSUE_ID)
    return report


def _notify_dashboard(hass: HomeAssistant) -> None:
    get_configuration_runtime(hass).clear_cache()
    from .load_dashboard import invalidate_dashboard_cache

    invalidate_dashboard_cache(hass)
    for event_type in RELOAD_EVENTS:
        hass.bus.async_fire(event_type)


async def async_remove_orphans(hass: HomeAssistant) -> tuple[int, str]:
    """Remove orphaned entries after backing them up.

    The report is computed again here, so nothing is removed that came back
    after the repair issue was raised. Returns the number of removed entries
    and the backup folder relative to the config directory.
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
    ir.async_delete_issue(hass, DOMAIN, ORPHAN_ISSUE_ID)
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
    """Start registry tracking; returns a callback that stops it."""
    unsubscribers: list[CALLBACK_TYPE] = []
    pending_check: CALLBACK_TYPE | None = None

    @callback
    def schedule_check(delay: float) -> None:
        nonlocal pending_check
        if pending_check is not None:
            pending_check()

        @callback
        def run(_now) -> None:
            nonlocal pending_check
            pending_check = None
            hass.async_create_task(
                async_update_orphan_issue(hass), "dwains_dashboard orphan check"
            )

        pending_check = async_call_later(hass, delay, run)

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
        if data["action"] in ("create", "remove") or old_entity_id:
            schedule_check(RECHECK_DELAY)

    @callback
    def area_registry_updated(_event: Event) -> None:
        schedule_check(RECHECK_DELAY)

    unsubscribers.append(
        hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, entity_registry_updated)
    )
    unsubscribers.append(
        hass.bus.async_listen(ar.EVENT_AREA_REGISTRY_UPDATED, area_registry_updated)
    )

    remove_started_listener: CALLBACK_TYPE | None = None
    if hass.is_running:
        schedule_check(STARTUP_CHECK_DELAY)
    else:

        @callback
        def started(_event: Event) -> None:
            nonlocal remove_started_listener
            remove_started_listener = None
            schedule_check(STARTUP_CHECK_DELAY)

        remove_started_listener = hass.bus.async_listen_once(
            EVENT_HOMEASSISTANT_STARTED, started
        )

    @callback
    def stop() -> None:
        if pending_check is not None:
            pending_check()
        if remove_started_listener is not None:
            remove_started_listener()
        for unsubscribe in unsubscribers:
            unsubscribe()

    return stop
