"""Export and import of all dashboard settings."""

from __future__ import annotations

import io
import json
import os
import zipfile
from http import HTTPStatus
from pathlib import Path

import aiohttp
import pytest

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant

from custom_components.dwains_dashboard import settings_transfer
from custom_components.dwains_dashboard.settings_transfer import (
    KEEP_EXPORTS,
    MANIFEST_NAME,
    ExportError,
    InvalidArchive,
    export_archive,
    import_archive,
    read_archive,
    remove_path,
    transferable_path,
)


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)


def _dashboard(base: Path) -> None:
    _write(base / "configs/areas.yaml", "kitchen:\n  icon: mdi:fridge\n")
    _write(base / "configs/cards/areas/kitchen/markdown.yaml", "type: markdown\n")
    _write(base / "configs/more_pages/energy/page.yaml", "cards: []\n")
    _write(base / "blueprints/test.yaml", "blueprint:\n  name: Test\n")
    _write(base / "backups/cleanup-1/areas.yaml", "old: {}\n")


def _zip(files: dict[str, str], manifest: dict | None = None) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        if manifest is not False:
            archive.writestr(
                MANIFEST_NAME,
                json.dumps(manifest or {"format": "dwains-dashboard-export", "format_version": 1}),
            )
        for name, text in files.items():
            archive.writestr(name, text)
    return buffer.getvalue()


def test_export_contains_everything_but_backups(tmp_path: Path) -> None:
    _dashboard(tmp_path)
    filename, count = export_archive(str(tmp_path), "20260101-000000", {"options": {"sidepanel_title": "Home"}})
    assert filename == "dwains-dashboard-20260101-000000.zip"
    assert count == 4

    content = (tmp_path / "backups/exports" / filename).read_bytes()
    manifest, files = read_archive(content)
    assert manifest["options"] == {"sidepanel_title": "Home"}
    assert manifest["files"] == 4
    assert sorted(files) == [
        "blueprints/test.yaml",
        "configs/areas.yaml",
        "configs/cards/areas/kitchen/markdown.yaml",
        "configs/more_pages/energy/page.yaml",
    ]


def test_only_the_newest_exports_are_kept(tmp_path: Path) -> None:
    _dashboard(tmp_path)
    for index in range(KEEP_EXPORTS + 2):
        export_archive(str(tmp_path), f"20260101-00000{index}", {})
    kept = sorted(path.name for path in (tmp_path / "backups/exports").iterdir())
    assert len(kept) == KEEP_EXPORTS
    assert kept[0] == "dwains-dashboard-20260101-000002.zip"


@pytest.mark.parametrize(
    "content",
    [
        b"not a zip",
        _zip({"configs/areas.yaml": "a: 1\n"}, manifest=False),
        _zip({"configs/areas.yaml": "a: 1\n"}, manifest={"format": "other"}),
        _zip({"../configuration.yaml": "x: 1\n", "configs/areas.yaml": "a: 1\n"}),
        _zip({"/etc/passwd.yaml": "x\n", "configs/areas.yaml": "a: 1\n"}),
        _zip({"configs/..\\..\\x.yaml": "x\n"}),
        _zip({"backups/x.yaml": "x\n", "configs/areas.yaml": "a: 1\n"}),
        _zip({"configs/script.py": "print()\n"}),
        _zip({"configs/.hidden.yaml": "x\n"}),
        _zip({"blueprints/only.yaml": "x\n"}),
    ],
    ids=[
        "no-zip",
        "no-manifest",
        "other-format",
        "parent-path",
        "absolute-path",
        "backslashes",
        "backups-folder",
        "not-yaml",
        "hidden-file",
        "no-configs",
    ],
)
def test_invalid_archives_are_rejected(content: bytes) -> None:
    with pytest.raises(InvalidArchive):
        read_archive(content)


