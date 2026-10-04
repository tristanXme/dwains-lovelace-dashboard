"""Lovelace dashboard adapter for the Dwains Dashboard YAML templates."""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any, override

from annotatedyaml.exceptions import YamlTypeError
from annotatedyaml.loader import Secrets
from homeassistant.components.lovelace.const import MODE_YAML, ConfigNotFound
from homeassistant.components.lovelace.dashboard import LovelaceConfig
from homeassistant.helpers.json import json_bytes, json_fragment

from .process_yaml import DashboardYamlProcessor


class DwainsDashboardLovelaceYAML(LovelaceConfig):
    """Serve the template-aware dashboard through the abstract Lovelace API.

    Only the abstract ``LovelaceConfig`` contract (``mode``, ``async_get_info``,
    ``async_load`` and ``async_json``) is implemented. Earlier versions
    overrode private methods of Home Assistant's ``LovelaceYAML``, which any
    core release could rename or change.
    """

    def __init__(self, hass, url_path, config, processor: DashboardYamlProcessor):
        super().__init__(hass, url_path, config)
        self.path = hass.config.path(config["filename"])
        self._processor = processor
        self._cache: tuple[dict[str, Any], float, json_fragment] | None = None

    def invalidate_cache(self, *_args) -> None:
        """Invalidate includes which cannot be tracked through the root mtime."""
        self._cache = None

    @property
    @override
    def mode(self) -> str:
        return MODE_YAML

    @override
    async def async_get_info(self) -> dict[str, Any]:
        try:
            config = await self.async_load(False)
        except ConfigNotFound:
            return {"mode": self.mode, "error": f"{self.path} not found"}
        return {"mode": self.mode, "views": len(config.get("views", []))}

    @override
    async def async_load(self, force: bool) -> dict[str, Any]:
        config, _json = await self._async_load_or_cached(force)
        return config

    @override
    async def async_json(self, force: bool) -> json_fragment:
        _config, json = await self._async_load_or_cached(force)
        return json

    async def _async_load_or_cached(
        self, force: bool
    ) -> tuple[dict[str, Any], json_fragment]:
        is_updated, config, json = await self.hass.async_add_executor_job(
            self._load_config, force
        )
        if is_updated:
            self._config_updated()
        return config, json

    def _load_config(self, force: bool) -> tuple[bool, dict[str, Any], json_fragment]:
        cache = self._cache
        if not force and cache is not None:
            config, last_update, json = cache
            if config and last_update > os.path.getmtime(self.path):
                return False, config, json

        is_updated = cache is not None
        try:
            config = self._processor.load_yaml(
                self.path,
                Secrets(Path(self.hass.config.config_dir)),
            )
        except FileNotFoundError:
            raise ConfigNotFound from None
        if not isinstance(config, dict):
            raise YamlTypeError(f"YAML file {self.path} does not contain a dict")

        json = json_fragment(json_bytes(config))
        self._cache = (config, time.time(), json)
        return is_updated, config, json
