import { css, html, LitElement } from 'lit';
import { checkRowStyles, toggleCheckRow } from './styles/form-styles';
import translateEngine from './translate-engine';
import { showSaveError } from './save-error-toast';
import { closePopup } from "./helpers";
const { closeParentDropdown } = require('./dropdown-controller');
const { defineDwainsElement } = require('./custom-element-registration');

class DwainsEditDeviceButtonCard extends LitElement {
      static get styles() {
        return [
        checkRowStyles(css),
          css`
        .edit-element {
          padding: 20px;
          max-width: 460px;
          margin-right: auto;
          margin-left: auto;
        }
        .edit-element ha-icon-picker, .edit-element ha-input, .edit-element ha-select, .edit-element ha-entity-picker {
          display: block;
          margin: .8rem 0;
        }
        .edit-element .dd-check {
          display: flex;
          align-items: center;
          gap: .6rem;
          margin: .9rem 0;
          padding-inline-start: .25rem;
        }
          .add-button {
            font-size: 16px;
            border: 2px solid #4591B8;
            padding: 5px;
            margin-bottom: 50px;
            background: #459CEE;
            border-radius: 20px;
            color: white;
          }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          .dd-check {
            padding: 16px 6px;
          }
          `
        ]
      }
      setConfig(config) {
        this.device = config.device;
        this.icon = config.icon ? config.icon : "";
        this.showInNavbar = config.showInNavbar ? config.showInNavbar : false;
      }
      connectedCallback(){
        super.connectedCallback();
      }
      _iconPickerChange(ev){
        this.icon = ev.detail['value'];
      }
      _showInMainNavbarValueChanged(ev) {
        this.showInNavbar = ev.target.checked;
      }
      _saveButton(ev){
        closeParentDropdown(ev);
        ev.stopPropagation();

        if(this.showInNavbar && !this.icon){
          alert(translateEngine(this.hass, 'device.icon_required'));
          return;
        }

        this.hass.callWS({
          type: 'dwains_dashboard/edit_device_button',
          icon: this.icon,
          device: this.device,
          showInNavbar: this.showInNavbar,
        }).then(
            (resp) => {
                closePopup();
            },
            (err) => {
                showSaveError(this.hass, err);
            }
        );
      }
      render() {
        return html`
        <div class="edit-element">
            <ha-icon-picker
              label=${translateEngine(this.hass, 'device.icon')}
              .value=${this.icon}
              @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>

          <label class="dd-check" @click=${toggleCheckRow}>
              <ha-switch
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
              ></ha-switch>
              <span>${translateEngine(this.hass,'device.show_in_navbar')}</span>
            </label>

            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${(e) => closePopup()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
        `;
      }
}
defineDwainsElement("dwains-edit-device-button-card", DwainsEditDeviceButtonCard);
