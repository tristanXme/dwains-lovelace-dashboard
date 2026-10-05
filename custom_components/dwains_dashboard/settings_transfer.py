"""Filesystem side of the settings export and import (no Home Assistant imports).

An export is a zip of the dwains-dashboard folder (configs, more pages,
blueprints and card templates) without its backups, plus a small manifest.
An import replaces that folder with the archive's content; the previous
content is moved to backups/ first.

transferable_path() is the single rule for which files an export contains
and an import accepts, so every export can be imported again.
"""

from __future__ import annotations

import io
import json
import os
import posixpath
import shutil
import tempfile
import zipfile
from dataclasses import dataclass, field
from typing import Any

from .mutation_files import prune_backups, unique_path

MANIFEST_NAME = "dwains-dashboard-export.json"
EXPORT_FORMAT = "dwains-dashboard-export"
EXPORT_FORMAT_VERSION = 1
BACKUPS_FOLDER = "backups"
EXPORTS_FOLDER = "exports"
KEEP_EXPORTS = 5
ALLOWED_SUFFIXES = (".yaml", ".yml")
MAX_FILES = 5000
MAX_TOTAL_BYTES = 50 * 1024 * 1024
# Dashboard YAML files are small; anything bigger is not dashboard content.
MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_MANIFEST_BYTES = 64 * 1024
EXPORT_PREFIX = "dwains-dashboard-"


class InvalidArchive(Exception):
    """The uploaded file is not a usable Dwains Dashboard export."""


class ExportError(Exception):
    """The dashboard folder cannot be exported as an importable archive."""


# Moves within the dashboard folder; a name of its own so tests can make a
# single move fail.
_move = os.replace


def transferable_path(relative: str) -> bool:
    """Whether a file (relative path with /) belongs in an export.

    YAML files of the dashboard folder outside backups/. Hidden files and
    folders (.DS_Store, editor or VCS folders) and other file types (notes,
    images) are left out of an export and rejected by an import.
    """
    parts = relative.split("/")
    return (
        parts[0] != BACKUPS_FOLDER
        and all(part and not part.startswith(".") for part in parts)
        and relative.endswith(ALLOWED_SUFFIXES)
    )


def _check_file(relative: str, data: bytes) -> str | None:
    """Why a file cannot be transferred, None if it can."""
    try:
        data.decode("utf-8")
    except UnicodeDecodeError:
        return f"not UTF-8 text: {relative}"
    return None


def _check_size(relative: str, size: int) -> str | None:
    if size > MAX_FILE_BYTES:
        return f"file too large: {relative} ({size} bytes, at most {MAX_FILE_BYTES})"
    return None


def _check_totals(count: int, size: int) -> str | None:
    if count > MAX_FILES:
        return f"too many files ({count}, at most {MAX_FILES})"
    if size > MAX_TOTAL_BYTES:
        return f"too large ({size} bytes, at most {MAX_TOTAL_BYTES})"
    return None


def remove_path(path: str) -> None:
    """Remove a file, a symlink (not its target) or a folder; missing is fine."""
    if os.path.islink(path) or os.path.isfile(path):
        os.unlink(path)
    elif os.path.isdir(path):
        shutil.rmtree(path)


@dataclass
class ImportResult:
    files: int
    backup: str
    options: dict[str, Any] = field(default_factory=dict)


def _exported_files(base: str) -> list[str]:
    """Relative paths (with /) of all files that belong in an export.

    Symlinks are never followed or exported: the archive must only hold
    files of the dashboard folder itself.
    """
    files = []
    for root, dirs, names in os.walk(base):
        relative_root = os.path.relpath(root, base)
        prefix = "" if relative_root == "." else relative_root.replace(os.sep, "/") + "/"
        dirs[:] = sorted(
            name
            for name in dirs
            if not os.path.islink(os.path.join(root, name))
            and not name.startswith(".")
            and not (prefix == "" and name == BACKUPS_FOLDER)
        )
        for name in sorted(names):
            path = os.path.join(root, name)
            relative = prefix + name
            if (
                os.path.isfile(path)
                and not os.path.islink(path)
                and transferable_path(relative)
            ):
                files.append(relative)
    return files