def test_import_replaces_and_backs_up(tmp_path: Path) -> None:
    _dashboard(tmp_path)
    content = _zip(
        {
            "configs/areas.yaml": "living_room:\n  icon: mdi:sofa\n",
            "configs/entities.yaml": "light.lamp:\n  friendly_name: Lamp\n",
        },
        manifest={
            "format": "dwains-dashboard-export",
            "format_version": 1,
            "options": {"sidepanel_title": "Imported"},
        },
    )
    result = import_archive(str(tmp_path), content, "20260101-000000")

    assert result.files == 2
    assert result.options == {"sidepanel_title": "Imported"}
    assert (tmp_path / "configs/areas.yaml").read_text().startswith("living_room")
    assert (tmp_path / "configs/entities.yaml").exists()
    # Everything that was there before is in the backup, nothing is left over.
    assert not (tmp_path / "blueprints").exists()
    assert not (tmp_path / "configs/cards").exists()
    backup = tmp_path / "backups" / result.backup
    assert (backup / "configs/areas.yaml").read_text().startswith("kitchen")
    assert (backup / "configs/cards/areas/kitchen/markdown.yaml").exists()
    assert (backup / "blueprints/test.yaml").exists()
    # Older backups stay where they are.
    assert (tmp_path / "backups/cleanup-1/areas.yaml").exists()
    assert not [p for p in (tmp_path / "backups").iterdir() if p.name.startswith(".")]


def test_invalid_import_changes_nothing(tmp_path: Path) -> None:
    _dashboard(tmp_path)
    with pytest.raises(InvalidArchive):
        import_archive(str(tmp_path), _zip({"configs/x.py": "x"}), "20260101-000000")
    assert (tmp_path / "configs/areas.yaml").read_text().startswith("kitchen")
    assert sorted(p.name for p in (tmp_path / "backups").iterdir()) == ["cleanup-1"]


async def _open(hass: HomeAssistant, entry_id: str, step: str):
    result = await hass.config_entries.options.async_init(entry_id)
    return await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": step}
    )


async def test_export_and_download(
    hass: HomeAssistant, setup_dashboard, config_path, hass_client
) -> None:
    _dashboard(config_path("dwains-dashboard"))
    hass.config_entries.async_update_entry(
        setup_dashboard, options={"sidepanel_title": "Haus", "sidepanel_icon": "mdi:home"}
    )
    await hass.async_block_till_done()

    result = await _open(hass, setup_dashboard.entry_id, "export_settings")
    assert result["type"] == "abort"
    assert result["reason"] == "export_done"
    placeholders = result["description_placeholders"]
    filename = placeholders["filename"]
    assert placeholders["link"].startswith(f"/api/dwains_dashboard/export/{filename}?authSig=")
    assert placeholders["download"] == (
        f'<a href="{placeholders["link"]}" target="_blank">{filename}</a>'
    )

    client = await hass_client()
    response = await client.get(f"/api/dwains_dashboard/export/{filename}")
    assert response.status == HTTPStatus.OK
    assert "attachment" in response.headers["Content-Disposition"]
    manifest, files = read_archive(await response.read())
    assert manifest["options"] == {"sidepanel_title": "Haus", "sidepanel_icon": "mdi:home"}
    assert "configs/cards/areas/kitchen/markdown.yaml" in files

    for name in ("missing.zip", "..%2Fconfigs%2Fareas.yaml", "dwains-dashboard-x.yaml"):
        response = await client.get(f"/api/dwains_dashboard/export/{name}")
        # HA's security filter already answers 400 for encoded paths.
        assert response.status in (HTTPStatus.BAD_REQUEST, HTTPStatus.NOT_FOUND), name


async def test_export_that_could_not_be_imported_is_refused(
    hass: HomeAssistant, setup_dashboard, config_path
) -> None:
    base = config_path("dwains-dashboard")
    _dashboard(base)
    (base / "configs/latin1.yaml").write_bytes("name: Küche\n".encode("latin-1"))

    result = await _open(hass, setup_dashboard.entry_id, "export_settings")
    assert result["type"] == "abort"
    assert result["reason"] == "export_failed"
    assert "configs/latin1.yaml" in result["description_placeholders"]["error"]
    assert not (base / "backups/exports").exists()


async def test_download_requires_login(
    hass: HomeAssistant, setup_dashboard, hass_client_no_auth
) -> None:
    client = await hass_client_no_auth()
    response = await client.get("/api/dwains_dashboard/export/dwains-dashboard-1.zip")
    assert response.status == HTTPStatus.UNAUTHORIZED


async def _upload(hass_client, content: bytes) -> str:
    client = await hass_client()
    form = aiohttp.FormData()
    form.add_field("file", content, filename="export.zip", content_type="application/zip")
    response = await client.post("/api/file_upload", data=form)
    assert response.status == HTTPStatus.OK
    return (await response.json())["file_id"]


