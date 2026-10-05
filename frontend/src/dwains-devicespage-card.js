import { clientPreferences } from './client-preferences';
import {
  computeDomain
} from './frontend-helpers';
import { mdiDotsVertical, mdiCog } from "@mdi/js";
import { html, LitElement } from 'lit';
import translateEngine from './translate-engine';
import { createCardElementSafe, resolveEntityName } from './helpers';
import { devicesPageCardStyles } from './styles/devicespage-card-styles';
import { DeviceEditActionsMixin } from './devicespage/edit-actions';
import { DeviceButtonsMixin } from './devicespage/device-buttons';
import { DeviceViewMixin } from './devicespage/device-view';
const { EventSubscriptionOwner } = require('./event-subscription-owner');
const { EventListenerOwner } = require('./event-listener-owner');
const { TimerOwner } = require('./timer-owner');
const { PopupOpenScheduler } = require('./popup-open-scheduler');
const { ReloadableLoadOwner } = require('./reloadable-load-owner');
const { hassConnectionIdentity, hasHassConnectionChanged } = require('./hass-connection');
const { websocketReadStore } = require('./websocket-read-store');
const { loadDashboardRegistrySnapshot } = require('./dashboard-registry-snapshot');
const { registryOrderedEntityUnion } = require('./registry-indexes');
const { resolveHass } = require('./hass-provider');
const { loadCardHelpers } = require('./card-helpers-loader');
const { defineDwainsElement } = require('./custom-element-registration');
const { DisconnectGrace } = require('./disconnect-grace');
const { RegistryChangeWatcher } = require('./registry-change-watcher');
const { entityIdsIn, hassChangeIsRelevant, relevanceFilter } = require('./state-relevance');
const { attachDeferredCard } = require('./deferred-card');

function getDwainsHass() {
  return resolveHass();
}

