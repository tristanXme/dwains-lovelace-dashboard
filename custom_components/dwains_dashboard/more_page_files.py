"""Filesystem operations for Dwains Dashboard more pages.

A more page is a folder below configs/more_pages with page.yaml (its card)
and config.yaml (name, icon, place in the navigation). All readers follow the
same rules, so the navigation, the list of pages, the dashboard views and the
page itself agree:

- Visible folders with a page.yaml are pages.
- A config.yaml without content (or one that is not a mapping) means the
  defaults: the folder name and the puzzle icon.
- A page whose config.yaml cannot be read is left out; the others are not
  affected.
- page.yaml is only read when the page itself is shown or edited, so a broken
  one only affects its own page.
"""

from __future__ import annotations

import os
from collections import OrderedDict
from collections.abc import Callable
from typing import Any

import yaml

from .yaml_files import dump_yaml_file, load_yaml_file

READ_ERRORS = (OSError, UnicodeDecodeError, yaml.YAMLError)
DEFAULT_ICON = "mdi:puzzle"


class MorePageError(Exception):
    """A file of a more page cannot be read."""

    def __init__(self, filename: str, error: BaseException) -> None:
        super().__init__(f"{filename}: {describe_error(error)}")


def describe_error(error: BaseException) -> str:
    """One line about a file that cannot be read, without its path."""
    cause = error if isinstance(error, yaml.MarkedYAMLError) else error.__cause__
    if isinstance(cause, yaml.MarkedYAMLError):
        mark = cause.problem_mark or cause.context_mark
        text = cause.problem or cause.context or type(cause).__name__
        return f"{text} (line {mark.line + 1})" if mark else text
    text = str(error).splitlines()[0] if str(error) else type(error).__name__
    # Jinja names the line of a template error separately.
    line = getattr(error, "lineno", None)
    return f"{text} (line {line})" if isinstance(line, int) else text


def _more_pages_path(configs_path: str) -> str:
    return os.path.join(configs_path, "more_pages")


def _valid_foldername(foldername: str) -> bool:
    return bool(foldername) and os.path.basename(foldername) == foldername and foldername not in {".", ".."}


def validate_more_page_foldername(foldername: str) -> str:
    """Return a safe more-page folder name or reject the request."""
    if not _valid_foldername(foldername):
        raise ValueError("Invalid more-page folder name")
    return foldername


def page_folders(more_pages_path: str) -> list[str]:
    """Names of the visible folders with a page.yaml, sorted."""
    if not os.path.isdir(more_pages_path):
        return []
    return [
        name
        for name in sorted(os.listdir(more_pages_path))
        if not name.startswith(".")
        and os.path.isfile(os.path.join(more_pages_path, name, "page.yaml"))
    ]


def read_page_config(config_path: str) -> dict[str, Any]:
    """A page's config.yaml; without content or not a mapping: {}.

    A missing or unreadable file raises (FileNotFoundError, a YAML error).
    """
    config = load_yaml_file(config_path)
    return config if isinstance(config, dict) else {}


def _sort_order(config: dict[str, Any]) -> int:
    value = config.get("sort_order", 99)
    try:
        return int(value)
    except (TypeError, ValueError):
        return 99


def page_metadata(foldername: str, config: dict[str, Any]) -> dict[str, Any]:
    """Name, icon and place in the navigation of a page."""
    return {
        "name": config.get("name") or foldername,
        "icon": config.get("icon") or DEFAULT_ICON,
        "show_in_navbar": bool(config.get("show_in_navbar", False)),
        "sort_order": _sort_order(config),
    }


def load_more_pages_metadata(configs_path: str) -> dict[str, dict[str, Any]]:
    """Load only the metadata needed by the navigation and the page list."""
    pages: dict[str, dict[str, Any]] = {}
    more_pages_path = _more_pages_path(configs_path)
    for foldername in page_folders(more_pages_path):
        config_path = os.path.join(more_pages_path, foldername, "config.yaml")
        if not os.path.isfile(config_path):
            continue
        try:
            config = read_page_config(config_path)
        except READ_ERRORS:
            continue  # left out; the configuration read reports the file
        pages[foldername] = page_metadata(foldername, config)
    return pages


def load_more_page_content(
    configs_path: str,
    foldername: str,
    load_page: Callable[[str], Any] = load_yaml_file,
) -> dict[str, Any] | None:
    """Load one complete page; None when it does not exist.

    load_page reads page.yaml (the dashboard reads it with its includes and
    templates). `templated` tells whether the shown card differs from the
    plain file, i.e. whether the page uses !include or a template. Raises
    MorePageError when a file of the page cannot be read.
    """
    validate_more_page_foldername(foldername)
    folder_path = os.path.join(_more_pages_path(configs_path), foldername)
    page_path = os.path.join(folder_path, "page.yaml")
    config_path = os.path.join(folder_path, "config.yaml")
    if not os.path.isfile(page_path) or not os.path.isfile(config_path):
        return None

    try:
        config = read_page_config(config_path)
    except READ_ERRORS as error:
        raise MorePageError("config.yaml", error) from None
    try:
        card = load_page(page_path)
    # Whatever stops the page from loading (YAML, template, include) is
    # shown on the page instead of its card.
    except Exception as error:
        raise MorePageError("page.yaml", error) from None
    if not isinstance(card, (dict, list)):
        raise MorePageError("page.yaml", TypeError("must contain a card or a list of cards"))
    try:
        templated = load_yaml_file(page_path) != card
    except READ_ERRORS:
        templated = True
    return {
        "foldername": foldername,
        **page_metadata(foldername, config),
        "card": card,
        "templated": templated,
    }


def _navigation_entry(subdirectory: str, metadata: dict[str, Any]) -> dict[str, Any]:
    return {
        **metadata,
        # Kept for templates that read it; the views no longer include it.
        "path": f"dwains-dashboard/configs/more_pages/{subdirectory}/page.yaml",
    }


def load_more_page_navigation(
    configs_path: str,
) -> tuple[bool, dict[str, dict[str, Any]], list[tuple[str, Exception]]]:
    """The pages for the dashboard views; creates missing config.yaml files.

    Returns whether the configuration folder exists, the pages and the pages
    left out with their error.
    """
    configs_exist = os.path.exists(configs_path)
    pages: dict[str, dict[str, Any]] = {}
    failures: list[tuple[str, Exception]] = []
    more_pages_path = _more_pages_path(configs_path)
    if not configs_exist:
        return configs_exist, pages, failures

    for subdirectory in page_folders(more_pages_path):
        config_path = os.path.join(more_pages_path, subdirectory, "config.yaml")
        try:
            if not os.path.exists(config_path):
                dump_yaml_file(
                    config_path,
                    OrderedDict({"name": subdirectory, "icon": DEFAULT_ICON}),
                )
            config = read_page_config(config_path)
        except READ_ERRORS as error:
            failures.append((subdirectory, error))
            continue
        pages[subdirectory] = _navigation_entry(
            subdirectory, page_metadata(subdirectory, config)
        )

    return configs_exist, pages, failures