async def test_import_through_the_options_flow(
    hass: HomeAssistant, setup_dashboard, config_path, hass_client
) -> None:
    base = config_path("dwains-dashboard")
    _dashboard(base)
    events = []
    hass.bus.async_listen("dwains_dashboard_homepage_card_reload", events.append)

    result = await _open(hass, setup_dashboard.entry_id, "import_settings")
    assert result["type"] == "form"
    assert result["step_id"] == "import_settings"

    content = _zip(
        {"configs/areas.yaml": "living_room:\n  icon: mdi:sofa\n"},
        manifest={
            "format": "dwains-dashboard-export",
            "format_version": 1,
            "options": {"sidepanel_title": "Imported", "unknown": "ignored"},
        },
    )

    # Without the confirmation nothing happens.
    file_id = await _upload(hass_client, content)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"file": file_id, "confirm": False}
    )
    assert result["errors"] == {"base": "confirm_required_import"}

    # A file that is not an export is rejected.
    bad_id = await _upload(hass_client, b"not a zip")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"file": bad_id, "confirm": True}
    )
    assert result["errors"] == {"base": "invalid_archive"}
    assert (base / "configs/areas.yaml").read_text().startswith("kitchen")

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"file": file_id, "confirm": True}
    )
    assert result["type"] == "abort"
    assert result["reason"] == "import_done"
    await hass.async_block_till_done()

    assert (base / "configs/areas.yaml").read_text().startswith("living_room")
    backup = config_path(result["description_placeholders"]["backup"])
    assert (backup / "configs/areas.yaml").read_text().startswith("kitchen")
    assert setup_dashboard.options["sidepanel_title"] == "Imported"
    assert "unknown" not in setup_dashboard.options
    # The sidebar shows the imported title right away.
    assert hass.data[frontend.DATA_PANELS]["dwains-dashboard"].sidebar_title == "Imported"
    assert events


def _tree(base: Path) -> dict[str, str]:
    """Every file, symlink and folder below base with its content or target."""
    tree = {}
    for path in sorted(base.rglob("*")):
        relative = path.relative_to(base).as_posix()
        if path.is_symlink():
            tree[relative] = f"-> {path.readlink()}"
        elif path.is_dir():
            tree[relative] = "/"
        else:
            tree[relative] = path.read_bytes().decode("utf-8", "replace")
    return tree


def _export(base: Path, stamp: str = "20260101-000000") -> bytes:
    filename, _count = export_archive(str(base), stamp, {})
    return (base / "backups/exports" / filename).read_bytes()


def test_transferable_paths() -> None:
    assert transferable_path("configs/areas.yaml")
    assert transferable_path("blueprints/test.yml")
    for path in (
        "configs/.DS_Store",
        ".DS_Store",
        "configs/notes.txt",
        "configs/areas.yaml.bak",
        ".git/config.yaml",
        "configs/.hidden/areas.yaml",
        "backups/import-1/configs/areas.yaml",
        "configs//areas.yaml",
    ):
        assert not transferable_path(path), path


def test_an_export_is_always_importable(tmp_path: Path) -> None:
    source = tmp_path / "source"
    _dashboard(source)
    _write(source / ".DS_Store", "finder")
    _write(source / "configs/.DS_Store", "finder")
    _write(source / "configs/notes.txt", "my notes")
    _write(source / ".git/config.yaml", "core: {}\n")
    _write(source / "configs/.drafts/areas.yaml", "draft: {}\n")
    outside = tmp_path / "outside"
    _write(outside / "secret.yaml", "password: x\n")
    (source / "configs/linked.yaml").symlink_to(outside / "secret.yaml")
    (source / "blueprints/linked").symlink_to(outside, target_is_directory=True)

    content = _export(source)
    _manifest, files = read_archive(content)
    assert sorted(files) == [
        "blueprints/test.yaml",
        "configs/areas.yaml",
        "configs/cards/areas/kitchen/markdown.yaml",
        "configs/more_pages/energy/page.yaml",
    ]

    target = tmp_path / "target"
    _write(target / "configs/areas.yaml", "other: {}\n")
    import_archive(str(target), content, "20260101-000001")
    for relative, data in files.items():
        assert (target / relative).read_bytes() == data
    assert (target / "configs/areas.yaml").read_text().startswith("kitchen")


