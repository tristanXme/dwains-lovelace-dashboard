"use strict";

// Code only edit mode needs, loaded on first use. Webpack writes each
// import() below to its own file in js/chunks/ with a content hash in the
// name, so browsers can cache them indefinitely.

// Tags defined by ./editors.js.
function isEditorTag(tag) {
  return typeof tag === "string"
    && (tag.startsWith("dwains-edit-") || tag.startsWith("dwains-create-") || tag.startsWith("dwains-card-"));
}

// A failed load is forgotten so the next attempt can retry, e.g. after a
// connection drop. After an update a page still running the old bundle
// asks for chunk files that no longer exist; reloading the page fixes that.
function once(load) {
  let pending;
  return () => {
    pending ||= load().catch((error) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}

const loadEditors = once(() => import(/* webpackChunkName: "editors" */ "./editors.js"));

const loadSortable = once(() => import(
  /* webpackChunkName: "sortable" */ "sortablejs/modular/sortable.complete.esm.js"
).then((module) => module.default));

module.exports = { isEditorTag, loadEditors, loadSortable };
