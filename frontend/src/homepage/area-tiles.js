import { html } from 'lit';
import { STATES_OFF, UNAVAILABLE_STATES, SENSOR_DOMAINS, ALERT_DOMAINS, COVER_DOMAINS, TOGGLE_DOMAINS, OTHER_DOMAINS, DEVICE_CLASSES, DOMAIN_STATE_ICONS } from '../variables';
import translateEngine from '../translate-engine';
const { areaBinarySensorDeviceClasses, areaBinarySensorEntities, areaSensorDeviceClasses, areaSensorEntities } = require('../homepage-preferences');
const { collectAreaBinarySensorValues, entityBelongsToArea, summaryTranslationKey } = require('../area-binary-sensors');
const { collectAreaSensorValues } = require('../area-sensors');
require('../dwains-area-graph');

// Area tiles on the homepage: values, badges, graph and grouping by floor.
export const AreaTilesMixin = (Base) => class extends Base {
    _areaGraph(areaId) {
      const area = this.configuration['areas'] ? this.configuration['areas'][areaId] : undefined;
      const entityId = area && area['graph_entity'];
      return entityId && this._hass.states[entityId]
        ? { entityId, hours: area['graph_hours'] }
        : undefined;
    }

    _renderAreaButtons(data){
      const withGraphs = data.some((item) => this._areaGraph(item.area.area_id)) ? "with-graphs" : "";
      if(!this.areaDisplayGrouped){
        return html`
          <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration['homepage_header']['v2_mode'] ? "lg-grid-cols-4 xl-grid-cols-5" : ""} gap-4 sortable ${withGraphs}">
            ${data.map((i) => this._renderAreaButton(i))}
          </div>`;
      } else {
        //Sort by floor
        data.sort(function (x, y) {
          let a = x.floor,
              b = y.floor;
          return a == b ? 0 : a > b ? 1 : -1;
        });

        data.sort(function (x, y) {
          let a = x.grouped_sort_order,
              b = y.grouped_sort_order;
          return a == b ? 0 : a > b ? 1 : -1;
        });

        let group = data.reduce((r, a) => {
          //console.log("a", a);
          //console.log('r', r);
          r[a.floor] = [...r[a.floor] || [], a];
          return r;
         }, {});
        //console.log("group", group);


        return html`
        <div>
        ${Object.keys(group).map((key) =>
          html`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${key.replace(/_/g, " ")}</h3>
              <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration['homepage_header']['v2_mode'] ? "lg-grid-cols-4 xl-grid-cols-5" : ""} gap-4 sortable ${withGraphs}">
              ${Object.entries(group[key]).map(([k,v]) => html`${this._renderAreaButton(v)}`)}
              </div>
            </div>
          `
        )}
        </div>
        `;
      }
    }
    _renderAreaButtonCard(area, type) {
      return html`
        <div>
          <ha-card class="p-2">
            ${translateEngine(this._hass, 'area.title')}:<br>
            <span class="break-words">
            ${area.name}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              <ha-button
                .areaId="${area.area_id}"
                .key=${"disabled"}
                .value=${false}
                @click=${this._handleAreaEditBoolValueClick}
              >
                ${translateEngine(this._hass, 'area.enable')}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `;
    }
    _areaSensorDeviceClasses() {
      return areaSensorDeviceClasses(this.configuration);
    }

    _areaBinarySensorDeviceClasses() {
      return areaBinarySensorDeviceClasses(this.configuration);
    }

    _areaBinarySensorEntities() {
      return areaBinarySensorEntities(this.configuration);
    }

    _areaSensorEntities() {
      return areaSensorEntities(this.configuration);
    }

    _areaBinarySensorLabel(deviceClass) {
      return translateEngine(this._hass, `device.${deviceClass}`, undefined, deviceClass.replace(/_/g, " "));
    }

    _translateAreaBinarySensorText(key, replacements = {}) {
      let text = translateEngine(this._hass, key, undefined, key);
      Object.entries(replacements).forEach(([replacementKey, replacementValue]) => {
        text = text.replace(new RegExp(`\\{${replacementKey}\\}`, "g"), replacementValue);
      });
      return text;
    }

    _isAvailableEntity(entity) {
      return entity && !UNAVAILABLE_STATES.includes(entity.state);
    }

    _areaBinarySensorSummary(deviceClass, activeCount) {
      const label = this._areaBinarySensorLabel(deviceClass);
      return this._translateAreaBinarySensorText(
        summaryTranslationKey(deviceClass, activeCount),
        {
        count: activeCount,
        label,
        },
      );
    }

    _entityBelongsToArea(entityId, areaId) {
      return entityBelongsToArea(entityId, areaId, {
        entitiesById: this.entitiesById,
        entities: this.entities,
        devicesById: this.devicesById,
      });
    }

    _areaEntityIdsForArea(areaId) {
      return (this.entitiesByAreaId?.get(areaId) || [])
        .filter((entity) => !entity.hidden_by)
        .filter((entity) => !(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['disabled']))
        .filter((entity) => this._hass.states[entity.entity_id])
        .map((entity) => entity.entity_id);
    }

    // Tooltip of a status badge: "2 windows open", "Vacuum: active".
    _badgeTitle(type, count) {
      return translateEngine(this._hass, summaryTranslationKey(type, count))
        .replace('{count}', count)
        .replace('{label}', translateEngine(this._hass, 'device.' + type));
    }

    _binarySensorStateLabel(entity) {
      if(!entity){
        return "";
      }
      const deviceClass = entity.attributes.device_class || "_";
      return (
        this._hass.localize(`component.binary_sensor.entity_component.${deviceClass}.state.${entity.state}`) ||
        this._hass.localize(`component.binary_sensor.entity_component._.state.${entity.state}`) ||
        entity.state
      );
    }

    _areaBinarySensorValues(area) {
      const areaId = area.area_id;
      return collectAreaBinarySensorValues({
        areaId,
        areaEntityIds: this._areaEntityIdsForArea(areaId),
        states: this._hass.states,
        deviceClasses: this._areaBinarySensorDeviceClasses(),
        explicitEntityIds: this._areaBinarySensorEntities(),
        unavailableStates: UNAVAILABLE_STATES,
        offStates: STATES_OFF,
        belongsToArea: (entityId, targetAreaId) => (
          this._entityBelongsToArea(entityId, targetAreaId)
        ),
        summary: (deviceClass, count) => (
          this._areaBinarySensorSummary(deviceClass, count)
        ),
        displayName: (entityId) => this._entityDisplayName(entityId),
        stateLabel: (entity) => this._binarySensorStateLabel(entity),
      });
    }

    _areaValues(data, entitiesByDomain = this._entitiesByDomain(data.entities)) {
      const sensors = collectAreaSensorValues({
        areaId: data.area.area_id,
        deviceClasses: this._areaSensorDeviceClasses(),
        average: (deviceClass) => SENSOR_DOMAINS
          .map((domain) => this._average(entitiesByDomain, domain, deviceClass))
          .find(Boolean),
        explicitEntityIds: this._areaSensorEntities(),
        states: this._hass.states,
        unavailableStates: UNAVAILABLE_STATES,
        belongsToArea: (entityId, areaId) => this._entityBelongsToArea(entityId, areaId),
        displayName: (entityId) => this._entityDisplayName(entityId),
        locale: this._hass?.locale?.language || this._hass?.language,
      });
      sensors.push(...this._areaBinarySensorValues(data.area));
      return sensors;
    }

    _renderAreaButton(data){
      const entitiesByDomain = this._entitiesByDomain(
        data.entities
      );

      //console.log(entitiesByDomain);

      const sensors = this._areaValues(data, entitiesByDomain);

      const configuredArea = this.configuration['areas']
        ? this.configuration['areas'][data.area.area_id]
        : undefined;
      const hideAreaIcon = configuredArea && configuredArea['hide_icon'];
      const areaIcon = hideAreaIcon
        ? ""
        : ((configuredArea && configuredArea['icon']) || data.area.icon || "mdi:texture-box");
      const graph = this._areaGraph(data.area.area_id);

      return html`
        <div class="relative" data-area-id='${data.area.area_id}'>
          <div
            class="flex justify-between h-44 p-3 area-button ${graph ? 'has-graph' : ''} ${this.selectedArea == data.area.area_id && !this.configuration['homepage_header']['v2_mode'] ? 'current' : ''}"
            data-area-id='${data.area.area_id}'
            @click=${this._handleAreaClick}
            .lightState=${this._isOn(entitiesByDomain, 'light')}
            @dblclick="${this._handleAreaDoubleClick}"
          >
            ${graph ? html`
              <div
                class="area-graph"
                title=${translateEngine(this._hass, 'area.graph_open_history')}
                .entity=${graph.entityId}
                @click=${this._handleGraphClick}
                @dblclick=${(ev) => ev.stopPropagation()}
              >
                <dwains-area-graph
                  .hass=${this._hass}
                  .entity=${graph.entityId}
                  .hours=${graph.hours}
                ></dwains-area-graph>
              </div>
            ` : ""}
            <div class="h-full flex flex-wrap content-between">
              <div class="w-full ha-icon">
                ${areaIcon ? html`
                  <ha-icon
                    class="h-14 w-14"
                    style="color: var(--primary-color);"
                    .hass=${this._hass}
                    .icon=${areaIcon}
                  ></ha-icon>
                ` : ""}
              </div>
              <div class="w-full">
                <h3 class="font-semibold text-lg">${data.area.name}</h3>
                ${sensors.length
                  ? html`
                    <div
                      class="sensors text-gray"
                      title="${sensors.join(" · ")}"
                    >
                      ${sensors.map((sensor, index) => html`
                        <span class="sensor-chip">${sensor}</span>${index < sensors.length - 1 ? html`<span class="sensor-separator"> · </span>` : ""}
                      `)}
                    </div>`
                  : ""
                }
                <span class="text-gray text-sm capitalize">${this._climateState(entitiesByDomain, 'climate')}</span>
              </div>
            </div>
            <div class="row-span-2 text-right space-y-0.5 info">
              ${TOGGLE_DOMAINS.map((domain) => {
                if (!(domain in entitiesByDomain)) {
                  return "";
                }
                const on = this._isOn(entitiesByDomain, domain);
                if(domain == 'light' || domain != 'light' && on){
                  return TOGGLE_DOMAINS.includes(domain)
                    ? html`
                      <span
                        class="info-badge toggle-badge badge-${domain} inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
                        title=${translateEngine(this._hass, on ? 'area.toggle_all_off' : 'area.toggle_all_on').replace('{domain}', translateEngine(this._hass, 'device.'+domain))}
                        role="button"
                        .domain=${domain}
                        .area_id=${data.area.area_id}
                        .state=${on}
                        @click=${this._toggle}
                      >
                        <ha-icon
                          class="${on ? 'on' : 'off'} w-6 h-6 mr-0.5"
                          .icon=${DOMAIN_STATE_ICONS[domain][on ? "on" : "off"]}
                        >
                        </ha-icon>
                        ${on}
                      </span><br>
                      `
                    : "";
                }
              })}
              ${ALERT_DOMAINS.map((domain) => {
                if (!(domain in entitiesByDomain)) {
                  return "";
                }
                return DEVICE_CLASSES[domain].map((deviceClass) => {
                  const isOn = this._isOn(entitiesByDomain, domain, deviceClass);
                  if(isOn){
                    return html`
                      ${DOMAIN_STATE_ICONS[domain][deviceClass]
                        ? html`
                          <span
                            class="info-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
                            title=${this._badgeTitle(deviceClass, isOn)}
                          >
                            <ha-icon
                              class="w-6 h-6 mr-0.5"
                              .icon=${DOMAIN_STATE_ICONS[domain][deviceClass]}
                            ></ha-icon> ${isOn}
                          </span><br>`
                        : ""}
                    `
                  }
                });
              })}
              ${COVER_DOMAINS.map((domain) => {
                if (!(domain in entitiesByDomain)) {
                  return "";
                }
                return DEVICE_CLASSES[domain].map((deviceClass) => {
                  const isOn = this._coverOpenCount(entitiesByDomain, deviceClass);
                  if(isOn){
                    return html`
                      ${DOMAIN_STATE_ICONS[domain][deviceClass]
                        ? html`
                          <span class="info-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium">
                            <ha-icon
                              class="w-6 h-6 mr-0.5"
                              .icon=${DOMAIN_STATE_ICONS[domain][deviceClass]}
                            ></ha-icon> ${isOn}
                          </span><br>`
                        : ""}
                    `
                  }
                });
              })}
              ${OTHER_DOMAINS.map((domain) => {
                if (!(domain in entitiesByDomain)) {
                  return "";
                }
                const isOn = this._isOn(entitiesByDomain, domain);
                if(isOn){
                  return OTHER_DOMAINS.includes(domain)
                    ? html`
                      <span
                        class="info-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
                        title=${this._badgeTitle(domain, isOn)}
                      >
                        <ha-icon
                          class="${isOn ? 'on' : 'off'} w-6 h-6 mr-0.5"
                          .icon=${DOMAIN_STATE_ICONS[domain][isOn ? "on" : "off"]}
                        >
                        </ha-icon>
                        ${isOn}
                      </span><br>
                      `
                    : "";
                }
              })}
            </div>
          </div>
          ${this.areaEditMode ? html`
            <ha-card>
              <div class="card-actions-multiple">
                <div class="sortable-move">
                  <ha-icon
                    .icon=${"mdi:cursor-move"}
                  >
                  </ha-icon>
                </div>
                <ha-button
                  .area_id=${data.area.area_id}
                  .area_icon=${this.configuration['areas'][data.area.area_id] && this.configuration['areas'][data.area.area_id]['icon'] ? this.configuration['areas'][data.area.area_id]['icon']: ""}
                  .disable_area=${this.configuration['areas'][data.area.area_id] && this.configuration['areas'][data.area.area_id]['disabled'] ? this.configuration['areas'][data.area.area_id]['disabled']: false}
                  .hide_icon=${this.configuration['areas'][data.area.area_id] && this.configuration['areas'][data.area.area_id]['hide_icon'] ? this.configuration['areas'][data.area.area_id]['hide_icon']: false}

                  @click=${this._handleAreaEditClick}
                >
                  ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                </ha-button>
              </div>
            </ha-card>
            ` : ""}
        </div>
      `;
    }
};
