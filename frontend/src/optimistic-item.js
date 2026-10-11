"use strict";

// Hides the card or row of a clicked action (hide, disable, exclude, show
// again) at once instead of after the save and the rebuild that follows;
// that rebuild removes it for good. A failed save shows it again.
function hideItemWhileSaving(target, save) {
  const item = target?.closest?.("[data-dd-item]");
  if (item) item.style.display = "none";
  return Promise.resolve()
    .then(save)
    .catch((error) => {
      if (item) item.style.display = "";
      throw error;
    });
}

module.exports = { hideItemWhileSaving };
