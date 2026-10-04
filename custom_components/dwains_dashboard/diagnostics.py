"""Diagnostics download (Settings > Integrations > Dwains Dashboard)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .configuration_files import load_configuration_files
from .const import BACKEND_BUILD_REVISION, FRONTEND_RESOURCE_REVISION, VERSION


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
        "entity_ids_configured": sorted(entities),
        "entity_card_ids": sorted(snapshot["entity_cards"]),
    }


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry
) -> dict[str, Any]:
    """Return versions, settings and configuration statistics.

    Card contents are not included; they may contain addresses or URLs.
    The entity lists only reveal entity ids, which bug reports need to spot
    stale configuration (entries for entities that no longer exist).
    """
    summary = await hass.async_add_executor_job(
        _summary, hass, hass.config.path("dwains-dashboard/configs")
    )
    registry = er.async_get(hass)
    known = set(hass.states.async_entity_ids()) | set(registry.entities)
    summary["orphaned"] = {
        "entities": [e for e in summary.pop("entity_ids_configured") if e not in known],
        "entity_cards": [e for e in summary.pop("entity_card_ids") if e not in known],
    }
    return {
        "versions": {
            "integration": VERSION,
            "backend_build": BACKEND_BUILD_REVISION,
            "frontend_resource": FRONTEND_RESOURCE_REVISION,
        },
        "options": dict(entry.options),
        **summary,
    }
