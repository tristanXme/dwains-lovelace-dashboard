"use strict";

// An edit action that takes something out of a list (hide, disable, exclude,
// show again, enable) hides it at once instead of after the save and the
// rebuild that follows; that rebuild removes it for good. A failed save
// shows it again.
function hideWhileSaving(elements, save) {
  const hidden = [...(elements || [])].filter(Boolean);
  for (const element of hidden) element.style.display = "none";
  return Promise.resolve()
    .then(save)
    .catch((error) => {
      for (const element of hidden) element.style.display = "";
      throw error;
    });
}

// The list item ([data-dd-item]) of the clicked action.
function hideItemWhileSaving(target, save) {
  return hideWhileSaving([target?.closest?.("[data-dd-item]")], save);
}

module.exports = { hideItemWhileSaving, hideWhileSaving };
