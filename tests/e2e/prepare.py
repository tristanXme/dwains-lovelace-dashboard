"""Start a real Home Assistant with Dwains Dashboard for the browser tests.

Usage: python tests/e2e/prepare.py <config dir>
Copies the test configuration, links the integration, starts Home Assistant
in the background, onboards it and configures one area with a graph. The
access token is written to <config dir>/e2e-token.json.
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import aiohttp

ROOT = Path(__file__).resolve().parents[2]
BASE = "http://127.0.0.1:8124"
CLIENT_ID = BASE + "/"


async def _wait_for_http(session: aiohttp.ClientSession) -> None:
    async with asyncio.timeout(240):
        while True:
            try:
                async with session.get(BASE + "/manifest.json") as response:
                    if response.status == 200:
                        return
            except aiohttp.ClientError:
                pass
            await asyncio.sleep(2)


class Ws:
    def __init__(self, ws):
        self._ws = ws
        self._id = 0

    async def call(self, **message):
        self._id += 1
        message["id"] = self._id
        await self._ws.send_json(message)
        while True:
            reply = await self._ws.receive_json()
            if reply.get("id") == self._id and reply["type"] == "result":
                if not reply["success"]:
                    raise RuntimeError(f"{message['type']}: {reply['error']}")
                return reply["result"]


async def _setup(config_dir: Path) -> None:
    async with aiohttp.ClientSession() as session:
        await _wait_for_http(session)
        response = await session.post(
            BASE + "/api/onboarding/users",
            json={
                "client_id": CLIENT_ID,
                "name": "Tristan",
                "username": "e2e",
                "password": "e2e-password",
                "language": "de",
            },
        )
        auth_code = (await response.json())["auth_code"]
        response = await session.post(
            BASE + "/auth/token",
            data={"grant_type": "authorization_code", "code": auth_code, "client_id": CLIENT_ID},
        )
        tokens = await response.json()
        headers = {"Authorization": "Bearer " + tokens["access_token"]}
        for step, body in (
            ("core_config", {}),
            ("analytics", {}),
            ("integration", {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID}),
        ):
            await session.post(BASE + f"/api/onboarding/{step}", json=body, headers=headers)

        async with session.ws_connect(BASE + "/api/websocket") as raw:
            await raw.receive_json()
            await raw.send_json({"type": "auth", "access_token": tokens["access_token"]})
            assert (await raw.receive_json())["type"] == "auth_ok"
            ws = Ws(raw)
            # Onboarding in German already creates a "Wohnzimmer" area.
            areas = await ws.call(type="config/area_registry/list")
            area = next((a for a in areas if a["name"] == "Wohnzimmer"), None) or await ws.call(
                type="config/area_registry/create", name="Wohnzimmer", icon="mdi:sofa"
            )
            entity_ids = (
                "sensor.temperatur_wohnzimmer",
                "sensor.luftfeuchte_wohnzimmer",
                "binary_sensor.fenster_wohnzimmer",
                "input_boolean.e2e_lamp",
            )
            # HTTP answers before every integration has registered its
            # entities (on a fast machine the template sensors come later).
            async with asyncio.timeout(60):
                while True:
                    registry = await ws.call(type="config/entity_registry/list")
                    known = {entry["entity_id"] for entry in registry}
                    if known.issuperset(entity_ids):
                        break
                    await asyncio.sleep(0.5)
            for entity_id in entity_ids:
                await ws.call(
                    type="config/entity_registry/update",
                    entity_id=entity_id,
                    area_id=area["area_id"],
                )
            response = await session.post(
                BASE + "/api/config/config_entries/flow",
                json={"handler": "dwains_dashboard"},
                headers=headers,
            )
            assert response.status == 200, await response.text()
            await asyncio.sleep(3)
            await ws.call(
                type="dwains_dashboard/edit_area_button",
                areaId=area["area_id"],
                icon="mdi:sofa",
                graphEntity="sensor.temperatur_wohnzimmer",
                graphHours=24,
            )
            await ws.call(
                type="dwains_dashboard/edit_entity_favorite",
                entityId="input_boolean.e2e_lamp",
                favorite=True,
            )

        (config_dir / "e2e-token.json").write_text(
            json.dumps({**tokens, "hassUrl": BASE, "clientId": CLIENT_ID, "areaId": area["area_id"]})
        )


def _has_setup_port() -> bool:
    from homeassistant.components.http import const

    return hasattr(const, "ENV_SETUP_PORT")


def main() -> None:
    config_dir = Path(sys.argv[1]).resolve()
    shutil.rmtree(config_dir, ignore_errors=True)
    (config_dir / "custom_components").mkdir(parents=True)
    shutil.copy(Path(__file__).with_name("configuration.yaml"), config_dir / "configuration.yaml")
    if not _has_setup_port():
        # Before SETUP_PORT (the oldest supported releases) the port comes
        # from configuration.yaml and is kept.
        with open(config_dir / "configuration.yaml", "a", encoding="utf-8") as config:
            config.write("http:\n  server_port: 8124\n")
    os.symlink(
        ROOT / "custom_components" / "dwains_dashboard",
        config_dir / "custom_components" / "dwains_dashboard",
    )
    log = open(config_dir / "hass.out", "w")  # noqa: SIM115 - kept open for the child
    # The port comes from SETUP_PORT: a port in configuration.yaml is a
    # "pending" HTTP config that Home Assistant reverts after five minutes.
    subprocess.Popen(
        [sys.executable, "-m", "homeassistant", "-c", str(config_dir)],
        env={**os.environ, "SETUP_PORT": "8124"},
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    asyncio.run(_setup(config_dir))
    print("Home Assistant ready on", BASE)


if __name__ == "__main__":
    main()
