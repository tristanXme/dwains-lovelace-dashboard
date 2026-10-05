"""Filesystem snapshot loader for Dwains Dashboard configuration.

Only visible, real YAML files and folders are read (no hidden files such as
.DS_Store, no symlinks, matching what an export contains). A file that cannot
be read or parsed is left out and reported in "load_errors"; the rest of the
configuration still loads.
"""

from __future__ import annotations

import os
from collections import OrderedDict
from typing import Any

import yaml

from .yaml_files import load_yaml_file

_READ_ERRORS = (OSError, UnicodeDecodeError, yaml.YAMLError)
# Returned for a file that could not be read; empty files stay None as before.
_BROKEN = object()


class _Snapshot:
    def __init__(self, configs_path: str) -> None:
        self.configs_path = configs_path
        self.errors: list[dict[str, str]] = []

    def _record(self, path: str, error: Exception) -> None:
        message = str(error).splitlines()[0] if str(error) else type(error).__name__
        self.errors.append(
            {"file": os.path.relpath(path, self.configs_path), "error": message}
        )

    def load(self, path: str, fallback: Any = None, broken: Any = _BROKEN) -> Any:
        """A YAML file's content; fallback if missing, broken if unreadable."""
        try:
            return load_yaml_file(path)
        except FileNotFoundError:
            return fallback
        except _READ_ERRORS as error:
            self._record(path, error)
            return broken


def _entries(directory: str, *, folders: bool) -> list[str]:
    """Visible, non-symlink sub-folders or .yaml files of a folder, sorted."""
    if not os.path.isdir(directory) or os.path.islink(directory):
        return []
    names = []
    for name in sorted(os.listdir(directory)):
        path = os.path.join(directory, name)
        if name.startswith(".") or os.path.islink(path):
            continue
        if folders and os.path.isdir(path):
            names.append(name)
        elif not folders and name.endswith(".yaml") and os.path.isfile(path):
            names.append(name)
    return names


def _load_grouped_cards(snapshot: _Snapshot, directory: str) -> dict[str, dict[str, Any]]:
    cards: dict[str, dict[str, Any]] = {}
    for subdirectory in _entries(directory, folders=True):
        subdirectory_path = os.path.join(directory, subdirectory)
        cards[subdirectory] = {}
        for filename in _entries(subdirectory_path, folders=False):
            path = os.path.join(subdirectory_path, filename)
            card = snapshot.load(path)
            if card is not _BROKEN:
                cards[subdirectory][filename] = card
    return cards


def _load_flat_cards(snapshot: _Snapshot, directory: str) -> dict[str, Any]:
    cards: dict[str, Any] = {}
    for filename in _entries(directory, folders=False):
        card = snapshot.load(os.path.join(directory, filename))
        if card is not _BROKEN:
            cards[filename[: -len(".yaml")]] = card
    return cards


def _load_more_pages(snapshot: _Snapshot, directory: str) -> dict[str, Any]:
    pages: dict[str, Any] = {}
    for subdirectory in _entries(directory, folders=True):
        subdirectory_path = os.path.join(directory, subdirectory)
        page_path = os.path.join(subdirectory_path, "page.yaml")
        config_path = os.path.join(subdirectory_path, "config.yaml")
        if not (os.path.isfile(page_path) and os.path.isfile(config_path)):
            continue
        config = snapshot.load(config_path)
        card = snapshot.load(page_path)
        if config is _BROKEN or card is _BROKEN:
            continue  # a broken page is left out as a whole
        pages[subdirectory] = (
            {**config, "foldername": subdirectory, "card": card}
            if isinstance(config, dict)
            else config
        )
    return pages


def load_configuration_files(configs_path: str) -> dict[str, Any]:
    """Read one coherent dashboard configuration snapshot."""
    snapshot = _Snapshot(configs_path)
    cards_path = os.path.join(configs_path, "cards")

    def mapping(filename: str) -> Any:
        return snapshot.load(os.path.join(configs_path, filename), OrderedDict(), OrderedDict())

    configuration = {
        "areas": mapping("areas.yaml"),
        "area_cards": _load_grouped_cards(snapshot, os.path.join(cards_path, "areas")),
        "device_cards": _load_grouped_cards(snapshot, os.path.join(cards_path, "devices")),
        "entity_cards": _load_flat_cards(snapshot, os.path.join(cards_path, "entities")),
        "entities_popup": _load_flat_cards(
            snapshot, os.path.join(cards_path, "entities_popup")
        ),
        "entities": mapping("entities.yaml"),
        "devices": mapping("devices.yaml"),
        "homepage_header": mapping("settings.yaml"),
        "more_pages": _load_more_pages(snapshot, os.path.join(configs_path, "more_pages")),
        "devices_card": _load_flat_cards(snapshot, os.path.join(cards_path, "devices_card")),
        "devices_popup": _load_flat_cards(
            snapshot, os.path.join(cards_path, "devices_popup")
        ),
    }
    configuration["load_errors"] = snapshot.errors
    return configuration
