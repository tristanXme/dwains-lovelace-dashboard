import { css, html } from 'lit';
import translateEngine from './translate-engine';
const { emptyStateTexts } = require('./empty-state');

// The message a page shows instead of its tiles when it has none.
export function renderEmptyState(hass, page, reason) {
  const texts = emptyStateTexts(page, reason);
  if (!texts) return '';
  return html`
    <div class="dd-empty-state" data-reason=${reason}>
      <ha-icon .icon=${texts.icon}></ha-icon>
      <h3>${translateEngine(hass, texts.title)}</h3>
      <p>${translateEngine(hass, texts.hint)}</p>
    </div>
  `;
}

export const emptyStateStyles = css`
  .dd-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    text-align: center;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--card-background-color);
    color: var(--secondary-text-color);
  }
  .dd-empty-state ha-icon {
    --mdc-icon-size: 40px;
    color: var(--secondary-text-color);
  }
  .dd-empty-state h3 {
    margin: 0;
    color: var(--primary-text-color);
    font-size: 1rem;
    font-weight: 600;
  }
  .dd-empty-state p {
    margin: 0;
    max-width: 28rem;
    font-size: 0.875rem;
  }
`;
