"""The Lovelace YAML adapter never re-caches a result an invalidation outdated."""

from __future__ import annotations

from custom_components.dwains_dashboard.lovelace_yaml import DwainsDashboardLovelaceYAML


class _Processor:
    def __init__(self, on_load) -> None:
        self.on_load = on_load
        self.views = ["old"]

    def load_yaml(self, path, secrets):
        views = list(self.views)
        self.on_load()
        return {"views": views}


def test_invalidation_during_load_is_not_overwritten(hass, tmp_path) -> None:
    hass.config.config_dir = str(tmp_path)
    (tmp_path / "ui.yaml").write_text("views: []\n")
    holder: dict = {}
    processor = _Processor(lambda: holder["dash"].invalidate_cache())
    dash = holder["dash"] = DwainsDashboardLovelaceYAML(
        hass, "dwains-dashboard", {"filename": "ui.yaml"}, processor
    )

    config, _ = dash._load_config(True)[1:]
    assert config["views"] == ["old"]
    assert dash._cache is None

    processor.on_load = lambda: None
    processor.views = ["new"]
    dash._load_config(False)
    assert dash._cache is not None
    assert dash._cache[0]["views"] == ["new"]
