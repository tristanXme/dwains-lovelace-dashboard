import { popUp } from "../dwains-popup";
import { fireEvent } from "../card-tools-compat";
const { loadSortable } = require('../lazy-modules');
import translateEngine from '../translate-engine';
import { showSaveError } from '../save-error-toast';
const { savingSortableOptions } = require('../sortable-save');
const { closeParentDropdown } = require('../dropdown-controller');
const { entitySettingsFromConfiguration } = require('../entity-settings-config');

// Menu actions and edit dialogs of the devices page, and drag sorting in edit mode.
export const DeviceEditActionsMixin = (Base) => class extends Base {
    _addLovelaceCard(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const domain = ev.currentTarget.domain;
      const position = ev.currentTarget.position;

      this._popupOpens.schedule(() => {
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'device.add_card_to') + domain, {
          type: "custom:dwains-create-custom-card-card",
          domain: domain,
          position: position,
          page: "devices"
        }, true, '');
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
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'entity.edit_entity'), {
          type: "custom:dwains-edit-entity-card",
          ...settings,
        }, false, '');
      });
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
        fireEvent("hass-more-info", {entityId: ""}, this);
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
        cardConfig = {input_name: friendlyName,input_entity: entityId, ...this.configuration['entities_popup'][entityId]};
        mode = "editor-element";
      }


      this._popupOpens.schedule(() => {
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'entity.edit_entity_popup_card'), {
          type: "custom:dwains-edit-entity-popup-card",
          entity_id: entityId,
          cardConfig: cardConfig,
          mode: mode,
          existingCardEdit: cardConfig ? true : false,
        }, true, '');
      });
    }

    _handleDeviceEditClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const device = ev.currentTarget.device;
      const icon = ev.currentTarget.device_icon;
      const showInNavbar = ev.currentTarget.showInNavbar;
      this._popupOpens.schedule(() => {
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'device.edit_device_button'), {
          type: "custom:dwains-edit-device-button-card",
          device: device,
          icon: icon,
          showInNavbar: showInNavbar,
        }, false, '');
      });
    }

    _handleCustomCardEditClick(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const domain = ev.currentTarget.domain;
      const filename = ev.currentTarget.filename;

      const colSpan = ev.currentTarget.colSpan;
      const rowSpan = ev.currentTarget.rowSpan;
      const colSpanLg = ev.currentTarget.colSpanLg;
      const rowSpanLg = ev.currentTarget.rowSpanLg;
      const colSpanXl = ev.currentTarget.colSpanXl;
      const rowSpanXl = ev.currentTarget.rowSpanXl;

      // Keep the shared configuration snapshot immutable while preparing
      // the editor-only card data.
      const cardConfig = structuredClone(
        this.configuration.device_cards[domain][filename],
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
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(this._hass.localize("ui.components.entity.entity-picker.edit"), {
          type: "custom:dwains-create-custom-card-card",
          domain: domain,
          page: "devices",
          mode: "editor-element",
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

    _handleDeviceEditBoolValueClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const device = ev.currentTarget.device;
      const key = ev.currentTarget.key;
      const value = ev.currentTarget.ddValue;

      this._hass.callWS({
        type: 'dwains_dashboard/edit_device_bool_value',
        device: device,
        key: key,
        value: value,
      }).catch((err) => showSaveError(this._hass, err));
    }

    _handleDeviceEditCardClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const domain = ev.currentTarget.domain;

      let cardConfig, mode;
      if(this.configuration['devices_card'] && this.configuration['devices_card'][domain]){
        cardConfig = this.configuration['devices_card'][domain];
        mode = 'current-selected-blueprint';
      }

      this._popupOpens.schedule(() => {
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'device.edit_device_card')+translateEngine(this._hass, 'device.'+domain), {
          type: "custom:dwains-edit-device-card-card",
          domain: domain,
          cardConfig: cardConfig,
          existingCardEdit: cardConfig ? true : false,
          mode: mode,
        }, true, '');
      });
    }

    _handleDeviceEditPopupClick(ev) {
      closeParentDropdown(ev);
      ev.stopPropagation();
      const domain = ev.currentTarget.domain;

      let cardConfig, mode;
      if(this.configuration['devices_popup'] && this.configuration['devices_popup'][domain]){
        cardConfig = this.configuration['devices_popup'][domain];
        mode = 'current-selected-blueprint';
      }

      this._popupOpens.schedule(() => {
        fireEvent("hass-more-info", {entityId: ""}, this);
        popUp(translateEngine(this._hass, 'device.edit_device_popup')+translateEngine(this._hass, 'device.'+domain), {
          type: "custom:dwains-edit-device-popup-card",
          domain: domain,
          cardConfig: cardConfig,
          existingCardEdit: cardConfig ? true : false,
          mode: mode,
        }, true, '');
      });
    }


    /**
     * Handle when area button is moved
     * @param {evt} evt
     */
    _handleDeviceEditModeClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const value = ev.currentTarget.ddValue;

      if(value){
        const cardHass = this._hass;
        this._attachSortables('#sortable', 'data-device', () => this.deviceEditMode,
          (order) => cardHass.callWS({ type: 'dwains_dashboard/sort_device_button', sortData: JSON.stringify(order) }));
      } else {
        this._destroySortables();
      }
      this.deviceEditMode = value;
    }

    _handleDeviceViewEditModeClicked(ev){
      closeParentDropdown(ev);
      ev.stopPropagation();
      const value = ev.currentTarget.ddValue;

      if(value){
        const cardHass = this._hass;
        const sortType = (this.deviceViewDisplayGrouped ? 'devices_grouped_sort_order' : 'devices_sort_order');
        this._attachSortables('.sortable', 'data-entity', () => this.deviceViewEditMode,
          (order) => cardHass.callWS({ type: 'dwains_dashboard/sort_entity', sortData: JSON.stringify(order), sortType: sortType }));
      } else {
        this._destroySortables();
      }
      this.deviceViewEditMode = value;
    }

    // Sortable is loaded on first use, so isActive() tells whether the
    // edit mode is still on once it has arrived. save(order) stores the
    // order after a drag; a failure is shown and the drag undone.
    async _attachSortables(selector, dataIdAttr, isActive, save){
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
        ...savingSortableOptions(save, (err) => showSaveError(cardHass, err)),
      }));
    }

    _destroySortables(){
      if(this._sortable){
        this._sortable.forEach(sortElement => sortElement.destroy());
        this._sortable = undefined;
      }
    }
};
