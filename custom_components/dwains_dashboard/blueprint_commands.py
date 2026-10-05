"""Blueprint WebSocket commands for Dwains Dashboard."""

from __future__ import annotations

import logging
from typing import Any, Mapping

import voluptuous as vol
import yaml
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.util import slugify

from .blueprint_files import (
    blueprint_file_paths,
    load_blueprint_files,
    replace_blueprint_files,
)
from .configuration_runtime import serialize_configuration_mutation
from .input_validation import DashboardInputError, safe_path_segment
from .yaml_files import parse_yaml_text


_LOGGER = logging.getLogger(__name__)
DASHBOARD_PATH = "dwains-dashboard"


@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): "dwains_dashboard/get_blueprints"})
async def websocket_get_blueprints(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Mapping[str, Any],
) -> None:
    """Return a list of installed blueprints asynchronously."""
    blueprints, failures = await hass.async_add_executor_job(
        load_blueprint_files,
        hass.config.path("dwains-dashboard/blueprints"),
    )
    for filename, error in failures:
        _LOGGER.error("Error loading blueprint %s: %s", filename, error)

    connection.send_result(msg["id"], {"blueprints": blueprints})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/install_blueprint",
        vol.Required("yamlCode"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_install_blueprint(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Install a blueprint while preserving the legacy response contract."""
    try:
        filecontent = await hass.async_add_executor_job(
            parse_yaml_text, msg["yamlCode"]
        )
    except yaml.YAMLError as error:
        raise DashboardInputError(f"Blueprint is not valid YAML: {error}") from None
    if not isinstance(filecontent, dict):
        raise DashboardInputError("Blueprint must be a YAML mapping")

    if not isinstance(filecontent.get("blueprint"), dict):
        _LOGGER.warning("no blueprint data")
        connection.send_result(msg["id"], {"error": "Blueprint has invalid data"})
        return
    if not filecontent.get("card"):
        _LOGGER.warning("no card")
        connection.send_result(msg["id"], {"error": "Blueprint has no card"})
        return

    name = filecontent["blueprint"].get("name")
    if not isinstance(name, str) or not slugify(name):
        raise DashboardInputError("Blueprint has no usable name")
    filename = f"{slugify(name)}.yaml"
    # Templates the blueprint no longer brings along are removed, so a
    # reinstall never leaves stale ones active.
    paths = blueprint_file_paths(hass.config.path(DASHBOARD_PATH), filename)
    files = {
        paths["button_card_templates/blueprints"]: filecontent.pop("button_card_templates", None) or None,
        paths["apexcharts_card_templates/blueprints"]: filecontent.pop("apexcharts_card_templates", None) or None,
    }
    files[paths["blueprints"]] = filecontent
    await hass.async_add_executor_job(replace_blueprint_files, files)
    connection.send_result(msg["id"], {"succesfull": filename})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "dwains_dashboard/delete_blueprint",
        vol.Required("blueprint"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
@serialize_configuration_mutation
async def ws_handle_delete_blueprint(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Delete a blueprint while preserving the legacy response contract."""
    blueprint = safe_path_segment(msg["blueprint"], "blueprint file name")
    if not blueprint.endswith(".yaml"):
        raise DashboardInputError(f"Invalid blueprint file name: {blueprint!r}")
    # The blueprint and the card templates it installed.
    paths = blueprint_file_paths(hass.config.path(DASHBOARD_PATH), blueprint)
    await hass.async_add_executor_job(
        replace_blueprint_files, {path: None for path in paths.values()}
    )
    connection.send_result(
        msg["id"], {"succesfull": "Blueprint deleted succesfull"}
    )