def test_export_refuses_what_an_import_would_reject(tmp_path: Path, monkeypatch) -> None:
    _dashboard(tmp_path)
    (tmp_path / "configs/latin1.yaml").write_bytes("name: Küche\n".encode("latin-1"))
    with pytest.raises(ExportError, match="UTF-8"):
        export_archive(str(tmp_path), "20260101-000000", {})
    (tmp_path / "configs/latin1.yaml").unlink()

    monkeypatch.setattr(settings_transfer, "MAX_FILES", 3)
    with pytest.raises(ExportError, match="too many files"):
        export_archive(str(tmp_path), "20260101-000000", {})
    assert not (tmp_path / "backups/exports").exists()


def test_remove_path_handles_files_links_and_folders(tmp_path: Path) -> None:
    base = tmp_path / "work"
    _write(base / "file.yaml", "a: 1\n")
    _write(base / "folder/inner.yaml", "a: 1\n")
    _write(base / "target/keep.yaml", "a: 1\n")
    (base / "link").symlink_to(base / "target", target_is_directory=True)
    for name in ("file.yaml", "folder", "link", "missing"):
        remove_path(str(base / name))
    assert sorted(p.name for p in base.iterdir()) == ["target"]
    assert (base / "target/keep.yaml").exists()


def _failing_move(fail_on: int, moves: list[tuple[str, str]]):
    def move(source, target):
        moves.append((source, target))
        if len(moves) == fail_on:
            raise OSError("disk full")
        return os.replace(source, target)

    return move


@pytest.mark.parametrize(
    ("fail_on", "phase"),
    [
        (1, "backup"),  # first move of the current content into the backup
        (2, "backup"),  # after one entry was moved
        (4, "import"),  # first move of the import into place
        (5, "import"),  # after one entry (a folder) was placed
        (6, "import"),  # after a plain file was placed
    ],
)
def test_failed_import_restores_everything(
    tmp_path: Path, monkeypatch, fail_on: int, phase: str
) -> None:
    base = tmp_path / "dashboard"
    _dashboard(base)
    _write(base / "settings.yaml", "top: level file\n")
    before = _tree(base)
    # Current content: blueprints, configs, settings.yaml (moves 1-3 into the
    # backup); the import: a.yaml, configs, settings.yaml (moves 4-6).
    content = _zip(
        {
            "a.yaml": "first: file\n",
            "configs/areas.yaml": "living_room: {}\n",
            "settings.yaml": "imported: true\n",
        }
    )
    moves: list[tuple[str, str]] = []
    monkeypatch.setattr(settings_transfer, "_move", _failing_move(fail_on, moves))
    with pytest.raises(OSError, match="disk full"):
        import_archive(str(base), content, "20260101-000000")

    failed_target = moves[-1][1]
    assert ("/backups/import-" in failed_target) == (phase == "backup")
    # Exactly as before: nothing of the import left, no backup or staging
    # folder, every previous file back in place.
    assert _tree(base) == before


def test_two_imports_in_the_same_second_keep_both_backups(tmp_path: Path) -> None:
    tmp_path = tmp_path / "dashboard"
    _dashboard(tmp_path)
    first = import_archive(str(tmp_path), _zip({"configs/areas.yaml": "first: {}\n"}), "20260101-000000")
    second = import_archive(str(tmp_path), _zip({"configs/areas.yaml": "second: {}\n"}), "20260101-000000")
    assert first.backup == "import-20260101-000000"
    assert second.backup == "import-20260101-000000-2"
    backups = tmp_path / "backups"
    assert (backups / first.backup / "configs/areas.yaml").read_text().startswith("kitchen")
    assert (backups / second.backup / "configs/areas.yaml").read_text().startswith("first")
    assert (tmp_path / "configs/areas.yaml").read_text().startswith("second")


def test_an_existing_backup_is_never_overwritten(tmp_path: Path) -> None:
    tmp_path = tmp_path / "dashboard"
    _dashboard(tmp_path)
    _write(tmp_path / "backups/import-20260101-000000/configs/areas.yaml", "older backup\n")
    result = import_archive(str(tmp_path), _zip({"configs/areas.yaml": "new: {}\n"}), "20260101-000000")
    assert result.backup != "import-20260101-000000"
    assert (tmp_path / "backups/import-20260101-000000/configs/areas.yaml").read_text() == "older backup\n"
    assert (tmp_path / "backups" / result.backup / "configs/areas.yaml").read_text().startswith("kitchen")
