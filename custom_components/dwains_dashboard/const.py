DOMAIN = "dwains_dashboard"
VERSION = "3.11.0"
BACKEND_BUILD_REVISION = "20261004.1"
# Keep the integration version compatible while giving changed frontend
# artifacts a distinct module URL. scripts/postbuild.mjs writes the revision:
# a digest of every served frontend file (bundle, chunks, strings, loader).
FRONTEND_ASSET_REVISION = "8113fc1e"
# Increment to force new module URLs without a frontend change.
FRONTEND_RESOURCE_REVISION = f"{FRONTEND_ASSET_REVISION}-r1"
