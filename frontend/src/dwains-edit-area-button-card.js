import { css, html, LitElement } from 'lit';
import { checkRowStyles, toggleCheckRow } from './styles/form-styles';
import translateEngine from './translate-engine';
import { showSaveError } from './save-error-toast';
import { closePopup } from "./helpers";
const { closeParentDropdown } = require('./dropdown-controller');
const { defineDwainsElement } = require('./custom-element-registration');
const { AREA_GRAPH_HOURS, normalizeGraphHours } = require('./area-graph');
const { areaSensorChoices, chooseExtraSensors, chooseTypeSensor } = require('./area-sensor-choice');

class DwainsEditAreaButtonCard extends LitElement {
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
        .edit-element ha-icon-picker, .edit-element ha-select, .edit-element ha-entity-picker, .edit-element ha-selector {
          display: block;
          margin: .8rem 0;
        }
        .edit-element .section-title {
          margin: 1.1rem 0 .1rem;
        }
        .edit-element .section-helper {
          color: var(--secondary-text-color);
          font-size: .85rem;
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
        `
      ]
    }
    setConfig(config) {
      this.areaId = config.areaId;
      this.icon = config.icon ? config.icon : "";
      this.disableArea = config.disableArea ? config.disableArea : false;
      this.hideIcon = config.hideIcon ? config.hideIcon : false;
      this.graphEntity = config.graphEntity || "";
      this.graphHours = normalizeGraphHours(config.graphHours);
      this.sensorEntities = Array.isArray(config.sensorEntities) ? config.sensorEntities : [];
      this.sensorDeviceClasses = Array.isArray(config.sensorDeviceClasses) ? config.sensorDeviceClasses : [];
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
    // Several entities: one picker per chosen entity (empty removes it) and
    // an empty one to add another. Unlike Home Assistant's multiple entity
    // selector these pickers show the entity id below the name, since names
    // repeat across rooms.
    _renderEntityPickers({ className, label, helper, values, candidates, onChange }) {
      const free = candidates.filter((entityId) => !values.includes(entityId));
      const changed = (index, ev) => {
        ev.stopPropagation();
        const next = [...values];
        if (ev.detail.value) next[index] = ev.detail.value;
        else next.splice(index, 1);
        onChange(next);
      };
      const added = (ev) => {
        ev.stopPropagation();
        const entityId = ev.detail.value;
        ev.target.value = "";
        if (entityId) onChange([...values, entityId]);
      };
      return html`
        <div class="section-title">${label}</div>
        ${values.map((entityId, index) => html`
          <ha-entity-picker
            class=${className}
            .hass=${this.hass}
            .showEntityId=${true}
            .value=${entityId}
            .includeEntities=${[entityId, ...free]}
            @value-changed=${(ev) => changed(index, ev)}
          ></ha-entity-picker>
        `)}
        <ha-entity-picker
          class=${className}
          .hass=${this.hass}
          .showEntityId=${true}
          .value=${""}
          .disabled=${!free.length}
          .includeEntities=${free.length ? free : ["none.none"]}
          .helper=${helper}
          @value-changed=${added}
        ></ha-entity-picker>
      `;
    }
    _deviceClassOf(entityId) {
      return this.hass?.states?.[entityId]?.attributes?.device_class;
    }
    _typeSensorChanged(deviceClass, ev) {
      ev.stopPropagation();
      // Empty: the average of all sensors of this type.
      const entityId = ev.detail?.value || undefined;
      this.sensorEntities = chooseTypeSensor(this.sensorEntities, deviceClass, entityId, (id) => this._deviceClassOf(id));
      this.requestUpdate();
    }
    _extraSensorsChanged(extras) {
      this.sensorEntities = chooseExtraSensors(this.sensorEntities, extras, this.sensorDeviceClasses, (id) => this._deviceClassOf(id));
      this.requestUpdate();
    }
    // Values below the area name: per type shown as an average, that average
    // (empty) or one sensor of the area; sensors of other types as more
    // sensors, like the binary sensors below.
    _renderSensorValues() {
      const { types, extras, extraCandidates } = areaSensorChoices({
        deviceClasses: this.sensorDeviceClasses,
        areaSensorIds: this._areaEntities('sensor'),
        chosenIds: this.sensorEntities,
        deviceClassOf: (id) => this._deviceClassOf(id),
      });
      return html`
        <div class="section-title">${translateEngine(this.hass, 'area.sensor_values')}</div>
        <div class="section-helper">${translateEngine(this.hass, 'area.sensor_values_helper')}</div>
        ${types.map((type) => html`
          <ha-entity-picker
            class="sensor-type"
            .hass=${this.hass}
            .showEntityId=${true}
            .label=${this.hass.localize(`component.sensor.entity_component.${type.deviceClass}.name`) || type.deviceClass.replace(/_/g, ' ')}
            .placeholder=${translateEngine(this.hass, 'area.sensor_average').replace('{count}', type.averaged)}
            .value=${type.chosen || ""}
            .includeEntities=${type.sensors}
            @value-changed=${(ev) => this._typeSensorChanged(type.deviceClass, ev)}
          ></ha-entity-picker>
        `)}
        ${this._renderEntityPickers({
          className: 'extra-sensors',
          label: translateEngine(this.hass, 'area.extra_sensor_entities'),
          helper: translateEngine(this.hass, 'area.extra_sensor_entities_helper'),
          values: extras,
          candidates: extraCandidates,
          onChange: (values) => this._extraSensorsChanged(values),
        })}
      `;
    }
    _renderEntityList(key, domain, label, helper) {
      // Keep chosen entities selectable even if they moved to another area.
      const candidates = [...new Set([...this._areaEntities(domain), ...this[key]])];
      return this._renderEntityPickers({
        className: `entity-list-${domain}`,
        label,
        helper,
        values: this[key],
        candidates,
        onChange: (values) => {
          this[key] = values;
          this.requestUpdate();
        },
      });
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
            label=${translateEngine(this.hass, 'area.icon')}
            .value=${this.icon}
            .name=${translateEngine(this.hass, 'area.icon')}
            .disabled=${this.hideIcon}
            @value-changed=${this._iconPickerChange}
          ></ha-icon-picker>
          <label class="dd-check" @click=${toggleCheckRow}>
              <ha-checkbox
              @change=${this._hideIconValueChanged}
              .checked=${this.hideIcon}
            ></ha-checkbox>
              <span>${translateEngine(this.hass, 'area.hide_icon')}</span>
            </label>
          <ha-entity-picker
            .hass=${this.hass}
            .showEntityId=${true}
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
          ${this._renderSensorValues()}
          ${this._renderEntityList(
            'binarySensorEntities',
            'binary_sensor',
            translateEngine(this.hass, 'area.binary_sensor_entities'),
            translateEngine(this.hass, 'area.binary_sensor_entities_helper'),
          )}
          <label class="dd-check" @click=${toggleCheckRow}>
              <ha-checkbox
              @change=${this._disableValueChanged}
              .checked=${this.disableArea}
            ></ha-checkbox>
              <span>${translateEngine(this.hass, 'area.disable')}</span>
            </label>
          <div class="card-footer">
            <ha-button appearance="plain" slot="secondaryAction" @click=${(e) => closePopup()}>
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
