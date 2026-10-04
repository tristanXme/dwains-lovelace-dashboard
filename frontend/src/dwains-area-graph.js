import { css, html, svg, LitElement } from 'lit';
const { defineDwainsElement } = require('./custom-element-registration');
const {
  normalizeGraphHours,
  historyToPoints,
  bucketPoints,
  graphPaths,
} = require('./area-graph');

// History is shared between tiles and re-fetched at most every few minutes,
// so re-rendering the homepage does not hit the recorder again.
const CACHE_TTL_MS = 5 * 60 * 1000;
const REFRESH_MS = 10 * 60 * 1000;
const historyCache = new Map();
let graphSequence = 0;

function loadHistory(hass, entityId, hours) {
  const key = `${entityId}|${hours}`;
  const cached = historyCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.promise;
  const promise = hass.callWS({
    type: 'history/history_during_period',
    start_time: new Date(Date.now() - hours * 3600 * 1000).toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  }).then((result) => historyToPoints(result?.[entityId]));
  promise.catch(() => historyCache.delete(key));
  historyCache.set(key, { promise, fetchedAt: Date.now() });
  return promise;
}

class DwainsAreaGraph extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      entity: { type: String },
      hours: { type: Number },
      _points: { state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none;
        color: var(--dwains-area-graph-color, var(--primary-color));
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .line {
        fill: none;
        stroke: currentColor;
        stroke-width: 1.75;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
    `;
  }

  constructor() {
    super();
    this._gradientId = `dwains-area-graph-${++graphSequence}`;
    this._points = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._timer = setInterval(() => this._load(true), REFRESH_MS);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
  }

  updated(changed) {
    if (changed.has('entity') || changed.has('hours') || (changed.has('hass') && !this._loadedFor)) {
      this._load(false);
    }
    if (changed.has('hass')) this._appendLiveState();
  }

  async _load(force) {
    const entityId = this.entity;
    if (!this.hass?.callWS || !entityId) return;
    const hours = normalizeGraphHours(this.hours);
    const key = `${entityId}|${hours}`;
    if (force) historyCache.delete(key);
    this._loadedFor = key;
    try {
      const points = await loadHistory(this.hass, entityId, hours);
      if (this._loadedFor === key) this._points = points.slice();
    } catch (error) {
      if (this._loadedFor === key) this._points = [];
    }
  }

  _appendLiveState() {
    const state = this.hass?.states?.[this.entity];
    if (!state || !this._points.length) return;
    const value = Number(state.state);
    const time = Date.parse(state.last_updated);
    const last = this._points[this._points.length - 1];
    if (!Number.isFinite(value) || !Number.isFinite(time) || time <= last.time) return;
    this._points = [...this._points, { time, value }];
  }

  render() {
    const hours = normalizeGraphHours(this.hours);
    const end = Date.now();
    const values = bucketPoints(this._points, { start: end - hours * 3600 * 1000, end });
    const paths = graphPaths(values, 300, 48);
    if (!paths) return html``;
    const id = this._gradientId;
    return html`
      <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
        ${svg`
          <defs>
            <linearGradient id=${id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.22"></stop>
              <stop offset="1" stop-color="currentColor" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <path d=${paths.area} fill=${`url(#${id})`}></path>
          <path class="line" d=${paths.line}></path>
        `}
      </svg>
    `;
  }
}

defineDwainsElement('dwains-area-graph', DwainsAreaGraph);
