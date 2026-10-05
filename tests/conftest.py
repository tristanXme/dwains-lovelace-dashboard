"""Shared fixtures: a real Home Assistant instance with Dwains Dashboard loaded."""

from __future__ import annotations

from pathlib import Path

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

REPO_ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "dwains_dashboard"


@pytest.fixture
def hass_config_dir(tmp_path: Path) -> str:
    """Use an isolated config directory per test.

    The integration resolves its frontend files and dashboard YAML relative to
    the config directory, exactly like a HACS installation.
    """
    (tmp_path / "custom_components").mkdir()
    (tmp_path / "custom_components" / DOMAIN).symlink_to(
        REPO_ROOT / "custom_components" / DOMAIN
    )
    return str(tmp_path)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Allow loading the integration under test."""
    return


@pytest.fixture
async def setup_dashboard(hass: HomeAssistant) -> MockConfigEntry:
    """Set up the integration through a config entry."""
    assert await async_setup_component(hass, "http", {})
    entry = MockConfigEntry(domain=DOMAIN, title="Dwains Dashboard")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
def config_path(hass: HomeAssistant):
    """Return a helper resolving paths below the test config directory."""
    return lambda *parts: Path(hass.config.path(*parts))
