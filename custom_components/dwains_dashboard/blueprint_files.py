"""Filesystem snapshot loader for Dwains Dashboard blueprints."""

from __future__ import annotations

import os
from typing import Any

from .mutation_files import replace_files
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

def blueprint_file_paths(dashboard_path: str, filename: str) -> dict[str, str]:
    """Paths of a blueprint's files, keyed by folder (see BLUEPRINT_FOLDERS)."""
    return {
        folder: os.path.join(dashboard_path, *folder.split("/"), filename)
        for folder in BLUEPRINT_FOLDERS
    }


def replace_blueprint_files(files: dict[str, Any]) -> None:
    """Write the given files together; None removes a file.

    A blueprint is never left half installed or half removed (replace_files).
    """
    replace_files(
        {
            path: None
            if content is None
            else lambda target, content=content: dump_yaml_file(target, content)
            for path, content in files.items()
        }
    )
