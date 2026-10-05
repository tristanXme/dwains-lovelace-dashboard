"""Export and import of all dashboard settings (Home Assistant side)."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta
from http import HTTPStatus

from aiohttp import web

from homeassistant.components.file_upload import process_uploaded_file
from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView
from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant

from .const import VERSION
from .configuration_runtime import get_configuration_runtime
from .settings_transfer import (
    ImportResult,
    export_archive,
    export_path,
    import_archive,
)

_LOGGER = logging.getLogger(__name__)

DASHBOARD_PATH = "dwains-dashboard"
EXPORT_URL = "/api/dwains_dashboard/export/{filename}"
DOWNLOAD_LINK_VALID = timedelta(minutes=10)
EXPORTED_OPTIONS = ("sidepanel_title", "sidepanel_icon")
RELOAD_EVENTS = (
    "dwains_dashboard_config_reload",
    "dwains_dashboard_homepage_card_reload",
    "dwains_dashboard_devicespage_card_reload",
    "dwains_dashboard_navigation_card_reload",
    "dwains_dashboard_more_pages_reload",
    "dwains_dashboard_reload",
)
_VIEW_REGISTERED = "dwains_dashboard_export_view"


def _stamp() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")


class DwainsDashboardExportView(HomeAssistantView):
    """Serves export archives to administrators (signed link from the flow)."""

    url = EXPORT_URL
    name = "api:dwains_dashboard:export"
    requires_auth = True

    async def get(self, request: web.Request, filename: str) -> web.StreamResponse:
        hass: HomeAssistant = request.app["hass"]
        if not request[KEY_HASS_USER].is_admin:
            return web.Response(status=HTTPStatus.UNAUTHORIZED)
        path = await hass.async_add_executor_job(
            export_path, hass.config.path(DASHBOARD_PATH), filename
        )
        if path is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        return web.FileResponse(
            path,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Cache-Control": "no-store",
            },
        )


def async_register_export_view(hass: HomeAssistant) -> None:
    """Register the download view once per Home Assistant run."""
    if hass.data.get(_VIEW_REGISTERED):
        return
    hass.http.register_view(DwainsDashboardExportView())
    hass.data[_VIEW_REGISTERED] = True


async def async_export(hass: HomeAssistant, options) -> tuple[str, int, str]:
    """Write an export archive.

    Returns the file name, the number of files and a signed download link
    for the current user.
    """
    manifest = {
        "dashboard_version": VERSION,
        "created": datetime.now().astimezone().isoformat(timespec="seconds"),
        "options": {key: options[key] for key in EXPORTED_OPTIONS if key in options},
    }
    runtime = get_configuration_runtime(hass)
    async with runtime.mutation_lock:
        filename, files = await hass.async_add_executor_job(
            export_archive, hass.config.path(DASHBOARD_PATH), _stamp(), manifest
        )
    link = async_sign_path(
        hass, EXPORT_URL.format(filename=filename), DOWNLOAD_LINK_VALID
    )
    return filename, files, link


def _read_upload(hass: HomeAssistant, file_id: str) -> bytes:
    with process_uploaded_file(hass, file_id) as path:
        return path.read_bytes()


async def async_import(hass: HomeAssistant, file_id: str) -> ImportResult:
    """Replace all dashboard settings with an uploaded export.

    Raises settings_transfer.InvalidArchive for files that are not an export.
    """
    content = await hass.async_add_executor_job(_read_upload, hass, file_id)
    base = hass.config.path(DASHBOARD_PATH)
    runtime = get_configuration_runtime(hass)
    async with runtime.mutation_lock:
        runtime.clear_cache()
        try:
            result = await hass.async_add_executor_job(
                import_archive, base, content, _stamp()
            )
        finally:
            runtime.clear_cache()
    _LOGGER.info(
        "Imported %d dashboard files, previous settings in %s",
        result.files,
        os.path.join(DASHBOARD_PATH, "backups", result.backup),
    )

    from .process_yaml import reload_configuration

    await reload_configuration(hass)
    for event_type in RELOAD_EVENTS:
        hass.bus.async_fire(event_type)
    return result
