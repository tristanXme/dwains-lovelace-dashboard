"""Area and device custom-card WebSocket commands."""

from __future__ import annotations

from datetime import datetime

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .configuration_runtime import serialize_configuration_mutation
from .input_validation import (
    DashboardInputError,
    parse_json_object,
    safe_path_segment,
)
from .mutation_files import file_has_content, remove_file_if_exists
from .yaml_files import dump_and_verify_json_normalized_yaml_file

SPAN_FIELDS = (
    ("colSpan", "col_span"),
    ("rowSpan", "row_span"),
    ("colSpanLg", "col_span_lg"),
    ("rowSpanLg", "row_span_lg"),
    ("colSpanXl", "col_span_xl"),
    ("rowSpanXl", "row_span_xl"),
)


def _card_directory(msg, *, page_driven=False):
    if page_driven:
        if msg.get("page") == "areas":
            area_id = safe_path_segment(msg.get("area_id"), "area id")
            return f"dwains-dashboard/configs/cards/areas/{area_id}"
        if msg.get("page") == "devices":
            domain = safe_path_segment(msg.get("domain"), "domain")
            return f"dwains-dashboard/configs/cards/devices/{domain}"
        raise DashboardInputError(f'Unsupported dashboard page: {msg.get("page")!r}')
    if msg.get("domain"):
        domain = safe_path_segment(msg["domain"], "domain")
        return f"dwains-dashboard/configs/cards/devices/{domain}"
    area_id = safe_path_segment(msg.get("area_id"), "area id")
    return f"dwains-dashboard/configs/cards/areas/{area_id}"


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/add_card",
        vol.Required("card_data"): str,
        vol.Optional("area_id"): str,
        vol.Optional("domain"): str,
        vol.Optional("position", default=""): str,
        vol.Optional("filename", default=""): str,
        vol.Optional("page"): str,
        vol.Optional("rowSpan", default="1"): str,
        vol.Optional("colSpan", default="1"): str,
        vol.Optional("rowSpanLg", default="1"): str,
        vol.Optional("colSpanLg", default="1"): str,
        vol.Optional("rowSpanXl", default="1"): str,
        vol.Optional("colSpanXl", default="1"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_add_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Add an area or device custom card."""
    card = parse_json_object(msg["card_data"], "card data")
    card_type = msg["filename"] or card.get("type")
    if not card_type:
        raise DashboardInputError("Card has no type")
    card_type = safe_path_segment(card_type, "card file name")
    card.update({yaml_key: msg[msg_key] for msg_key, yaml_key in SPAN_FIELDS})
    card["position"] = msg["position"]
    directory = _card_directory(msg, page_driven=True)
    filename = hass.config.path(f"{directory}/{card_type}.yaml")
    if not msg["filename"] and await hass.async_add_executor_job(
        file_has_content, filename
    ):
        suffix = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = hass.config.path(f"{directory}/{card_type}{suffix}.yaml")
    persisted_card = await hass.async_add_executor_job(
        dump_and_verify_json_normalized_yaml_file,
        filename,
        card,
    )
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"],
        {
            "succesfull": "card added succesfully",
            "card": persisted_card,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/remove_card",
        vol.Optional("area_id"): str,
        vol.Optional("domain"): str,
        vol.Required("filename"): str,
        vol.Optional("page"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_remove_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Remove an area or device custom card."""
    card_file = safe_path_segment(msg["filename"], "card file name")
    filename = hass.config.path(f"{_card_directory(msg)}/{card_file}.yaml")
    await hass.async_add_executor_job(remove_file_if_exists, filename)
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(msg["id"], {"succesfull": "card removed succesfully"})
