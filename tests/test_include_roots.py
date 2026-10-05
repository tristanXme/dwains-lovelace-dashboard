"""Dashboard YAML and templates can only read files of the dashboard folders."""

from __future__ import annotations

from pathlib import Path

import pytest

from custom_components.dwains_dashboard.process_yaml import (
    DashboardPathError,
    DashboardYamlProcessor,
)


def _write(path: Path, text: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return path


@pytest.fixture
def base(tmp_path: Path) -> Path:
    config = tmp_path / "config"
    _write(config / "secrets.yaml", "password: TOP-SECRET\n")
    _write(config / "dwains-dashboard/configs/snippet.yaml", "value: 1\n")
    _write(config / "dwains-dashboard/backups/old/snippet.yaml", "value: old\n")
    return config


def _processor(base: Path) -> DashboardYamlProcessor:
    return DashboardYamlProcessor(
        [str(base / "dwains-dashboard"), str(base / "custom_components/dwains_dashboard/lovelace")],
        [str(base / "dwains-dashboard/backups")],
    )


def _page(base: Path, text: str) -> str:
    return str(_write(base / "dwains-dashboard/configs/more_pages/test/page.yaml", text))


def test_includes_inside_the_dashboard_folders_work(base: Path) -> None:
    page = _page(base, "card: !include ../../snippet.yaml\n")
    assert _processor(base).load_yaml(page) == {"card": {"value": 1}}


@pytest.mark.parametrize(
    "include",
    [
        "../../../../secrets.yaml",  # relative escape
        "{base}/secrets.yaml",  # absolute path
        "../../../backups/old/snippet.yaml",  # backups are not dashboard content
    ],
)
def test_includes_outside_are_rejected(base: Path, include: str) -> None:
    page = _page(base, f"card: !include {include.format(base=base)}\n")
    with pytest.raises(DashboardPathError):
        _processor(base).load_yaml(page)


def test_a_symlink_cannot_point_outside(base: Path) -> None:
    link = base / "dwains-dashboard/configs/more_pages/test/link.yaml"
    link.parent.mkdir(parents=True, exist_ok=True)
    link.symlink_to(base / "secrets.yaml")
    page = _page(base, "card: !include link.yaml\n")
    with pytest.raises(DashboardPathError):
        _processor(base).load_yaml(page)


def test_a_symlinked_folder_cannot_point_outside(base: Path) -> None:
    (base / "dwains-dashboard/configs/linked").symlink_to(base, target_is_directory=True)
    page = _page(base, "cards: !include_dir_named ../../linked\n")
    with pytest.raises(DashboardPathError):
        _processor(base).load_yaml(page)


def test_templates_cannot_include_files_outside(base: Path) -> None:
    page = _page(base, f"# dwains_dashboard\ncard: {{% include '{base}/secrets.yaml' %}}\n")
    with pytest.raises(DashboardPathError):
        _processor(base).load_yaml(page)


def test_templates_can_include_dashboard_files(base: Path) -> None:
    snippet = _write(base / "dwains-dashboard/configs/inline.yaml", "{value: 1}")
    page = _page(base, f"# dwains_dashboard\ncard: {{% include '{snippet}' %}}\n")
    assert _processor(base).load_yaml(page) == {"card": {"value": 1}}


def test_files_outside_cannot_be_loaded_directly(base: Path) -> None:
    with pytest.raises(DashboardPathError):
        _processor(base).load_yaml(str(base / "secrets.yaml"))


def test_secrets_cannot_be_used(base: Path) -> None:
    from homeassistant.exceptions import HomeAssistantError

    page = _page(base, "card:\n  type: markdown\n  content: !secret password\n")
    with pytest.raises(HomeAssistantError, match="!secret password is not supported"):
        _processor(base).load_yaml(page)
