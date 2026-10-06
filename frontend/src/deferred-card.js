"use strict";

// Cards of the previous build by what they show. A rebuild after a change
// (an entity hidden, a card edited) keeps every card whose configuration
// stayed the same instead of creating all cards again, which also fetched
// every graph's history again. Each card is used for one item only.
class CardReuse {
  constructor() {
    this._previous = new Map();
    this._current = new Map();
    this.generation = 0;
  }

  // Before building the items of a new build.
  startBuild() {
    this._previous = this._current;
    this._current = new Map();
    this.generation += 1;
  }

  take(key) {
    const card = this._previous.get(key)?.shift();
    if (card) this.keep(key, card, this.generation);
    return card;
  }

  // A card created for an item of an earlier build is not shown anymore:
  // it must not stand in for the card a later build shows.
  keep(key, card, generation) {
    if (generation !== this.generation) return;
    const cards = this._current.get(key);
    if (cards) cards.push(card);
    else this._current.set(key, [card]);
  }
}

// Where a card is shown and its configuration; undefined when the
// configuration cannot be compared.
function cardReuseKey(slot, config) {
  try {
    return `${slot}|${JSON.stringify(config)}`;
  } catch {
    return undefined;
  }
}

function attachDeferredCard(item, createCard, { reuse, key } = {}) {
  if (!item || typeof createCard !== "function") {
    throw new TypeError("Deferred cards require an item and a card factory");
  }

  const reusable = reuse && key !== undefined;
  const generation = reusable ? reuse.generation : undefined;
  const reused = reusable ? reuse.take(key) : undefined;
  if (reused) item.card = reused;

  let inFlight;
  item.cardFactory = () => {
    if (item.card) return Promise.resolve(item.card);
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(createCard)
        .then((card) => {
          item.card = card;
          inFlight = undefined;
          if (reusable && card) reuse.keep(key, card, generation);
          return card;
        })
        .catch((error) => {
          inFlight = undefined;
          throw error;
        });
    }
    return inFlight;
  };
  return item;
}

module.exports = { CardReuse, attachDeferredCard, cardReuseKey };
