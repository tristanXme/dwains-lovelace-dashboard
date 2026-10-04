"""Filesystem side of configuration maintenance (no Home Assistant imports).

Dwains Dashboard keys several files by entity id or area id:

- configs/entities.yaml                      entity id -> display settings
- configs/cards/entities/<entity_id>.yaml    custom entity card
- configs/cards/entities_popup/<id>.yaml     custom entity popup
- configs/settings.yaml                      lists of explicit (binary) sensors
- configs/areas.yaml                         area id -> area settings
- configs/cards/areas/<area_id>/             custom area cards

Home Assistant does not know these files, so renamed or removed entities and
areas leave stale entries behind that only the dashboard can resolve.
"""

from __future__ import annotations

import os
import shutil
from collections import OrderedDict
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from .yaml_files import dump_yaml_file, load_yaml_file_or_default

ENTITY_CARD_DIRECTORIES = ("entities", "entities_popup")
SETTINGS_ENTITY_LISTS = ("area_sensor_entities", "area_binary_sensor_entities")
SETTINGS_ENTITY_VALUES = ("weather_entity", "alarm_entity")


@dataclass
class OrphanReport:
    """Configuration entries whose entity or area no longer exists."""

    entities: list[str] = field(default_factory=list)
    entity_cards: list[str] = field(default_factory=list)
    entity_popups: list[str] = field(default_factory=list)
    settings_entities: list[str] = field(default_factory=list)
    areas: list[str] = field(default_factory=list)
    area_card_folders: list[str] = field(default_factory=list)

    @property
    def total(self) -> int:
        return sum(len(values) for values in self.as_dict().values())

    def as_dict(self) -> dict[str, list[str]]:
        return {
            "entities": self.entities,
            "entity_cards": self.entity_cards,
            "entity_popups": self.entity_popups,
            "settings_entities": self.settings_entities,
            "areas": self.areas,
            "area_card_folders": self.area_card_folders,
        }


def _cards_path(configs_path: str, *parts: str) -> str:
    return os.path.join(configs_path, "cards", *parts)


def _yaml_stems(directory: str) -> list[str]:
    if not os.path.isdir(directory):
        return []
    return sorted(
        filename[: -len(".yaml")]
        for filename in os.listdir(directory)
        if filename.endswith(".yaml") and not filename.startswith(".")
    )


def _mapping(path: str) -> dict[str, Any]:
    value = load_yaml_file_or_default(path, OrderedDict(), True)
    return value if isinstance(value, dict) else OrderedDict()


def find_orphans(
    configs_path: str,
    entity_exists: Callable[[str], bool],
    area_exists: Callable[[str], bool],
) -> OrphanReport:
    """Collect entries pointing to entities/areas that no longer exist."""
    report = OrphanReport()
    report.entities = sorted(
        entity_id
        for entity_id in _mapping(os.path.join(configs_path, "entities.yaml"))
        if not entity_exists(entity_id)
    )
    report.entity_cards = [
        entity_id
        for entity_id in _yaml_stems(_cards_path(configs_path, "entities"))
        if not entity_exists(entity_id)
    ]
    report.entity_popups = [
        entity_id
        for entity_id in _yaml_stems(_cards_path(configs_path, "entities_popup"))
        if not entity_exists(entity_id)
    ]
    settings = _mapping(os.path.join(configs_path, "settings.yaml"))
    report.settings_entities = sorted(
        {
            entity_id
            for key in SETTINGS_ENTITY_LISTS
            for entity_id in (settings.get(key) or [])
            if isinstance(entity_id, str) and not entity_exists(entity_id)
        }
    )
    report.areas = sorted(
        area_id
        for area_id in _mapping(os.path.join(configs_path, "areas.yaml"))
        if not area_exists(str(area_id))
    )
    area_cards = _cards_path(configs_path, "areas")
    if os.path.isdir(area_cards):
        report.area_card_folders = sorted(
            name
            for name in os.listdir(area_cards)
            if os.path.isdir(os.path.join(area_cards, name))
            and not name.startswith(".")
            and not area_exists(name)
        )
    return report


