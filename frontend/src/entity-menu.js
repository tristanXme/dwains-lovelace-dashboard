import { css, html } from 'lit';
import translateEngine from './translate-engine';
import { showSaveError } from './save-error-toast';
const { closeParentDropdown } = require('./dropdown-controller');

// The menu of an entity's card in edit mode, the same in the area views and
// on the devices page: what to edit, then where the card shows and whether
// it counts, then disabling. A switch that is on offers its opposite.
// `host` is the page card; its handlers save the settings. `data` is the
// card's entry, with the spans it shows (a camera's default is 2).
export function renderEntityMenuItems(host, data) {
  const entity = data.entity;
  const hass = host._hass;
  const configured = host.configuration?.entities?.[entity] || {};
  const t = (key) => translateEngine(hass, key);
  return html`
    <ha-dropdown-item
      .entity=${entity}
      .rowSpan=${data.rowSpan}
      .colSpan=${data.colSpan}
      .rowSpanLg=${data.rowSpanLg}
      .colSpanLg=${data.colSpanLg}
      .rowSpanXl=${data.rowSpanXl}
      .colSpanXl=${data.colSpanXl}
      @click=${host._handleEntityEditClick}
    >
      <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
      ${t('entity.settings')}
    </ha-dropdown-item>
    <ha-dropdown-item .entity=${entity} @click=${host._handleEntityEditCardClick}>
      <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
      ${t('entity.entity_card')}
    </ha-dropdown-item>
    <ha-dropdown-item .entity=${entity} @click=${host._handleEntityEditPopupClick}>
      <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
      ${t('entity.popup_card')}
    </ha-dropdown-item>
    <ha-dropdown-item @click=${(ev) => saveFavorite(ev, hass, entity, !configured.favorite)}>
      <ha-icon slot="icon" .icon=${configured.favorite ? "mdi:heart-minus-outline" : "mdi:heart-plus-outline"}></ha-icon>
      ${t(configured.favorite ? 'entity.remove_from_favorites' : 'entity.add_to_favorites')}
    </ha-dropdown-item>
    <wa-divider></wa-divider>
    <ha-dropdown-item
      .entity=${entity}
      .key=${"hidden"}
      .ddValue=${!configured.hidden}
      @click=${host._handleEntityEditBoolValueClick}
    >
      <ha-icon slot="icon" .icon=${configured.hidden ? "mdi:eye" : "mdi:eye-off"}></ha-icon>
      ${t(configured.hidden ? 'entity.unhide' : 'entity.hide')}
    </ha-dropdown-item>
    ${renderEntityAreaVisibilityAction(host, entity)}
    <ha-dropdown-item
      .entity=${entity}
      .key=${"excluded"}
      .ddValue=${!configured.excluded}
      @click=${host._handleEntityEditBoolValueClick}
    >
      <ha-icon slot="icon" .icon=${configured.excluded ? "mdi:counter" : "mdi:numeric-off"}></ha-icon>
      ${t(configured.excluded ? 'entity.include' : 'entity.exclude')}
    </ha-dropdown-item>
    <wa-divider></wa-divider>
    <ha-dropdown-item
      .entity=${entity}
      .key=${"disabled"}
      .ddValue=${true}
      @click=${host._handleEntityEditBoolValueClick}
    >
      <ha-icon slot="icon" .icon=${"mdi:tray-remove"}></ha-icon>
      ${t('entity.disable')}
    </ha-dropdown-item>
  `;
}

// "Aus dem Bereich nehmen" / "Wieder in den Bereich aufnehmen"; also in the
// menu of a favorite.
export function renderEntityAreaVisibilityAction(host, entity) {
  const hiddenInArea = host.configuration?.entities?.[entity]?.hidden_in_area === true;
  return html`
    <ha-dropdown-item @click=${(ev) => host._handleEntityAreaVisibilityClick(ev, entity, !hiddenInArea)}>
      <ha-icon slot="icon" .icon=${hiddenInArea ? "mdi:home-import-outline" : "mdi:home-export-outline"}></ha-icon>
      ${translateEngine(host._hass, hiddenInArea ? 'entity.unhide_in_area' : 'entity.hide_in_area')}
    </ha-dropdown-item>
  `;
}

// In edit mode a card that is not counted says so; nothing else shows it.
export function renderEntityStateHint(host, entity) {
  if (!host.configuration?.entities?.[entity]?.excluded) return "";
  return html`
    <span class="dd-entity-hint">
      <ha-icon .icon=${"mdi:numeric-off"}></ha-icon>
      ${translateEngine(host._hass, 'entity.not_counted')}
    </span>
  `;
}

export const entityMenuStyles = css`
  .dd-entity-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin: auto 0.5rem;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    --mdc-icon-size: 1rem;
  }
`;

function saveFavorite(ev, hass, entityId, favorite) {
  closeParentDropdown(ev);
  ev.stopPropagation();
  hass.callWS({
    type: 'dwains_dashboard/edit_entity_favorite',
    entityId,
    favorite,
  }).catch((err) => showSaveError(hass, err));
}
