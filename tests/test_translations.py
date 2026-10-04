"""Translation strings must be valid for Home Assistant's ICU message format."""

import json
import re
from pathlib import Path

import pytest

TRANSLATIONS = sorted(
    (Path(__file__).resolve().parents[1] / "custom_components" / "dwains_dashboard" / "translations").glob("*.json")
)


def _strings(node, path=""):
    if isinstance(node, dict):
        for key, value in node.items():
            yield from _strings(value, f"{path}.{key}" if path else key)
    elif isinstance(node, str):
        yield path, node


@pytest.mark.parametrize("translation", TRANSLATIONS, ids=lambda p: p.name)
def test_no_html_like_tags(translation: Path) -> None:
    """`<word>` is parsed as a tag by the frontend ("UNCLOSED_TAG")."""
    for path, text in _strings(json.loads(translation.read_text())):
        assert not re.search(r"<[A-Za-z][^>]*>", text), f"{translation.name}: {path}"
        assert text.count("{") == text.count("}"), f"{translation.name}: {path}"
