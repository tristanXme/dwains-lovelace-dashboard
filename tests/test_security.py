"""Permission checks, path traversal and YAML injection."""

from __future__ import annotations

import pytest

from homeassistant.core import HomeAssistant

# Every mutating command with a minimal valid payload.
WRITE_COMMANDS = {
    "edit_area_button": {"areaId": "kitchen"},
    "edit_area_bool_value": {"areaId": "kitchen", "key": "hidden", "value": True},
    "edit_homepage_header": {"disableClock": True},
    "sort_area_button": {"sortData": '["kitchen"]', "sortType": "sort_order"},
    "add_card": {"card_data": '{"type":"markdown"}', "page": "areas", "area_id": "kitchen"},
    "remove_card": {"area_id": "kitchen", "filename": "markdown"},
    "edit_entity": {"entity": "light.x"},
    "edit_entity_card": {"entityId": "light.x", "cardData": '{"type":"tile"}'},
    "edit_entity_popup": {"entityId": "light.x", "cardData": '{"type":"tile"}'},
    "remove_entity_card": {"entityId": "light.x"},
    "remove_entity_popup": {"entityId": "light.x"},
    "edit_entity_favorite": {"entityId": "light.x", "favorite": True},
    "edit_entity_bool_value": {"entityId": "light.x", "key": "hidden", "value": True},
    "edit_entities_bool_value": {"entities": '["light.x"]', "key": "hidden", "value": True},
    "sort_entity": {"sortData": '["light.x"]', "sortType": "sort_order"},
    "edit_device_button": {"device": "light"},
    "edit_device_card": {"domain": "light", "cardData": '{"type":"tile"}'},
    "edit_device_popup": {"domain": "light", "cardData": '{"type":"tile"}'},
    "remove_device_card": {"domain": "light"},
    "remove_device_popup": {"domain": "light"},
    "edit_device_bool_value": {"device": "light", "key": "hidden", "value": True},
    "sort_device_button": {"sortData": '["light"]'},
    "edit_more_page": {"name": "Energie", "card_data": '{"type":"markdown"}'},
    "edit_more_page_button": {"more_page": "energie", "name": "E"},
    "remove_more_page": {"foldername": "energie"},
    "add_more_page_to_navbar": {"more_page": "energie"},
    "sort_more_page": {"sortData": '["energie"]'},
    "install_blueprint": {"yamlCode": "blueprint:\n  name: x\ncard:\n  type: markdown\n"},
    "delete_blueprint": {"blueprint": "x.yaml"},
}

READ_COMMANDS = (
    "dwains_dashboard/configuration/get",
    "dwains_dashboard/navigation/get",
    "dwains_dashboard/more_pages/get",
    "dwains_dashboard/get_blueprints",
    "dwains_dashboard_notification/get",
)


async def _call(client, msg_type: str, **payload) -> dict:
    await client.send_json_auto_id({"type": msg_type, **payload})
    return await client.receive_json()


@pytest.mark.parametrize("command", sorted(WRITE_COMMANDS))
async def test_non_admin_cannot_write(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, hass_read_only_access_token, command
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    response = await _call(client, f"dwains_dashboard/{command}", **WRITE_COMMANDS[command])
    assert not response["success"]
    assert response["error"]["code"] == "unauthorized"


@pytest.mark.parametrize("command", sorted(WRITE_COMMANDS))
async def test_admin_minimal_payloads_succeed(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, command
) -> None:
    """Payloads with omitted optional fields never end in `unknown_error`."""
    client = await hass_ws_client(hass)
    # Pages referenced by the more-page commands must exist.
    await _call(
        client,
        "dwains_dashboard/edit_more_page",
        name="Energie",
        card_data='{"type":"markdown"}',
    )
    response = await _call(client, f"dwains_dashboard/{command}", **WRITE_COMMANDS[command])
    assert response["success"], response


@pytest.mark.parametrize("command", READ_COMMANDS)
async def test_non_admin_can_read(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, hass_read_only_access_token, command
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    response = await _call(client, command)
    assert response["success"], response


TRAVERSAL_CASES = [
    ("remove_entity_card", {"entityId": "../../../../canary"}),
    ("remove_entity_popup", {"entityId": "../../../../canary"}),
    ("edit_entity_card", {"entityId": "../../../../canary", "cardData": "{}"}),
    ("edit_entity_popup", {"entityId": "../../../../canary", "cardData": "{}"}),
    ("edit_device_card", {"domain": "../../../../canary", "cardData": "{}"}),
    ("remove_device_card", {"domain": "../../../../canary"}),
    ("remove_device_popup", {"domain": "../../../../canary"}),
    ("delete_blueprint", {"blueprint": "../../canary.yaml"}),
    ("delete_blueprint", {"blueprint": "../../canary.txt"}),
    ("delete_blueprint", {"blueprint": "secrets"}),
    ("add_card", {"card_data": '{"type":"../../../../../canary"}', "page": "areas", "area_id": "kitchen"}),
    ("add_card", {"card_data": '{"type":"x"}', "page": "areas", "area_id": "../../../../.."}),
    ("add_card", {"card_data": '{"type":"x"}', "page": "devices", "domain": ".."}),
    ("remove_card", {"area_id": "../../../..", "filename": "canary"}),
    ("remove_card", {"area_id": "kitchen", "filename": "../../../../../canary"}),
    ("remove_more_page", {"foldername": ".."}),
    ("edit_more_page_button", {"more_page": "../../..", "name": "x"}),
]


@pytest.mark.parametrize(("command", "payload"), TRAVERSAL_CASES)
async def test_path_traversal_is_rejected(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path, command, payload
) -> None:
    for name in ("canary.yaml", "canary.txt"):
        config_path(name).write_text("keep: me\n")

    client = await hass_ws_client(hass)
    response = await _call(client, f"dwains_dashboard/{command}", **payload)

    assert not response["success"]
    assert response["error"]["code"] in ("invalid_format", "invalid_foldername")
    assert config_path("canary.yaml").read_text() == "keep: me\n"
    assert config_path("canary.txt").read_text() == "keep: me\n"


@pytest.mark.parametrize(
    "name",
    [
        "Strom: Haus",
        "Raum #1",
        "!secret dashboard_test_secret",
        "!include ../../../../secrets.yaml",
        '"quoted" <b>&amp;',
        "{{ 7 * 7 }}",
        "Küche 🏠",
        "- list",
    ],
)
async def test_more_page_names_are_plain_text(
    hass: HomeAssistant,
    setup_dashboard,
    hass_ws_client,
    hass_read_only_access_token,
    config_path,
    name,
) -> None:
    """A page name never breaks the dashboard or exposes secrets."""
    config_path("secrets.yaml").write_text("dashboard_test_secret: TOP-SECRET\n")
    admin = await hass_ws_client(hass)
    response = await _call(
        admin,
        "dwains_dashboard/edit_more_page",
        name=name,
        icon="mdi:flash",
        card_data='{"type":"markdown","content":"x"}',
    )
    assert response["success"], response

    user = await hass_ws_client(hass, hass_read_only_access_token)
    response = await _call(user, "lovelace/config", url_path="dwains-dashboard", force=True)
    assert response["success"], response
    titles = [view.get("title") for view in response["result"]["views"]]
    assert name.strip() in titles
    assert "TOP-SECRET" not in str(response["result"])