def rename_entity(configs_path: str, old_entity_id: str, new_entity_id: str) -> bool:
    """Move every dashboard setting of an entity to its new entity id.

    Returns whether anything changed. Existing settings of the new id win:
    they are never overwritten.
    """
    changed = False

    entities_path = os.path.join(configs_path, "entities.yaml")
    entities = _mapping(entities_path)
    if old_entity_id in entities and new_entity_id not in entities:
        entities = OrderedDict(
            (new_entity_id if key == old_entity_id else key, value)
            for key, value in entities.items()
        )
        dump_yaml_file(entities_path, entities)
        changed = True

    for directory in ENTITY_CARD_DIRECTORIES:
        source = _cards_path(configs_path, directory, f"{old_entity_id}.yaml")
        target = _cards_path(configs_path, directory, f"{new_entity_id}.yaml")
        if os.path.isfile(source) and not os.path.exists(target):
            os.replace(source, target)
            changed = True

    settings_path = os.path.join(configs_path, "settings.yaml")
    settings = _mapping(settings_path)
    settings_changed = False
    for key in SETTINGS_ENTITY_LISTS:
        values = settings.get(key)
        if isinstance(values, list) and old_entity_id in values:
            settings[key] = [
                new_entity_id if value == old_entity_id else value
                for value in values
                if value != new_entity_id
            ]
            settings_changed = True
    for key in SETTINGS_ENTITY_VALUES:
        if settings.get(key) == old_entity_id:
            settings[key] = new_entity_id
            settings_changed = True
    if settings_changed:
        dump_yaml_file(settings_path, settings)
        changed = True

    return changed


def _backup(source: str, backup_dir: str, configs_path: str) -> None:
    target = os.path.join(backup_dir, os.path.relpath(source, configs_path))
    os.makedirs(os.path.dirname(target), exist_ok=True)
    if os.path.isdir(source):
        shutil.copytree(source, target, dirs_exist_ok=True)
    else:
        shutil.copy2(source, target)


def remove_orphans(configs_path: str, report: OrphanReport, backup_dir: str) -> int:
    """Remove the reported entries after copying every touched file to backup_dir.

    Returns the number of removed entries.
    """
    removed = 0

    def prune_mapping(filename: str, keys: list[str]) -> None:
        nonlocal removed
        if not keys:
            return
        path = os.path.join(configs_path, filename)
        data = _mapping(path)
        remaining = OrderedDict((k, v) for k, v in data.items() if k not in set(keys))
        if len(remaining) != len(data):
            _backup(path, backup_dir, configs_path)
            dump_yaml_file(path, remaining)
            removed += len(data) - len(remaining)

    prune_mapping("entities.yaml", report.entities)
    prune_mapping("areas.yaml", report.areas)

    for directory, entity_ids in (
        ("entities", report.entity_cards),
        ("entities_popup", report.entity_popups),
    ):
        for entity_id in entity_ids:
            path = _cards_path(configs_path, directory, f"{entity_id}.yaml")
            if os.path.isfile(path):
                _backup(path, backup_dir, configs_path)
                os.remove(path)
                removed += 1

    for area_id in report.area_card_folders:
        path = _cards_path(configs_path, "areas", area_id)
        if os.path.isdir(path):
            _backup(path, backup_dir, configs_path)
            shutil.rmtree(path)
            removed += 1

    if report.settings_entities:
        path = os.path.join(configs_path, "settings.yaml")
        settings = _mapping(path)
        stale = set(report.settings_entities)
        before = sum(len(settings.get(key) or []) for key in SETTINGS_ENTITY_LISTS)
        for key in SETTINGS_ENTITY_LISTS:
            if isinstance(settings.get(key), list):
                settings[key] = [value for value in settings[key] if value not in stale]
        after = sum(len(settings.get(key) or []) for key in SETTINGS_ENTITY_LISTS)
        if after != before:
            _backup(path, backup_dir, configs_path)
            dump_yaml_file(path, settings)
            removed += before - after

    return removed
