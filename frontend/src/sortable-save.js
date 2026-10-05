"use strict";

// Sortable options that save the order after a drag. When saving fails the
// items are put back where they were before the drag, so the page never
// shows an order that is not saved.
function savingSortableOptions(save, onError) {
  let before;
  return {
    onStart() {
      before = this.toArray();
    },
    onEnd() {
      const sortable = this;
      const previous = before;
      return Promise.resolve()
        .then(() => save(sortable.toArray()))
        .catch((error) => {
          onError(error);
          if (previous) sortable.sort(previous, true);
        });
    },
  };
}

module.exports = { savingSortableOptions };
