"use strict";
const { READ_TYPES } = require("./websocket-read-messages");

const CACHEABLE_READ_TYPES = new Set(Object.values(READ_TYPES));

// The Home Assistant frontend replaces `hass.entities`, `hass.devices`,
// `hass.areas` and `hass.floors` with new objects whenever the matching
// registry changes. While the object is the same, a registry list read
// earlier is still current, so it is reused across dashboard navigations
// instead of being downloaded again (the entity registry alone is several MB
// on large installations).
const REGISTRY_FRESHNESS_KEYS = Object.freeze({
  [READ_TYPES.entities]: "entities",
  [READ_TYPES.devices]: "devices",
  [READ_TYPES.areas]: "areas",
  [READ_TYPES.floors]: "floors",
});

// Dashboard data that changes only through dashboard mutations. Every
// mutation fires a dashboard event; while the dashboard holds a live
// subscription to those events (see markEventInvalidation) these reads are
// kept until such an event invalidates them instead of expiring after `ttl`.
const EVENT_INVALIDATED_TYPES = new Set([
  READ_TYPES.configuration,
  READ_TYPES.navigation,
  READ_TYPES.morePages,
]);
const EVENT_INVALIDATED_TTL = 10 * 60 * 1000;

function registryFreshnessToken(hass, message) {
  const key = REGISTRY_FRESHNESS_KEYS[message?.type];
  const token = key ? hass?.[key] : undefined;
  return token && typeof token === "object" ? token : undefined;
}

class WebSocketReadStore {
  constructor({
    ttl = 3000,
    now = () => Date.now(),
    reportError = (message, error) => console.error(message, error),
    reportCompatibility = (message) => console.info(message),
    freshnessToken = registryFreshnessToken,
  } = {}) {
    this._ttl = ttl;
    this._freshnessToken = freshnessToken;
    this._now = now;
    this._reportError = reportError;
    this._reportCompatibility = reportCompatibility;
    this._connections = new WeakMap();
    this._eventInvalidated = new WeakSet();
    this._unsupportedCapabilities = new WeakMap();
  }

  readPreferred(
    hass,
    preferredMessage,
    fallbackMessage,
    {
      capability = preferredMessage?.type,
      selectFallback = (value) => value,
    } = {},
  ) {
    const scope = hass?.connection || hass;
    if ((typeof scope !== "object" && typeof scope !== "function") || scope === null) {
      return Promise.reject(new TypeError("A stable Home Assistant connection is required"));
    }
    let unsupported = this._unsupportedCapabilities.get(scope);
    if (!unsupported) {
      unsupported = new Set();
      this._unsupportedCapabilities.set(scope, unsupported);
    }
    const fallback = () => this.read(hass, fallbackMessage).then(selectFallback);
    if (unsupported.has(capability)) return fallback();

    return this.read(hass, preferredMessage).catch((error) => {
      if (error?.code !== "unknown_command") throw error;
      unsupported.add(capability);
      this._reportCompatibility(
        `Home Assistant does not expose ${preferredMessage.type}; using the compatible configuration read.`,
      );
      return fallback();
    });
  }

  read(hass, message) {
    if (!hass || typeof hass.callWS !== "function") {
      return Promise.reject(new TypeError("A Home Assistant callWS client is required"));
    }
    if (!message || !CACHEABLE_READ_TYPES.has(message.type)) {
      return Promise.reject(new TypeError("Only registered read-only messages may be cached"));
    }

    const scope = hass.connection || hass;
    if ((typeof scope !== "object" && typeof scope !== "function") || scope === null) {
      return Promise.reject(new TypeError("A stable Home Assistant connection is required"));
    }
    let state = this._connections.get(scope);
    if (!state) {
      state = {
        cache: new Map(),
        inflight: new Map(),
        generations: new Map(),
        invalidated: false,
      };
      this._connections.set(scope, state);
    }

    let key;
    try {
      key = JSON.stringify(message);
    } catch (error) {
      return Promise.reject(error);
    }
    const generation = state.generations.get(key) || 0;
    const token = this._freshnessToken(hass, message);
    const ttl = this._eventInvalidated.has(scope) && EVENT_INVALIDATED_TYPES.has(message.type)
      ? EVENT_INVALIDATED_TTL
      : this._ttl;
    const cached = state.cache.get(key);
    if (cached && (
      (token !== undefined && cached.token === token)
      || this._now() - cached.storedAt < ttl
    )) {
      return Promise.resolve(cached.value);
    }
    const current = state.inflight.get(key);
    if (current && current.generation === generation) return current.promise;

    let pending;
    pending = Promise.resolve()
      // Home Assistant's WebSocket client adds its request id directly to the
      // message object. Keep canonical/cache-key messages immutable, but always
      // hand the transport a fresh extensible request.
      .then(() => hass.callWS({ ...message }))
      .then(
        (value) => {
          if (state.inflight.get(key)?.promise === pending) state.inflight.delete(key);
          if (state.invalidated || (state.generations.get(key) || 0) !== generation) {
            return this.read(hass, message);
          }
          state.cache.set(key, { storedAt: this._now(), token, value });
          return value;
        },
        (error) => {
          if (state.inflight.get(key)?.promise === pending) state.inflight.delete(key);
          if (state.invalidated || (state.generations.get(key) || 0) !== generation) {
            return this.read(hass, message);
          }
          throw error;
        },
      );
    state.inflight.set(key, { generation, promise: pending });
    return pending;
  }

  /**
   * Declare whether dashboard events currently invalidate this connection's
   * dashboard reads. Only then are they cached beyond the short `ttl`.
   */
  markEventInvalidation(hass, active) {
    const scope = hass?.connection || hass;
    if ((typeof scope !== "object" && typeof scope !== "function") || scope === null) return;
    if (active) this._eventInvalidated.add(scope);
    else this._eventInvalidated.delete(scope);
  }

  readOptional(hass, message, fallback) {
    return this.read(hass, message).catch((error) => {
      this._reportError(`Optional WebSocket read failed: ${message?.type || "unknown"}`, error);
      return fallback;
    });
  }

  invalidate(hass, message) {
    if (!hass) return;
    const scope = hass.connection || hass;
    if ((typeof scope === "object" || typeof scope === "function") && scope !== null) {
      const state = this._connections.get(scope);
      if (!state) return;
      if (message) {
        let key;
        try {
          key = JSON.stringify(message);
        } catch (error) {
          this._reportError("Unable to invalidate WebSocket read", error);
          return;
        }
        state.generations.set(key, (state.generations.get(key) || 0) + 1);
        state.cache.delete(key);
        state.inflight.delete(key);
        return;
      }
      state.invalidated = true;
      this._connections.delete(scope);
    }
  }
}

const websocketReadStore = new WebSocketReadStore();

module.exports = {
  CACHEABLE_READ_TYPES,
  WebSocketReadStore,
  registryFreshnessToken,
  websocketReadStore,
};
