import { html } from 'lit';
import { mdiDotsVertical } from "@mdi/js";
import { DOMAIN_ICONS } from '../variables';
import translateEngine from '../translate-engine';

// The overview of device type buttons on the devices page.
export const DeviceButtonsMixin = (Base) => class extends Base {
    _renderDeviceButtonCard(domain, type) {
      return html`
        <div>
          <ha-card class="p-2">
            <span class="break-words">
            ${translateEngine(this._hass, 'device.'+domain)}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              <ha-button
                .device="${domain}"
                .key=${"hidden"}
                .ddValue=${false}
                @click=${this._handleDeviceEditBoolValueClick}
              >
                ${translateEngine(this._hass, 'device.unhide')}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `;
    }

_renderDeviceButton(data){
  //console.log(data.domain);
  const deviceDomain = data.domain || "unknown";
  const deviceIcon = this.configuration['devices'][deviceDomain] && this.configuration['devices'][deviceDomain]['icon']
    ? this.configuration['devices'][deviceDomain]['icon']
    : (DOMAIN_ICONS[deviceDomain] ? DOMAIN_ICONS[deviceDomain] : DOMAIN_ICONS["unknown"]);
  return html`
    <div class="relative" data-device='${deviceDomain}'>
      <div
        class="flex justify-between h-44 p-3 device-button ${this.selectedDevice == deviceDomain && !this.configuration['homepage_header']['v2_mode'] ? 'current' : ''}"
        data-device=${deviceDomain}
        @click=${this._handleDeviceClick}
      >
        <div class="h-full flex flex-wrap content-between">
          <div class="w-full ha-icon">
            ${deviceIcon ? html`
              <ha-icon
                class="h-14 w-14"
                style="color: var(--primary-color);"
                .icon=${deviceIcon}
              ></ha-icon>` : ""}
          </div>
          <div class="w-full">
            <h3 class="font-semibold text-lg capitalize">${translateEngine(this._hass, 'device.'+deviceDomain)}</h3>
          </div>
        </div>
            <div class="row-span-2 text-right space-y-0.5 info">

            </div>
          </div>
          ${this.deviceEditMode ? html`
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
                  .device=${deviceDomain}
                  .device_icon=${deviceIcon}
                  .showInNavbar=${this.configuration['devices'][deviceDomain] && this.configuration['devices'][deviceDomain]['show_in_navbar'] ? this.configuration['devices'][deviceDomain]['show_in_navbar'] : ""}
                  @click=${this._handleDeviceEditClick}
                    >
                      <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                      ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                    </ha-dropdown-item>

                    <ha-dropdown-item
                  .domain=${deviceDomain}
                  @click="${this._handleDeviceEditCardClick}"
                    >
                      <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                      ${translateEngine(this._hass, 'entity.entity_card')}
                    </ha-dropdown-item>
                    <ha-dropdown-item
                  .domain=${deviceDomain}
                  @click="${this._handleDeviceEditPopupClick}"
                    >
                      <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                      ${translateEngine(this._hass, 'entity.popup_card')}
                    </ha-dropdown-item>
                    <ha-dropdown-item
                  .device=${deviceDomain}
                  .key=${"hidden"}
                      .ddValue=${true}
                      @click=${this._handleDeviceEditBoolValueClick}
                    >
                      <ha-icon slot="icon" .icon=${"mdi:eye-off"}></ha-icon>
                      ${translateEngine(this._hass, 'device.hide')}
                    </ha-dropdown-item>
                </ha-dropdown>
              </div>
            </ha-card>
            ` : ""
          }
        </div>
      `;
    }

	        _hideUnavailableEntitiesEnabled(){
	          return !!(this.configuration && this.configuration.homepage_header && this.configuration.homepage_header.hide_unavailable_entities);
	        }

	        _filterUnavailableCards(cards){
	          if(this.deviceViewEditMode || !this._hideUnavailableEntitiesEnabled()){
	            return cards;
	          }
	          return cards.filter((card) => {
	            const stateObj = this._hass.states[card.entity];
	            return !(stateObj && stateObj.state === "unavailable");
	          });
	        }

	        _renderDeviceViewCards(data){
	          const cards = this._filterUnavailableCards(data.cards);
	          if(!this.deviceViewDisplayGrouped || data.domain == 'person' || data.domain == 'weather' || data.domain == 'alarm_control_panel'){
	            cards.sort(function (x, y) {
	              let a = x.sort_order,
	                  b = y.sort_order;
	              return a == b ? 0 : a > b ? 1 : -1;
	            });

	            return html`
	            <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable">
	              ${cards.map((i) =>
	                html`${this._renderDeviceViewCard(i)}`
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
          r[a.area.area_id] = [...r[a.area.area_id] || [], a];
          return r;
         }, {});

         //console.log(1, group);

         let sortedGroup = Object.keys(group).sort((x,y) => {
          let a = (this.configuration['areas'][x] && this.configuration['areas'][x]['sort_order'] ? this.configuration['areas'][x] : 1),
              b = (this.configuration['areas'][y] && this.configuration['areas'][y]['sort_order'] ? this.configuration['areas'][y] : 1);
          return a == b ? 0 : a > b ? 1 : -1;
         });

         //sortedGroup.map(input => );

         //console.log(2,test);

        //  group.sort(function(x,y) {
        //    console.log(x);
        //   let a = x,
        //       b = y;
        //   return a == b ? 0 : a > b ? 1 : -1;
        //  });


        return html`
        <div>
        ${sortedGroup.map((key) =>
          html`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${group[key][0].area.name}</h3>
              <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable">
              ${Object.entries(group[key]).map(([k,v]) => html`${this._renderDeviceViewCard(v)}`)}
              </div>
            </div>
          `
        )}
        </div>
        `;
      }
    }
};
