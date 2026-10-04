"""Entity configuration WebSocket commands."""

from __future__ import annotations

from collections import OrderedDict

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .configuration_runtime import serialize_configuration_mutation
from .input_validation import (
    parse_json_object,
    parse_json_string_list,
    safe_path_segment,
)
from .mutation_files import remove_file_if_exists
from .yaml_files import (
    dump_and_verify_json_normalized_yaml_file,
    dump_yaml_file,
    load_yaml_file_or_default,
)


ENTITIES_PATH = "dwains-dashboard/configs/entities.yaml"

# WebSocket field -> entities.yaml key for ``edit_entity``. The editor always
# submits the complete form; the schema defaults mirror its initial values so a
# request with omitted fields is still a well-defined complete form.
EDIT_ENTITY_FIELDS = (
    ("hideEntity", "hidden"),
    ("excludeEntity", "excluded"),
    ("disableEntity", "disabled"),
    ("friendlyName", "friendly_name"),
    ("colSpan", "col_span"),
    ("rowSpan", "row_span"),
    ("colSpanLg", "col_span_lg"),
    ("rowSpanLg", "row_span_lg"),
    ("colSpanXl", "col_span_xl"),
    ("rowSpanXl", "row_span_xl"),
    ("customCard", "custom_card"),
    ("customPopup", "custom_popup"),
)


async def _load_entities(hass):
    return await hass.async_add_executor_job(
        load_yaml_file_or_default,
        hass.config.path(ENTITIES_PATH),
        OrderedDict(),
        True,
    )


async def _save_entities(hass, entities):
    await hass.async_add_executor_job(
        dump_yaml_file,
        hass.config.path(ENTITIES_PATH),
        entities,
    )


async def _write_entity_override(hass, msg, directory, flag):
    entity_id = safe_path_segment(msg["entityId"], "entity id")
    card = parse_json_object(msg["cardData"], "card data")
    filename = hass.config.path(
        f"dwains-dashboard/configs/cards/{directory}/{entity_id}.yaml"
    )
    persisted_card = await hass.async_add_executor_job(
        dump_and_verify_json_normalized_yaml_file,
        filename,
        card,
    )
    entities = await _load_entities(hass)
    if not entities.get(msg["entityId"]):
        entities[msg["entityId"]] = OrderedDict()
    entities[msg["entityId"]].update({flag: True})
    await _save_entities(hass, entities)
    return persisted_card


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entity",
        vol.Required("entity"): str,
        vol.Optional("friendlyName", default=""): str,
        vol.Optional("disableEntity", default=False): bool,
        vol.Optional("hideEntity", default=False): bool,
        vol.Optional("excludeEntity", default=False): bool,
        vol.Optional("rowSpan", default="1"): str,
        vol.Optional("colSpan", default="1"): str,
        vol.Optional("rowSpanLg", default="1"): str,
        vol.Optional("colSpanLg", default="1"): str,
        vol.Optional("rowSpanXl", default="1"): str,
        vol.Optional("colSpanXl", default="1"): str,
        vol.Optional("customCard", default=False): bool,
        vol.Optional("customPopup", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entity(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save entity display settings."""
    entities = await _load_entities(hass)
    if not entities.get(msg["entity"]):
        entities[msg["entity"]] = OrderedDict()
    entities[msg["entity"]].update(
        {
            yaml_key: msg[msg_key]
            for msg_key, yaml_key in EDIT_ENTITY_FIELDS
        }
    )
    await _save_entities(hass, entities)
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(msg["id"], {"succesfull": "Entity saved"})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entity_card",
        vol.Required("cardData"): str,
        vol.Required("entityId"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entity_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save an entity card override and enable it."""
    persisted_card = await _write_entity_override(
        hass, msg, "entities", "custom_card"
    )
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Card added succesfully",
            "card": persisted_card,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entity_popup",
        vol.Required("cardData"): str,
        vol.Required("entityId"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entity_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save an entity popup override and enable it."""
    persisted_card = await _write_entity_override(
        hass, msg, "entities_popup", "custom_popup"
    )
    hass.bus.async_fire("dwains_dashboard_config_reload")
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Popup added succesfully",
            "card": persisted_card,
        },
    )


async def _remove_entity_card_file(hass, entity_id, directory):
    entity_id = safe_path_segment(entity_id, "entity id")
    filename = hass.config.path(
        f"dwains-dashboard/configs/cards/{directory}/{entity_id}.yaml"
    )
    await hass.async_add_executor_job(remove_file_if_exists, filename)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/remove_entity_card",
        vol.Required("entityId"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_remove_entity_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Remove an entity card override."""
    await _remove_entity_card_file(hass, msg["entityId"], "entities")
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"], {"succesfull": "Entity card removed succesfully"}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/remove_entity_popup",
        vol.Required("entityId"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_remove_entity_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Remove an entity popup override."""
    await _remove_entity_card_file(hass, msg["entityId"], "entities_popup")
    hass.bus.async_fire("dwains_dashboard_config_reload")
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"], {"succesfull": "Entity card removed succesfully"}
    )


async def _set_entity_value(hass, entity_id, key, value):
    entities = await _load_entities(hass)
    if not entities.get(entity_id):
        entities[entity_id] = OrderedDict()
    entities[entity_id][key] = value
    await _save_entities(hass, entities)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entity_favorite",
        vol.Required("entityId"): str,
        vol.Optional("favorite", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entity_favorite(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Set an entity's favorite state."""
    await _set_entity_value(hass, msg["entityId"], "favorite", msg["favorite"])
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    connection.send_result(msg["id"], {"succesfull": "Popup added succesfully"})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entity_bool_value",
        vol.Required("entityId"): str,
        vol.Required("key"): str,
        vol.Required("value"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entity_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Set a boolean entity option."""
    await _set_entity_value(hass, msg["entityId"], msg["key"], msg["value"])
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"], {"succesfull": "Entity bool value set succesfully"}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/edit_entities_bool_value",
        vol.Required("entities"): str,
        vol.Required("key"): str,
        vol.Required("value"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_edit_entities_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Set a boolean option for multiple entities in one write."""
    entities = await _load_entities(hass)
    for entity_id in parse_json_string_list(msg["entities"], "entity list"):
        if not entities.get(entity_id):
            entities[entity_id] = OrderedDict()
        entities[entity_id][msg["key"]] = msg["value"]
    await _save_entities(hass, entities)
    hass.bus.async_fire("dwains_dashboard_homepage_card_reload")
    hass.bus.async_fire("dwains_dashboard_devicespage_card_reload")
    connection.send_result(
        msg["id"], {"succesfull": "Entities bool value set succesfully"}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/sort_entity",
        vol.Required("sortData"): str,
        vol.Required("sortType"): vol.All(str, vol.Length(min=1)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_sort_entity(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save the requested entity order."""
    entities = await _load_entities(hass)
    sort_type = msg["sortType"]
    sort_data = parse_json_string_list(msg["sortData"], "sort order")
    for position, entity_id in enumerate(sort_data, start=1):
        if not entities.get(entity_id):
            entities[entity_id] = OrderedDict()
        entities[entity_id][sort_type] = position
    await _save_entities(hass, entities)
    connection.send_result(
        msg["id"], {"succesfull": "Entity cards sorted succesfully"}
    )
