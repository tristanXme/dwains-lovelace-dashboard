"""Small synchronous filesystem primitives used by WebSocket mutations."""

from __future__ import annotations

import os
import shutil
import uuid
from collections.abc import Callable
from typing import Any


def remove_file_if_exists(file_path: str) -> None:
    """Remove one file without a check/delete race."""
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass


def file_has_content(file_path: str) -> bool:
    """Return whether a file exists and is nonempty."""
    try:
        return os.path.getsize(file_path) != 0
    except FileNotFoundError:
        return False


def unique_path(directory: str, stem: str, suffix: str = "") -> str:
    """directory/stem+suffix, or stem-2, stem-3, … when that name is taken.

    Mutations run one at a time (serialize_configuration_mutation), so a
    free name stays free until it is written. A name counts as taken while
    a file, folder or symlink with it exists, also an empty file.
    """
    candidate = os.path.join(directory, f"{stem}{suffix}")
    number = 1
    while os.path.lexists(candidate):
        number += 1
        candidate = os.path.join(directory, f"{stem}-{number}{suffix}")
    return candidate


# Backups kept per kind (import-, cleanup-, migration- folders).
KEEP_BACKUPS = 10


def prune_backups(backups_path: str, prefix: str, keep: int = KEEP_BACKUPS) -> list[str]:
    """Remove all but the newest `keep` backup folders starting with prefix.

    Returns the removed folder names. Newest is by modification time, so a
    -2 suffix from unique_path sorts correctly.
    """
    if not os.path.isdir(backups_path):
        return []
    folders = [
        entry
        for entry in os.scandir(backups_path)
        if entry.name.startswith(prefix) and entry.is_dir(follow_symlinks=False)
    ]
    folders.sort(key=lambda entry: (entry.stat(follow_symlinks=False).st_mtime, entry.name))
    removed = []
    for entry in folders[: max(len(folders) - keep, 0)]:
        shutil.rmtree(entry.path)
        removed.append(entry.name)
    return removed


# Moves of existing files; a name of its own so tests can make one fail.
_move = os.replace


def _beside(path: str, token: str, kind: str) -> str:
    # Hidden, so loaders and exports never pick it up.
    directory, name = os.path.split(path)
    return os.path.join(directory, f".{name}.{token}.{kind}")


def replace_files(writes: dict[str, Callable[[str], Any] | None]) -> None:
    """Change several files together.

    writes[path](target) writes one file's new content to target; None
    removes the file. All new contents are written beside their files
    first, then swapped in, each previous file kept until the end. If
    anything fails, every file is as before.
    """
    token = uuid.uuid4().hex
    staged: dict[str, str] = {}
    aside: dict[str, str] = {}
    done: list[str] = []
    try:
        for path, write in writes.items():
            if write is not None:
                staged[path] = _beside(path, token, "new")
                write(staged[path])
        for path in writes:
            if os.path.lexists(path):
                aside[path] = _beside(path, token, "previous")
                if path in staged:
                    # Keep the previous content and replace the file in one
                    # step, so readers never find it missing.
                    shutil.copy2(path, aside[path], follow_symlinks=False)
                else:
                    _move(path, aside[path])
                    done.append(path)
                    continue
            if path in staged:
                _move(staged[path], path)
                del staged[path]
                done.append(path)
    except BaseException:
        for path in reversed(done):
            if path in aside:
                os.replace(aside.pop(path), path)
            else:
                remove_file_if_exists(path)
        for leftover in (*staged.values(), *aside.values()):
            remove_file_if_exists(leftover)
        raise
    for previous in aside.values():
        remove_file_if_exists(previous)
