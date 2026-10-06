import { moreInfo } from './card-tools-compat';
import { popUp } from './dwains-popup';
import { mdiDotsVertical, mdiCog } from '@mdi/js';
import { css, html, LitElement } from 'lit';
import { clientPreferences } from './client-preferences';
import { WEATHER_ICONS, STATES_OFF, UNAVAILABLE_STATES, SENSOR_DOMAINS, ALERT_DOMAINS, COVER_DOMAINS, TOGGLE_DOMAINS, CLIMATE_DOMAINS, OTHER_DOMAINS, DEVICE_CLASSES, ALARM_ICONS } from './variables';
import { computeDomain } from './frontend-helpers';
import translateEngine from './translate-engine';
import { showSaveError } from './save-error-toast';
const { savingSortableOptions } = require('./sortable-save');
import { createCardElementSafe, resolveEntityName } from './helpers';
import { subtleDetailViewStyles, subtleHomepageStyles } from './styles/dwains-subtle-style';
const { EventSubscriptionOwner } = require('./event-subscription-owner');
const { averageEntityStates, countActiveEntities, groupEntityStatesByDomain, isEntityHiddenInArea, localizedClimateState } = require('./entity-aggregation');
const { TimerOwner } = require('./timer-owner');
const { PopupOpenScheduler } = require('./popup-open-scheduler');
const { ReloadableLoadOwner } = require('./reloadable-load-owner');
const { hassConnectionIdentity, hasHassConnectionChanged } = require('./hass-connection');
const { websocketReadStore } = require('./websocket-read-store');
const { loadDashboardRegistrySnapshot } = require('./dashboard-registry-snapshot');
const { resolveHass } = require('./hass-provider');
const { loadCardHelpers } = require('./card-helpers-loader');
const { loadSortable } = require('./lazy-modules');
const { RegistryChangeWatcher } = require('./registry-change-watcher');
const { homepageEmptyReason, initialSelection } = require('./empty-state');
import { emptyStateStyles, renderEmptyState } from './empty-state-view';
const { entityIdsIn, hassChangeIsRelevant, relevanceFilter } = require('./state-relevance');
const { closeParentDropdown } = require('./dropdown-controller');
const { defineDwainsElement } = require('./custom-element-registration');
const { DisconnectGrace } = require('./disconnect-grace');
const { CardReuse, attachDeferredCard, cardReuseKey } = require('./deferred-card');
const { entitySettingsFromConfiguration } = require('./entity-settings-config');
const { createHomepageCardElement, propagateHomepageHass } = require('./homepage-card-runtime');
const { groupingMode, readBooleanCookie, resolveGroupingPreference } = require('./homepage-preferences');
const { formatValueWithUnit } = require('./value-format');
import { homepageCardStyles } from './styles/homepage-card-styles';
import { AreaTilesMixin } from './homepage/area-tiles';
import { AreaViewMixin } from './homepage/area-view';

