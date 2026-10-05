import { hass } from "./hass-compat";
import { css, html, LitElement } from 'lit';
import translateEngine from './translate-engine';
import { closePopup } from "./helpers";
const { closeParentDropdown } = require('./dropdown-controller');
const { defineDwainsElement } = require('./custom-element-registration');
const { AREA_GRAPH_HOURS, normalizeGraphHours } = require('./area-graph');

class DwainsEditAreaButtonCard extends LitElement {
    static get styles() {
      return [
        css`
        .edit-element {
          padding: 20px;
          max-width: 460px;
          margin-right: auto;
          margin-left: auto;
        }
        .edit-element ha-icon-picker, .edit-element ha-select, .edit-element ha-entity-picker, .edit-element ha-selector {
          display: block;
          margin: .8rem 0;
        }
        .edit-element ha-formfield {
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
        `
      ]
    }
    setConfig(config) {
      if (!this.hass) this.hass = hass();
      this.areaId = config.areaId;
      this.icon = config.icon ? config.icon : "";
      this.disableArea = config.disableArea ? config.disableArea : false;
      this.hideIcon = config.hideIcon ? config.hideIcon : false;
      this.graphEntity = config.graphEntity || "";
      this.graphHours = normalizeGraphHours(config.graphHours);
      this.sensorEntities = Array.isArray(config.sensorEntities) ? config.sensorEntities : [];
      this.binarySensorEntities = Array.isArray(config.binarySensorEntities) ? config.binarySensorEntities : [];
    }
    connectedCallback(){
      //console.log('connectedCallBack');
      super.connectedCallback();
    }
    _iconPickerChange(ev){
      this.icon = ev.detail['value'];
    }
    _disableValueChanged(ev) {
      this.disableArea = ev.target.checked;
    }
    _hideIconValueChanged(ev) {
      this.hideIcon = ev.target.checked;
      this.requestUpdate();
    }
    _graphEntityChanged(ev) {
      this.graphEntity = ev.detail.value || "";
      this.requestUpdate();
    }
    _graphHoursChanged(ev) {
      ev.stopPropagation();
      const value = ev.detail?.value;
      if (value !== undefined && value !== null && value !== "") {
        this.graphHours = normalizeGraphHours(value);
        this.requestUpdate();
      }
    }
    _graphEntityFilter(stateObj) {
      return Boolean(stateObj.attributes && stateObj.attributes.unit_of_measurement);
    }
    // Entities of this area (directly or through their device) in a domain;
    // only those can be shown below the area name.
    _areaEntities(domain) {
      const entities = this.hass?.entities || {};
      const devices = this.hass?.devices || {};
      return Object.values(entities)
        .filter((entry) => entry.entity_id.startsWith(`${domain}.`))
        .filter((entry) => (entry.area_id || devices[entry.device_id]?.area_id) === this.areaId)
        .map((entry) => entry.entity_id);
    }
    _entityListChanged(key, ev) {
      ev.stopPropagation();
      this[key] = Array.isArray(ev.detail.value) ? ev.detail.value : [];
      this.requestUpdate();
    }
    _renderEntityList(key, domain, label, helper) {
      const choices = this._areaEntities(domain);
      // Keep chosen entities selectable even if they moved to another area.
      const include = [...new Set([...choices, ...this[key]])];
      return html`
        <ha-selector
          .hass=${this.hass}
          .label=${label}
          .helper=${helper}
          .value=${this[key]}
          .selector=${{ entity: { multiple: true, include_entities: include.length ? include : ["none.none"] } }}
          @value-changed=${(ev) => this._entityListChanged(key, ev)}
        ></ha-selector>
      `;
    }
    _saveButton(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      this.hass.callWS({
        type: 'dwains_dashboard/edit_area_button',
        icon: this.icon,
        areaId: this.areaId,
        disableArea: this.disableArea,
        hideIcon: this.hideIcon,
        graphEntity: this.graphEntity,
        graphHours: this.graphHours,
        sensorEntities: this.sensorEntities,
        binarySensorEntities: this.binarySensorEntities,
      }).then(
          (resp) => {
              console.log(resp);
              closePopup();
          },
          (err) => {
              console.error('Message failed!', err);
          }
      );
    }
    render() {
      return html`
      <div class="edit-element">
          <ha-icon-picker
            label=${translateEngine(this.hass, 'area.icon')}
            .value=${this.icon}
            .name=${translateEngine(this.hass, 'area.icon')}
            .disabled=${this.hideIcon}
            @value-changed=${this._iconPickerChange}
          ></ha-icon-picker>
          <ha-formfield>
            <ha-checkbox
              @change=${this._hideIconValueChanged}
              .checked=${this.hideIcon}
            ></ha-checkbox>
            <span slot="label">${translateEngine(this.hass, 'area.hide_icon')}</span>
          </ha-formfield>
          <ha-entity-picker
            .hass=${this.hass}
            .label=${translateEngine(this.hass, 'area.graph_entity')}
            .helper=${translateEngine(this.hass, 'area.graph_entity_helper')}
            .value=${this.graphEntity}
            .includeDomains=${["sensor"]}
            .entityFilter=${this._graphEntityFilter}
            allow-custom-entity
            @value-changed=${this._graphEntityChanged}
          ></ha-entity-picker>
          ${this.graphEntity ? html`
            <ha-selector
              .hass=${this.hass}
              .label=${translateEngine(this.hass, 'area.graph_hours')}
              .value=${String(this.graphHours)}
              .selector=${{ select: {
                mode: "dropdown",
                options: AREA_GRAPH_HOURS.map((hours) => ({
                  value: String(hours),
                  label: translateEngine(this.hass, `area.graph_hours_${hours}`),
                })),
              } }}
              @value-changed=${this._graphHoursChanged}
            ></ha-selector>
          ` : ""}
          ${this._renderEntityList(
            'sensorEntities',
            'sensor',
            translateEngine(this.hass, 'area.sensor_entities'),
            translateEngine(this.hass, 'area.sensor_entities_helper'),
          )}
          ${this._renderEntityList(
            'binarySensorEntities',
            'binary_sensor',
            translateEngine(this.hass, 'area.binary_sensor_entities'),
            translateEngine(this.hass, 'area.binary_sensor_entities_helper'),
          )}
          <ha-formfield>
            <ha-checkbox
              @change=${this._disableValueChanged}
              .checked=${this.disableArea}
            ></ha-checkbox>
            <span slot="label">${translateEngine(this.hass, 'area.disable')}</span>
          </ha-formfield>
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
defineDwainsElement("dwains-edit-area-button-card", DwainsEditAreaButtonCard);
