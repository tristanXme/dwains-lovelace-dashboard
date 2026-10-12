"use strict";

// Deleting a more page, a card, a popup or a blueprint removes its files
// without a backup, so a stray click must not do it: ask first. Without a
// confirm dialog (no browser window) the action goes ahead as before.

function confirmDelete(name, { translate, confirm = globalThis.confirm }) {
  const message = name
    ? translate("global.confirm_delete_named").replace("{name}", name)
    : translate("global.confirm_delete");
  if (typeof confirm !== "function") return true;
  return Boolean(confirm(message));
}

module.exports = { confirmDelete };
