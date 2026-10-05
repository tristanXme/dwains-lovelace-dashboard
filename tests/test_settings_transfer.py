"""Export and import of all dashboard settings."""

from __future__ import annotations

import io
import json
import zipfile
from http import HTTPStatus
from pathlib import Path

import aiohttp
import pytest

from homeassistant.core import HomeAssistant

from custom_components.dwains_dashboard.settings_transfer import (
    KEEP_EXPORTS,
    MANIFEST_NAME,
    InvalidArchive,
    export_archive,
    import_archive,
    read_archive,
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
    assert events
