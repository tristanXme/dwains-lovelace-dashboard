"""Diagnostics download (Settings > Integrations > Dwains Dashboard)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .configuration_files import load_configuration_files
from .const import BACKEND_BUILD_REVISION, FRONTEND_RESOURCE_REVISION, VERSION
from .maintenance import async_find_orphans


def _summary(hass: HomeAssistant, configs_path: str) -> dict[str, Any]:
    snapshot = load_configuration_files(configs_path)
    entities = snapshot["entities"] if isinstance(snapshot["entities"], dict) else {}
    return {
        "settings": snapshot["homepage_header"],
        "counts": {
            "areas": len(snapshot["areas"] or {}),
            "entities": len(entities),
            "entity_cards": len(snapshot["entity_cards"]),
            "entity_popups": len(snapshot["entities_popup"]),
            "device_cards": len(snapshot["devices_card"]),
            "device_popups": len(snapshot["devices_popup"]),
            "area_card_folders": len(snapshot["area_cards"]),
            "more_pages": len(snapshot["more_pages"]),
        },
        # File names and parser messages only, no file content.
        "load_errors": snapshot["load_errors"],
    }


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry
) -> dict[str, Any]:
    """Return versions, settings and configuration statistics.

    Card contents are not included; they may contain addresses or URLs.
    The orphan lists only reveal entity and area ids, which bug reports need to
    spot stale configuration (entries for entities that no longer exist).
    """
    summary = await hass.async_add_executor_job(
        _summary, hass, hass.config.path("dwains-dashboard/configs")
    )
    summary["orphaned"] = (await async_find_orphans(hass)).as_dict()
    return {
        "versions": {
            "integration": VERSION,
            "backend_build": BACKEND_BUILD_REVISION,
            "frontend_resource": FRONTEND_RESOURCE_REVISION,
        },
        "options": dict(entry.options),
        **summary,
    }