def export_archive(
    base: str, stamp: str, manifest: dict[str, Any]
) -> tuple[str, int]:
    """Write backups/exports/dwains-dashboard-<stamp>.zip.

    Returns the archive file name and the number of exported files. Only the
    newest KEEP_EXPORTS archives are kept.
    """
    # The same checks the import applies, so the archive can be imported;
    # sizes are checked before anything is read into memory.
    relatives = _exported_files(base)
    sizes = {
        relative: os.path.getsize(os.path.join(base, *relative.split("/")))
        for relative in relatives
    }
    problem = _check_totals(len(sizes), sum(sizes.values())) or next(
        (reason for relative, size in sizes.items() if (reason := _check_size(relative, size))),
        None,
    )
    if problem:
        raise ExportError(problem)
    files: dict[str, bytes] = {}
    for relative in relatives:
        with open(os.path.join(base, *relative.split("/")), "rb") as handle:
            files[relative] = handle.read()
        if problem := _check_file(relative, files[relative]):
            raise ExportError(problem)

    exports = os.path.join(base, BACKUPS_FOLDER, EXPORTS_FOLDER)
    os.makedirs(exports, exist_ok=True)
    filename = os.path.basename(unique_path(exports, f"{EXPORT_PREFIX}{stamp}", ".zip"))
    data = {
        **manifest,
        "format": EXPORT_FORMAT,
        "format_version": EXPORT_FORMAT_VERSION,
        "files": len(files),
    }
    target = os.path.join(exports, filename)
    with zipfile.ZipFile(target + ".tmp", "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(MANIFEST_NAME, json.dumps(data, indent=2, ensure_ascii=False))
        for relative, content in files.items():
            archive.writestr(relative, content)
    os.replace(target + ".tmp", target)

    archives = sorted(
        name
        for name in os.listdir(exports)
        if name.startswith(EXPORT_PREFIX) and name.endswith(".zip")
    )
    for old in archives[:-KEEP_EXPORTS]:
        os.remove(os.path.join(exports, old))
    return filename, len(files)


def export_path(base: str, filename: str) -> str | None:
    """Path of an existing export archive, None for anything else."""
    if (
        posixpath.basename(filename) != filename
        or not filename.startswith(EXPORT_PREFIX)
        or not filename.endswith(".zip")
    ):
        return None
    path = os.path.join(base, BACKUPS_FOLDER, EXPORTS_FOLDER, filename)
    return path if os.path.isfile(path) else None


def _safe_member(name: str) -> str | None:
    """Normalized relative path of an archive member, None if not allowed."""
    if "\\" in name or name.startswith("/") or "\x00" in name:
        return None
    parts = [part for part in name.split("/") if part not in ("", ".")]
    if not parts or ".." in parts or ":" in parts[0]:
        return None
    relative = "/".join(parts)
    return relative if transferable_path(relative) else None


def read_archive(content: bytes) -> tuple[dict[str, Any], dict[str, bytes]]:
    """Validate an export and return its manifest and files.

    Raises InvalidArchive for anything that is not an export of this format:
    no manifest, paths outside the folder, other file types, too large.
    """
    try:
        archive = zipfile.ZipFile(io.BytesIO(content))
    except (zipfile.BadZipFile, ValueError) as err:
        raise InvalidArchive("not a zip file") from err
    with archive:
        # Sizes come from the archive's directory; nothing is unpacked
        # before they are checked.
        try:
            manifest_info = archive.getinfo(MANIFEST_NAME)
        except KeyError as err:
            raise InvalidArchive("manifest missing") from err
        if manifest_info.file_size > MAX_MANIFEST_BYTES:
            raise InvalidArchive("manifest too large")
        members = [info for info in archive.infolist() if not info.is_dir()]
        problem = _check_totals(
            len([info for info in members if info.filename != MANIFEST_NAME]),
            sum(info.file_size for info in members if info.filename != MANIFEST_NAME),
        ) or next(
            (
                reason
                for info in members
                if info.filename != MANIFEST_NAME
                and (reason := _check_size(info.filename, info.file_size))
            ),
            None,
        )
        if problem:
            raise InvalidArchive(problem)
        try:
            manifest = json.loads(archive.read(manifest_info))
        except ValueError as err:
            raise InvalidArchive("manifest unreadable") from err
        if (
            not isinstance(manifest, dict)
            or manifest.get("format") != EXPORT_FORMAT
            or manifest.get("format_version") != EXPORT_FORMAT_VERSION
        ):
            raise InvalidArchive("unknown export format")

        files: dict[str, bytes] = {}
        for info in members:
            if info.filename == MANIFEST_NAME:
                continue
            relative = _safe_member(info.filename)
            if relative is None:
                raise InvalidArchive(f"file not allowed: {info.filename}")
            data = archive.read(info)
            if len(data) != info.file_size:
                raise InvalidArchive(f"size mismatch: {info.filename}")
            problem = _check_file(relative, data)
            if problem:
                raise InvalidArchive(problem)
            files[relative] = data
    if not any(path.startswith("configs/") for path in files):
        raise InvalidArchive("no dashboard configuration in the archive")
    return manifest, files


def _new_backup_folder(backups: str, stamp: str) -> str:
    """Create backups/import-<stamp>[-<n>]; an existing backup is never reused."""
    for attempt in range(1, 1000):
        name = f"import-{stamp}" if attempt == 1 else f"import-{stamp}-{attempt}"
        try:
            os.mkdir(os.path.join(backups, name))
        except FileExistsError:
            continue
        return name
    raise OSError(f"no free backup folder name for import-{stamp}")


def import_archive(base: str, content: bytes, stamp: str) -> ImportResult:
    """Replace the dashboard folder with an export.

    The current content (everything but backups/) is moved to
    backups/import-<stamp>/ first. If anything fails, everything the import
    put in place is removed and the previous content is moved back, so the
    folder is exactly as before.
    """
    manifest, files = read_archive(content)
    backups = os.path.join(base, BACKUPS_FOLDER)
    os.makedirs(backups, exist_ok=True)
    staging = tempfile.mkdtemp(prefix=f".import-{stamp}-", dir=backups)
    backup_name = None
    try:
        for relative, data in files.items():
            target = os.path.join(staging, *relative.split("/"))
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "wb") as handle:
                handle.write(data)

        backup_name = _new_backup_folder(backups, stamp)
        backup = os.path.join(backups, backup_name)
        moved: list[str] = []
        placed: list[str] = []
        try:
            for name in sorted(os.listdir(base)):
                if name == BACKUPS_FOLDER:
                    continue
                _move(os.path.join(base, name), os.path.join(backup, name))
                moved.append(name)
            for name in sorted(os.listdir(staging)):
                _move(os.path.join(staging, name), os.path.join(base, name))
                placed.append(name)
        except BaseException:
            _roll_back(base, backup, moved, placed)
            backup_name = None
            raise
    finally:
        remove_path(staging)

    prune_backups(backups, "import-")
    options = manifest.get("options")
    return ImportResult(
        files=len(files),
        backup=backup_name,
        options=options if isinstance(options, dict) else {},
    )


def _roll_back(base: str, backup: str, moved: list[str], placed: list[str]) -> None:
    """Undo a partial import: drop what it placed, bring back what it moved."""
    for name in placed:
        remove_path(os.path.join(base, name))
    for name in moved:
        os.replace(os.path.join(backup, name), os.path.join(base, name))
    # The backup folder was created by this import; it is empty again unless
    # moving something back failed, in which case it keeps that content.
    if not os.listdir(backup):
        os.rmdir(backup)
