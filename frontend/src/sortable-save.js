"use strict";

// Sortable options that save the order after a drag. Saves run one after
// the other. When the save of the newest drag fails, the items go back to
// the last order the backend confirmed, so the page never shows an order
// that is not saved. A failure of an older drag is left alone: the newer
// drag saves the whole order again.
//
// With `applyOrder`, the page renders the order itself: lists rendered
// with lit's keyed repeat keep each card where lit put it, and a card that
// Sortable moved behind lit's back would end up in the wrong place on the
// next render. The drag is then undone in the DOM right away and
// applyOrder(order) shows the new order (and the saved one after a failure).
function savingSortableOptions(save, onError, { applyOrder } = {}) {
  let saved;
  let latest = 0;
  let queue = Promise.resolve();
  let origin;
  const show = (sortable, order) => {
    if (applyOrder) applyOrder(order);
    else sortable.sort(order, true);
  };
  return {
    onStart(evt) {
      if (!saved) saved = this.toArray();
      origin = applyOrder && evt?.item
        ? { item: evt.item, parent: evt.item.parentNode, next: evt.item.nextSibling }
        : undefined;
    },
    onEnd() {
      const sortable = this;
      const order = sortable.toArray();
      if (origin) {
        origin.parent?.insertBefore(origin.item, origin.next);
        origin = undefined;
        applyOrder(order);
      }
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
            if (saved) show(sortable, saved);
          },
        );
      return queue;
    },
  };
}

module.exports = { savingSortableOptions };
