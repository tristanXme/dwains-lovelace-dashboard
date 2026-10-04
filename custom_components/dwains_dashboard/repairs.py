"""Repair flows for Dwains Dashboard.

- restart_required: raised when the integration is disabled; its sidebar
  dashboard and frontend resources (the JS bundle / static path / websocket
  commands registered in async_setup) can only be fully removed by a restart.
  Created on disable and removed again on (re-)enable, see __init__.py.
- orphaned_configuration: dashboard settings for entities or areas that no
  longer exist, see maintenance.py. The fix lists them, backs them up and
  removes them.
"""

import voluptuous as vol

from homeassistant import data_entry_flow
from homeassistant.components.repairs import RepairsFlow
from homeassistant.core import HomeAssistant

from .maintenance import ORPHAN_ISSUE_ID, async_find_orphans, async_remove_orphans

MAX_LISTED_ENTRIES = 25
ORPHAN_LOCATIONS = {
    "entities": "entities.yaml",
    "entity_cards": "cards/entities/",
    "entity_popups": "cards/entities_popup/",
    "settings_entities": "settings.yaml",
    "areas": "areas.yaml",
    "area_card_folders": "cards/areas/",
}


class RestartRequiredRepairFlow(RepairsFlow):
    """Fix flow that restarts Home Assistant."""

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> data_entry_flow.FlowResult:
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict | None = None
    ) -> data_entry_flow.FlowResult:
        if user_input is not None:
            # Fire-and-forget: the restart tears down the event loop, so don't
            # await it (awaiting can surface as a cancelled task during shutdown).
            self.hass.async_create_task(
                self.hass.services.async_call("homeassistant", "restart", blocking=False)
            )
            return self.async_create_entry(title="", data={})

        return self.async_show_form(step_id="confirm", data_schema=vol.Schema({}))


class OrphanedConfigurationRepairFlow(RepairsFlow):
    """List orphaned dashboard entries and remove them after confirmation."""

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> data_entry_flow.FlowResult:
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict | None = None
    ) -> data_entry_flow.FlowResult:
        if user_input is not None:
            removed, backup = await async_remove_orphans(self.hass)
            return self.async_create_entry(
                title="", data={"removed": removed, "backup": backup}
            )

        report = await async_find_orphans(self.hass)
        if not report.total:
            return self.async_abort(reason="nothing_to_clean")
        # One line per id with the affected files, e.g.
        # "`light.lamp` – entities.yaml, cards/entities/"
        locations: dict[str, list[str]] = {}
        for kind, names in report.as_dict().items():
            for name in names:
                locations.setdefault(name, []).append(ORPHAN_LOCATIONS[kind])
        lines = [
            f"- `{name}` – {', '.join(files)}" for name, files in locations.items()
        ]
        listed = "\n".join(lines[:MAX_LISTED_ENTRIES])
        if len(lines) > MAX_LISTED_ENTRIES:
            listed += f"\n- … +{len(lines) - MAX_LISTED_ENTRIES}"
        return self.async_show_form(
            step_id="confirm",
            data_schema=vol.Schema({}),
            description_placeholders={
                "count": str(report.total),
                "entities": str(len(report.entities)),
                "cards": str(len(report.entity_cards) + len(report.entity_popups)),
                "areas": str(len(report.areas) + len(report.area_card_folders)),
                "settings": str(len(report.settings_entities)),
                "items": listed,
            },
        )


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict | None
) -> RepairsFlow:
    """Create the fix flow for a Dwains Dashboard repair issue."""
    if issue_id == ORPHAN_ISSUE_ID:
        return OrphanedConfigurationRepairFlow()
    return RestartRequiredRepairFlow()
