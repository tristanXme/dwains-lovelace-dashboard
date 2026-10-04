DOMAIN = "dwains_dashboard"
VERSION = "3.11.0"
BACKEND_BUILD_REVISION = "20261004.1"
# Keep the integration version compatible while giving changed frontend
# artifacts a distinct module URL. The revision is the leading digest of the
# checked-in production bundle and must change whenever that bundle changes.
FRONTEND_ASSET_REVISION = "2ea7b43d"
# Increment when a standalone loader/layout changes without changing the main
# bundle. This keeps every globally registered module URL cache-safe.
FRONTEND_RESOURCE_REVISION = f"{FRONTEND_ASSET_REVISION}-r1"
