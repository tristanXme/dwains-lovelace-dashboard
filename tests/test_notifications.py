"""Lifecycle of the dashboard notifications."""

from __future__ import annotations

import pytest
from pytest_homeassistant_custom_component.common import async_capture_events

from custom_components.dwains_dashboard.notifications import (
    EVENT_DWAINS_dashboard_NOTIFICATIONS_UPDATED as UPDATED,
)
from custom_components.dwains_dashboard.runtime_data import get_domain_data
from homeassistant.core import HomeAssistant

DOMAIN = "dwains_dashboard"


async def _service(hass: HomeAssistant, name: str, **data) -> None:
    await hass.services.async_call(DOMAIN, f"notification_{name}", data, blocking=True)
    await hass.async_block_till_done()


async def _get(client) -> list[dict]:
    await client.send_json_auto_id({"type": "dwains_dashboard_notification/get"})
    response = await client.receive_json()
    assert response["success"], response
    return response["result"]


def _store(hass: HomeAssistant) -> dict:
    return get_domain_data(hass)["notifications"]


async def test_create_with_id_and_title(hass: HomeAssistant, setup_dashboard) -> None:
    events = async_capture_events(hass, UPDATED)
    await _service(hass, "create", message="Hello", title="Greeting", notification_id="My Note")

    state = hass.states.get("dwains_dashboard.my_note")
    assert state is not None
    assert state.state == "notifying"
    assert state.attributes["message"] == "Hello"
    assert state.attributes["title"] == "Greeting"

    stored = _store(hass)["dwains_dashboard.my_note"]
    assert stored["message"] == "Hello"
    assert stored["title"] == "Greeting"
    assert stored["notification_id"] == "My Note"
    assert stored["status"] == "unread"
    assert stored["created_at"] is not None
    assert len(events) == 1


async def test_create_without_id_or_title_generates_an_entity(
    hass: HomeAssistant, setup_dashboard
) -> None:
    events = async_capture_events(hass, UPDATED)
    await _service(hass, "create", message="First")
    await _service(hass, "create", message="Second")

    state = hass.states.get("dwains_dashboard.notification")
    second = hass.states.get("dwains_dashboard.notification_2")
    assert state is not None and second is not None
    assert state.attributes["message"] == "First"
    assert "title" not in state.attributes

    stored = _store(hass)["dwains_dashboard.notification"]
    assert stored["notification_id"] == "notification"
    assert stored["title"] is None
    assert len(events) == 2


async def test_create_with_an_existing_id_replaces_the_notification(
    hass: HomeAssistant, setup_dashboard
) -> None:
    await _service(hass, "create", message="old", notification_id="same")
    await _service(hass, "create", message="new", notification_id="same")
    assert list(_store(hass)) == ["dwains_dashboard.same"]
    assert hass.states.get("dwains_dashboard.same").attributes["message"] == "new"


async def test_create_requires_a_message(hass: HomeAssistant, setup_dashboard) -> None:
    import voluptuous as vol

    with pytest.raises(vol.Invalid):
        await _service(hass, "create", title="no message")


async def test_dismiss_removes_entity_and_store_entry(
    hass: HomeAssistant, setup_dashboard
) -> None:
    await _service(hass, "create", message="one", notification_id="a")
    await _service(hass, "create", message="two", notification_id="b")
    events = async_capture_events(hass, UPDATED)

    await _service(hass, "dismiss", notification_id="a")

    assert hass.states.get("dwains_dashboard.a") is None
    assert hass.states.get("dwains_dashboard.b") is not None
    assert list(_store(hass)) == ["dwains_dashboard.b"]
    assert len(events) == 1


async def test_dismiss_unknown_id_is_a_noop(hass: HomeAssistant, setup_dashboard) -> None:
    await _service(hass, "create", message="one", notification_id="a")
    events = async_capture_events(hass, UPDATED)

    await _service(hass, "dismiss", notification_id="ghost")

    assert list(_store(hass)) == ["dwains_dashboard.a"]
    assert hass.states.get("dwains_dashboard.a") is not None
    assert events == []


async def test_mark_read_flips_status_and_fires_event(
    hass: HomeAssistant, setup_dashboard
) -> None:
    await _service(hass, "create", message="one", notification_id="a")
    events = async_capture_events(hass, UPDATED)

    await _service(hass, "mark_read", notification_id="a")

    assert _store(hass)["dwains_dashboard.a"]["status"] == "read"
    # The entity stays: only the stored status changes.
    assert hass.states.get("dwains_dashboard.a") is not None
    assert len(events) == 1


async def test_mark_read_unknown_id_is_logged_not_raised(
    hass: HomeAssistant, setup_dashboard, caplog
) -> None:
    events = async_capture_events(hass, UPDATED)
    await _service(hass, "mark_read", notification_id="ghost")
    assert "ghost not found" in caplog.text
    assert events == []


async def test_websocket_get_returns_stored_notifications(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    assert await _get(client) == []

    await _service(hass, "create", message="one", title="T", notification_id="a")
    await _service(hass, "create", message="two", notification_id="b")
    await _service(hass, "mark_read", notification_id="a")

    result = await _get(client)
    assert [n["notification_id"] for n in result] == ["a", "b"]
    assert result[0]["status"] == "read"
    assert result[0]["title"] == "T"
    assert result[1]["status"] == "unread"
    assert result[1]["title"] is None
    assert all(set(n) == {"notification_id", "message", "status", "title", "created_at"} for n in result)

    await _service(hass, "dismiss", notification_id="a")
    assert [n["notification_id"] for n in await _get(client)] == ["b"]
