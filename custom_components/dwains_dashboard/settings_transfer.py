"""Filesystem side of the settings export and import (no Home Assistant imports).

An export is a zip of the dwains-dashboard folder (configs, more pages,
blueprints and card templates) without its backups, plus a small manifest.
An import replaces that folder with the archive's content; the previous
content is moved to backups/ first.
"""

from __future__ import annotations

import io
import json
import os
import posixpath
import shutil
import zipfile
from dataclasses import dataclass, field
from typing import Any

MANIFEST_NAME = "dwains-dashboard-export.json"
EXPORT_FORMAT = "dwains-dashboard-export"
EXPORT_FORMAT_VERSION = 1
BACKUPS_FOLDER = "backups"
EXPORTS_FOLDER = "exports"
KEEP_EXPORTS = 5
ALLOWED_SUFFIXES = (".yaml", ".yml")
MAX_FILES = 5000
MAX_TOTAL_BYTES = 50 * 1024 * 1024
EXPORT_PREFIX = "dwains-dashboard-"


class InvalidArchive(Exception):
    """The uploaded file is not a usable Dwains Dashboard export."""


@dataclass
class ImportResult:
    files: int
    backup: str
    options: dict[str, Any] = field(default_factory=dict)


def _exported_files(base: str) -> list[str]:
    """Relative paths (with /) of all files that belong in an export."""
    files = []
    for root, dirs, names in os.walk(base):
        relative_root = os.path.relpath(root, base)
        if relative_root == ".":
            dirs[:] = [name for name in dirs if name != BACKUPS_FOLDER]
        dirs.sort()
        for name in sorted(names):
            path = os.path.join(root, name)
            if os.path.isfile(path) and not os.path.islink(path):
                files.append(os.path.relpath(path, base).replace(os.sep, "/"))
    return files


def export_archive(
    base: str, stamp: str, manifest: dict[str, Any]
) -> tuple[str, int]:
    """Write backups/exports/dwains-dashboard-<stamp>.zip.

    Returns the archive file name and the number of exported files. Only the
    newest KEEP_EXPORTS archives are kept.
    """
    exports = os.path.join(base, BACKUPS_FOLDER, EXPORTS_FOLDER)
    os.makedirs(exports, exist_ok=True)
    filename = f"{EXPORT_PREFIX}{stamp}.zip"
    files = _exported_files(base)
    data = {
        **manifest,
        "format": EXPORT_FORMAT,
        "format_version": EXPORT_FORMAT_VERSION,
        "files": len(files),
    }
    target = os.path.join(exports, filename)
    with zipfile.ZipFile(target + ".tmp", "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(MANIFEST_NAME, json.dumps(data, indent=2, ensure_ascii=False))
        for relative in files:
            archive.write(os.path.join(base, *relative.split("/")), relative)
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
    if parts[0] == BACKUPS_FOLDER or any(part.startswith(".") for part in parts):
        return None
    return "/".join(parts)


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
        try:
            manifest = json.loads(archive.read(MANIFEST_NAME))
        except KeyError as err:
            raise InvalidArchive("manifest missing") from err
        except ValueError as err:
            raise InvalidArchive("manifest unreadable") from err
        if (
            not isinstance(manifest, dict)
            or manifest.get("format") != EXPORT_FORMAT
            or manifest.get("format_version") != EXPORT_FORMAT_VERSION
        ):
            raise InvalidArchive("unknown export format")

        members = [info for info in archive.infolist() if not info.is_dir()]
        if len(members) > MAX_FILES + 1:
            raise InvalidArchive("too many files")
        if sum(info.file_size for info in members) > MAX_TOTAL_BYTES:
            raise InvalidArchive("too large")

        files: dict[str, bytes] = {}
        for info in members:
            if info.filename == MANIFEST_NAME:
                continue
            relative = _safe_member(info.filename)
            if relative is None or not relative.endswith(ALLOWED_SUFFIXES):
                raise InvalidArchive(f"file not allowed: {info.filename}")
            data = archive.read(info)
            if len(data) != info.file_size:
                raise InvalidArchive(f"size mismatch: {info.filename}")
            try:
                data.decode("utf-8")
            except UnicodeDecodeError as err:
                raise InvalidArchive(f"not text: {info.filename}") from err
            files[relative] = data
    if not any(path.startswith("configs/") for path in files):
        raise InvalidArchive("no dashboard configuration in the archive")
    return manifest, files


def import_archive(base: str, content: bytes, stamp: str) -> ImportResult:
    """Replace the dashboard folder with an export.

    The current content (everything but backups/) is moved to
    backups/import-<stamp>/ first; on an error it is moved back.
    """
    manifest, files = read_archive(content)
    backups = os.path.join(base, BACKUPS_FOLDER)
    staging = os.path.join(backups, f".import-{stamp}")
    backup = os.path.join(backups, f"import-{stamp}")
    shutil.rmtree(staging, ignore_errors=True)
    try:
        for relative, data in files.items():
            target = os.path.join(staging, *relative.split("/"))
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "wb") as handle:
                handle.write(data)

        os.makedirs(backup, exist_ok=True)
        moved: list[str] = []
        try:
            for name in sorted(os.listdir(base)):
                if name == BACKUPS_FOLDER:
                    continue
                os.replace(os.path.join(base, name), os.path.join(backup, name))
                moved.append(name)
            for name in sorted(os.listdir(staging)):
                os.replace(os.path.join(staging, name), os.path.join(base, name))
        except OSError:
            for name in sorted(os.listdir(base)):
                if name != BACKUPS_FOLDER and name not in moved:
                    shutil.rmtree(os.path.join(base, name), ignore_errors=True)
            for name in moved:
                os.replace(os.path.join(backup, name), os.path.join(base, name))
            raise
    finally:
        shutil.rmtree(staging, ignore_errors=True)

    options = manifest.get("options")
    return ImportResult(
        files=len(files),
        backup=f"import-{stamp}",
        options=options if isinstance(options, dict) else {},
    )
