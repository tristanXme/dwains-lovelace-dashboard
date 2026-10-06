"use strict";

// Sortable options that save the order after a drag. Saves run one after
// the other. When the save of the newest drag fails, the items go back to
// the last order the backend confirmed, so the page never shows an order
// that is not saved. A failure of an older drag is left alone: the newer
// drag saves the whole order again.
function savingSortableOptions(save, onError) {
  let saved;
  let latest = 0;
  let queue = Promise.resolve();
  return {
    onStart() {
      if (!saved) saved = this.toArray();
    },
    onEnd() {
      const sortable = this;
      const order = sortable.toArray();
      const drag = ++latest;
      queue = queue
        .then(() => save(order))
        .then(
          () => {
            saved = order;
          },
          (error) => {
            if (drag !== latest) return;
            onError(error);
            if (saved) sortable.sort(saved, true);
          },
        );
      return queue;
    },
  };
}

module.exports = { savingSortableOptions };
