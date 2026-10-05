import { css, html, svg, LitElement } from 'lit';
const { defineDwainsElement } = require('./custom-element-registration');
const {
  normalizeGraphHours,
  bucketPoints,
  graphPaths,
} = require('./area-graph');

const { createAreaGraphLoader } = require('./area-graph-loader');

// One loader for all tiles: requests are batched and cached.
const REFRESH_MS = 10 * 60 * 1000;
const loader = createAreaGraphLoader();
let graphSequence = 0;

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
    // Refresh on the wall-clock grid so all tiles reload in the same moment
    // and share one batched request.
    const delay = REFRESH_MS - (Date.now() % REFRESH_MS);
    this._timer = setTimeout(() => {
      this._load(true);
      this._timer = setInterval(() => this._load(true), REFRESH_MS);
    }, delay);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
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
    this._loadedFor = key;
    try {
      const points = await loader.load(this.hass, entityId, hours, { force });
      if (this._loadedFor === key) this._points = points.slice();
    } catch (error) {
      if (this._loadedFor === key) this._points = [];
    }
    if (this._loadedFor === key) this._appendLiveState();
  }

  _appendLiveState() {
    const state = this.hass?.states?.[this.entity];
    if (!state || this._loadedFor !== `${this.entity}|${normalizeGraphHours(this.hours)}`) return;
    const value = Number(state.state);
    const time = Date.parse(state.last_updated);
    if (state.state === '' || !Number.isFinite(value) || !Number.isFinite(time)) return;
    // Without recorded history (new sensor, excluded from the recorder) the
    // graph starts at the current value and grows with live updates.
    const last = this._points[this._points.length - 1];
    if (last && time <= last.time) return;
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
