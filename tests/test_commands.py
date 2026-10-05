"""Behaviour of the configuration commands."""

from __future__ import annotations

import os
from pathlib import Path

import pytest
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


async def test_cards_of_one_type_get_their_own_files(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    for content in ("one", "two", "three"):
        response = await _call(
            client,
            "dwains_dashboard/add_card",
            card_data=f'{{"type":"markdown","content":"{content}"}}',
            page="areas",
            area_id="kitchen",
        )
        assert response["success"], response
    response = await _call(client, "dwains_dashboard/configuration/get")
    cards = response["result"]["area_cards"]["kitchen"]
    assert sorted(cards) == ["markdown-2.yaml", "markdown-3.yaml", "markdown.yaml"]
    assert sorted(card["content"] for card in cards.values()) == ["one", "three", "two"]


async def test_more_pages_with_the_same_name_get_their_own_folders(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    folders = []
    for _ in range(3):
        response = await _call(
            client, "dwains_dashboard/edit_more_page", name="Energy", card_data='{"type":"markdown"}'
        )
        assert response["success"], response
        folders.append(response["result"]["foldername"])
    assert folders == ["energy", "energy-2", "energy-3"]


async def test_a_failed_more_page_save_changes_nothing(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path, monkeypatch
) -> None:
    from custom_components.dwains_dashboard import more_page_commands

    client = await hass_ws_client(hass)
    response = await _call(
        client, "dwains_dashboard/edit_more_page", name="Energy", card_data='{"type":"markdown","content":"old"}'
    )
    assert response["success"], response
    folder = config_path("dwains-dashboard/configs/more_pages/energy")
    before = {path.name: path.read_text() for path in folder.iterdir()}

    def failing_dump(path, content):
        raise OSError("disk full")

    monkeypatch.setattr(more_page_commands, "dump_yaml_file", failing_dump)
    response = await _call(
        client,
        "dwains_dashboard/edit_more_page",
        foldername="energy",
        name="Renamed",
        card_data='{"type":"markdown","content":"new"}',
    )
    assert not response["success"]
    assert {path.name: path.read_text() for path in folder.iterdir()} == before

    # A new page that cannot be saved leaves no folder behind.
    response = await _call(
        client, "dwains_dashboard/edit_more_page", name="Water", card_data='{"type":"markdown"}'
    )
    assert not response["success"]
    assert not config_path("dwains-dashboard/configs/more_pages/water").exists()

    # Sorting saves all positions or none.
    response = await _call(
        client, "dwains_dashboard/edit_more_page", name="Gas", card_data='{"type":"markdown"}'
    )
    assert not response["success"]
    monkeypatch.undo()
    response = await _call(
        client, "dwains_dashboard/edit_more_page", name="Gas", card_data='{"type":"markdown"}'
    )
    assert response["success"], response
    configs = config_path("dwains-dashboard/configs/more_pages")
    before = {p: (configs / p / "config.yaml").read_text() for p in ("energy", "gas")}
    calls = []

    def second_fails(path, content):
        calls.append(path)
        if len(calls) == 2:
            raise OSError("disk full")
        from custom_components.dwains_dashboard.yaml_files import dump_yaml_file

        dump_yaml_file(path, content)

    monkeypatch.setattr(more_page_commands, "dump_yaml_file", second_fails)
    response = await _call(client, "dwains_dashboard/sort_more_page", sortData='["gas", "energy"]')
    assert not response["success"]
    assert {p: (configs / p / "config.yaml").read_text() for p in ("energy", "gas")} == before
    assert not [p for p in configs.rglob(".*")]


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


async def test_area_graph_setting_round_trip(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    areas_file = config_path("dwains-dashboard/configs/areas.yaml")

    response = await _call(
        client,
        "dwains_dashboard/edit_area_button",
        areaId="living",
        icon="mdi:sofa",
        graphEntity="sensor.living_temperature",
        graphHours=48,
    )
    assert response["success"], response
    area = yaml.safe_load(areas_file.read_text())["living"]
    assert area["graph_entity"] == "sensor.living_temperature"
    assert area["graph_hours"] == 48
    assert area["icon"] == "mdi:sofa"

    # Without a graph entity both keys disappear again.
    response = await _call(
        client, "dwains_dashboard/edit_area_button", areaId="living", icon="mdi:sofa"
    )
    assert response["success"], response
    area = yaml.safe_load(areas_file.read_text())["living"]
    assert "graph_entity" not in area
    assert "graph_hours" not in area


async def test_area_graph_rejects_invalid_input(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(
        client,
        "dwains_dashboard/edit_area_button",
        areaId="living",
        graphEntity="light.lamp",
    )
    assert not response["success"]
    assert response["error"]["code"] == "invalid_format"

    response = await _call(
        client,
        "dwains_dashboard/edit_area_button",
        areaId="living",
        graphEntity="sensor.x",
        graphHours=5,
    )
    assert not response["success"]


async def test_area_sensors_below_the_name(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    areas_file = config_path("dwains-dashboard/configs/areas.yaml")

    response = await _call(
        client,
        "dwains_dashboard/edit_area_button",
        areaId="living",
        sensorEntities=["sensor.living_temperature", "sensor.living_temperature"],
        binarySensorEntities=["binary_sensor.living_window"],
    )
    assert response["success"], response
    area = yaml.safe_load(areas_file.read_text())["living"]
    assert area["sensor_entities"] == ["sensor.living_temperature"]
    assert area["binary_sensor_entities"] == ["binary_sensor.living_window"]

    # Left out: unchanged (older dialogs do not send the lists).
    response = await _call(client, "dwains_dashboard/edit_area_button", areaId="living")
    assert response["success"], response
    area = yaml.safe_load(areas_file.read_text())["living"]
    assert area["sensor_entities"] == ["sensor.living_temperature"]

    # Empty: removed.
    response = await _call(
        client,
        "dwains_dashboard/edit_area_button",
        areaId="living",
        sensorEntities=[],
        binarySensorEntities=[],
    )
    assert response["success"], response
    area = yaml.safe_load(areas_file.read_text())["living"]
    assert "sensor_entities" not in area
    assert "binary_sensor_entities" not in area

    for field, value in (
        ("sensorEntities", ["binary_sensor.window"]),
        ("binarySensorEntities", ["sensor.temperature"]),
        ("sensorEntities", ["sensor.../x"]),
    ):
        response = await _call(
            client, "dwains_dashboard/edit_area_button", areaId="living", **{field: value}
        )
        assert not response["success"], (field, value)


BLUEPRINT_YAML = "blueprint:\n  name: Test Blueprint\ncard:\n  type: markdown\n  content: hi\n"


async def test_install_blueprint_writes_the_pasted_yaml(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(client, "dwains_dashboard/install_blueprint", yamlCode=BLUEPRINT_YAML)
    assert response["success"], response
    assert response["result"] == {"succesfull": "test_blueprint.yaml"}
    installed = yaml.safe_load(
        config_path("dwains-dashboard/blueprints/test_blueprint.yaml").read_text()
    )
    assert installed == yaml.safe_load(BLUEPRINT_YAML)


async def test_install_blueprint_rejects_unusable_yaml(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    cases = {
        "empty": "",
        "only whitespace": "  \n",
        "invalid syntax": "blueprint: [unclosed",
        "list at the top": "- blueprint\n- card\n",
        "scalar at the top": "just text",
        # What the frontend sent before: the YAML as a JSON string literal.
        "JSON string of the YAML": '"blueprint:\\n  name: Test Blueprint\\ncard:\\n  type: markdown\\n"',
    }
    for case, code in cases.items():
        response = await _call(client, "dwains_dashboard/install_blueprint", yamlCode=code)
        assert not response["success"], case
        assert response["error"]["code"] == "invalid_format", (case, response)
    assert not config_path("dwains-dashboard/blueprints").exists() or not any(
        config_path("dwains-dashboard/blueprints").iterdir()
    )


async def test_install_blueprint_without_card_reports_it(
    hass: HomeAssistant, setup_dashboard, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(
        client, "dwains_dashboard/install_blueprint", yamlCode="blueprint:\n  name: Test\n"
    )
    assert response["success"], response
    assert response["result"] == {"error": "Blueprint has no card"}


BLUEPRINT_WITH_TEMPLATES = (
    "blueprint:\n  name: Fancy\n"
    "card:\n  type: custom:button-card\n  template: fancy\n"
    "button_card_templates:\n  fancy:\n    color: red\n"
    "apexcharts_card_templates:\n  fancy_chart:\n    header: {show: true}\n"
)


def _blueprint_files(config_path) -> dict[str, bool]:
    return {
        folder: config_path(f"dwains-dashboard/{folder}/fancy.yaml").exists()
        for folder in (
            "blueprints",
            "button_card_templates/blueprints",
            "apexcharts_card_templates/blueprints",
        )
    }


async def test_blueprint_files_are_installed_replaced_and_removed_together(
    hass: HomeAssistant, setup_dashboard, hass_ws_client, config_path
) -> None:
    client = await hass_ws_client(hass)
    response = await _call(client, "dwains_dashboard/install_blueprint", yamlCode=BLUEPRINT_WITH_TEMPLATES)
    assert response["result"] == {"succesfull": "fancy.yaml"}
    assert all(_blueprint_files(config_path).values())
    assert yaml.safe_load(
        config_path("dwains-dashboard/button_card_templates/blueprints/fancy.yaml").read_text()
    ) == {"fancy": {"color": "red"}}
    blueprint = yaml.safe_load(config_path("dwains-dashboard/blueprints/fancy.yaml").read_text())
    assert "button_card_templates" not in blueprint

    # A new version without templates removes the old ones.
    response = await _call(
        client,
        "dwains_dashboard/install_blueprint",
        yamlCode="blueprint:\n  name: Fancy\ncard:\n  type: markdown\n",
    )
    assert response["result"] == {"succesfull": "fancy.yaml"}
    assert _blueprint_files(config_path) == {
        "blueprints": True,
        "button_card_templates/blueprints": False,
        "apexcharts_card_templates/blueprints": False,
    }

    await _call(client, "dwains_dashboard/install_blueprint", yamlCode=BLUEPRINT_WITH_TEMPLATES)
    response = await _call(client, "dwains_dashboard/delete_blueprint", blueprint="fancy.yaml")
    assert response["success"], response
    assert not any(_blueprint_files(config_path).values())


def test_a_failed_blueprint_write_restores_the_previous_files(tmp_path, monkeypatch) -> None:
    from custom_components.dwains_dashboard import blueprint_files

    base = tmp_path / "dashboard"
    paths = blueprint_files.blueprint_file_paths(str(base), "fancy.yaml")
    for folder, path in paths.items():
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(f"old: {folder}\n")
    before = {path: Path(path).read_text() for path in paths.values()}

    calls = []

    def failing_dump(path, content):
        calls.append(path)
        if len(calls) == 2:
            raise OSError("disk full")
        Path(path).write_text(yaml.safe_dump(content))

    monkeypatch.setattr(blueprint_files, "dump_yaml_file", failing_dump)
    with pytest.raises(OSError, match="disk full"):
        blueprint_files.replace_blueprint_files({path: {"new": True} for path in paths.values()})

    assert {path: Path(path).read_text() for path in paths.values()} == before
    leftovers = [p.name for p in base.rglob("*") if p.is_file() and not p.name.endswith("fancy.yaml")]
    assert leftovers == []


def test_a_failed_move_aside_restores_the_previous_files(tmp_path, monkeypatch) -> None:
    from custom_components.dwains_dashboard import blueprint_files, mutation_files

    base = tmp_path / "dashboard"
    paths = blueprint_files.blueprint_file_paths(str(base), "fancy.yaml")
    for path in paths.values():
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text("old: true\n")
    moves = []

    def failing_move(source, target):
        moves.append(source)
        if len(moves) == 2:
            raise OSError("busy")
        os.replace(source, target)

    monkeypatch.setattr(mutation_files, "_move", failing_move)
    with pytest.raises(OSError, match="busy"):
        blueprint_files.replace_blueprint_files({path: None for path in paths.values()})
    assert all(Path(path).read_text() == "old: true\n" for path in paths.values())
