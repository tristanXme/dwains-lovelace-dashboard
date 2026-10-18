"""Validation of client supplied values before they reach the filesystem."""

from __future__ import annotations

import json
import os
from typing import Any


class DashboardInputError(ValueError):
    """A WebSocket request contained an invalid value."""


# The switches the dashboard sets with its *_bool_value commands and the
# orders it saves when cards are dragged. Any other key would only end up as
# a stray (or, for a key the dashboard reads, a wrong) value in the files.
ENTITY_SWITCHES = ("hidden", "hidden_in_area", "excluded", "disabled")
DEVICE_SWITCHES = ("hidden",)
AREA_SWITCHES = ("disabled",)
AREA_SORT_ORDERS = ("sort_order", "grouped_sort_order")
ENTITY_SORT_ORDERS = (
    *AREA_SORT_ORDERS,
    "favorite_sort_order",
    "devices_sort_order",
    "devices_grouped_sort_order",
)


def safe_path_segment(value: Any, what: str) -> str:
    """Return a value usable as one file or directory name below a fixed root.

    Rejects everything that could leave the intended directory or create a
    hidden file: separators, ``.``/``..``, a leading dot and NUL bytes.
    """
    if (
        not isinstance(value, str)
        or not value
        or value.startswith(".")
        or "/" in value
        or "\\" in value
        or "\x00" in value
        or os.path.basename(value) != value
    ):
        raise DashboardInputError(f"Invalid {what}: {value!r}")
    return value


def parse_json(value: Any, what: str) -> Any:
    """Parse JSON sent as a string by the frontend."""
    if not isinstance(value, str):
        raise DashboardInputError(f"Missing {what}")
    try:
        return json.loads(value)
    except json.JSONDecodeError as error:
        raise DashboardInputError(f"Invalid {what}: {error}") from None


def parse_json_object(value: Any, what: str) -> dict[str, Any]:
    """Parse a JSON object (a card configuration)."""
    parsed = parse_json(value, what)
    if not isinstance(parsed, dict):
        raise DashboardInputError(f"Invalid {what}: expected an object")
    return parsed


def parse_json_string_list(value: Any, what: str) -> list[str]:
    """Parse a JSON list of strings (sort orders, entity id lists)."""
    parsed = parse_json(value, what)
    if not isinstance(parsed, list) or any(not isinstance(item, str) for item in parsed):
        raise DashboardInputError(f"Invalid {what}: expected a list of strings")
    return parsed