const GLOBAL_DEVICE_PAGE_DOMAINS = new Set([
  'person',
  'weather',
  'alarm_control_panel',
]);

	    class DevicesCard extends DeviceViewMixin(DeviceButtonsMixin(DeviceEditActionsMixin(LitElement))) {
        static get properties() {
          return {
            data: {},
            selectedDevice: {},
            deviceEditMode: {},
            deviceViewDisplayGrouped: {},
            deviceViewEditMode: {},
          };
        }

        constructor() {
          super();
          this._disconnectGrace = new DisconnectGrace();
          this._registryChanges = new RegistryChangeWatcher(() => {
            this._reloadCard().catch((error) => console.error('Error reloading devices page card:', error));
          });
          this._subscriptions = new EventSubscriptionOwner();
          this._listeners = new EventListenerOwner();
          this._timers = new TimerOwner();
          this._popupOpens = new PopupOpenScheduler(this._timers);
          this._loads = new ReloadableLoadOwner((context) => this._loadConfiguration(context));
          this._locationChangedHandler = () => this._syncSelectedDeviceFromLocation();
          this._listeners.listen(
            'location-changed',
            window,
            'location-changed',
            this._locationChangedHandler,
          );
          this._startedHass = undefined;
        }

	        async loadHelpers() {
	          return loadCardHelpers();
	        }

        _entityDisplayName(entityId, entityRegistryEntry) {
          const entityEntry = entityRegistryEntry || this.entitiesById?.get(entityId);
          const deviceEntry = entityEntry?.device_id
            ? this.devicesById?.get(entityEntry.device_id)
            : undefined;
          return resolveEntityName(
            this._hass,
            this.configuration,
            entityId,
            entityEntry,
            deviceEntry,
          );
        }

        /**
         * @param {any} hass
         */
        set hass(hass) {
          const connectionChanged = hasHassConnectionChanged(this._hass, hass);
          const previous = this._hass;
          this._hass = hass;
          if(this.startedUp){
            this._registryChanges.update(hass);
            this._update_hass(hass, hassChangeIsRelevant(previous, hass, this._isShownEntity));
          }
          if (connectionChanged && this.isConnected) {
            this._subscriptions.disconnect();
            this._subscriptions.connect();
          }
          void this._startIfReady(connectionChanged);
        }

	        // render: false when only entities changed that the page does not
	        // show; the cards inside still get the new hass.
	        _update_hass(hass, render = true){
	          this._hass = hass;

	          if(this.data == null || this.data.length === 0) return;

	          Object.values(this.data).map((data) => {
	            if(data.domain == this.selectedDevice){
	              data.cards.forEach((item) => {
	                if(item.card) item.card.hass = hass;
	              });
	              data.customCardsTop.forEach((item) => {
	                if(item.card) item.card.hass = hass;
	              });
	              data.customCardsBottom.forEach((item) => {
	                if(item.card) item.card.hass = hass;
	              });
	            }
	          });
	          if(!render) return;

	          if(this.timeout) {
	            this._pendingHassUpdate = true;
	            return;
	          }
	          this.timeout = true;
	          this._pendingHassUpdate = false;
	          const timer = this._timers.schedule('hass-update-throttle', () => {
	            this.timeout = false;
	            if(this._pendingHassUpdate){
	              this._pendingHassUpdate = false;
	              this.requestUpdate();
	            }
	          }, 100);
	          if(timer === undefined){
	            this.timeout = false;
	            this._pendingHassUpdate = false;
	          }
	          this.requestUpdate();
	        }

        async setConfig(config) {
          this.startedUp = false;
          this.timeout = false;
          this._pendingHassUpdate = false;

          this.selectedDevice = window.location.hash.substring(1);
          this.deviceEditMode = false;
          this.deviceViewEditMode = false;
          this.deviceViewDisplayGrouped = (() => { const stored = clientPreferences.get('dwains_dashboard_deviceViewDisplayGrouped'); return stored ? stored !== "false" : false; })();
          this._config = config;

          this.notificationCard, this.weatherCard;

          this._cardHelpersReady = this.loadHelpers();
          this.cardHelpers = await this._cardHelpersReady;
          await this._startIfReady();
        }

        updated(changedProperties) {
          if(!changedProperties.has("state")) {
            this._syncSelectedDeviceFromLocation();
          }
        }

        _syncSelectedDeviceFromLocation() {
          const newstate = window.location.hash.substring(1);

          if (newstate){
            this.selectedDevice = newstate;
          } else {
            //The tab/page itself is clicked so fallback on first device button
            if(this.data != null && Object.keys(this.data).length != 0){
              this.selectedDevice = Object.values(this.data)[0]['domain'];
            }
          }
        }

	        async connectedCallback(){
	          //console.log('connectedCallBack');
	          super.connectedCallback();
	          if (this._disconnectGrace.cancel()) return;
	          this._subscriptions.connect();
	          this._timers.connect();
	          this._listeners.connect();

	          await this._startIfReady();
	        }

          async _startIfReady(reload = false) {
            const connection = hassConnectionIdentity(this._hass);
            if (!this.isConnected || !this._hass || !this._config || this._startedHass === connection) return;
            const hass = this._hass;
            this._startedHass = connection;
            try {
              if(this._cardHelpersReady){
                this.cardHelpers = await this._cardHelpersReady;
              }
              if (reload) await this._reloadCard();
              else await this._loadData();
              if (this.isConnected && hassConnectionIdentity(this._hass) === connection && this._startedHass === connection) {
                await this._subscribeReload();
              }
            } catch (error) {
              if (this._startedHass === connection) this._startedHass = undefined;
              console.error('Error starting devices page card:', error);
            }
          }

	        disconnectedCallback(){
	          super.disconnectedCallback();
	          this._disconnectGrace.schedule(this, () => this._teardown());
	        }

	        _teardown(){
	          this._subscriptions.disconnect();
	          this._timers.disconnect();
	          this._listeners.disconnect();
	          this._registryChanges.reset();
	          this._startedHass = undefined;
              this._loads.invalidate();
	          this.timeout = false;
	          this._pendingHassUpdate = false;
	        }

	        _subscribeReload(){
	          return this._subscriptions.subscribeEvent(
	            'devices-page',
	            this._hass,
	            "dwains_dashboard_devicespage_card_reload",
	            () => {
	              websocketReadStore.invalidate(this._hass);
	              this._reloadCard().catch((error) => {
	                console.error('Error reloading devices page card:', error);
	              });
	            },
	          );
	        }

        async _reloadCard(){
          await this._loads.reload();
          this.requestUpdate();
        }

	        _loadData(){
	          return this._loads.load();
	        }

	        async _loadConfiguration({ isCurrent = () => true } = {}){
	          this.selectedArea = this.selectedArea || "";
	          this.startedUp = false;

          const snapshot = await loadDashboardRegistrySnapshot(this._hass);
          if (!isCurrent()) return;
          Object.assign(this, snapshot);

          if(this.areas == null || this.areas.length === 0
          || this.devices == null || this.devices.length === 0
          || this.entities == null || this.entities.length === 0
          || this.configuration == null || this.configuration.length === 0
          ){
          } else {
            const data = [];
            const disabledDevices = [];

            const areaEntities = new Set();
            const globalAreaEntities = this.entities.filter((entity) => (
              GLOBAL_DEVICE_PAGE_DOMAINS.has(computeDomain(entity.entity_id))
            ));
            //Loop throught all areas to get all entities assigned to an area to populate the data group
            for(const area of this.areas){
              if(!(this.configuration['areas'][area.area_id] && this.configuration['areas'][area.area_id]['disabled'])){
                const areaDevices = new Set(
                  (this.devicesByAreaId.get(area.area_id) || []).map((device) => device.id),
                );
                const candidateEntities = registryOrderedEntityUnion([
                  this.entitiesByAreaId.get(area.area_id),
                  globalAreaEntities.filter((entry) => !areaEntities.has(entry.entity_id)),
                ], this.entityOrderById);

                // Find all entities directly linked to this area
                // or linked to a device linked to this area.
                for (const entity of candidateEntities) {
                  if (
                    entity.area_id
                      ? entity.area_id === area.area_id
                      : areaDevices.has(entity.device_id)
                    ||
                      (computeDomain(entity.entity_id) == 'person' && !areaEntities.has(entity.entity_id))
                    ||
                      (computeDomain(entity.entity_id) == 'weather' && !areaEntities.has(entity.entity_id))
                    ||
                      (computeDomain(entity.entity_id) == 'alarm_control_panel' && !areaEntities.has(entity.entity_id))
                  ) {

                    if(entity.hidden_by){
                      continue;
                    }

                    const domain = computeDomain(entity.entity_id);
                    const stateObj = this._hass.states[entity.entity_id];

                    if(this.configuration['devices'][domain] && this.configuration['devices'][domain]['hidden']){
                      if (!disabledDevices.includes(domain)) {
                        disabledDevices.push(domain);
                      }
                      continue;
                    }

                    if (!(domain in data)) {
                      //Custom cards
                      const deviceCustomCardsTop = [];
                      const deviceCustomCardsBottom = [];

                      if(this.configuration.device_cards.length !== 0){
                        if(this.configuration.device_cards[domain]){
                          Object.entries(this.configuration.device_cards[domain]).forEach(([k,v]) => {
                            const rowSpan = v["row_span"] ? v["row_span"] : "1";
                            const colSpan = v["col_span"] ? v["col_span"] : "1";
                            const rowSpanLg = v["row_span_lg"] ? v["row_span_lg"] : "1";
                            const colSpanLg = v["col_span_lg"] ? v["col_span_lg"] : "1";
                            const rowSpanXl = v["row_span_xl"] ? v["row_span_xl"] : "1";
                            const colSpanXl = v["col_span_xl"] ? v["col_span_xl"] : "1";

                            if(v["position"] == 'bottom'){
                              deviceCustomCardsBottom.push(attachDeferredCard({
                                filename: k,
                                domain: domain,
                                rowSpan: rowSpan,
                                colSpan: colSpan,
                                rowSpanLg: rowSpanLg,
                                colSpanLg: colSpanLg,
                                rowSpanXl: rowSpanXl,
                                colSpanXl: colSpanXl,
                              }, () => this.createCardElement2(v)));
                            } else {
                              deviceCustomCardsTop.push(attachDeferredCard({
                                filename: k,
                                domain: domain,
                                rowSpan: rowSpan,
                                colSpan: colSpan,
                                rowSpanLg: rowSpanLg,
                                colSpanLg: colSpanLg,
                                rowSpanXl: rowSpanXl,
                                colSpanXl: colSpanXl,
                              }, () => this.createCardElement2(v)));
                            }
                          });
                        }
                      }
                      data[domain] = {
                        domain: domain,
                        cards: [],
                        entitiesNoState: [],
                        entitiesHidden: [],
                        entitiesDisabled: [],
                        customCardsTop: deviceCustomCardsTop,
                        customCardsBottom: deviceCustomCardsBottom,
                        sort_order: (this.configuration['devices'][domain] && this.configuration['devices'][domain]['sort_order'] ? this.configuration['devices'][domain]['sort_order']: 99),
                      };
                    }

                    const disableEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['disabled'] ? true : false) : false;
                    if(disableEntity){
                      data[domain].entitiesDisabled.push(entity.entity_id);
                      areaEntities.add(entity.entity_id);
                      continue;
                    }

                    if (!stateObj) {
                      data[domain].entitiesNoState.push(entity.entity_id);
                      areaEntities.add(entity.entity_id);
                      continue;
                    } else {
                      const hideEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['hidden'] ? true : false) : false;
                      const excludeEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['excluded'] ? true : false) : false;
                      const configuredFriendlyName = this.configuration['entities'][entity.entity_id] ? this.configuration['entities'][entity.entity_id]['friendly_name'] : "";
                      const friendlyName = this._entityDisplayName(entity.entity_id, entity);
                      const customCard = this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['custom_card'] ? this.configuration['entities'][entity.entity_id]['custom_card'] : false;
                      const customPopup = this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['custom_popup'] ? this.configuration['entities'][entity.entity_id]['custom_popup'] : false;

                      if(hideEntity){
                        if(!data[domain].entitiesHidden.includes(entity.entity_id)){
                          data[domain].entitiesHidden.push(entity.entity_id);
                        }
                        continue;
                      }

                      let cardConfig = {};
                      let rowSpan = "1";
                      let colSpan = "1";
                      let rowSpanLg = "1";
                      let colSpanLg = "1";
                      let rowSpanXl = "1";
                      let colSpanXl = "1";
                      if(customCard && this.configuration['entity_cards'] && this.configuration['entity_cards'][entity.entity_id]){
                        //If entity has a custom card set by user
                        cardConfig = {input_name: friendlyName, input_entity: entity.entity_id,...this.configuration['entity_cards'][entity.entity_id]};
                      } else if(this.configuration['devices_card'][domain]){
                        //If domain has a custom card set by user
                        cardConfig = {input_name: friendlyName, input_entity: entity.entity_id,...this.configuration['devices_card'][domain]};
	                      } else if (domain === 'sensor' && this._hass && this._hass.states[entity.entity_id]?.attributes?.unit_of_measurement) {
	                        cardConfig = {
	                          graph: "line",
	                          type: "sensor",
	                          hours_to_show: 24,
	                          detail: 1,
	                          entity: entity.entity_id,
	                          ...(friendlyName ? { name: friendlyName } : {})
	                        };
	                      } else {
                        //No custom card set so fallback to original DD cards
                        switch(domain) {
	                          default:
                            // cardConfig = {
                            //   type: "custom:dwains-button-card",
                            //   friendly_name: friendlyName
                            // };
	                            cardConfig = friendlyName ? {
	                              type: "tile",
	                              name: friendlyName,
	                            } : {
	                              type: "tile",
	                            }
	                            break;
	                          case "camera":
	                            cardConfig = {
	                              type: "picture-entity",
	                              camera_view: "auto"
	                            };
                            rowSpan = "2";
                            colSpan = "2";
                            rowSpanLg = "2";
                            colSpanLg = "2";
                            rowSpanXl = "2";
                            colSpanXl = "2";
                            break;
                          case "climate":
                            // cardConfig = {
                            //   type: "custom:dwains-thermostat-card",
                            //   friendly_name: friendlyName
                            // };
	                            cardConfig = friendlyName ? {
	                              type: "thermostat",
	                              name: friendlyName,
	                              features: [
                                {
                                  type: "climate-fan-modes",
                                  fan_modes: ["quiet","low","medium","high"],
                                },
                                {
                                  type: "climate-hvac-modes",
                                  hvac_modes: ["heat_cool","heat","dry","fan_only","cool","off"]
	                                }
	                              ]
	                            } : {
	                              type: "thermostat",
	                              features: [
	                                {
	                                  type: "climate-fan-modes",
	                                  fan_modes: ["quiet","low","medium","high"],
	                                },
	                                {
	                                  type: "climate-hvac-modes",
	                                  hvac_modes: ["heat_cool","heat","dry","fan_only","cool","off"]
	                                }
	                              ]
	                            }
	                            break;
                          case "cover":
                            // cardConfig = {
                            //   type: "custom:dwains-cover-card",
                            //   friendly_name: friendlyName
                            // };
	                            cardConfig = friendlyName ? {
	                              type: "tile",
	                              name: friendlyName,
	                              features: [
                                {
                                  type: "cover-open-close"
                                },
                                {
                                  type: "cover-position"
	                                }
	                              ]
	                            } : {
	                              type: "tile",
	                              features: [
	                                {
	                                  type: "cover-open-close"
	                                },
	                                {
	                                  type: "cover-position"
	                                }
	                              ]
	                            }
	                            break;
                          case "light":
                            // cardConfig = {
                            //   type: "custom:dwains-light-card",
                            //   friendly_name: friendlyName
                            // };
	                            cardConfig = friendlyName ? {
	                              type: "tile",
	                              name: friendlyName,
	                              features: [
                                {
                                  type: "light-brightness",
	                                }
	                              ]
	                            } : {
	                              type: "tile",
	                              features: [
	                                {
	                                  type: "light-brightness",
	                                }
	                              ]
	                            };
	                            break;
                        }

                        cardConfig = {entity: entity.entity_id,...cardConfig};
                      }


                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['row_span']){
                        rowSpan = this.configuration['entities'][entity.entity_id]['row_span'];
                      }
                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['col_span']){
                        colSpan = this.configuration['entities'][entity.entity_id]['col_span'];
                      }
                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['row_span_lg']){
                        rowSpanLg = this.configuration['entities'][entity.entity_id]['row_span_lg'];
                      }
                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['col_span_lg']){
                        colSpanLg = this.configuration['entities'][entity.entity_id]['col_span_lg'];
                      }
                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['row_span_xl']){
                        rowSpanXl = this.configuration['entities'][entity.entity_id]['row_span_xl'];
                      }
                      if(this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['col_span_xl']){
                        colSpanXl = this.configuration['entities'][entity.entity_id]['col_span_xl'];
                      }

                      areaEntities.add(entity.entity_id);

                      data[domain].cards.push(attachDeferredCard({
                        area: area,
                        entity: entity.entity_id,
                        rowSpan: rowSpan,
                        colSpan: colSpan,
                        rowSpanLg: rowSpanLg,
                        colSpanLg: colSpanLg,
                        rowSpanXl: rowSpanXl,
                        colSpanXl: colSpanXl,
                        friendlyName: configuredFriendlyName,
                        hideEntity: hideEntity,
                        excludeEntity: excludeEntity,
                        customCard: customCard,
                        customPopup: customPopup,
                        sort_order: (this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['devices_sort_order'] ? this.configuration['entities'][entity.entity_id]['devices_sort_order']: 99),
                        grouped_sort_order: (this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['devices_grouped_sort_order'] ? this.configuration['entities'][entity.entity_id]['devices_grouped_sort_order']: 99),
                      }, () => this.createCardElement2(cardConfig)));
                    }
                  }
                }
              }
            }

	            const sortedData = Object.keys(data)
              .sort(function(a, b) {
                return data[a].sort_order - data[b].sort_order;
              })
	              .map(function(category) {
	                return data[category]; // Convert array of categories to array of objects
	              });

                if (!isCurrent()) return;
            this.data = sortedData;
            this.disabledDevices = disabledDevices;
            this._isShownEntity = relevanceFilter({
              entityIds: [
                ...this.entities.map((entity) => entity.entity_id),
                ...entityIdsIn(this.configuration),
              ],
            });
            this.startedUp = true;

            //Set first selected device
            if(this.selectedDevice.length === 0){
              this.selectedDevice = Object.values(sortedData)[0]['domain'];
            }
          }
        }

        _handleDeviceClick(event){
          const id = event.currentTarget.dataset.device;
          window.location.hash = id;
          this.selectedDevice = id;
          window.scrollTo(0,0);
          //this.requestUpdate();
          this._update_hass(this._hass);
        }

        _backButtonClick(){
          window.location.hash = "";
          //this.selectedDevice = "woonkamer";
          //this.requestUpdate();
          this._update_hass(this._hass);
        }

        async createCardElement2(config){
          // Zorg ervoor dat this.cardHelpers geladen is voordat je verder gaat.
          if (!this.cardHelpers) {
            console.error("Card helpers zijn niet geladen.");
            return;
          }

          return createCardElementSafe(this.cardHelpers, config, this._hass);
        }

        shouldUpdate(changedProps){
          if (changedProps.has("_hass")) {
            return false;
          }
          return true;

          // const oldHass = changedProps.get("hass");

          // if (
          //   !oldHass ||
          //   oldHass.themes !== this._hass!.themes ||
          //   oldHass.locale !== this._hass!.locale
          // ) {
          //   return true;
          // }

        }

        render() {
          //console.log('render()');

          if(this.data == null || Object.keys(this.data).length === 0){
            return html``;
          } else {
            return html`
                <div class="flex flex-wrap dd-dashboard-style-refresh">
                  <div class="w-full ${this.configuration['homepage_header']['v2_mode'] ? "" : "lg-w-1-2 xl-w-1-3"} ${window.location.hash ? (this.configuration['homepage_header']['v2_mode'] ? "hidden" : "hidden lg-block") : ""} p-4">
                    <div id="devices">
                      <div class="flex justify-between mb-2">
                        <div>
                          <h2 class="font-semibold text-lg capitalize">
                            ${translateEngine(this._hass, 'device.title_plural')}
                          </h2>
                          <span class="text-gray">
                            ${Object.keys(this.data).length} ${translateEngine(this._hass, 'device.title_plural')}
                          </span>
                        </div>
                        <div>
                          ${this._hass.user.is_admin ? html`
                          <ha-dropdown
                            class="ha-icon-overflow-menu-overflow"
                            placement="bottom-end"
                          >
                            <ha-icon-button
                              label=${this._hass.localize("ui.common.overflow_menu")}
                              .path=${mdiDotsVertical}
                              slot="trigger"
                            ></ha-icon-button>
                              ${this.deviceEditMode ? html `
                                <ha-dropdown-item
                                  .ddValue=${false}
                                  @click=${this._handleDeviceEditModeClicked}
                                >
                                  <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                                  ${translateEngine(this._hass, 'global.disable_edit_mode')}
                                </ha-dropdown-item>` : html `
                                <ha-dropdown-item
                                  .ddValue=${true}
                                  @click=${this._handleDeviceEditModeClicked}
                                >
                                  <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                                  ${translateEngine(this._hass, 'global.enable_edit_mode')}
                                </ha-dropdown-item>
                                `
                              }
                          </ha-dropdown>
                          ` : ""}
                        </div>
                      </div>

                      <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration['homepage_header']['v2_mode'] ? "lg-grid-cols-4 xl-grid-cols-5" : ""} gap-4" id="sortable">
                        ${Object.values(this.data).map((i) => this._renderDeviceButton(i))}
                      </div>

                      ${this.deviceEditMode ? html `
                        ${this.disabledDevices.length ? html`
                          <div class="mb-5">
                            <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass,'device.hidden')}</h3>
                            <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                            ${this.disabledDevices.map((device) =>
                                html`${this._renderDeviceButtonCard(device, 'disabled')}`
                            )}
                            </div>
                          </div>` : ""
                        }
                      `: ""}
                    </div>
                  </div>
                  <div class="w-full ${this.configuration['homepage_header']['v2_mode'] ? "" : "lg-w-1-2 xl-w-2-3"} ${!window.location.hash ? (this.configuration['homepage_header']['v2_mode'] ? "hidden" : "hidden lg-block") : ""} p-4">
                    ${Object.values(this.data).map((i) => this._renderDeviceView(i))}
                  </div>
                </div>
                <div class="sticky z-30 bottom-0 ${!window.location.hash ? "hidden" : ""} ${this.configuration['homepage_header']['v2_mode'] ? "" : "lg-hidden"} text-right">
                <div @click=${this._backButtonClick} class="back-button">
                    <div class="button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                </div>
                </div>
            `;
          }
        }

      static get styles() {
        return devicesPageCardStyles;
      }


      }
      defineDwainsElement("devices-card", DevicesCard);
