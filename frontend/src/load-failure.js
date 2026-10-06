"use strict";

// Code or strings that are loaded on demand (edit dialogs, drag and drop,
// other languages) and fail to arrive. After an update a page still running
// the old bundle asks for files that no longer exist; the handler set by the
// bundle tells the user to reload the page.

let handler = () => {};

function setLoadFailureHandler(next) {
  handler = next;
}

function reportLoadFailure(error) {
  try {
    handler(error);
  } catch (handlerError) {
    console.error("Dwains Dashboard: failed to report a load failure", handlerError);
  }
}

module.exports = { reportLoadFailure, setLoadFailureHandler };
