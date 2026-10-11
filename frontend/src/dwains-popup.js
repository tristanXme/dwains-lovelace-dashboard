import { provideHass } from "./hass-compat";
import { selectTree } from "./card-tools-compat";
import { fireEvent } from "./card-tools-compat";
import { LitElement, html, css } from 'lit';
import { createCardElementSafe } from './helpers';
import { subtlePopupStyles } from './styles/dwains-subtle-style';
const { loadCardHelpers } = require('./card-helpers-loader');
const { CardBuildOwner } = require('./card-build-owner');
const { popupHistoryController } = require('./popup-history-controller');
const { handlePopupCardRebuild } = require('./popup-rebuild-policy');
const { defineOwnedElement } = require('./custom-element-registration');
const {
  closeCardToolsPopup,
  findCardToolsPopup,
  findPopupRoot,
  mountCardToolsPopup,
} = require('./popup-host');

export async function closePopUp() {
  const root = findPopupRoot();
  if (root) fireEvent("hass-more-info", {entityId: "."}, root);
  return closeCardToolsPopup({ root, selectTree });
}

export async function popUp(title, card, large=false, style={}, fullscreen=false, recordHistory=true) {
  if(!customElements.get("card-tools-popup"))
  {
      class CardToolsPopup extends LitElement {

        constructor() {
          super();
          this._cardBuilds = new CardBuildOwner({
            loadHelpers: loadCardHelpers,
            createCard: createCardElementSafe,
          });
        }

        static get properties() {
          return {
            open: {},
            large: {reflect: true, type: Boolean},
            hass: {},
          };
        }

        updated(changedProperties) {
          if(changedProperties.has("hass")) {
            if(this.card)
              this.card.hass = this.hass;
          }
        }

        closeDialog() {
          this._cardBuilds.invalidate();
          this.open = false;
          popupHistoryController.markClosed();
        }

        async _makeCard() {
          this.card = null;
          const card = await this._cardBuilds.build(this._card, this.hass);
          if(card){
            this.card = card;
            this.requestUpdate();
          }
        }

        _handleCardRebuild(event) {
          handlePopupCardRebuild(this._card, event, () => this._makeCard());
        }

        disconnectedCallback() {
          super.disconnectedCallback();
          this._cardBuilds.invalidate();
        }

        async _applyStyles() {
          let el = await selectTree(this, "$ ha-dialog");
          customElements.whenDefined("card-mod").then(async () => {
          if(!el) return;
            const cm = window.cardMod || customElements.get("card-mod");
            if(!cm || typeof cm.applyToElement !== "function") return;
            if(cm.applyToElement.length <= 3){
              cm.applyToElement(el, this._style, {config: this._card, tag: "more-info"});
            } else {
              cm.applyToElement(el, "more-info", this._style, {config: this._card}, [], false);
            }
          });

        }

        async showDialog(title, card, large=false, style={}, fullscreen=false) {
          this.title = title;
          this._card = card;
          this.large = large;
          this._style = style;
          this.fullscreen = !!fullscreen;
          this._makeCard();
          await this.updateComplete;
          this.open = true;
          await this._applyStyles();
        }

        _enlarge() {
          this.large = !this.large;
        }

        render() {
          if(!this.open) {
            return html``;
          }

          return html`
            <ha-dialog
              open
              @closed=${this.closeDialog}
              .width=${this.fullscreen ? "full" : this.large ? "large" : "medium"}
              @ll-rebuild=${this._handleCardRebuild}
            >
            ${this.fullscreen ? "" : html`
              <span slot="headerTitle" class="main-title" @click=${this._enlarge}>${this.title}</span>
            `}
              <div class="content">
                ${this.card}
              </div>
            </ha-dialog>
          `
        }

        static get styles() {
          return [css`
          /* Home Assistant's dialog (since 2026.5): the title goes into its
             headerTitle slot, the size is its width (medium, large, full). */
          .main-title {
            display: block;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .content {
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0;
            overflow-x: hidden;
          }

          .content > * {
            display: block;
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          `, subtlePopupStyles(css)];
        }

      }
    defineOwnedElement("card-tools-popup", CardToolsPopup);
  }

  const root = findPopupRoot();

  if(!root) return;
  let el = await findCardToolsPopup({ root, selectTree });
  if(!el) {
    el = document.createElement("card-tools-popup");
    if (!mountCardToolsPopup({ root, popup: el, provideHass })) return;
  }

  popupHistoryController.connect(el, (params) => {
    if (!params) return undefined;
    const {title, card, large, style, fullscreen} = params;
    return popUp(title, card, large, style, fullscreen, false);
  });

  if(recordHistory) {
    popupHistoryController.recordOpen({title, card, large, style, fullscreen});
  }

  el.showDialog(title, card, large, style, fullscreen);

}
