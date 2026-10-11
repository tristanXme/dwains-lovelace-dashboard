const { iconDbRecovery } = require('./icon-db-recovery');
const { registerLazyCard } = require('./lazy-card');
const { getDwainsRuntimeState } = require('./runtime-state');
const { setLoadFailureHandler } = require('./load-failure');
import { showReloadHint } from './save-error-toast';

(function() {
  'use strict';
  // === Dwains reliability patches (v20) ===
  const runtimeState = getDwainsRuntimeState();
  if (runtimeState.bundleLoaded) {
    console.info('Dwains bundle already loaded; skipping second init');
    return;
  }
  runtimeState.bundleLoaded = true;
  // Injected by webpack from manifest.json, the single source of the version.
  console.info(
    `%c DWAINS-DASHBOARD-JS \n%c Version ${__DD_VERSION__}`,
    "color: #2fbae5; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );

  iconDbRecovery.start();

  registerLazyCard();

  // Parts that cannot be loaded after an update: ask for a reload.
  setLoadFailureHandler(showReloadHint);

})();
