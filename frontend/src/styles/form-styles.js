// A checkbox or switch with its text, replacing ha-formfield (which Home
// Assistant is phasing out). Clicking the text toggles the control.
export const checkRowStyles = (css) => css`
  .dd-check {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0.6rem 0;
    padding-inline-start: 0.25rem;
    cursor: pointer;
    color: var(--primary-text-color);
  }
`;

// Click handler for a .dd-check row. Not every HA release toggles its
// checkbox or switch when a <label> forwards the click, so do it here and
// fire the same change event a direct click would.
export function toggleCheckRow(ev) {
  const control = ev.currentTarget.querySelector("ha-checkbox, ha-switch");
  if (!control || control.disabled) return;
  if (ev.composedPath().includes(control)) return;
  ev.preventDefault();
  control.checked = !control.checked;
  control.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}
