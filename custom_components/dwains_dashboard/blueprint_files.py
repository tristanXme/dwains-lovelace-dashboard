"""Filesystem snapshot loader for Dwains Dashboard blueprints."""

from __future__ import annotations

import os
import uuid
from typing import Any

from .yaml_files import dump_yaml_file, load_yaml_file


def load_blueprint_files(
    blueprints_path: str,
) -> tuple[dict[str, Any], list[tuple[str, Exception]]]:
    """Load all blueprint YAML files and retain per-file failures."""
    blueprints: dict[str, Any] = {}
    failures: list[tuple[str, Exception]] = []
    if not os.path.isdir(blueprints_path):
        return blueprints, failures

    for filename in os.listdir(blueprints_path):
        if not filename.endswith(".yaml"):
            continue
        try:
            blueprints[filename] = load_yaml_file(
                os.path.join(blueprints_path, filename)
            )
        except Exception as error:
            failures.append((filename, error))
    return blueprints, failures


# A blueprint is up to three files with the same name: the blueprint itself
# and the button-card and apexcharts-card templates it brings along.
BLUEPRINT_FOLDERS = (
    "blueprints",
    "button_card_templates/blueprints",
    "apexcharts_card_templates/blueprints",
)

# Moves of existing files; a name of its own so tests can make one fail.
_move = os.replace


def blueprint_file_paths(dashboard_path: str, filename: str) -> dict[str, str]:
    """Paths of a blueprint's files, keyed by folder (see BLUEPRINT_FOLDERS)."""
    return {
        folder: os.path.join(dashboard_path, *folder.split("/"), filename)
        for folder in BLUEPRINT_FOLDERS
    }


def replace_blueprint_files(files: dict[str, Any]) -> None:
    """Write the given files together; None removes a file.

    Existing files are moved aside first. If anything fails, the files
    written so far are removed and the previous ones are put back, so a
    blueprint is never left half installed or half removed.
    """
    token = uuid.uuid4().hex
    aside: dict[str, str] = {}
    written: list[str] = []
    try:
        for path in files:
            if os.path.lexists(path):
                backup = f"{path}.{token}.previous"
                _move(path, backup)
                aside[path] = backup
        for path, content in files.items():
            if content is not None:
                dump_yaml_file(path, content)
                written.append(path)
    except BaseException:
        for path in written:
            if os.path.lexists(path):
                os.remove(path)
        for path, backup in aside.items():
            os.replace(backup, path)
        raise
    for backup in aside.values():
        os.remove(backup)
