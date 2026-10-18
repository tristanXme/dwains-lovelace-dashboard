"""More pages: every reader follows the same rules, and a page that cannot be
read never takes the dashboard, the navigation or the other pages down."""

from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

DOMAIN = "dwains_dashboard"
SETTINGS = "name: {folder}\nicon: mdi:flash\n"


def _page(config_path, folder: str, page: str, config: str | None = SETTINGS) -> Path:
    path = config_path("dwains-dashboard/configs/more_pages", folder)
    path.mkdir(parents=True, exist_ok=True)
    (path / "page.yaml").write_text(page)
    if config is not None:
        (path / "config.yaml").write_text(config.format(folder=folder))
    return path


async def _call(client, msg_type: str, **payload) -> dict:
    await client.send_json_auto_id({"type": msg_type, **payload})
    return await client.receive_json()


async def _reload(hass: HomeAssistant) -> None:
    await hass.services.async_call(DOMAIN, "reload", blocking=True)


async def _views(client) -> list[str]:
    response = await _call(client, "lovelace/config", url_path="dwains-dashboard", force=True)
    assert response["success"], response
    return [view.get("path") for view in response["result"]["views"]]


async def test_pages_with_includes_and_templates_show_their_cards(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    """The page shows what the dashboard always read: includes and templates
    resolved. `templated` tells the editor that saving would replace them."""
    _page(config_path, "plain", "type: markdown\ncontent: plain\n")
    _page(config_path, "include", "type: vertical-stack\ncards: !include ../snippet.yaml\n")
    config_path("dwains-dashboard/configs/more_pages/snippet.yaml").write_text(
        "- type: markdown\n  content: included\n"
    )
    _page(
        config_path,
        "template",
        "# dwains_dashboard\ntype: vertical-stack\ncards:\n"
        "{% for n in range(2) %}\n  - type: markdown\n    content: \"part {{ n }}\"\n{% endfor %}\n",
    )
    await _reload(hass)
    client = await hass_ws_client(hass)

    response = await _call(client, "dwains_dashboard/more_page/get", foldername="plain")
    assert response["result"]["card"] == {"type": "markdown", "content": "plain"}
    assert response["result"]["templated"] is False

    response = await _call(client, "dwains_dashboard/more_page/get", foldername="include")
    assert response["success"], response
    assert response["result"]["card"]["cards"] == [{"type": "markdown", "content": "included"}]
    assert response["result"]["templated"] is True

    response = await _call(client, "dwains_dashboard/more_page/get", foldername="template")
    assert response["success"], response
    assert [card["content"] for card in response["result"]["card"]["cards"]] == ["part 0", "part 1"]
    assert response["result"]["templated"] is True

    # Valid pages are no broken files.
    response = await _call(client, "dwains_dashboard/configuration/get")
    assert response["success"], response
    assert ir.async_get(hass).async_get_issue(DOMAIN, "broken_configuration_files") is None


async def test_a_page_without_settings_uses_the_defaults(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    """An empty config.yaml used to break the navigation of every page."""
    _page(config_path, "energy", "type: markdown\n")
    _page(config_path, "bare", "type: markdown\ncontent: bare\n", config="")
    await _reload(hass)
    client = await hass_ws_client(hass)

    for msg_type in ("dwains_dashboard/navigation/get", "dwains_dashboard/more_pages/get"):
        response = await _call(client, msg_type)
        assert response["success"], (msg_type, response)
        pages = response["result"]["more_pages"]
        assert sorted(pages) == ["bare", "energy"]
        assert pages["bare"] == {
            "name": "bare",
            "icon": "mdi:puzzle",
            "show_in_navbar": False,
            "sort_order": 99,
        }
    response = await _call(client, "dwains_dashboard/more_page/get", foldername="bare")
    assert response["result"]["name"] == "bare"
    assert response["result"]["card"] == {"type": "markdown", "content": "bare"}
    assert "more_page_bare" in await _views(client)


async def test_a_page_whose_settings_cannot_be_read_is_left_out(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    _page(config_path, "energy", "type: markdown\n")
    _page(config_path, "broken", "type: markdown\n", config="name: [unclosed\n")
    await _reload(hass)
    client = await hass_ws_client(hass)

    for msg_type in ("dwains_dashboard/navigation/get", "dwains_dashboard/more_pages/get"):
        response = await _call(client, msg_type)
        assert response["success"], (msg_type, response)
        assert list(response["result"]["more_pages"]) == ["energy"]
    response = await _call(client, "dwains_dashboard/more_page/get", foldername="broken")
    assert response["error"]["code"] == "invalid_page"
    assert response["error"]["message"].startswith("config.yaml: ")
    assert "(line " in response["error"]["message"]

    # Other pages are saved as before; the broken one says why it cannot be.
    response = await _call(
        client, "dwains_dashboard/edit_more_page", name="Water", card_data='{"type":"markdown"}'
    )
    assert response["success"], response
    assert response["result"]["page"]["name"] == "Water"
    response = await _call(client, "dwains_dashboard/add_more_page_to_navbar", more_page="broken")
    assert response["error"]["code"] == "invalid_format"
    assert "broken/config.yaml cannot be read" in response["error"]["message"]

    views = await _views(client)
    assert {"more_page_energy", "more_page_water"} <= set(views)
    assert "more_page_broken" not in views


async def test_a_page_that_cannot_be_read_only_affects_itself(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    """A broken page.yaml made the whole dashboard show an error."""
    _page(config_path, "energy", "type: markdown\n")
    _page(config_path, "broken", "type: markdown\ncontent: [unclosed\n")
    _page(config_path, "outside", "type: vertical-stack\ncards: !include ../../../../secrets.yaml\n")
    config_path("secrets.yaml").write_text("- password\n")
    await _reload(hass)
    client = await hass_ws_client(hass)

    assert {"more_page_energy", "more_page_broken", "more_page_outside"} <= set(await _views(client))
    response = await _call(client, "dwains_dashboard/navigation/get")
    assert sorted(response["result"]["more_pages"]) == ["broken", "energy", "outside"]

    response = await _call(client, "dwains_dashboard/more_page/get", foldername="broken")
    assert response["error"]["code"] == "invalid_page"
    assert response["error"]["message"].startswith("page.yaml: ")
    assert "(line 3)" in response["error"]["message"]
    assert config_path().as_posix() not in response["error"]["message"]

    # Includes stay limited to the dashboard folders.
    response = await _call(client, "dwains_dashboard/more_page/get", foldername="outside")
    assert response["error"]["code"] == "invalid_page"
    assert "outside the Dwains Dashboard folders" in response["error"]["message"]
    assert "password" not in str(response)

    response = await _call(client, "dwains_dashboard/more_page/get", foldername="energy")
    assert response["result"]["card"] == {"type": "markdown"}
