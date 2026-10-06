import { html } from 'lit';
import { STATES_OFF, UNAVAILABLE_STATES, SENSOR_DOMAINS, ALERT_DOMAINS, COVER_DOMAINS, TOGGLE_DOMAINS, OTHER_DOMAINS, DEVICE_CLASSES, DOMAIN_STATE_ICONS, DETECTED_DEVICE_CLASSES } from '../variables';
import translateEngine from '../translate-engine';
const { areaBinarySensorDeviceClasses, areaBinarySensorEntities, areaSensorDeviceClasses, areaSensorEntities } = require('../homepage-preferences');
const { collectAreaBinarySensorValues, entityBelongsToArea, summaryTranslationKey } = require('../area-binary-sensors');
const { collectAreaSensorValues } = require('../area-sensors');
const { isEntityHiddenInArea } = require('../entity-aggregation');
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
          <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration['homepage_header']['v2_mode'] ? "lg-grid-cols-4 xl-grid-cols-5" : ""} gap-4 sortable area-sortable ${withGraphs}">
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
              <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration['homepage_header']['v2_mode'] ? "lg-grid-cols-4 xl-grid-cols-5" : ""} gap-4 sortable area-sortable ${withGraphs}">
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
                .ddValue=${false}
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

    _areaBinarySensorEntities(areaId) {
      return areaBinarySensorEntities(this.configuration, areaId);
    }

    _areaSensorEntities(areaId) {
      return areaSensorEntities(this.configuration, areaId);
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

    // The same entities as the badges and averages of the tile: hidden in
    // the area also leaves the summary below the area name.
    _areaEntityIdsForArea(areaId) {
      return (this.entitiesByAreaId?.get(areaId) || [])
        .filter((entity) => !entity.hidden_by)
        .filter((entity) => !(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['disabled']))
        .filter((entity) => !isEntityHiddenInArea(this.configuration['entities'][entity.entity_id]))
        .filter((entity) => this._hass.states[entity.entity_id])
        .map((entity) => entity.entity_id);
    }

    // Status badges in the top right corner of an area tile, in columns from
    // right to left like before: the light badge on top, then safety alerts,
    // the other toggles, sensors, covers and devices. _fitAreaBadges() keeps
    // them to two columns and sums up the rest in a "+N" badge.
    _renderAreaBadges(data, entitiesByDomain) {
      const badges = [];
      const add = (priority, icon, count, title, toggle) => badges.push({ priority, icon, count, title, toggle });
      for (const domain of TOGGLE_DOMAINS) {
        if (!(domain in entitiesByDomain)) continue;
        const count = this._isOn(entitiesByDomain, domain);
        if (domain == 'light' || count) {
          add(domain == 'light' ? 0 : 2, DOMAIN_STATE_ICONS[domain][count ? "on" : "off"], count, this._badgeTitle(domain, count), domain);
        }
      }
      for (const domain of ALERT_DOMAINS) {
        if (!(domain in entitiesByDomain)) continue;
        for (const deviceClass of DEVICE_CLASSES[domain]) {
          const count = this._isOn(entitiesByDomain, domain, deviceClass);
          const icon = DOMAIN_STATE_ICONS[domain][deviceClass];
          if (count && icon) {
            add(DETECTED_DEVICE_CLASSES.includes(deviceClass) ? 1 : 3, icon, count, this._badgeTitle(deviceClass, count));
          }
        }
      }
      for (const domain of COVER_DOMAINS) {
        if (!(domain in entitiesByDomain)) continue;
        for (const deviceClass of DEVICE_CLASSES[domain]) {
          const count = this._coverOpenCount(entitiesByDomain, deviceClass);
          const icon = DOMAIN_STATE_ICONS[domain][deviceClass];
          if (count && icon) add(4, icon, count, this._badgeTitle(deviceClass, count));
        }
      }
      for (const domain of OTHER_DOMAINS) {
        if (!(domain in entitiesByDomain)) continue;
        const count = this._isOn(entitiesByDomain, domain);
        if (count) add(5, DOMAIN_STATE_ICONS[domain].on, count, this._badgeTitle(domain, count));
      }
      // Stable sort: within a priority the order of DEVICE_CLASSES and the
      // domain lists is kept.
      badges.sort((a, b) => a.priority - b.priority);
      return html`
        <div class="row-span-2 text-right space-y-0.5 info">
          ${badges.map((badge) => badge.toggle ? html`
            <span
              class="info-badge toggle-badge badge-${badge.toggle} inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
              title=${translateEngine(this._hass, badge.count ? 'area.toggle_all_off' : 'area.toggle_all_on').replace('{domain}', translateEngine(this._hass, 'device.' + badge.toggle))}
              data-summary=${badge.title}
              role="button"
              .domain=${badge.toggle}
              .area_id=${data.area.area_id}
              .state=${badge.count}
              @click=${this._toggle}
            >
              <ha-icon class="${badge.count ? 'on' : 'off'} w-6 h-6 mr-0.5" .icon=${badge.icon}></ha-icon>
              ${badge.count}
            </span>
          ` : html`
            <span class="info-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium" title=${badge.title} data-summary=${badge.title}>
              <ha-icon class="w-6 h-6 mr-0.5" .icon=${badge.icon}></ha-icon> ${badge.count}
            </span>
          `)}
          <span class="info-badge more-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium" style="display: none"></span>
        </div>
      `;
    }

    // Badges flow in columns from right to left; how many fit in a column
    // depends on the tile height. Keep at most two columns: if more would be
    // needed, the last place shows "+N" and its tooltip names the others.
    _fitAreaBadges() {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll('.area-button .info').forEach((info) => {
        const more = info.querySelector('.more-badge');
        if (!more) return;
        const badges = Array.from(info.children).filter((child) => child !== more);
        badges.forEach((badge) => { if (badge.style.display) badge.style.display = ''; });
        more.style.display = 'none';
        // Columns end above the area name and its values (on tiles with a
        // graph the name sits higher than the bottom of the badge area).
        const text = info.closest('.area-button')?.querySelector('h3')?.parentElement;
        if (text && badges.length) {
          const available = text.getBoundingClientRect().top - info.getBoundingClientRect().top - 4;
          const height = `${Math.max(available, badges[0].offsetHeight)}px`;
          if (info.style.maxHeight !== height) info.style.maxHeight = height;
        }
        // A new column starts where a badge is not below its predecessor.
        let columns = badges.length ? 1 : 0;
        let perColumn = badges.length;
        for (let index = 1; index < badges.length; index++) {
          if (badges[index].offsetTop <= badges[index - 1].offsetTop) {
            if (columns === 1) perColumn = index;
            columns++;
          }
        }
        if (columns <= 2) return;
        const visibleCount = Math.max(1, perColumn * 2 - 1);
        const hidden = badges.slice(visibleCount);
        hidden.forEach((badge) => { badge.style.display = 'none'; });
        more.textContent = `+${hidden.length}`;
        more.title = hidden.map((badge) => badge.dataset.summary).join(' · ');
        more.style.display = '';
      });
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
        explicitEntityIds: this._areaBinarySensorEntities(areaId),
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
        explicitEntityIds: this._areaSensorEntities(data.area.area_id),
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
            ${this._renderAreaBadges(data, entitiesByDomain)}
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