function getDwainsHass() {
  return resolveHass();
}

	  class HomepageCard extends AreaViewMixin(AreaTilesMixin(LitElement)) {
    static get properties() {
      return {
        data: {},
        favorites: {},
        favoriteEditMode: {},
        selectedArea: {},
        areaEditMode: {},
        areaViewEditMode: {},
        areaViewDisplayGrouped: {},
        areaDisplayGrouped: {},
      };
    }

    constructor() {
      super();
      this._disconnectGrace = new DisconnectGrace();
      this._registryChanges = new RegistryChangeWatcher(() => {
        this._reloadCard().catch((error) => console.error('Error reloading homepage card:', error));
      });
      this._subscriptions = new EventSubscriptionOwner();
      this._timers = new TimerOwner();
      this._popupOpens = new PopupOpenScheduler(this._timers);
      this._loads = new ReloadableLoadOwner((context) => this._loadConfiguration(context));
      this._startedHass = undefined;
      this._cardReuse = new CardReuse();
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
      propagateHomepageHass(this, hass);
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

	    // render: false when only entities changed that the homepage does not
	    // show; the cards inside still get the new hass.
	    _update_hass(hass, render = true){
	      this._hass = hass;
	      propagateHomepageHass(this, hass);

	      //console.log('set hass runned');
	      if(this.data == null || this.data.length === 0) return;

      //Only update the cards for the opened area page.
	      this.data.forEach((data) => {
	        if(data.area.area_id == this.selectedArea){
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

	      if(this.favorites.length != 0){
	        this.favorites.forEach((item) => {
	          if(item.card) item.card.hass = hass;
	        })
	      }
	      if(this.badgesCard) this.badgesCard.hass = hass;
	      if(!render) return;

	      if(this.timeout) {
	        this._pendingHassUpdate = true;
	        return;
	      }
	      this.timeout = true;
	      this._pendingHassUpdate = false;
	      const delay = this.areaEditMode || this.favoriteEditMode || this.areaViewEditMode
	        ? 1000
	        : 100;
	      const timer = this._timers.schedule('hass-update-throttle', () => {
	        this.timeout = false;
	        if(this._pendingHassUpdate){
	          this._pendingHassUpdate = false;
	          this.requestUpdate();
	        }
	      }, delay);
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

      this.selectedArea = window.location.hash.substring(1);
      this.areaEditMode = false;
      this.favoriteEditMode = false;
      this.areaViewEditMode = false;
      this.areaViewDisplayGrouped = this._areaViewDisplayGroupedFromClient();
      this.areaDisplayGrouped = this._areaDisplayGroupedFromClient();

      this._config = config;

      this._cardHelpersReady = this.loadHelpers();
      this.cardHelpers = await this._cardHelpersReady;
      await this._startIfReady();
    }

    _areaViewDisplayGroupedFromClient(){
      return readBooleanCookie(clientPreferences, 'dwains_dashboard_areaViewDisplayGrouped');
    }

    _areaViewGroupingMode(){
      return groupingMode(this.configuration, 'area_view_grouping_mode');
    }

    _areaViewDisplayGroupedFromPreference(){
      return resolveGroupingPreference(
        this.configuration,
        'area_view_grouping_mode',
        this._areaViewDisplayGroupedFromClient(),
      );
    }

    _applyAreaViewGroupingPreference(){
      this.areaViewDisplayGrouped = this._areaViewDisplayGroupedFromPreference();
    }

    _areaDisplayGroupedFromClient(){
      return readBooleanCookie(clientPreferences, 'dwains_dashboard_areaDisplayGrouped');
    }

    _areaFloorGroupingMode(){
      return groupingMode(this.configuration, 'area_floor_grouping_mode');
    }

    _areaDisplayGroupedFromPreference(){
      return resolveGroupingPreference(
        this.configuration,
        'area_floor_grouping_mode',
        this._areaDisplayGroupedFromClient(),
      );
    }

    _applyAreaDisplayGroupingPreference(){
      this.areaDisplayGrouped = this._areaDisplayGroupedFromPreference();
    }

	    async connectedCallback(){
	      super.connectedCallback();
	      if (this._disconnectGrace.cancel()) return;
	      this._subscriptions.connect();
	      this._timers.connect();

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
          this._scheduleIconRepoke();
        }
      } catch (error) {
        if (this._startedHass === connection) this._startedHass = undefined;
        console.error('Error starting homepage card:', error);
      }
    }

	    disconnectedCallback(){
	      super.disconnectedCallback();
	      this._disconnectGrace.schedule(this, () => this._teardown());
	    }

	    _teardown(){
	      this._subscriptions.disconnect();
	      this._timers.disconnect();
	      this._registryChanges.reset();
	      this._startedHass = undefined;
	      this._loads.invalidate();
	      this.timeout = false;
	      this._pendingHassUpdate = false;
	      this.__iconRepokeScheduled = false;
	      if(this.__masonryRO){
	        this.__masonryRO.disconnect();
	        this.__masonryRO = undefined;
	      }
	      if(this.__masonryRaf){
	        cancelAnimationFrame(this.__masonryRaf);
	        this.__masonryRaf = 0;
	      }
	      if(this.__masonryLayoutRaf){
	        cancelAnimationFrame(this.__masonryLayoutRaf);
	        this.__masonryLayoutRaf = 0;
	      }
	    }

	    _subscribeReload(){
	      return this._subscriptions.subscribeEvent(
	        'homepage',
	        this._hass,
	        "dwains_dashboard_homepage_card_reload",
	        () => {
	          websocketReadStore.invalidate(this._hass);
	          this._reloadCard().catch((error) => {
	            console.error('Error reloading homepage card:', error);
	          });
	        },
	      );
	    }

	    updated(){
	      // The repeated checks run after loading (see _startIfReady); later
	      // renders only add single icons, one check a second is enough.
	      this._timers.schedule('icon-check', () => this._repokeIcons(), 1000, { replace: false });
	      // updated() runs for every hass state change; one masonry pass per
	      // animation frame is enough.
	      this._scheduleMasonryLayout();
	    }

	    // Integration option "Cards in rows of equal height (no masonry)".
	    _masonryEnabled(){
	      return !this.configuration?.homepage_header?.disable_masonry;
	    }

	    _scheduleMasonryLayout(){
	      if(this.__masonryLayoutRaf) return;
	      this.__masonryLayoutRaf = requestAnimationFrame(() => {
	        this.__masonryLayoutRaf = 0;
	        this._fitAreaBadges();
	        this._layoutMasonry();
	      });
	    }

	    _repokeIcons(){
	      try {
	        if(!this.shadowRoot) return;
	        this.shadowRoot.querySelectorAll(".area-button ha-icon").forEach((iconEl) => {
	          const icon = iconEl.icon;
	          if(!icon || icon.indexOf(":") < 1) return;
	          const root = iconEl.shadowRoot;
	          const svgIcon = root && root.querySelector("ha-svg-icon");
	          if(svgIcon && svgIcon.path) return;
	          const path = root && root.querySelector("svg path");
	          if(path && (path.getAttribute("d") || "").length) return;
	          iconEl.icon = "";
	          iconEl.icon = icon;
	        });
	      } catch (error) {
	        console.error("Failed to repoke homepage icons", error);
	      }
	    }

	    _scheduleIconRepoke(){
	      if(this.__iconRepokeScheduled) return;
	      this.__iconRepokeScheduled = true;
	      const delays = [60, 300, 900, 2000, 4000, 8000, 12000];
	      const timers = delays.map((delay, index) => this._timers.schedule(`icon-repoke-${index}`, () => {
	        if(index === delays.length - 1){
	          this.__iconRepokeScheduled = false;
	        }
	        this._repokeIcons();
	      }, delay));
	      if(timers.every((timer) => timer === undefined)) {
	        this.__iconRepokeScheduled = false;
	      }
	    }

	    _layoutMasonry(){
	      try {
	        if(!this.shadowRoot) return;
	        const grids = this.shadowRoot.querySelectorAll(this.areaViewEditMode ? ".dd-masonry, .dd-fav-masonry, .area-view-entity-sortable" : ".dd-masonry, .dd-fav-masonry");
	        if(!grids.length) return;
	        if(!this.__masonryRO && "ResizeObserver" in window){
	          this.__masonryRO = new ResizeObserver(() => {
	            if(this.__masonryRaf) return;
	            this.__masonryRaf = requestAnimationFrame(() => {
	              this.__masonryRaf = 0;
	              this._applyMasonrySpans();
	            });
	          });
	        }
	        grids.forEach((grid) => {
	          Array.from(grid.children).forEach((item) => {
	            try {
	              if(this.__masonryRO) this.__masonryRO.observe(item);
	              // Cells have a fixed row span; watch the card itself so the
	              // span follows when the card finishes loading.
	              if(this.__masonryRO && item.firstElementChild){
	                this.__masonryRO.observe(item.firstElementChild);
	              }
	            } catch (error) {
	              console.error("Failed to observe a homepage masonry item", error);
	            }
	          });
	        });
	        this._applyMasonrySpans();
	      } catch (error) {
	        console.error("Failed to update homepage masonry observers", error);
	      }
	    }

	    _applyMasonrySpans(){
	      try {
	        if(!this.shadowRoot) return;
	        // Favorites: real masonry on 8px rows, so a short tile no longer
	        // leaves a gap below it next to a tall one.
	        // Favorites and area cards: real masonry on 8px rows, so a short card
	        // no longer leaves a gap below it next to a tall one.
	        const grids = Array.from(this.shadowRoot.querySelectorAll(".dd-fav-masonry, .dd-masonry"));
	        // Read every height first and write afterwards: interleaving
	        // getBoundingClientRect() with style writes forces one full layout
	        // per card (the main cost when opening an area).
	        const layouts = grids.map((grid) => {
	          const items = Array.from(grid.children);
	          // Every card takes its own height. A configured row span only
	          // applies to rows of equal height (the "no masonry" option); here
	          // it would reserve room the card does not fill.
	          return items.map((item) => {
	            const content = item.firstElementChild;
	            const height = content ? content.getBoundingClientRect().height : 0;
	            return [item, height > 0 ? Math.ceil((height + 16) / 8) : undefined];
	          });
	        });
	        layouts.flat().forEach(([item, span]) => {
	          // Set start and end: with the row-span-* classes both sides are
	          // spans and a span on grid-row-end alone would be ignored.
	          const row = span && `span ${span} / span ${span}`;
	          if(row && item.style.gridRow !== row){
	            item.style.gridRow = row;
	          }
	        });
	        // Edit mode and the "no masonry" option use the plain grid again
	        // (no masonry class): drop spans written before.
	        this.shadowRoot.querySelectorAll(".area-view-entity-sortable:not(.dd-masonry) > *, .sortable:not(.dd-fav-masonry):not(.dd-masonry) > *").forEach((item) => {
	          if(item.style.gridRow) item.style.gridRow = "";
	        });
	      } catch (error) {
	        console.error("Failed to apply homepage masonry spans", error);
	      }
	    }

    async _reloadCard(){
      await this._loads.reload();
      this.requestUpdate();
      this._scheduleIconRepoke();
    }

    _loadData(){
      return this._loads.load();
    }

    async _loadConfiguration({ isCurrent = () => true } = {}){
      this.startedUp = false;

      const snapshot = await loadDashboardRegistrySnapshot(
        this._hass,
        { includeFloors: true },
      );
      if (!isCurrent()) return;
      Object.assign(this, snapshot);

      this._applyAreaViewGroupingPreference();
      this._applyAreaDisplayGroupingPreference();

      const data = [];
      const disabledAreas = [];
      const favorites = [];
      this._cardReuse.startBuild();

      if(this.areas == null || this.areas.length === 0
      || this.devices == null || this.devices.length === 0
      || this.entities == null || this.entities.length === 0
      || this.configuration == null || this.configuration.length === 0
      ){
        // Nothing to build areas from yet (no areas, devices or entities):
        // show the page with its empty state instead of nothing.
        if (this.configuration != null) {
          this.data = [];
          this.disabledAreas = [];
          this.favorites = [];
          this.selectedArea = "";
          this.startedUp = true;
        }
      } else {
        // Kept across rebuilds; the status bar reads the changed settings.
        const [notificationCard, badgesCard] = await Promise.all([
          this.notificationCard || this.createCardElement2({
            type: "custom:dwains-notification-card",
            hass: this._hass,
          }),
          this.badgesCard || this.createCardElement2({
            type: "custom:dwains-house-information-card",
            hass: this._hass,
          }),
        ]);
        if (badgesCard === this.badgesCard) {
          badgesCard._reloadCard?.().catch((error) => console.error('Error reloading house information card:', error));
        }
        if (!isCurrent()) return;
        this.notificationCard = notificationCard;
        this.badgesCard = badgesCard;


        //Favorites load part
        if(this.configuration['entities']){
          const favoritesEntities = [];
          await Promise.all(Object.entries(this.configuration['entities']).map(async ([entity,v]) => {
            if(v['favorite']){
              const domain = computeDomain(entity);
              const hideEntity = this.configuration['entities'][entity] ? (this.configuration['entities'][entity]['hidden'] ? true : false) : false;
              const excludeEntity = this.configuration['entities'][entity] ? (this.configuration['entities'][entity]['excluded'] ? true : false) : false;
              const configuredFriendlyName = this.configuration['entities'][entity] ? this.configuration['entities'][entity]['friendly_name'] : "";
              const friendlyName = this._entityDisplayName(entity);
              const customCard = this.configuration['entities'][entity] && this.configuration['entities'][entity]['custom_card'] ? this.configuration['entities'][entity]['custom_card'] : false;
              const customPopup = this.configuration['entities'][entity] && this.configuration['entities'][entity]['custom_popup'] ? this.configuration['entities'][entity]['custom_popup'] : false;
              const isFavorite = this.configuration['entities'][entity] && this.configuration['entities'][entity]['favorite'] ? this.configuration['entities'][entity]['favorite'] : false;

              let cardConfig = {};
              let rowSpan = "1";
              let colSpan = "1";
              let rowSpanLg = "1";
              let colSpanLg = "1";
              let rowSpanXl = "1";
              let colSpanXl = "1";
              if(customCard && this.configuration['entity_cards'] && this.configuration['entity_cards'][entity]){
                //If entity has a custom card set by user
                cardConfig = {input_name: friendlyName, input_entity: entity,...this.configuration['entity_cards'][entity]};
              } else if(this.configuration['devices_card'][domain]){
                //If domain has a custom card set by user
                cardConfig = {input_name: friendlyName, input_entity: entity,...this.configuration['devices_card'][domain]};
	              } else if (domain === 'sensor' && this._hass && this._hass.states[entity]?.attributes?.unit_of_measurement
	              && !this.configuration['homepage_header']['disable_sensor_graph']) {
	                cardConfig = {
	                  graph: "line",
	                  type: "sensor",
	                  hours_to_show: 24,
	                  detail: 1,
	                  entity: entity,
	                  ...(friendlyName ? { name: friendlyName } : {})
	                };
	              } else {
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

                cardConfig = {entity: entity,...cardConfig};
              }

              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['row_span']){
                rowSpan = this.configuration['entities'][entity]['row_span'];
              }
              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['col_span']){
                colSpan = this.configuration['entities'][entity]['col_span'];
              }
              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['row_span_lg']){
                rowSpanLg = this.configuration['entities'][entity]['row_span_lg'];
              }
              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['col_span_lg']){
                colSpanLg = this.configuration['entities'][entity]['col_span_lg'];
              }
              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['row_span_xl']){
                rowSpanXl = this.configuration['entities'][entity]['row_span_xl'];
              }
              if(this.configuration['entities'][entity] && this.configuration['entities'][entity]['col_span_xl']){
                colSpanXl = this.configuration['entities'][entity]['col_span_xl'];
              }

	              favoritesEntities.push(attachDeferredCard({
                domain: domain,
                entity: entity,
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
                isFavorite: isFavorite,
                favorite_sort_order: (this.configuration['entities'][entity] && this.configuration['entities'][entity]['favorite_sort_order'] ? this.configuration['entities'][entity]['favorite_sort_order']: 99),
              }, () => this.createCardElement2(cardConfig), { reuse: this._cardReuse, key: cardReuseKey('favorite', cardConfig) }));
            }
          }));

          this.favorites = favoritesEntities;
        }

        for(const area of this.areas){
          if(this.configuration['areas'][area.area_id] && this.configuration['areas'][area.area_id]['disabled']){
            disabledAreas.push(area);
          } else {
            // //Check if selectedArea is empty (no hash and this is first area to loop throug so set it)
            // if(this.selectedArea.length === 0){
            //   this.selectedArea = area.area_id;
            // }

            const areaEntities = new Set();
            const areaCardsByDomain = [];
            const areaEntitiesNoState = [];
            const areaEntitiesHidden = [];
            const areaEntitiesDisabled = [];
            const areaCustomCardsTop = [];
            const areaCustomCardsBottom = [];

            for (const entity of this.entitiesByAreaId.get(area.area_id) || []) {
                if(entity.hidden_by){
                  continue;
                }
                const entityConfig = this.configuration['entities']?.[entity.entity_id];
                if (isEntityHiddenInArea(entityConfig)) {
                  areaEntitiesHidden.push(entity.entity_id);
                  continue;
                }
                const disableEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['disabled'] ? true : false) : false;
                if(disableEntity){
                  areaEntitiesDisabled.push(entity.entity_id);
                  continue;
                }
                const domain = entity.entity_id.slice(0, entity.entity_id.indexOf("."));
                const stateObj = this._hass.states[entity.entity_id];

                if (stateObj) {
                  const hideEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['hidden'] ? true : false) : false;
                  const excludeEntity = this.configuration['entities'][entity.entity_id] ? (this.configuration['entities'][entity.entity_id]['excluded'] ? true : false) : false;
                  const configuredFriendlyName = this.configuration['entities'][entity.entity_id] ? this.configuration['entities'][entity.entity_id]['friendly_name'] : "";
                  const friendlyName = this._entityDisplayName(entity.entity_id, entity);
                  const customCard = this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['custom_card'] ? this.configuration['entities'][entity.entity_id]['custom_card'] : false;
                  const customPopup = this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['custom_popup'] ? this.configuration['entities'][entity.entity_id]['custom_popup'] : false;
                  const isFavorite = this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['favorite'] ? this.configuration['entities'][entity.entity_id]['favorite'] : false;

                  if(hideEntity){
                    areaEntitiesHidden.push(entity.entity_id);

                    //Also add the entity to the normal area entities because a hidden entity is still used in area button (states)
                    areaEntities.add(entity.entity_id);
                  } else {
                    let cardConfig = {};
                    let rowSpan = "1";
                    let colSpan = "1";
                    let rowSpanLg = "1";
                    let colSpanLg = "1";
                    let rowSpanXl = "1";
                    let colSpanXl = "1";
                    if(customCard && this.configuration['entity_cards'] && this.configuration['entity_cards'][entity.entity_id]){
                      //If entity has a custom card set by user
                      cardConfig = {input_name: friendlyName,input_entity: entity.entity_id,...this.configuration['entity_cards'][entity.entity_id]};
                    } else if(this.configuration['devices_card'][domain]){
                      //If domain has a custom card set by user
                      cardConfig = {input_name: friendlyName,input_entity: entity.entity_id,...this.configuration['devices_card'][domain]};
	                    } else if (domain === 'sensor' && this._hass && this._hass.states[entity.entity_id]?.attributes?.unit_of_measurement
	                    && !this.configuration['homepage_header']['disable_sensor_graph']) {
	                      cardConfig = {
	                        graph: "line",
	                        type: "sensor",
	                        hours_to_show: 24,
	                        detail: 1,
	                        entity: entity.entity_id,
	                        ...(friendlyName ? { name: friendlyName } : {})
	                      };
	                    } else {
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


                    areaCardsByDomain.push(attachDeferredCard({
                      domain: domain,
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
                      isFavorite: isFavorite,
                      sort_order: (this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['sort_order'] ? this.configuration['entities'][entity.entity_id]['sort_order']: 99),
                      grouped_sort_order: (this.configuration['entities'][entity.entity_id] && this.configuration['entities'][entity.entity_id]['grouped_sort_order'] ? this.configuration['entities'][entity.entity_id]['grouped_sort_order']: 99),
                    }, () => this.createCardElement2(cardConfig), { reuse: this._cardReuse, key: cardReuseKey(`area:${area.area_id}`, cardConfig) }));

                    areaEntities.add(entity.entity_id);
                  }
                } else {
                  areaEntitiesNoState.push(entity.entity_id);
                }
            }

            //Custom cards
            if(this.configuration.area_cards.length !== 0){
              if(this.configuration.area_cards[area.area_id]){
                //console.log(Object.entries(this.configuration.area_cards[area.area_id]));
                Object.entries(this.configuration.area_cards[area.area_id]).forEach(([k,v]) => {
                  const rowSpan = v["row_span"] ? v["row_span"] : "1";
                  const colSpan = v["col_span"] ? v["col_span"] : "1";
                  const rowSpanLg = v["row_span_lg"] ? v["row_span_lg"] : "1";
                  const colSpanLg = v["col_span_lg"] ? v["col_span_lg"] : "1";
                  const rowSpanXl = v["row_span_xl"] ? v["row_span_xl"] : "1";
                  const colSpanXl = v["col_span_xl"] ? v["col_span_xl"] : "1";

                  if(v["position"] == 'bottom'){
                    areaCustomCardsBottom.push(attachDeferredCard({
                      filename: k,
                      area_id: area.area_id,
                      rowSpan: rowSpan,
                      colSpan: colSpan,
                      rowSpanLg: rowSpanLg,
                      colSpanLg: colSpanLg,
                      rowSpanXl: rowSpanXl,
                      colSpanXl: colSpanXl,
                    }, () => this.createCardElement2(v), { reuse: this._cardReuse, key: cardReuseKey(`area-card:${area.area_id}:${k}`, v) }));
                  } else {
                    areaCustomCardsTop.push(attachDeferredCard({
                      filename: k,
                      area_id: area.area_id,
                      rowSpan: rowSpan,
                      colSpan: colSpan,
                      rowSpanLg: rowSpanLg,
                      colSpanLg: colSpanLg,
                      rowSpanXl: rowSpanXl,
                      colSpanXl: colSpanXl,
                    }, () => this.createCardElement2(v), { reuse: this._cardReuse, key: cardReuseKey(`area-card:${area.area_id}:${k}`, v) }));
                  }
                });
              }
            }

            const floor = this.floorsById.get(area.floor_id);
            //if(areaCardsByDomain.length != 0){
              data.push({
                entitiesNoState: areaEntitiesNoState,
                entitiesHidden: areaEntitiesHidden,
                entitiesDisabled: areaEntitiesDisabled,
                entities: areaEntities,
                area: area,
                cards: areaCardsByDomain,
                customCardsTop: areaCustomCardsTop,
                customCardsBottom: areaCustomCardsBottom,
	                floor: floor?.name || translateEngine(this._hass, 'area.no_floor'),
	                floorLevel: floor?.level ?? 9999,
                sort_order: (this.configuration['areas'][area.area_id] && this.configuration['areas'][area.area_id]['sort_order'] ? this.configuration['areas'][area.area_id]['sort_order']: 99),
                grouped_sort_order: (this.configuration['areas'][area.area_id] && this.configuration['areas'][area.area_id]['grouped_sort_order'] ? this.configuration['areas'][area.area_id]['grouped_sort_order']: 99),
              });
            //}
          }
        }

        if (!isCurrent()) return;
        data.sort(function (x, y) {
          let a = x.sort_order,
              b = y.sort_order;
          return a == b ? 0 : a > b ? 1 : -1;
        });

        if (!isCurrent()) return;
	        // Without a hash the first area is selected; "" when there is none.
	        this.selectedArea = initialSelection(this.selectedArea, data.map((item) => item.area.area_id));
	        this.data = data;
        this.disabledAreas = disabledAreas;
        this._isShownEntity = relevanceFilter({
          entityIds: [
            ...[...this.entitiesByAreaId.values()].flat().map((entity) => entity.entity_id),
            ...entityIdsIn(this.configuration),
          ],
          // Header (weather, alarm) and greeting; usually named in the
          // configuration as well.
          domains: ['weather', 'alarm_control_panel', 'sun', 'person'],
        });

        this.startedUp = true;
      }
    }

    _average(data, domain, deviceClass) {
      return averageEntityStates(data, domain, deviceClass, {
        isAvailable: (entity) => this._isAvailableEntity(entity),
        locale: this._hass?.locale?.language || this._hass?.language,
      });
    }

    _isOn(data, domain, deviceClass) {
      return countActiveEntities(data, domain, deviceClass, {
        unavailableStates: UNAVAILABLE_STATES,
        statesOff: STATES_OFF,
      });
    }

    _coverOpenCount(data, deviceClass) {
      const entities = data["cover"];
      if (!entities) {
        return undefined;
      }
      const invertCover = !!(
        this.configuration &&
        this.configuration.homepage_header &&
        this.configuration.homepage_header.invert_cover
      );
      return entities
        .filter((entity) =>
          deviceClass ? entity.attributes.device_class === deviceClass : true
        )
        .filter((entity) => !UNAVAILABLE_STATES.includes(entity.state))
        .filter((entity) => {
          const position = Number(entity.attributes.current_position);
          if (!Number.isNaN(position)) {
            return invertCover ? position === 0 : position > 0;
          }
          return invertCover
            ? STATES_OFF.includes(entity.state)
            : !STATES_OFF.includes(entity.state);
        }).length;
    }

    _climateState(data, domain){
      return localizedClimateState(data, domain, {
        hass: this._hass,
        unavailableStates: UNAVAILABLE_STATES,
        statesOff: STATES_OFF,
      });
    }

    _handleAreaDisableAllEntitiesClicked(ev){
      const areaId = ev.currentTarget.area;
      const data = this.data.find((data) => data.area.area_id == areaId);
      const key = ev.currentTarget.key;
      const value = ev.currentTarget.ddValue;

      this._hass.callWS({
        type: 'dwains_dashboard/edit_entities_bool_value',
        entities: JSON.stringify([...data.entities]),
        key: key,
        value: value,
      }).catch((err) => showSaveError(this._hass, err));
    }

    _handleAreaClick(event){
      const id = event.currentTarget.dataset.areaId;
      window.location.hash = id;
      this.selectedArea = id;
      window.scrollTo(0,0);
      //this.requestUpdate();
      this._update_hass(this._hass);
    }

    _handleAreaDoubleClick(event){
      const areaId = event.currentTarget.dataset.areaId;
      const lightState = event.currentTarget.lightState;
      this._hass.callService(
        'light',
        (lightState ? "turn_off" : "turn_on"),
        undefined,
        {
          area_id: areaId,
        }
      );
    }

    _subscribeWeatherForecast(entityId, stateObj) {
      // Daily forecast (bit 1) for today's high/low next to the weather pill.
      if (!(Number(stateObj.attributes.supported_features) & 1)) return;
      const connection = this._hass?.connection;
      if (typeof connection?.subscribeMessage !== "function") return;
      this._subscriptions.subscribe(`weather-forecast:${entityId}`, () =>
        connection.subscribeMessage((event) => {
          this._weatherForecast = { entity: entityId, forecast: event?.forecast || [] };
          this.requestUpdate();
        }, {
          type: "weather/subscribe_forecast",
          forecast_type: "daily",
          entity_id: entityId,
        })
      ).catch(() => {});
    }

    _handleGraphClick(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      moreInfo(ev.currentTarget.entity);
    }

    _backButtonClick(){
      window.location.hash = "";
      //this.requestUpdate();
      this._update_hass(this._hass);
    }

    _handleMoreInfo(ev){
      moreInfo(ev.currentTarget.entity);
    }

    _entitiesByDomain(entities){
      return groupEntityStatesByDomain(entities, {
        states: this._hass.states,
        excludedEntities: this.configuration.entities,
        domainGroups: {
          toggle: TOGGLE_DOMAINS,
          sensor: SENSOR_DOMAINS,
          alert: ALERT_DOMAINS,
          cover: COVER_DOMAINS,
          climate: CLIMATE_DOMAINS,
          other: OTHER_DOMAINS,
        },
        deviceClasses: DEVICE_CLASSES,
        sensorDeviceClasses: this._areaSensorDeviceClasses(),
        registryEntities: this._hass.entities,
      });
    }

    async createCardElement2(config){
      if (!this.cardHelpers) {
        this.cardHelpers = await loadCardHelpers();
      }
      return createHomepageCardElement({
        helpers: this.cardHelpers,
        config,
        hass: this._hass,
        createCardElement: createCardElementSafe,
      });
    }


    _toggle(ev) {
      closeParentDropdown(ev);
      ev.preventDefault();
      ev.stopPropagation();
      if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      const domain = ev.currentTarget.domain;
      if (TOGGLE_DOMAINS.includes(domain)) {
        this._hass.callService(
          domain,
          (ev.currentTarget.state ? "turn_off" : "turn_on"),
          undefined,
          {
            area_id: ev.currentTarget.area_id,
          }
        );
      }
    }

    _addLovelaceCard(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const area = ev.currentTarget.area;
      const areaName = ev.currentTarget.areaName;
      const position = ev.currentTarget.position;

      this._popupOpens.schedule(() => {

        popUp(translateEngine(this._hass, 'entity.add_card_to') + areaName, {
          type: "custom:dwains-create-custom-card-card",
          area: area,
          position: position,
          page: "areas",
          name: areaName,
        }, true, '');
      });
    }

    _handleAreaEditClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const areaId = ev.currentTarget.area_id;
      const icon = ev.currentTarget.area_icon;
      const disableArea = ev.currentTarget.disable_area;
      const hideIcon = ev.currentTarget.hide_icon;
      const configuredArea = (this.configuration['areas'] && this.configuration['areas'][areaId]) || {};
      this._popupOpens.schedule(() => {

        popUp(translateEngine(this._hass, 'area.edit_area_button'), {
          type: "custom:dwains-edit-area-button-card",
          areaId: areaId,
          icon: icon,
          disableArea: disableArea,
          hideIcon: hideIcon,
          graphEntity: configuredArea['graph_entity'] || "",
          graphHours: configuredArea['graph_hours'],
          sensorEntities: configuredArea['sensor_entities'] || [],
          binarySensorEntities: configuredArea['binary_sensor_entities'] || [],
        }, false, '');
      });
    }

    _handleEntityEditClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const entity = ev.currentTarget.entity;
      const configured = entitySettingsFromConfiguration(this.configuration, entity);
      const settings = {};
      for (const key of Object.keys(configured)) {
        settings[key] = ev.currentTarget[key] ?? configured[key];
      }
      this._openEntitySettings(settings);
    }

    _handleUnavailableEntityEditClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      this._openEntitySettings(
        entitySettingsFromConfiguration(this.configuration, ev.currentTarget.entity),
      );
    }

    _openEntitySettings(settings) {
      this._popupOpens.schedule(() => {
        popUp(translateEngine(this._hass, 'entity.edit_entity'), {
          type: "custom:dwains-edit-entity-card",
          ...settings,
        }, false, '');
      });
    }

    _saveEntityBoolValue(entityId, key, value) {
      return this._hass.callWS({
        type: 'dwains_dashboard/edit_entity_bool_value',
        entityId,
        key,
        value,
      }).catch((err) => {
        console.error('Failed to update entity setting:', err);
      });
    }
    _handleEntityEditBoolValueClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      this._saveEntityBoolValue(
        ev.currentTarget.entity,
        ev.currentTarget.key,
        ev.currentTarget.ddValue,
      );
    }
    _handleEntityAreaVisibilityClick(ev, entityId, value) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      this._saveEntityBoolValue(entityId, 'hidden_in_area', value);
    }
    _handleAreaEditBoolValueClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const areaId = ev.currentTarget.areaId;
      const key = ev.currentTarget.key;
      const value = ev.currentTarget.ddValue;

      this._hass.callWS({
        type: 'dwains_dashboard/edit_area_bool_value',
        areaId: areaId,
        key: key,
        value: value,
      }).catch((err) => showSaveError(this._hass, err));

    }

    _handleEntityEditCardClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const entityId = ev.currentTarget.entity;

      let cardConfig, mode;
      if(this.configuration['entity_cards'] && this.configuration['entity_cards'][entityId]){
        //cardConfig = this.configuration['entity_cards'][entityId];
        const friendlyName = this._entityDisplayName(entityId);
        cardConfig = {input_name: friendlyName,input_entity: entityId,...this.configuration['entity_cards'][entityId]};
        mode = "editor-element";
      }

      this._popupOpens.schedule(() => {

        popUp(translateEngine(this._hass, 'entity.edit_entity_card'), {
          type: "custom:dwains-edit-entity-card-card",
          entity_id: entityId,
          cardConfig: cardConfig,
          mode: mode,
          existingCardEdit: cardConfig ? true : false,
        }, true, '');
      });
    }

    _handleEntityEditPopupClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const entityId = ev.currentTarget.entity;

      let cardConfig, mode;
      if(this.configuration['entities_popup'] && this.configuration['entities_popup'][entityId]){
        //cardConfig = this.configuration['entities_popup'][entityId];
        const friendlyName = this._entityDisplayName(entityId);
        cardConfig = {input_name: friendlyName,input_entity: entityId,...this.configuration['entities_popup'][entityId]};
        mode = "editor-element";
      }

      this._popupOpens.schedule(() => {

        popUp(translateEngine(this._hass, 'entity.edit_entity_popup_card'), {
          type: "custom:dwains-edit-entity-popup-card",
          entity_id: entityId,
          cardConfig: cardConfig,
          mode: mode,
          existingCardEdit: cardConfig ? true : false,
        }, true, '');
      });
    }

    _handleEntityAddToFavoritesClick(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const entityId = ev.currentTarget.entity;

      this._hass.callWS({
        type: 'dwains_dashboard/edit_entity_favorite',
        entityId: entityId,
        favorite: true,
      }).catch((err) => showSaveError(this._hass, err));
    }

    _handleEntityRemoveFromFavoritesClick(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const entityId = ev.currentTarget.entity;

      this._hass.callWS({
        type: 'dwains_dashboard/edit_entity_favorite',
        entityId: entityId,
        favorite: false,
      }).catch((err) => showSaveError(this._hass, err));

    }


    _handleAreaViewDisplayGroupedClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();

      const value = ev.currentTarget.ddValue;
      const mode = this._areaViewGroupingMode();
      if(mode != 'client'){
        this.areaViewDisplayGrouped = mode == 'enabled';
        if(this.areaViewEditMode){
          this._requestAreaViewSortableRebuild();
        }
        return;
      }
      this.areaViewDisplayGrouped = value;
      clientPreferences.set('dwains_dashboard_areaViewDisplayGrouped', value);
      if(this.areaViewEditMode){
        this._requestAreaViewSortableRebuild();
      }
    }

    _handleAreaDisplayGroupedClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();

      const value = ev.currentTarget.ddValue;
      const mode = this._areaFloorGroupingMode();
      if(mode != 'client'){
        this.areaDisplayGrouped = mode == 'enabled';
        return;
      }
      this.areaDisplayGrouped = value;
      clientPreferences.set('dwains_dashboard_areaDisplayGrouped', value);
    }

    _handleFavoriteEditModeClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const value = ev.currentTarget.ddValue;

      if(value){
        this._attachSortables('.favorites-sortable', 'data-entity', 'dwains_dashboard/sort_entity',
          'favorite_sort_order', () => this.favoriteEditMode);
      } else {
        this._destroySortables();
      }
      this.favoriteEditMode = value;
    }

    _handleAreaEditModeClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const value = ev.currentTarget.ddValue;

      if(value){
        this._attachSortables('.area-sortable', 'data-area-id', 'dwains_dashboard/sort_area_button',
          this.areaDisplayGrouped ? 'grouped_sort_order' : 'sort_order', () => this.areaEditMode);
      } else {
        this._destroySortables();
      }
      this.areaEditMode = value;
    }

    // Makes the grids matching selector drag-sortable and saves the new order.
    // Sortable is loaded on first use, so isActive() tells whether the edit
    // mode is still on once it has arrived.
    async _attachSortables(selector, dataIdAttr, type, sortType, isActive){
      let Sortable;
      try {
        Sortable = await loadSortable();
      } catch (err) {
        console.error('Dwains Dashboard: failed to load drag and drop (reload the page after an update)', err);
        return;
      }
      if(!isActive()) return;
      this._destroySortables();
      const cardHass = this._hass;
      this._sortable = [...this.shadowRoot.querySelectorAll(selector)].map((element) => new Sortable(element, {
        forceFallback: true,
        animation: 150,
        dataIdAttr: dataIdAttr,
        handle: '.sortable-move',
        ...savingSortableOptions(
          (order) => cardHass.callWS({ type: type, sortData: JSON.stringify(order), sortType: sortType }),
          (err) => showSaveError(cardHass, err),
        ),
      }));
    }

    _destroySortables(){
      if(this._sortable){
        this._sortable.forEach(sortElement => sortElement.destroy());
        this._sortable = undefined;
      }
    }

    _requestAreaViewSortableRebuild(){
      this._destroySortables();
      this.updateComplete.then(() => {
        if(this.areaViewEditMode){
          this._attachSortables('.area-view-entity-sortable', 'data-entity', 'dwains_dashboard/sort_entity',
            this.areaViewDisplayGrouped ? 'grouped_sort_order' : 'sort_order', () => this.areaViewEditMode);
        }
      });
    }

    _handleAreaViewEditModeClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const value = ev.currentTarget.ddValue;
      this.areaViewEditMode = value;

      if(value){
        this._requestAreaViewSortableRebuild();
      } else {
        this._destroySortables();
      }
    }

    _handleCustomCardEditClick(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const areaId = ev.currentTarget.area_id;
      const filename = ev.currentTarget.filename;

      const colSpan = ev.currentTarget.colSpan;
      const rowSpan = ev.currentTarget.rowSpan;
      const colSpanLg = ev.currentTarget.colSpanLg;
      const rowSpanLg = ev.currentTarget.rowSpanLg;
      const colSpanXl = ev.currentTarget.colSpanXl;
      const rowSpanXl = ev.currentTarget.rowSpanXl;

      // The dashboard snapshot is shared by every rendered area. Editing must
      // never delete Dwains layout metadata from that authoritative object.
      const cardConfig = structuredClone(
        this.configuration.area_cards[areaId][filename],
      );
      let position = "top";
      if(cardConfig["position"]){
        //Config has the DD position key, but editor doesnt understand that so remove it and parse it to editor
        position = cardConfig["position"];
        delete cardConfig["position"];
      }

      delete cardConfig["col_span"];
      delete cardConfig["row_span"];
      delete cardConfig["col_span_lg"];
      delete cardConfig["row_span_lg"];
      delete cardConfig["col_span_xl"];
      delete cardConfig["row_span_xl"];

      this._popupOpens.schedule(() => {

        popUp(this._hass.localize("ui.components.entity.entity-picker.edit"), {
          type: "custom:dwains-create-custom-card-card",
          area: areaId,
          mode: "editor-element",
          page: "areas",
          cardConfig: cardConfig,
          position: position,
          filename: filename,
          colSpan: colSpan,
          rowSpan: rowSpan,
          colSpanLg: colSpanLg,
          rowSpanLg: rowSpanLg,
          colSpanXl: colSpanXl,
          rowSpanXl: rowSpanXl,
          }, true, '');
      });
    }

	    _renderFavoriteViewCard(data){
	      return html`
	      <div data-entity='${data.entity}' class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg}  relative">
	        <div>
	          <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${this._hass}></dd-lazy-card>
	        </div>
        ${this.favoriteEditMode ? html`
        <ha-card>
          <div class="card-actions-multiple">
            <div class="sortable-move">
              <ha-icon
                .icon=${"mdi:cursor-move"}
              >
              </ha-icon>
            </div>
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              placement="bottom-end"
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${mdiDotsVertical}
                slot="trigger"
              ></ha-icon-button>
                <ha-dropdown-item
                  .entity="${data.entity}"
                  .friendlyName="${data.friendlyName}"
                  .disableEntity=${data.disableEntity}
                  .hideEntity=${data.hideEntity}
                  .excludeEntity=${data.excludeEntity}
                  .rowSpan=${data.rowSpan}
                  .colSpan=${data.colSpan}
                  .rowSpanLg=${data.rowSpanLg}
                  .colSpanLg=${data.colSpanLg}
                  .rowSpanXl=${data.rowSpanXl}
                  .colSpanXl=${data.colSpanXl}
                  .customCard=${data.customCard}
                  .customPopup=${data.customPopup}
                  @click=${this._handleEntityEditClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                  ${translateEngine(this._hass, 'entity.settings')}
                </ha-dropdown-item>
                ${data.entity != 't' ? html `
                  <ha-dropdown-item
                    .entity="${data.entity}"
                    @click="${this._handleEntityEditCardClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                    ${translateEngine(this._hass, 'entity.entity_card')}
                  </ha-dropdown-item>` : ""
                }
                ${data.entity != 't' ? html `
                  <ha-dropdown-item
                    .entity="${data.entity}"
                    @click="${this._handleEntityEditPopupClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                    ${translateEngine(this._hass, 'entity.popup_card')}
                  </ha-dropdown-item>` : ""
                }
                <ha-dropdown-item
                  .entity="${data.entity}"
                  @click="${this._handleEntityRemoveFromFavoritesClick}"
                >
                  <ha-icon slot="icon" .icon=${"mdi:tag-heart"}></ha-icon>
                  ${translateEngine(this._hass, 'entity.remove_from_favorites')}
                </ha-dropdown-item>
                ${this._renderEntityAreaVisibilityAction(data.entity)}
            </ha-dropdown>
          </div>
        </ha-card>` : ""}
      </div>
      `;
    }
    _renderFavorites(){
      if(this.favorites.length == 0){
        return html``;
      }
      this.favorites.sort(function (x, y) {
        let a = x.favorite_sort_order,
            b = y.favorite_sort_order;
        return a == b ? 0 : a > b ? 1 : -1;
      });
      return html`
        <div id="favorites" class="mt-4">
          <div class="flex justify-between mb-2">
            <div>
              <h2 class="font-semibold text-lg">
                ${translateEngine(this._hass, 'favorite.title_plural')}
              </h2>
              <span class="text-gray">
                ${translateEngine(this._hass, 'favorite.all_favorites')}
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
                  ${this.favoriteEditMode ? html `
                    <ha-dropdown-item
                      .ddValue=${false}
                      @click=${this._handleFavoriteEditModeClicked}
                    >
                      <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                      ${translateEngine(this._hass, 'global.disable_edit_mode')}
                    </ha-dropdown-item>` : html `
                    <ha-dropdown-item
                      .ddValue=${true}
                      @click=${this._handleFavoriteEditModeClicked}
                    >
                      <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                      ${translateEngine(this._hass, 'global.enable_edit_mode')}
                    </ha-dropdown-item>
                    `
                  }
              </ha-dropdown>
              `: ""}
            </div>
          </div>
          <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4 sortable favorites-sortable ${this.favoriteEditMode || !this._masonryEnabled() ? "" : "dd-fav-masonry"}">
            ${this.favorites.map((i) =>
              html`${this._renderFavoriteViewCard(i)}`
            )}
          </div>
        </div>
        `;
    }

    render() {
      // null while loading; an empty list renders the page with its empty state.
      if(this.data == null){
        return html``;
      } else {
        //Clock
        const d = new Date();
        const h = (d.getHours() < 10 ? "0" : "") + d.getHours();
        const m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
        const dateNice = d.toLocaleDateString(this._hass.locale.language, { weekday: 'long', month: 'short', day: 'numeric' });
        const currTimeAmPm = h >= 12 ? `${h - 12}:${m} pm` : `${h}:${m} am`;
        let greeting;

        if(d.getHours() < 12){
          //Morning
          greeting = translateEngine(this._hass,'global.greeting_morning');
        } else if(d.getHours() < 18){
          //Afternoon
          greeting = translateEngine(this._hass,'global.greeting_afternoon');
        } else {
          //Evening
          greeting = translateEngine(this._hass,'global.greeting_evening');
        }

        //Weather
        let weatherEntity, weatherState, weatherIcon, weatherStateTranslated, weatherTemperature, weatherRange;
        if(this.configuration['homepage_header']['weather_entity']){
          weatherEntity = this.configuration['homepage_header']['weather_entity'];
          weatherState = this._hass.states[weatherEntity];
          if(weatherState){
            weatherIcon = WEATHER_ICONS[weatherState.state] || "mdi:weather-cloudy-alert";

            const lang = this._hass.selectedLanguage || this._hass.language;
            const resources = this._hass.resources && this._hass.resources[lang] ? this._hass.resources[lang] : {};
            weatherStateTranslated = resources["component.weather.entity_component._.state." + weatherState.state]
              || this._hass.localize(`component.weather.entity_component._.state.${weatherState.state}`)
              || this._hass.localize(`state.default.${weatherState.state}`)
              || weatherState.state;

            // Unavailable/unknown weather entities have no temperature; never
            // render "undefined°C".
            const temperature = weatherState.attributes.temperature;
            const unit = weatherState.attributes.temperature_unit
              || this._hass.config.unit_system['temperature'];
            const locale = this._hass.locale?.language || this._hass.language;
            if (temperature !== undefined && temperature !== null && temperature !== "") {
              weatherTemperature = formatValueWithUnit(Number(temperature), unit, locale);
            }
            this._subscribeWeatherForecast(weatherEntity, weatherState);
            const today = this._weatherForecast?.entity === weatherEntity
              ? this._weatherForecast.forecast?.[0]
              : undefined;
            if (today && today.temperature !== undefined && today.temperature !== null) {
              const high = formatValueWithUnit(Number(today.temperature), "°", locale, 0).replace(/\u00a0/, "");
              const low = today.templow !== undefined && today.templow !== null
                ? formatValueWithUnit(Number(today.templow), "°", locale, 0).replace(/\u00a0/, "")
                : undefined;
              weatherRange = low ? `${high} / ${low}` : high;
            }
          }
        }

        //Alarm
        let alarmEntity, alarmState, alarmStateTranslated, alarmIcon;
        if(this.configuration['homepage_header']['alarm_entity']){
          alarmEntity = this.configuration['homepage_header']['alarm_entity'];
          // A removed or renamed alarm entity must not break the homepage.
          alarmState = this._hass.states[alarmEntity]?.state;
          if(alarmState){
            alarmIcon = ALARM_ICONS[alarmState];
            //console.log(alarmIcon);
            alarmStateTranslated = this._hass.localize(`component.alarm_control_panel.state._.${alarmState}`);
          }
        }

        return html`
            <div class="dd-homepage-horizontal-scroll dd-dashboard-style-refresh">
            <div class="dd-homepage-columns flex flex-wrap">
              <div class="w-full ${this.configuration['homepage_header']['v2_mode'] ? "" : "lg-w-1-2 xl-w-1-3"} ${window.location.hash ? (this.configuration['homepage_header']['v2_mode'] ? "hidden" : "hidden lg-block") : ""} p-4">
                <div class="dd-homepage-status mb-2">
                  <div>
                    ${alarmState ? html`
                      <div class="area-button py-1 px-2" .entity=${this.configuration['homepage_header']['alarm_entity']} @click=${this._handleMoreInfo}>
                        <ha-icon icon="${alarmIcon}"></ha-icon> ${alarmStateTranslated}
                      </div>`: ""
                    }
                  </div>

                  <div id="weather">
                    ${weatherState ? html`
                      <div class="area-button py-1 px-2" .entity=${this.configuration['homepage_header']['weather_entity']} @click=${this._handleMoreInfo}>
                        <ha-icon icon="${weatherIcon}"></ha-icon> ${weatherStateTranslated}${weatherTemperature ? `, ${weatherTemperature}` : ""}${weatherRange ? html`<span class="weather-range">${weatherRange}</span>` : ""}
                      </div>`: ""
                    }
                  </div>

                </div>
                <div class="mb-4 grid grid-cols-1 lg-grid-cols-2">
                  <div>
                    ${this.configuration['homepage_header']['disable_welcome_message'] ? '' : html`<h1 class="font-semibold text-xl">${greeting}, ${this._hass.user.name}</h1>`}
                    ${this.notificationCard}
                  </div>
                  ${this.configuration['homepage_header']['disable_clock'] ? "" : html`
                    <div class="text-right">
                      <div id="clock" class="mb-2 hidden lg-block">
                        <h2 class="font-semibold text-xl">${this.configuration['homepage_header']['am_pm_clock'] ? html`${currTimeAmPm}` : html`${h}:${m}`}</h2>
                        <span class="text-gray capitalize">${dateNice}</span>
                      </div>
                    </div>`
                  }
                </div>

                ${this.badgesCard}

                ${this._renderFavorites()}

                <div id="areas" class="mt-4">
                  <div class="flex justify-between mb-2">
                    <div>
                      <h2 class="font-semibold text-lg capitalize">
                        ${translateEngine(this._hass, 'area.title_plural')}
                      </h2>
                      <span class="text-gray">
                        ${this.data.length} ${translateEngine(this._hass, 'area.title_plural')}
                      </span>
                    </div>
                    <div>
                      <ha-dropdown
                        class="ha-icon-overflow-menu-overflow"
                        placement="bottom-end"
                      >
                        <ha-icon-button
                          label=${this._hass.localize("ui.common.overflow_menu")}
                          .path=${mdiDotsVertical}
                          slot="trigger"
                        ></ha-icon-button>
                          ${this._areaFloorGroupingMode() == 'client' ? html`
                            ${!this.areaDisplayGrouped ? html `
                              <ha-dropdown-item
                                .ddValue=${true}
                                @click=${this._handleAreaDisplayGroupedClicked}
                              >
                                <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                                ${translateEngine(this._hass, 'area.group_by_floor')}
                              </ha-dropdown-item>` : html `
                              <ha-dropdown-item
                                .ddValue=${false}
                                @click=${this._handleAreaDisplayGroupedClicked}
                              >
                                <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                                ${translateEngine(this._hass, 'area.ungroup_by_floor')}
                              </ha-dropdown-item>
                              `
                            }
                          ` : ""}
                          ${this._hass.user.is_admin ? html`
                            ${!this.areaEditMode ? html `
                              <ha-dropdown-item
                                .ddValue=${true}
                                @click=${this._handleAreaEditModeClicked}
                              >
                                <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                                ${translateEngine(this._hass, 'global.enable_edit_mode')}
                              </ha-dropdown-item>` : html `
                              <ha-dropdown-item
                                .ddValue=${false}
                                @click=${this._handleAreaEditModeClicked}
                              >
                                <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                                ${translateEngine(this._hass, 'global.disable_edit_mode')}
                              </ha-dropdown-item>
                              `
                            }
                          ` : ""}
                      </ha-dropdown>
                    </div>
                  </div>

                  ${this.data.length
                    ? this._renderAreaButtons(this.data)
                    : renderEmptyState(this._hass, 'homepage', homepageEmptyReason(this))}

                  ${this.areaEditMode ? html `
                    ${this.disabledAreas.length ? html`
                      <div class="mb-5">
                        <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass,'area.disabled')}</h3>
                        <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                        ${this.disabledAreas.map((area) =>
                            html`${this._renderAreaButtonCard(area, 'disabled')}`
                        )}
                        </div>
                      </div>` : ""
                    }
                  `: ""}
                </div>
              </div>
              <div class="w-full ${this.configuration['homepage_header']['v2_mode'] ? "" : "lg-w-1-2 xl-w-2-3"} ${!window.location.hash ? (this.configuration['homepage_header']['v2_mode'] ? "hidden" : "hidden lg-block") : ""} p-4">
                ${this.data.map((i) => this._renderAreaView(i))}
              </div>
            </div>
            </div>
            <div class="sticky z-30 bottom-0 ${!window.location.hash ? "hidden" : ""} lg-hidden text-right">
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
      return [homepageCardStyles(css), subtleHomepageStyles(css), subtleDetailViewStyles(css), emptyStateStyles]
    }


  }
  defineDwainsElement("homepage-card", HomepageCard);
