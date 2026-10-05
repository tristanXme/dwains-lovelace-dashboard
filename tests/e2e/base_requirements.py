"""Print the Python requirements of the integrations Home Assistant imports
to answer get_services (helpers/service.py: _base_components).

The browser tests run Home Assistant from the pip package, which does not
install integration requirements; without them get_services fails and the
frontend never loads its card helpers. Usage:

    pip install $(python tests/e2e/base_requirements.py)
"""

from __future__ import annotations

import inspect
import json
import re
from pathlib import Path

import homeassistant.components
from homeassistant.helpers import service


def _base_components() -> list[str]:
    source = inspect.getsource(service._base_components)
    names = re.search(r"from homeassistant\.components import \((.*?)\)", source, re.S)
    return re.findall(r"\b([a-z_]+),", names.group(1))


def requirements() -> list[str]:
    components = Path(homeassistant.components.__file__).parent
    base = _base_components()
    pending = list(base)
    # Integrations the base components import directly (ai_task imports
    # camera, conversation, image and media_source).
    for domain in base:
        for module in (components / domain).glob("*.py"):
            pending.extend(
                re.findall(r"from homeassistant\.components(?:\.| import )([a-z_]+)", module.read_text())
            )
    seen: set[str] = set()
    found: set[str] = set()
    while pending:
        domain = pending.pop()
        if domain in seen:
            continue
        seen.add(domain)
        manifest_path = components / domain / "manifest.json"
        if not manifest_path.exists():
            continue
        manifest = json.loads(manifest_path.read_text())
        found.update(manifest.get("requirements", []))
        pending.extend(manifest.get("dependencies", []))
    return sorted(found)


if __name__ == "__main__":
    print("\n".join(requirements()))
