import { mdiArrowLeft, mdiDotsVertical, mdiCog } from '@mdi/js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import translateEngine from '../translate-engine';
import { deviceTypeName } from '../device-type-name';
const { entityRecoveryActions } = require('../entity-settings-config');
import { renderEntityMenuItems, renderEntityStateHint, switchDescription } from '../entity-menu';

// Area detail view: entity cards, custom cards and grouping by domain.
export const AreaViewMixin = (Base) => class extends Base {
    _renderAreaViewCustomCards(data, position, hass){
      return html`
      <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 my-4">
        ${repeat(position == "bottom" ? data.customCardsBottom : data.customCardsTop, (i) => i.filename, (i) => this._renderAreaViewCustomCard(i, hass))}
      </div>
      `;
    }
	    _renderAreaViewCustomCard(data, hass){
	      return html`
	      <div class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative">
	        <div>
	          <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${hass}></dd-lazy-card>
	        </div>
        ${this.areaViewEditMode ? html`
        <ha-card>
          <div class="card-actions">
            <ha-button
              @click=${this._handleCustomCardEditClick}
              .area_id=${data.area_id}
              .filename=${data.filename}
              .rowSpan=${data.rowSpan}
              .colSpan=${data.colSpan}
              .rowSpanLg=${data.rowSpanLg}
              .colSpanLg=${data.colSpanLg}
              .rowSpanXl=${data.rowSpanXl}
              .colSpanXl=${data.colSpanXl}
            >
            ${this._hass.localize("ui.components.entity.entity-picker.edit")}
            </ha-button>
          </div>
        </ha-card>` : ""}
      </div>
      `;
    }

	    // Masonry (natural card heights) or, with the option off, rows of equal
	    // height in which the cards fill their cell as in earlier versions.
	    _areaViewGridLayout(){
	      if(this.areaViewEditMode) return "";
	      return this._masonryEnabled() ? "dd-masonry" : "dd-uniform";
	    }

	    _hideUnavailableEntitiesEnabled(){
	      return !!(this.configuration && this.configuration.homepage_header && this.configuration.homepage_header.hide_unavailable_entities);
	    }

	    _filterUnavailableCards(cards){
	      if(this.areaViewEditMode || this.favoriteEditMode || !this._hideUnavailableEntitiesEnabled()){
	        return cards;
	      }
	      return cards.filter((card) => {
	        const stateObj = this._hass.states[card.entity];
	        return !(stateObj && stateObj.state === "unavailable");
	      });
	    }

	    _renderAreaViewCards(data, hass){
	      const cards = this._filterUnavailableCards(data.cards);
	      if(!this.areaViewDisplayGrouped){
	        cards.sort(function (x, y) {
	          let a = x.sort_order,
	              b = y.sort_order;
	          return a == b ? 0 : a > b ? 1 : -1;
	        });

	        return html`
	        <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this._areaViewGridLayout()}">
	          ${repeat(cards, (i) => i.entity, (i) => this._renderAreaViewCard(i, hass))}
	        </div>
	        `;
	      } else {
	        cards.sort(function (x, y) {
          let a = x.grouped_sort_order,
              b = y.grouped_sort_order;
          return a == b ? 0 : a > b ? 1 : -1;
        });

	        let group = cards.reduce((r, a) => {
          //console.log("a", a);
          //console.log('r', r);
          r[a.domain] = [...r[a.domain] || [], a];
          return r;
         }, {});
        //console.log("group", group);

        let sortedGroup = Object.keys(group).sort((x,y) => {
          let a = this.configuration['devices'][x] && this.configuration['devices'][x]['sort_order'] ? this.configuration['devices'][x]['sort_order'] : 99,
              b = this.configuration['devices'][y] && this.configuration['devices'][y]['sort_order'] ? this.configuration['devices'][y]['sort_order'] : 99;
          return a == b ? 0 : a > b ? 1 : -1;
         });

        //console.log("sortedgroup", sortedGroup);

        //console.log(group);

        return html`
        <div>
        ${repeat(sortedGroup, (key) => key, (key) =>
          html`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${deviceTypeName(this._hass, key)}</h3>
              <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this._areaViewGridLayout()}">
                ${repeat(group[key], (v) => v.entity, (v) => this._renderAreaViewCard(v, hass))}
              </div>
            </div>
          `
        )}
        </div>
        `;
      }
    }
    _renderAreaViewCard(data, hass){
      return html`
	      <div
	        data-dd-item
	        data-entity='${data.entity}'
	        class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative"
	      >
	        <div>
	          <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${hass}></dd-lazy-card>
	        </div>
        ${this.areaViewEditMode ? html`
        <ha-card>
          <div class="card-actions-multiple">
            <div class="sortable-move">
              <ha-icon
                .icon=${"mdi:cursor-move"}
              >
              </ha-icon>
            </div>
            ${renderEntityStateHint(this, data.entity)}
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              placement="bottom-end"
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${mdiDotsVertical}
                slot="trigger"
              ></ha-icon-button>
              ${renderEntityMenuItems(this, data)}
            </ha-dropdown>
          </div>
        </ha-card>` : ""}
      </div>
      `;
    }
    _renderAreaViewEntityCard(entity, type) {
      const recoveryActions = entityRecoveryActions(
        this.configuration,
        entity,
        type,
      );
      return html`
        <div data-dd-item>
          <ha-card class="p-2">
            ${translateEngine(this._hass, 'entity.title')}:<br>
            <span class="break-words">
            ${entity}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              ${recoveryActions.map((action) => html`
                <ha-button
                  .entity="${entity}"
                  .key=${action.key}
                  .ddValue=${false}
                  title=${switchDescription(this._hass, action.key, true)}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  ${translateEngine(this._hass, action.translationKey)}
                </ha-button>
              `)}
              <ha-button
                .entity="${entity}"
                @click=${this._handleUnavailableEntityEditClick}
              >
                <ha-svg-icon .path=${mdiCog}></ha-svg-icon>
                ${translateEngine(this._hass, 'entity.settings')}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `;
    }

    // An area view stays in the page once opened, so its cards need not be
    // created again. While it is not shown its cards keep the hass they had:
    // a state change does not render them. Shown again, they get the current.
    _areaViewHass(areaId, shown){
      const kept = (this.__ddAreaViewHass ||= new Map());
      if (shown || !kept.has(areaId)) kept.set(areaId, this._hass);
      return kept.get(areaId);
    }

    _renderAreaView(data){
        //Make the cards grid
        // var outObject = data.cards.reduce(function(a, e) {
        //   // GROUP BY estimated key (estKey), well, may be a just plain key
        //   // a -- Accumulator result object
        //   // e -- sequentally checked Element, the Element that is tested just at this itaration

        //   // new grouping name may be calculated, but must be based on real value of real field
        //   let estKey = (e['domain']);

        //   (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
        //   return a;
        // }, {});
        // Object.keys(outObject).forEach((key, index) => {
        //     //console.log(`${key}: ${outObject[key]}`);
        //     outObject[key].map(child => console.log(child));
        // });

	        this.__ddVisited = this.__ddVisited || {};
	        if(this.selectedArea == data.area.area_id){
	          this.__ddVisited[data.area.area_id] = true;
	        }

	        if(!this.__ddVisited[data.area.area_id]){
	          return html``;
	        }

        const visible = this.selectedArea == data.area.area_id ? "block" : "hidden";
        const hass = this._areaViewHass(data.area.area_id, visible == "block");

        data.cards.sort(function (x, y) {
          let a = x.domain,
              b = y.domain;
          return a == b ? 0 : a > b ? 1 : -1;
        });

        return html`
          <div class="dd-area-view w-full mb-12 ${visible}" id="${data.area.area_id}">
            <div class="dd-area-view-header dd-detail-view-header flex justify-between ${this.configuration['homepage_header']['v2_mode'] ? 'with-back' : ''}">
              <ha-icon-button
                class="dd-area-view-back"
                label=${this._hass.localize("ui.common.back") || "Back"}
                .path=${mdiArrowLeft}
                @click=${this._backButtonClick}
              ></ha-icon-button>
              <div class="dd-area-view-title dd-detail-view-title sticky top-0">
                <h2 class="font-semibold text-lg">
                  ${data.area.name}
                </h2>
                <span class="text-gray">
                  ${[...this._areaValues(data), `${data.cards.length} ${translateEngine(this._hass, 'entity.title_plural')}`].join(" · ")}
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
                    ${this._areaViewGroupingMode() == 'client' ? html`
                      ${!this.areaViewDisplayGrouped ? html `
                        <ha-dropdown-item
                          .ddValue=${true}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                          ${translateEngine(this._hass, 'entity.group')}
                        </ha-dropdown-item>` : html `
                        <ha-dropdown-item
                          .ddValue=${false}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                          ${translateEngine(this._hass, 'entity.ungroup')}
                        </ha-dropdown-item>
                        `
                      }
                    ` : ""}
                    ${this._hass.user.is_admin ? html`
                      ${this.areaViewEditMode ? html `
                        <ha-dropdown-item
                          .ddValue=${false}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                          ${translateEngine(this._hass, 'global.disable_edit_mode')}
                        </ha-dropdown-item>` : html `
                        <ha-dropdown-item
                          .ddValue=${true}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                          ${translateEngine(this._hass, 'global.enable_edit_mode')}
                        </ha-dropdown-item>
                        `
                      }
                    ` : ""}
                </ha-dropdown>
              </div>
            </div>

            ${this.areaViewEditMode ? html `
            <ha-card class="card-actions-centered">
              <ha-button
                .area=${data.area.area_id}
                .key=${"disabled"}
                .ddValue=${true}
                title=${switchDescription(this._hass, "disabled", false)}
                @click=${this._handleAreaDisableAllEntitiesClicked}
              >
                ${translateEngine(this._hass, 'entity.disable_all')}
              </ha-button>
              <ha-button
                .area=${data.area.area_id}
                .key=${"hidden"}
                .ddValue=${true}
                title=${switchDescription(this._hass, "hidden", false)}
                @click=${this._handleAreaDisableAllEntitiesClicked}
              >
                ${translateEngine(this._hass, 'entity.hide_all')}
              </ha-button>
            </ha-card>

            <button type="button"
              @click=${this._addLovelaceCard}
              .area=${data.area.area_id}
              .areaName=${data.area.name}
              .position=${"top"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>` : "" }

            ${this._renderAreaViewCustomCards(data, "top", hass)}

            ${this._renderAreaViewCards(data, hass)}

            ${this._renderAreaViewCustomCards(data, "bottom", hass)}

            ${this.areaViewEditMode ? html `
              ${data.entitiesNoState.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'entity.unavailable')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${repeat(data.entitiesNoState, (entity) => entity, (entity) => this._renderAreaViewEntityCard(entity, 'noState'))}
                  </div>
                </div>` : ""
              }
              ${data.entitiesHidden.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'entity.hidden')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${repeat(data.entitiesHidden, (entity) => entity, (entity) => this._renderAreaViewEntityCard(entity, 'hidden'))}
                  </div>
                </div>` : ""
              }
              ${data.entitiesDisabled.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass,'entity.disabled')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${repeat(data.entitiesDisabled, (entity) => entity, (entity) => this._renderAreaViewEntityCard(entity, 'disabled'))}
                  </div>
                </div>` : ""
              }
            `: ""}

            ${this.areaViewEditMode ? html `
            <button type="button"
              @click=${this._addLovelaceCard}
              .area=${data.area.area_id}
              .areaName=${data.area.name}
              .position=${"bottom"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>` : "" }
          </div>`;
    }
};
