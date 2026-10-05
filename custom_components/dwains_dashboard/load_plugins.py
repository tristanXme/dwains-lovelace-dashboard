import logging
from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig

_LOGGER = logging.getLogger(__name__)

from .const import FRONTEND_RESOURCE_REVISION, VERSION
from .runtime_data import get_domain_data

FRONTEND_PLUGIN_URLS = (
    f"/dwains_dashboard/js/dwains-dashboard-layout.js?version={VERSION}-{FRONTEND_RESOURCE_REVISION}",
    f"/dwains_dashboard/js/dwains-dashboard-loader.js?version={VERSION}-{FRONTEND_RESOURCE_REVISION}",
)
FRONTEND_PLUGINS_REGISTERED_KEY = "frontend_plugins_registered"
STATIC_PATH_REGISTERED_KEY = "frontend_static_path_registered"


def register_frontend_plugins(hass) -> None:
    """Register the owned frontend module URLs idempotently."""
    domain_data = get_domain_data(hass)
    if domain_data.get(FRONTEND_PLUGINS_REGISTERED_KEY):
        return
    for plugin_url in FRONTEND_PLUGIN_URLS:
        add_extra_js_url(hass, plugin_url)
    domain_data[FRONTEND_PLUGINS_REGISTERED_KEY] = True


def remove_frontend_plugins(hass) -> None:
    """Remove the owned frontend module URLs idempotently."""
    domain_data = get_domain_data(hass)
    if not domain_data.pop(FRONTEND_PLUGINS_REGISTERED_KEY, False):
        return
    for plugin_url in FRONTEND_PLUGIN_URLS:
        remove_extra_js_url(hass, plugin_url)


async def load_plugins(hass, name):
    #_LOGGER.warning(f"load_plugins() version: {VERSION}")

    # Load the tiny layout preload FIRST so the custom view layout element is
    # defined before HA renders the dashboard view (the big bundle loads async
    # and otherwise loses the race -> "Configuration error" on the whole view).
    register_frontend_plugins(hass)

    domain_data = get_domain_data(hass)
    if domain_data.get(STATIC_PATH_REGISTERED_KEY):
        return
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                "/dwains_dashboard/js",
                hass.config.path(f"custom_components/{name}/js"),
                True,
            )
        ]
    )
    domain_data[STATIC_PATH_REGISTERED_KEY] = True
