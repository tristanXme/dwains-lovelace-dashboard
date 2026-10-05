import { LitElement, html, unsafeCSS } from "lit";
import layoutStyles from "./styles/dashboard-layout.css";
const { defineDwainsElement } = require('./custom-element-registration');
const { LovelaceHeaderOwner } = require('./lovelace-header-owner');
// Injected by webpack from manifest.json, the single source of the version.
const VERSION = __DD_VERSION__;
//Herschreven
class DwainsDashboardLayout extends LitElement {
  constructor() {
    super();
    this._headerOwner = new LovelaceHeaderOwner();
  }

  connectedCallback() {
    super.connectedCallback();
    this._headerOwner.connect(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._headerOwner.disconnect();
  }

  setConfig(_config) {}

  static get properties() {
    return {
      hass: { attribute: false },
      cards: { type: Array },
    };
  }

  static get styles() {
    return unsafeCSS(layoutStyles);
  }

  render() {
    return html`
      <div id="dwains_navigation">
        <dwainsboard-navigation-card .hass=${this.hass}></dwainsboard-navigation-card>
      </div>
      <div id="dwains_dashboard">
        ${this.cards ? this.cards.map((card) => html`${card}`) : ''}
      </div>
    `;
  }
}

if (!customElements.get("dwains-dashboard-layout")) {
  defineDwainsElement("dwains-dashboard-layout", DwainsDashboardLayout);
  console.info(
    `%c DWAINS-DASHBOARD-JS \n%c Version ${VERSION}`,
    "color: #2fbae5; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );
}
