import { mdiArrowLeft, mdiDotsVertical, mdiCog } from '@mdi/js';
import { html } from 'lit';
import translateEngine from '../translate-engine';
const { entityRecoveryActions } = require('../entity-settings-config');

// Area detail view: entity cards, custom cards and grouping by domain.
export const AreaViewMixin = (Base) => class extends Base {
    _renderAreaViewCustomCards(data, position){
      return html`
      <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 my-4">
        ${position == "bottom" ?  data.customCardsBottom.map((i) =>
          html`${this._renderAreaViewCustomCard(i)}`
        ) : data.customCardsTop.map((i) =>
          html`${this._renderAreaViewCustomCard(i)}`
        )}
      </div>
      `;
    }
	    _renderAreaViewCustomCard(data){
	      return html`
	      <div class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative">
	        <div>
	          <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${this._hass}></dd-lazy-card>
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

	    _renderAreaViewCards(data){
	      const cards = this._filterUnavailableCards(data.cards);
	      if(!this.areaViewDisplayGrouped){
	        cards.sort(function (x, y) {
	          let a = x.sort_order,
	              b = y.sort_order;
	          return a == b ? 0 : a > b ? 1 : -1;
	        });

	        return html`
	        <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this.areaViewEditMode ? "" : "dd-masonry"}">
	          ${cards.map((i) =>
	            html`${this._renderAreaViewCard(i)}`
	          )}
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
        ${sortedGroup.map((key) =>
          html`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'device.'+key)}</h3>
              <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this.areaViewEditMode ? "" : "dd-masonry"}">
                ${Object.entries(group[key]).map(([k,v]) => html`${this._renderAreaViewCard(v)}`)}
              </div>
            </div>
          `
        )}
        </div>
        `;
      }
    }
    _renderEntityAreaVisibilityAction(entity) {
      const hiddenInArea = this.configuration?.entities?.[entity]?.hidden_in_area === true;
      return html`
        <ha-list-item
          graphic="icon"
          @click=${(ev) => this._handleEntityAreaVisibilityClick(
            ev,
            entity,
            !hiddenInArea,
          )}
        >
          <div slot="graphic">
            <ha-icon .icon=${hiddenInArea ? "mdi:eye" : "mdi:eye-off"}></ha-icon>
          </div>
          ${translateEngine(
            this._hass,
            hiddenInArea ? 'entity.unhide_in_area' : 'entity.hide_in_area',
          )}
        </ha-list-item>
      `;
    }

    _renderAreaViewCard(data){
      return html`
	      <div
	        data-entity='${data.entity}'
	        class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative"
	      >
	        <div>
	          <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${this._hass}></dd-lazy-card>
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
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              corner="BOTTOM_START"
              absolute
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${mdiDotsVertical}
                slot="trigger"
              ></ha-icon-button>
                <ha-list-item
                  graphic="icon"
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
                  <div slot="graphic">
                    <ha-icon .icon=${"mdi:cog"}></ha-icon>
                  </div>
                  ${translateEngine(this._hass, 'entity.settings')}
                </ha-list-item>
                ${data.entity != 't' ? html `
                  <ha-list-item
                    graphic="icon"
                    .entity="${data.entity}"
                    @click="${this._handleEntityEditCardClick}"
                  >
                    <div slot="graphic">
                      <ha-icon .icon=${"mdi:pencil"}></ha-icon>
                    </div>
                    ${translateEngine(this._hass, 'entity.entity_card')}
                  </ha-list-item>` : ""
                }
                ${data.entity != 't' ? html `
                  <ha-list-item
                    graphic="icon"
                    .entity="${data.entity}"
                    @click="${this._handleEntityEditPopupClick}"
                  >
                    <div slot="graphic">
                      <ha-icon .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                    </div>
                    ${translateEngine(this._hass, 'entity.popup_card')}
                  </ha-list-item>` : ""
                }
                ${!data.isFavorite ? html `
                  <ha-list-item
                    graphic="icon"
                    .entity="${data.entity}"
                    @click="${this._handleEntityAddToFavoritesClick}"
                  >
                    <div slot="graphic">
                      <ha-icon .icon=${"mdi:tag-heart"}></ha-icon>
                    </div>
                    ${translateEngine(this._hass, 'entity.add_to_favorites')}
                  </ha-list-item>` : ""
                }
                <ha-list-item
                  graphic="icon"
                  .entity="${data.entity}"
                  .key=${"excluded"}
                  .value=${true}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <div slot="graphic">
                    <ha-icon .icon=${"mdi:table-eye-off"}></ha-icon>
                  </div>
                  ${translateEngine(this._hass, 'entity.exclude')}
                </ha-list-item>
                <ha-list-item
                  graphic="icon"
                  .entity="${data.entity}"
                  .key=${"hidden"}
                  .value=${true}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <div slot="graphic">
                    <ha-icon .icon=${"mdi:eye-off"}></ha-icon>
                  </div>
                  ${translateEngine(this._hass, 'entity.hide')}
                </ha-list-item>
                ${this._renderEntityAreaVisibilityAction(data.entity)}
                <ha-list-item
                  graphic="icon"
                  .entity="${data.entity}"
                  .key=${"disabled"}
                  .value=${true}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <div slot="graphic">
                    <ha-icon .icon=${"mdi:tray-remove"}></ha-icon>
                  </div>
                  ${translateEngine(this._hass, 'entity.disable')}
                </ha-list-item>
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
        <div>
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
                  .value=${false}
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
                  corner="BOTTOM_START"
                  absolute
                >
                  <ha-icon-button
                    label=${this._hass.localize("ui.common.overflow_menu")}
                    .path=${mdiDotsVertical}
                    slot="trigger"
                  ></ha-icon-button>
                    ${this._areaViewGroupingMode() == 'client' ? html`
                      ${!this.areaViewDisplayGrouped ? html `
                        <ha-list-item
                          graphic="icon"
                          .value=${true}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <div slot="graphic">
                            <ha-icon .icon=${"mdi:format-list-group"}></ha-icon>
                          </div>
                          ${translateEngine(this._hass, 'entity.group')}
                        </ha-list-item>` : html `
                        <ha-list-item
                          graphic="icon"
                          .value=${false}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <div slot="graphic">
                          <ha-icon .icon=${"mdi:grid"}></ha-icon>
                          </div>
                          ${translateEngine(this._hass, 'entity.ungroup')}
                        </ha-list-item>
                        `
                      }
                    ` : ""}
                    ${this._hass.user.is_admin ? html`
                      ${this.areaViewEditMode ? html `
                        <ha-list-item
                          graphic="icon"
                          .value=${false}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <div slot="graphic">
                            <ha-svg-icon .path=${mdiCog}></ha-svg-icon>
                          </div>
                          ${translateEngine(this._hass, 'global.disable_edit_mode')}
                        </ha-list-item>` : html `
                        <ha-list-item
                          graphic="icon"
                          .value=${true}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <div slot="graphic">
                            <ha-svg-icon .path=${mdiCog}></ha-svg-icon>
                          </div>
                          ${translateEngine(this._hass, 'global.enable_edit_mode')}
                        </ha-list-item>
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
                .value=${true}
                @click=${this._handleAreaDisableAllEntitiesClicked}
              >
                ${translateEngine(this._hass, 'entity.disable_all')}
              </ha-button>
              <ha-button
                .area=${data.area.area_id}
                .key=${"hidden"}
                .value=${true}
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

            ${this._renderAreaViewCustomCards(data, "top")}

            ${this._renderAreaViewCards(data)}

            ${this._renderAreaViewCustomCards(data, "bottom")}

            ${this.areaViewEditMode ? html `
              ${data.entitiesNoState.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'entity.unavailable')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${data.entitiesNoState.map((entity) =>
                      html`${this._renderAreaViewEntityCard(entity, 'noState')}`
                  )}
                  </div>
                </div>` : ""
              }
              ${data.entitiesHidden.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'entity.hidden')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${data.entitiesHidden.map((entity) =>
                      html`${this._renderAreaViewEntityCard(entity, 'hidden')}`
                  )}
                  </div>
                </div>` : ""
              }
              ${data.entitiesDisabled.length ? html`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass,'entity.disabled')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${data.entitiesDisabled.map((entity) =>
                      html`${this._renderAreaViewEntityCard(entity, 'disabled')}`
                  )}
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
