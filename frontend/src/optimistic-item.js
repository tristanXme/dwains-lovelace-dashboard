"use strict";

// An edit action that takes something out of a list (hide, disable, show
// again, enable) hides it at once instead of after the save and the rebuild
// that follows. A failed save shows it again. Whether it really leaves its
// list only the rebuild knows (an entity hidden and disabled stays in the
// list of disabled ones when it is shown again), so after each rebuild the
// page calls showSettledItems() to show what is still listed.
const SAVING = "ddSaving";

function hideWhileSaving(elements, save) {
  const hidden = [...(elements || [])].filter(Boolean);
  for (const element of hidden) {
    element.style.display = "none";
    element.dataset[SAVING] = "";
  }
  const settle = () => {
    for (const element of hidden) delete element.dataset[SAVING];
  };
  return Promise.resolve()
    .then(save)
    .then(
      (result) => {
        settle();
        return result;
      },
      (error) => {
        settle();
        for (const element of hidden) element.style.display = "";
        throw error;
      },
    );
}

// The list item ([data-dd-item]) of the clicked action.
function hideItemWhileSaving(target, save) {
  return hideWhileSaving([target?.closest?.("[data-dd-item]")], save);
}

// After a rebuild: items hidden by a finished save that are still listed.
function showSettledItems(root) {
  for (const element of root?.querySelectorAll?.("[data-dd-item]") || []) {
    if (element.style.display === "none" && !(SAVING in element.dataset)) {
      element.style.display = "";
    }
  }
}

module.exports = { hideItemWhileSaving, hideWhileSaving, showSettledItems };
