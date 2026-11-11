"""The YAML include / template pipeline that builds the dashboard."""

from __future__ import annotations

from pathlib import Path

import jinja2
import pytest
from annotatedyaml.objects import NodeDictClass, NodeStrClass

from custom_components.dwains_dashboard.process_yaml import (
    DashboardPathError,
    DashboardYamlProcessor,
)
from homeassistant.exceptions import HomeAssistantError


def _write(path: Path, text: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return path


@pytest.fixture
def base(tmp_path: Path) -> Path:
    config = tmp_path / "config"
    _write(config / "secrets.yaml", "password: TOP-SECRET\n")
    (config / "dwains-dashboard/configs").mkdir(parents=True)
    return config


@pytest.fixture
def processor(base: Path) -> DashboardYamlProcessor:
    return DashboardYamlProcessor([str(base / "dwains-dashboard")])


def _dd(base: Path, name: str, text: str) -> str:
    return str(_write(base / "dwains-dashboard/configs" / name, text))


def test_plain_yaml_loads(base, processor) -> None:
    page = _dd(base, "page.yaml", "type: markdown\ncontent: hi\n")
    assert processor.load_yaml(page) == {"type": "markdown", "content": "hi"}


def test_empty_file_loads_as_empty_mapping(base, processor) -> None:
    page = _dd(base, "empty.yaml", "# only a comment\n")
    assert processor.load_yaml(page) == {}


def test_values_carry_file_and_line_annotations(base, processor) -> None:
    page = _dd(base, "page.yaml", "card: !include sub.yaml\n")
    _dd(base, "sub.yaml", "a: 1\n")
    data = processor.load_yaml(page)
    assert isinstance(data["card"], NodeDictClass)
    # The annotation names the file containing the tag, and its line.
    assert data["card"].__config_file__ == page
    assert data["card"].__line__ == 1


def test_include_loads_a_relative_file(base, processor) -> None:
    _dd(base, "snippet.yaml", "value: 1\n")
    page = _dd(base, "page.yaml", "card: !include snippet.yaml\n")
    assert processor.load_yaml(page) == {"card": {"value": 1}}


def test_include_passes_template_arguments(base, processor) -> None:
    _dd(base, "tpl.yaml", "# dwains_dashboard\nname: {{ who }}\n")
    page = _dd(base, "page.yaml", "card: !include [tpl.yaml, {who: world}]\n")
    assert processor.load_yaml(page) == {"card": {"name": "world"}}


def test_include_of_a_missing_file_raises_homeassistant_error(base, processor) -> None:
    page = _dd(base, "page.yaml", "card: !include nope.yaml\n")
    with pytest.raises(HomeAssistantError):
        processor.load_yaml(page)


def test_include_dir_list_is_sorted_and_skips_hidden_and_secrets(base, processor) -> None:
    _dd(base, "cards/b.yaml", "n: b\n")
    _dd(base, "cards/a.yaml", "n: a\n")
    _dd(base, "cards/.hidden.yaml", "n: hidden\n")
    _dd(base, "cards/secrets.yaml", "n: secret\n")
    _dd(base, "cards/notes.txt", "n: text\n")
    _dd(base, "cards/empty.yaml", "# nothing\n")
    page = _dd(base, "page.yaml", "cards: !include_dir_list cards\n")
    # secrets.yaml is skipped by name; the empty file loads as {} and is kept.
    assert processor.load_yaml(page) == {"cards": [{"n": "a"}, {"n": "b"}, {}]}


def test_include_dir_named_keys_are_file_names(base, processor) -> None:
    _dd(base, "named/one.yaml", "n: 1\n")
    _dd(base, "named/sub/two.yaml", "n: 2\n")
    page = _dd(base, "page.yaml", "cards: !include_dir_named named\n")
    assert processor.load_yaml(page) == {"cards": {"one": {"n": 1}, "two": {"n": 2}}}


def test_include_dir_merge_variants(base, processor) -> None:
    _dd(base, "m/a.yaml", "x: 1\n")
    _dd(base, "m/b.yaml", "y: 2\n")
    _dd(base, "l/a.yaml", "- 1\n- 2\n")
    _dd(base, "l/b.yaml", "- 3\n")
    page = _dd(
        base,
        "page.yaml",
        "named: !include_dir_merge_named m\nlisted: !include_dir_merge_list l\n",
    )
    assert processor.load_yaml(page) == {"named": {"x": 1, "y": 2}, "listed": [1, 2, 3]}


def test_jinja_templates_render_with_arguments_and_globals(base, processor) -> None:
    processor.global_config = {"greeting": "hello"}
    processor.more_pages = {"p": 1}
    page = _dd(
        base,
        "page.yaml",
        "# dwains_dashboard\n"
        "a: {{ n * 2 }}\n"
        "b: {{ _global.greeting }}\n"
        "c: {{ _dd_more_pages | tojson }}\n"
        "d: {{ '{\"k\": 3}' | fromjson | tojson }}\n",
    )
    assert processor.load_yaml(page, args={"n": 21}) == {
        "a": 42,
        "b": "hello",
        "c": {"p": 1},
        "d": {"k": 3},
    }


def test_tojson_keeps_emoji_unescaped(base, processor) -> None:
    page = _dd(base, "page.yaml", "# dwains_dashboard\nicon: {{ '\U0001F600' | tojson }}\n")
    assert processor.load_yaml(page) == {"icon": "\U0001F600"}


@pytest.mark.parametrize(
    "marker", ["# dwains_dashboard", "# Dwains_Theme", "# lovelace_gen", "#dwains_dashboard"]
)
def test_first_line_marker_enables_templating(base, processor, marker) -> None:
    page = _dd(base, "page.yaml", f"{marker}\nvalue: {{{{ 1 + 1 }}}}\n")
    assert processor.load_yaml(page) == {"value": 2}


def test_without_marker_the_file_is_plain_yaml(base, processor) -> None:
    # Jinja syntax is not evaluated (the marker must be the first line).
    page = _dd(base, "page.yaml", "value: '{{ 1 + 1 }}'\n# dwains_dashboard\n")
    assert processor.load_yaml(page) == {"value": "{{ 1 + 1 }}"}


def test_the_sandbox_blocks_python_attribute_access(base, processor) -> None:
    page = _dd(base, "page.yaml", "# dwains_dashboard\nx: {{ ''.__class__.__mro__ }}\n")
    with pytest.raises(jinja2.exceptions.SecurityError):
        processor.load_yaml(page)


def test_the_sandbox_blocks_unsafe_callables(base, processor) -> None:
    page = _dd(
        base,
        "page.yaml",
        "# dwains_dashboard\nx: {{ ().__class__.__base__.__subclasses__() }}\n",
    )
    with pytest.raises(jinja2.exceptions.SecurityError):
        processor.load_yaml(page)


def test_secret_tag_is_rejected_naming_the_secret(base, processor) -> None:
    page = _dd(base, "page.yaml", "content: !secret password\n")
    with pytest.raises(HomeAssistantError) as err:
        processor.load_yaml(page)
    message = str(err.value)
    assert "!secret password is not supported" in message
    assert "page.yaml" in message


def test_secret_in_an_included_file_names_that_file(base, processor) -> None:
    _dd(base, "inner.yaml", "content: !secret token\n")
    page = _dd(base, "page.yaml", "card: !include inner.yaml\n")
    with pytest.raises(HomeAssistantError) as err:
        processor.load_yaml(page)
    assert "!secret token" in str(err.value)
    assert "inner.yaml" in str(err.value)


def test_invalid_yaml_raises_homeassistant_error(base, processor) -> None:
    page = _dd(base, "page.yaml", "a: [unclosed\n")
    with pytest.raises(HomeAssistantError):
        processor.load_yaml(page)


def test_invalid_yaml_after_templating_raises_homeassistant_error(base, processor) -> None:
    page = _dd(base, "page.yaml", "# dwains_dashboard\na: [{{ 1 }}\n")
    with pytest.raises(HomeAssistantError):
        processor.load_yaml(page)


@pytest.mark.parametrize("first_line", ["", "# dwains_dashboard\n"])
def test_undecodable_file_raises_homeassistant_error(base, processor, first_line) -> None:
    path = base / "dwains-dashboard/configs/bad.yaml"
    path.write_bytes(first_line.encode() + b"a: \xff\xfe\n")
    with pytest.raises(HomeAssistantError):
        processor.load_yaml(str(path))


def test_a_missing_file_raises_file_not_found(base, processor) -> None:
    with pytest.raises(FileNotFoundError):
        processor.load_yaml(str(base / "dwains-dashboard/configs/missing.yaml"))


def test_a_file_outside_the_roots_fails_through_load_yaml(base, processor) -> None:
    with pytest.raises(DashboardPathError):
        processor.load_yaml(str(base / "secrets.yaml"))


@pytest.mark.parametrize(
    "tag",
    [
        "!include ../../secrets.yaml",
        "!include_dir_list ../../..",
        "!include_dir_named ../../..",
        "!include_dir_merge_named ../../..",
        "!include_dir_merge_list ../../..",
    ],
)
def test_crafted_includes_cannot_leave_the_roots(base, processor, tag) -> None:
    _write(base / "other.yaml", "- outside\n")
    page = _dd(base, "page.yaml", f"x: {tag}\n")
    with pytest.raises(DashboardPathError):
        processor.load_yaml(page)


def test_crafted_include_inside_a_nested_include_is_checked(base, processor) -> None:
    _dd(base, "inner.yaml", f"x: !include {base}/secrets.yaml\n")
    page = _dd(base, "page.yaml", "card: !include inner.yaml\n")
    with pytest.raises(DashboardPathError):
        processor.load_yaml(page)


def test_include_node_strings_are_annotated(base, processor) -> None:
    _dd(base, "text.yaml", "just text\n")
    page = _dd(base, "page.yaml", "t: !include text.yaml\n")
    value = processor.load_yaml(page)["t"]
    assert value == "just text"
    assert isinstance(value, NodeStrClass)
