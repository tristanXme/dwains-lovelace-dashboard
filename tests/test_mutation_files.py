"""Unique names, backup retention and multi-file writes."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from custom_components.dwains_dashboard import mutation_files
from custom_components.dwains_dashboard.maintenance import _with_backup
from custom_components.dwains_dashboard.mutation_files import (
    prune_backups,
    replace_files,
    unique_path,
)


def _folder(tmp_path: Path) -> Path:
    # tmp_path also holds the integration (conftest); work in a folder of its own.
    folder = tmp_path / "work"
    folder.mkdir()
    return folder


def _writer(text: str):
    return lambda target: Path(target).write_text(text)


def _visible(folder: Path) -> list[str]:
    return sorted(path.name for path in folder.iterdir())


def _hidden(folder: Path) -> list[str]:
    return [name for name in os.listdir(folder) if name.startswith(".")]


def test_unique_path_counts_up_past_taken_names(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    assert unique_path(str(tmp_path), "card", ".yaml") == str(tmp_path / "card.yaml")
    (tmp_path / "card.yaml").write_text("")  # empty files count as taken too
    (tmp_path / "card-2.yaml").mkdir()
    assert unique_path(str(tmp_path), "card", ".yaml") == str(tmp_path / "card-3.yaml")


def test_only_the_newest_backups_of_a_kind_are_kept(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    for number in range(12):
        folder = tmp_path / f"import-{number:02d}"
        folder.mkdir()
        os.utime(folder, (1000 + number, 1000 + number))
    (tmp_path / "cleanup-old").mkdir()
    os.utime(tmp_path / "cleanup-old", (1, 1))

    removed = prune_backups(str(tmp_path), "import-", keep=10)
    assert removed == ["import-00", "import-01"]
    assert len([name for name in _visible(tmp_path) if name.startswith("import-")]) == 10
    assert (tmp_path / "cleanup-old").is_dir()  # other kinds are left alone


def test_replace_files_writes_and_removes_together(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    (tmp_path / "a.yaml").write_text("old a\n")
    (tmp_path / "b.yaml").write_text("old b\n")
    replace_files(
        {
            str(tmp_path / "a.yaml"): _writer("new a\n"),
            str(tmp_path / "b.yaml"): None,
            str(tmp_path / "c.yaml"): _writer("new c\n"),
        }
    )
    assert _visible(tmp_path) == ["a.yaml", "c.yaml"]
    assert (tmp_path / "a.yaml").read_text() == "new a\n"
    assert _hidden(tmp_path) == []


def test_a_failed_write_changes_nothing(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    (tmp_path / "a.yaml").write_text("old a\n")

    def failing(target: str) -> None:
        Path(target).write_text("half")
        raise OSError("disk full")

    with pytest.raises(OSError, match="disk full"):
        replace_files(
            {
                str(tmp_path / "a.yaml"): _writer("new a\n"),
                str(tmp_path / "b.yaml"): failing,
            }
        )
    assert _visible(tmp_path) == ["a.yaml"]
    assert (tmp_path / "a.yaml").read_text() == "old a\n"
    assert _hidden(tmp_path) == []


def test_a_failed_swap_puts_everything_back(tmp_path: Path, monkeypatch) -> None:
    tmp_path = _folder(tmp_path)
    for name in ("a", "b", "c"):
        (tmp_path / f"{name}.yaml").write_text(f"old {name}\n")
    moves = []

    def failing_move(source: str, target: str) -> None:
        moves.append(source)
        if len(moves) == 3:
            raise OSError("busy")
        os.replace(source, target)

    monkeypatch.setattr(mutation_files, "_move", failing_move)
    with pytest.raises(OSError, match="busy"):
        replace_files(
            {
                str(tmp_path / "a.yaml"): _writer("new a\n"),
                str(tmp_path / "b.yaml"): None,
                str(tmp_path / "new.yaml"): _writer("new\n"),
                str(tmp_path / "c.yaml"): _writer("new c\n"),
            }
        )
    assert _visible(tmp_path) == ["a.yaml", "b.yaml", "c.yaml"]
    assert [(tmp_path / f"{n}.yaml").read_text() for n in "abc"] == ["old a\n", "old b\n", "old c\n"]
    assert _hidden(tmp_path) == []


def test_maintenance_backups_get_their_own_folder(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    def change(backup_dir: str) -> int:
        os.makedirs(backup_dir)
        return 1

    names = [_with_backup("cleanup-", str(tmp_path), change)[1] for _ in range(3)]
    assert len(set(names)) == 3
    assert all((tmp_path / name).is_dir() for name in names)

    # Nothing backed up: no folder, nothing pruned.
    result, name = _with_backup("cleanup-", str(tmp_path), lambda backup_dir: 0)
    assert result == 0
    assert not (tmp_path / name).exists()


def test_maintenance_keeps_only_the_newest_backups(tmp_path: Path) -> None:
    tmp_path = _folder(tmp_path)
    for number in range(mutation_files.KEEP_BACKUPS + 3):
        folder = tmp_path / f"migration-old-{number:02d}"
        folder.mkdir()
        os.utime(folder, (number, number))
    _, name = _with_backup("migration-", str(tmp_path), lambda backup_dir: os.makedirs(backup_dir))
    kept = [entry for entry in _visible(tmp_path) if entry.startswith("migration-")]
    assert len(kept) == mutation_files.KEEP_BACKUPS
    assert name in kept
