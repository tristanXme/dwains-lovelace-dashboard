import { popUp } from "./dwains-popup";
import {
    applyThemesOnElement,
    computeDomain
} from './frontend-helpers';
import { resolveEntityName } from './helpers';
const { EventSubscriptionOwner } = require('./event-subscription-owner');
const { EventListenerOwner } = require('./event-listener-owner');
const { TimerOwner } = require('./timer-owner');
const { DashboardBootstrapOwner } = require('./dashboard-bootstrap-owner');
const { PopupOpenScheduler } = require('./popup-open-scheduler');
const { ReloadableLoadOwner } = require('./reloadable-load-owner');
const { websocketReadStore } = require('./websocket-read-store');
const { READ_MESSAGES } = require('./websocket-read-messages');
const { resolveHass } = require('./hass-provider');
const { hassConnectionIdentity } = require('./hass-connection');
const { loadDashboardCoreSnapshot } = require('./dashboard-registry-snapshot');
const { isDwainsRoute } = require('./dashboard-route-state');
const {
    findHomeAssistantHost,
    findHomeAssistantMain,
    findLovelaceRoot,
    findLovelaceShell,
} = require('./lovelace-dom');
const POPUP_LISTENER_OPTIONS = { capture: true };

//Herschreven
function getDwainsHass() {
    return resolveHass();
}

class DwainsDashboard {
    constructor() {
        this._subscriptions = new EventSubscriptionOwner();
        this._subscriptions.connect();
        this._listeners = new EventListenerOwner();
        this._timers = new TimerOwner();
        this._timers.connect();
        this._popupOpens = new PopupOpenScheduler(this._timers, { delay: 10 });
        this._loads = new ReloadableLoadOwner((context) => this._loadData(context));
        this._destroyed = false;
        this._locationUpdater = this.locationChanged.bind(this);
        this._visibilityChangeHandler = () => {
            if (document.visibilityState === "visible") {
                this.locationChanged();
                this._subscribeReload();
            }
        };
        this._popupCardHandler = this.popupCard.bind(this);

        this._listeners.listen('location-changed', window, 'location-changed', this._locationUpdater);
        this._listeners.listen('popstate', window, 'popstate', this._locationUpdater);
        this._listeners.listen(
            'visibilitychange',
            document,
            'visibilitychange',
            this._visibilityChangeHandler,
        );
        this._listeners.connect();

        this._subscribeReload();
        // Home Assistant may open on any page; the dashboard starts when it
        // is shown (now or after a later navigation).
        this.locationChanged();
    }

    _subscribeReload() {
        if (this._destroyed) return;
        const ha = getDwainsHass();
        if (ha && ha.connection) {
            const connection = hassConnectionIdentity(ha);
            const connectionChanged = Boolean(
                this._subscriptionConnection
                && this._subscriptionConnection !== connection,
            );
            if (connectionChanged) {
                websocketReadStore.markEventInvalidation(this._subscriptionHass, false);
                this._subscriptions.disconnect();
                this._subscriptions.connect();
                this.reloadData().catch((error) => {
                    console.error("Failed to refresh Dwains Dashboard after reconnect", error);
                });
            }
            this._subscriptionConnection = connection;
            this._subscriptionHass = ha;
            this._clearSubscriptionRetry();
            const invalidateDashboardReads = () => {
                for (const message of [
                    READ_MESSAGES.configuration,
                    READ_MESSAGES.navigation,
                    READ_MESSAGES.morePages,
                ]) {
                    websocketReadStore.invalidate(ha, message);
                }
            };
            Promise.all([
                // Any dashboard mutation fires one of these events. Holding
                // them here, independent of which view is open, lets the read
                // store keep the dashboard configuration between navigations.
                ...[
                    "dwains_dashboard_homepage_card_reload",
                    "dwains_dashboard_devicespage_card_reload",
                    "dwains_dashboard_navigation_card_reload",
                    "dwains_dashboard_more_pages_reload",
                ].map((eventType) => this._subscriptions.subscribeEvent(
                    `dashboard-data-${eventType}`,
                    ha,
                    eventType,
                    invalidateDashboardReads,
                )),
                this._subscriptions.subscribeEvent(
                    'dashboard-reload',
                    ha,
                    "dwains_dashboard_reload",
                    () => {
                        websocketReadStore.invalidate(ha);
                        this.reload().catch((error) => {
                            console.error("Failed to process Dwains Dashboard reload", error);
                        });
                    },
                ),
                this._subscriptions.subscribeEvent(
                    'dashboard-config-reload',
                    ha,
                    "dwains_dashboard_config_reload",
                    () => {
                        websocketReadStore.invalidate(ha);
                        this.reloadData().catch((error) => {
                            console.error("Failed to reload Dwains Dashboard configuration", error);
                        });
                    },
                ),
            ]).then(() => {
                websocketReadStore.markEventInvalidation(ha, true);
                this.__ddSubscribeRetries = 0;
                this.__ddSubscribeRetryExhausted = false;
            }).catch((error) => {
                websocketReadStore.markEventInvalidation(ha, false);
                console.error("Failed to subscribe to Dwains Dashboard reload events", error);
                this._scheduleSubscriptionRetry();
            });
        } else {
            this._scheduleSubscriptionRetry();
        }
    }

