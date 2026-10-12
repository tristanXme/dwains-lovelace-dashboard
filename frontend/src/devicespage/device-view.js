import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { mdiDotsVertical, mdiCog } from "@mdi/js";
import { clientPreferences } from '../client-preferences';
import translateEngine from '../translate-engine';
import { deviceTypeName } from '../device-type-name';
const { closeParentDropdown } = require('../dropdown-controller');
const { entityRecoveryActions } = require('../entity-settings-config');
import { renderEntityMenuItems, renderEntityStateHint } from '../entity-menu';

// The page of one device type: its entities, grouped by area or not, and custom cards.
export const DeviceViewMixin = (Base) => class extends Base {
    _renderDeviceViewCard(data){
      return html`
      <div
        data-dd-item
        data-entity='${data.entity}'
        class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative"
      >
	            <div>
	              <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${this._hass}></dd-lazy-card>
	            </div>
        ${this.deviceViewEditMode ? html`
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

    _renderDeviceViewCustomCards(data, position){
      return html`
      <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 my-4">
        ${repeat(position == "bottom" ? data.customCardsBottom : data.customCardsTop, (i) => i.filename, (i) => this._renderDeviceViewCustomCard(i))}
      </div>
      `;
    }
    _renderDeviceViewCustomCard(data){
      return html`
	          <div class="col-span-${data.colSpan} row-span-${data.rowSpan} lg-col-span-${data.colSpanLg} lg-row-span-${data.rowSpanLg} xl-col-span-${data.colSpanXl} xl-row-span-${data.rowSpanXl} relative">
	            <div>
	              <dd-lazy-card .card=${data.card} .cardFactory=${data.cardFactory} .hass=${this._hass}></dd-lazy-card>
	            </div>
        ${this.deviceViewEditMode ? html`
        <ha-card>
          <div class="card-actions">
            <ha-button
              @click=${this._handleCustomCardEditClick}
              .domain=${data.domain}
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


    _handleDeviceViewDisplayGroupedClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();

      const value = ev.currentTarget.ddValue;
      this.deviceViewDisplayGrouped = value;
      clientPreferences.set('dwains_dashboard_deviceViewDisplayGrouped', value);
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

    _renderDeviceView(data){

      if(this.selectedDevice != data.domain){
        return html``;
      }

        const visible = this.selectedDevice == data.domain ? "block" : "hidden";

        return html`
          <div class="w-full mb-12 ${visible}" id="${data.domain}">
            <div class="dd-detail-view-header flex justify-between">
              <div class="dd-detail-view-title">
                <h2 class="font-semibold text-lg capitalize">
                  ${deviceTypeName(this._hass, data.domain)}
                </h2>
                <span class="text-gray">
                  ${data.cards.length} ${translateEngine(this._hass, 'entity.title_plural')}
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
                    ${!this.deviceViewDisplayGrouped ? html `
                      <ha-dropdown-item
                        .ddValue=${true}
                        .key=${"deviceViewDisplayGrouped"}
                        @click="${this._handleDeviceViewDisplayGroupedClicked}"
                      >
                        <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                        ${translateEngine(this._hass, 'device.group')}
                      </ha-dropdown-item>` : html `
                      <ha-dropdown-item
                        .ddValue=${false}
                        .key=${"deviceViewDisplayGrouped"}
                        @click="${this._handleDeviceViewDisplayGroupedClicked}"
                      >
                        <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                        ${translateEngine(this._hass, 'device.ungroup')}
                      </ha-dropdown-item>
                      `
                    }
                    ${this._hass.user.is_admin ? html`
                      ${this.deviceViewEditMode ? html `
                        <ha-dropdown-item
                          .ddValue=${false}
                          @click=${this._handleDeviceViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${mdiCog}></ha-svg-icon>
                          ${translateEngine(this._hass, 'global.disable_edit_mode')}
                        </ha-dropdown-item>` : html `
                        <ha-dropdown-item
                          .ddValue=${true}
                          @click=${this._handleDeviceViewEditModeClicked}
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
            ${this.deviceViewEditMode ? html `
            <button type="button"
              @click=${this._addLovelaceCard}
              .domain=${data.domain}
              .position=${"top"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>` : "" }

            ${this._renderDeviceViewCustomCards(data, "top")}

            ${this._renderDeviceViewCards(data)}

            ${this._renderDeviceViewCustomCards(data, "bottom")}

            ${this.deviceViewEditMode ? html `
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
                  <h3 class="font-semibold capitalize text-gray">${translateEngine(this._hass, 'entity.disabled')}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${repeat(data.entitiesDisabled, (entity) => entity, (entity) => this._renderAreaViewEntityCard(entity, 'disabled'))}
                  </div>
                </div>` : ""
              }
            `: ""}

            ${this.deviceViewEditMode ? html `
            <button type="button"
              @click=${this._addLovelaceCard}
              .domain=${data.domain}
              .position=${"bottom"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
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
