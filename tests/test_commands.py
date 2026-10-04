"""Behaviour of the configuration commands."""

from __future__ import annotations

import yaml

from homeassistant.core import HomeAssistant


async def _call(client, msg_type: str, **payload) -> dict:
    await client.send_json_auto_id({"type": msg_type, **payload})
    return await client.receive_json()


async def test_invalid_input_returns_invalid_format(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    cases = [
        ("dwains_dashboard/add_card", {"card_data": "not json", "page": "areas", "area_id": "a"}),
        ("dwains_dashboard/add_card", {"card_data": "[1]", "page": "areas", "area_id": "a"}),
        ("dwains_dashboard/add_card", {"card_data": "{}", "page": "areas", "area_id": "a"}),
        ("dwains_dashboard/add_card", {"card_data": '{"type":"x"}', "page": "nope"}),
        ("dwains_dashboard/sort_entity", {"sortData": '{"a":1}', "sortType": "sort_order"}),
        ("dwains_dashboard/sort_entity", {"sortData": '["a"]', "sortType": ""}),
        ("dwains_dashboard/install_blueprint", {"yamlCode": "- a list"}),
        ("dwains_dashboard/install_blueprint", {"yamlCode": "a: [unclosed"}),
        ("dwains_dashboard/install_blueprint", {"yamlCode": "blueprint:\n  name: 5\ncard: {type: x}"}),
        ("dwains_dashboard/edit_entities_bool_value", {"entities": "[1, 2]", "key": "hidden", "value": True}),
    ]
    for msg_type, payload in cases:
        response = await _call(client, msg_type, **payload)
        assert not response["success"], (msg_type, payload)
        assert response["error"]["code"] == "invalid_format", (msg_type, payload, response)


async def test_edit_entity_partial_payload_uses_form_defaults(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(
        client, "dwains_dashboard/edit_entity", entity="light.x", hideEntity=True
    )
    assert response["success"], response
    entities = yaml.safe_load(config_path("dwains-dashboard/configs/entities.yaml").read_text())
    assert entities["light.x"]["hidden"] is True
    assert entities["light.x"]["friendly_name"] == ""
    assert entities["light.x"]["col_span"] == "1"


async def test_editing_more_page_keeps_sort_order(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    for name in ("Alpha", "Beta"):
        response = await _call(
            client, "dwains_dashboard/edit_more_page", name=name, card_data='{"type":"markdown"}'
        )
        assert response["success"], response
    response = await _call(client, "dwains_dashboard/sort_more_page", sortData='["beta", "alpha"]')
    assert response["success"], response

    response = await _call(
        client,
        "dwains_dashboard/edit_more_page",
        foldername="beta",
        name="Beta renamed",
        card_data='{"type":"markdown","content":"new"}',
    )
    assert response["success"], response
    config = yaml.safe_load(
        config_path("dwains-dashboard/configs/more_pages/beta/config.yaml").read_text()
    )
    assert config["sort_order"] == 1
    assert config["name"] == "Beta renamed"

    response = await _call(client, "dwains_dashboard/more_pages/get")
    pages = response["result"]["more_pages"]
    assert sorted(pages, key=lambda folder: pages[folder]["sort_order"]) == ["beta", "alpha"]


async def test_more_page_config_without_name_does_not_break_reload(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    page_dir = config_path("dwains-dashboard/configs/more_pages/manual")
    page_dir.mkdir(parents=True)
    (page_dir / "page.yaml").write_text("type: markdown\ncontent: hi\n")
    (page_dir / "config.yaml").write_text("show_in_navbar: true\n")

    await hass.services.async_call("dwains_dashboard", "reload", blocking=True)
    client = await hass_ws_client(hass)
    response = await _call(client, "lovelace/config", url_path="dwains-dashboard", force=True)
    assert response["success"], response
    assert "manual" in [view.get("title") for view in response["result"]["views"]]


async def test_card_files_round_trip(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(
        client,
        "dwains_dashboard/add_card",
        card_data='{"type":"custom:mushroom-entity-card","entity":"light.x"}',
        page="areas",
        area_id="kitchen",
    )
    assert response["success"], response
    assert response["result"]["card"]["entity"] == "light.x"

    response = await _call(client, "dwains_dashboard/configuration/get")
    cards = response["result"]["area_cards"]["kitchen"]
    assert list(cards) == ["custom:mushroom-entity-card.yaml"]

    response = await _call(
        client,
        "dwains_dashboard/remove_card",
        area_id="kitchen",
        filename="custom:mushroom-entity-card",
    )
    assert response["success"], response
    response = await _call(client, "dwains_dashboard/configuration/get")
    assert response["result"]["area_cards"]["kitchen"] == {}


async def test_notification_with_broken_template(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    """A template error is logged and the raw template is shown instead."""
    await hass.services.async_call(
        "dwains_dashboard",
        "notification_create",
        {"message": "{{ 1 / 0 }}", "notification_id": "broken"},
        blocking=True,
    )
    client = await hass_ws_client(hass)
    response = await _call(client, "dwains_dashboard_notification/get")
    assert response["success"]
    assert response["result"][0]["message"] == "{{ 1 / 0 }}"