    _scheduleSubscriptionRetry() {
        if (this._destroyed || this._timers.has('subscription-retry')) return;
        const retry = (this.__ddSubscribeRetries || 0) + 1;
        if (retry > 30) {
            if (!this.__ddSubscribeRetryExhausted) {
                console.error("Unable to subscribe to Dwains Dashboard reload events after 30 retries");
                this.__ddSubscribeRetryExhausted = true;
            }
            return;
        }
        this.__ddSubscribeRetries = retry;
        this._timers.schedule('subscription-retry', () => {
            this._subscribeReload();
        }, 200, { replace: false });
    }

    _clearSubscriptionRetry() {
        this._timers.clear('subscription-retry');
    }

    // In the capture phase: popupCard() runs before Home Assistant's own
    // listener on the same element and can keep it from opening its dialog.
    _ensurePopupListener() {
        if (this._destroyed) return;
        const host = findHomeAssistantHost();
        if (!host || host === this._popupHost) return;
        this._listeners.listen('hass-more-info', host, 'hass-more-info', this._popupCardHandler, POPUP_LISTENER_OPTIONS);
        this._popupHost = host;
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._loads.invalidate();
        this._clearSubscriptionRetry();
        this._timers.disconnect();
        this._subscriptions.disconnect();
        this._listeners.disconnect();
        websocketReadStore.markEventInvalidation(this._subscriptionHass, false);
        this._subscriptionConnection = undefined;
        this._subscriptionHass = undefined;
        this._popupHost = undefined;
    }

    loadData() {
        return this._loads.load();
    }

    reloadData() {
        return this._loads.reload();
    }

    async _loadData({ isCurrent = () => true } = {}) {
        const ha = getDwainsHass();
        const connection = hassConnectionIdentity(ha);
        const snapshot = await loadDashboardCoreSnapshot(ha, {
            optionalRegistries: true,
        });
        if (!isCurrent()
            || this._destroyed
            || hassConnectionIdentity(getDwainsHass()) !== connection) return;
        Object.assign(this, snapshot);
    }

    _entityDisplayName(entityId) {
        const entityEntry = this.entitiesById?.get(entityId);
        const deviceEntry = entityEntry?.device_id
            ? this.devicesById?.get(entityEntry.device_id)
            : undefined;
        return resolveEntityName(
            getDwainsHass(),
            this.configuration,
            entityId,
            entityEntry,
            deviceEntry,
        );
    }

    locationChanged() {
        if (this._destroyed || !isDwainsRoute(window.location.pathname)) return;
        this.applyDwainsTheme();
        this._ensurePopupListener();
        // The custom popups need the configuration. Loaded the first time the
        // dashboard is shown; dashboard events reload it (_subscribeReload).
        if (!this.configuration) {
            this.loadData().catch((error) => {
                console.error("Failed to load Dwains Dashboard data", error);
            });
        }
    }

    popupCard(ev) {
        const entityId = ev.detail?.entityId;
        // Only on the dashboard's own pages: other dashboards keep Home
        // Assistant's dialog.
        if(!entityId || !this.configuration || !isDwainsRoute(window.location.pathname)) return;

        // The entity's own popup unless it is switched off, else the popup
        // of its device type, else Home Assistant's more-info dialog.
        const ownPopup = this.configuration.entities_popup?.[entityId];
        const entityConfig = this.configuration.entities?.[entityId];
        const ownPopupOn = ownPopup && (!entityConfig || entityConfig.custom_popup);
        const popup = ownPopupOn ? ownPopup : this.configuration.devices_popup?.[computeDomain(entityId)];
        if(!popup) return;

        // Instead of Home Assistant's dialog, which must not open at all: it
        // also writes the browser history (and the URL), and closing it
        // again went back in the history and opened it again.
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        const friendlyName = this._entityDisplayName(entityId);
        this._popupOpens.schedule(() => {
            popUp(friendlyName, {input_entity: entityId, ...popup}, false, '');
        });
    }

    applyDwainsTheme(isRetry) {
        if (!isRetry) this.__ddThemeRetries = 0;
        const root = this.getRoot();
        const shell = findLovelaceShell(root);
        if (!shell) {
            if ((this.__ddThemeRetries = (this.__ddThemeRetries || 0) + 1) <= 20) {
                this._timers.schedule('apply-theme', () => this.applyDwainsTheme(true), 150);
            }
            return;
        }
        this.__ddThemeRetries = 0;
        applyThemesOnElement(shell.view, {
            themes: {
                "dwains-theme": { "ha-card-border-radius": "0.75rem"}
            }
        }, "dwains-theme");
    }

    async reload() {
        if (this.__ddReloading) {
            this.__ddReloadAgain = true;
            return;
        }
        this.__ddReloading = true;
        try {
            do {
                this.__ddReloadAgain = false;
                await this._softReload();
            } while (this.__ddReloadAgain);
        } finally {
            this.__ddReloading = false;
        }
    }

    async _softReload() {
        try {
            await this.reloadData();
        } catch (err) {
            console.error("Failed to reload Dwains Dashboard data", err);
        }
        this.applyDwainsTheme();
    }

    getRoot() {
        return findLovelaceRoot();
    }

}

// Initiate the class when Home Assistant's main shadow root is ready.
const dashboardBootstrap = new DashboardBootstrapOwner({
    target: window,
    findMain: findHomeAssistantMain,
    createDashboard: () => new DwainsDashboard(),
});
dashboardBootstrap.connect();
