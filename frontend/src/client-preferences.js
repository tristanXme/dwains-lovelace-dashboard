import Cookies from "js-cookie";

// Per-browser view preferences. They used to be cookies, which the browser
// attached to every request sent to Home Assistant; localStorage keeps them
// local. A value still stored as a cookie is migrated on first read.
function storage() {
  try {
    return window.localStorage;
  } catch (_error) {
    return undefined;
  }
}

export const clientPreferences = {
  get(key) {
    const store = storage();
    let value;
    try {
      value = store?.getItem(key) ?? undefined;
    } catch (_error) {
      value = undefined;
    }
    if (value !== undefined) return value;

    const legacy = Cookies.get(key);
    if (legacy !== undefined) {
      this.set(key, legacy);
      if (store) Cookies.remove(key);
    }
    return legacy;
  },

  set(key, value) {
    try {
      const store = storage();
      if (store) {
        store.setItem(key, String(value));
        return;
      }
    } catch (_error) {
      // Private mode or blocked storage: fall back to the old cookie.
    }
    Cookies.set(key, value, { expires: 365 });
  },
};
