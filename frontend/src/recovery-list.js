import { css, html } from 'lit';
import { mdiCog } from '@mdi/js';
import translateEngine from './translate-engine';
import { switchDescription } from './entity-menu';
import { showSaveError } from './save-error-toast';
const { entityRecoveryActions } = require('./entity-settings-config');
const { hideWhileSaving } = require('./optimistic-item');
const { switchesToRestore } = require('./bulk-switch');

// The lists of cards that left an area view, a device type or the favorites
// (unavailable, hidden, disabled), shown in edit mode on the homepage and the
// devices page. `host` is the page: its strings, configuration and actions.

// "Alle wieder anzeigen" / "Alle wieder aktivieren": every card of the list
// leaves it at once.
function restoreAll(host, ev) {
  const { entities, keys } = ev.currentTarget;
  const switches = switchesToRestore(entities, host.configuration, keys);
  if (!switches.length) return;
  const cards = [...(ev.currentTarget.closest('.dd-recovery-list')?.querySelectorAll('[data-dd-item]') || [])];
  hideWhileSaving(cards, () => Promise.all(switches.map(({ key, entities }) => host._hass.callWS({
    type: 'dwains_dashboard/edit_entities_bool_value',
    entities: JSON.stringify(entities),
    key,
    value: false,
  })))).catch((err) => showSaveError(host._hass, err));
}

// The heading of a list, with its button that brings all cards back (from two
// cards on).
export function renderRecoveryListHeader(host, title, button, entities, keys) {
  return html`
    <div class="flex justify-between items-center dd-recovery-header">
      <h3 class="font-semibold capitalize text-gray">${translateEngine(host._hass, title)}</h3>
      ${entities.length > 1 ? html`
        <ha-button
          appearance="plain"
          .entities=${entities}
          .keys=${keys}
          @click=${(ev) => restoreAll(host, ev)}
        >
          ${translateEngine(host._hass, button)}
        </ha-button>` : ""}
    </div>
  `;
}

// A card of a list: the entity's name and id, the switches that bring it back
// and its settings.
export function renderRecoveryCard(host, entity, type) {
  const recoveryActions = entityRecoveryActions(host.configuration, entity, type);
  return html`
    <div data-dd-item>
      <ha-card class="p-2">
        <span class="break-words font-semibold">${host._entityDisplayName(entity)}</span><br>
        <span class="break-words text-gray text-sm">${entity}</span>
      </ha-card>
      <ha-card>
        <div class="card-actions">
          ${recoveryActions.map((action) => html`
            <ha-button
              .entity="${entity}"
              .key=${action.key}
              .ddValue=${false}
              title=${switchDescription(host._hass, action.key, true)}
              @click=${host._handleEntityEditBoolValueClick}
            >
              ${translateEngine(host._hass, action.translationKey)}
            </ha-button>
          `)}
          <ha-button
            .entity="${entity}"
            @click=${host._handleUnavailableEntityEditClick}
          >
            <ha-svg-icon .path=${mdiCog}></ha-svg-icon>
            ${translateEngine(host._hass, 'entity.settings')}
          </ha-button>
        </div>
      </ha-card>
    </div>
  `;
}

export const recoveryListStyles = css`
  .dd-recovery-header {
    gap: 0.5rem;
  }
  .dd-recovery-header ha-button {
    flex-shrink: 0;
  }
`;
