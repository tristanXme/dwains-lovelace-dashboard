export const WEATHER_ICONS = {
    "clear-night": "mdi:weather-night",
    cloudy: "mdi:weather-cloudy",
    overcast: "mdi:weather-cloudy-arrow-right",
    fog: "mdi:weather-fog",
    hail: "mdi:weather-hail",
    lightning: "mdi:weather-lightning",
    "lightning-rainy": "mdi:weather-lightning-rainy",
    partlycloudy: "mdi:weather-partly-cloudy",
    pouring: "mdi:weather-pouring",
    rainy: "mdi:weather-rainy",
    snowy: "mdi:weather-snowy",
    "snowy-rainy": "mdi:weather-snowy-rainy",
    sunny: "mdi:weather-sunny",
    windy: "mdi:weather-windy",
    "windy-variant": "mdi:weather-windy-variant",
  };

export const ALARM_ICONS = {
    "armed_away": "mdi:shield-lock",
    "armed_vacation": "mdi:shield-airplane",
    "armed_home": "mdi:shield-home",
    "armed_night": "mdi:shield-moon",
    "armed_custom_bypass": "mdi:security",
    "pending": "mdi:shield-outline",
    "triggered": "mdi:bell-ring",
    disarmed: "mdi:shield-off",
  };

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

export const STATES_OFF = ["closed", "locked", "off", "docked","idle","standby","paused","auto"];

export const UNAVAILABLE_STATES = ["unavailable","unknown"];

export const SENSOR_DOMAINS = ["sensor"];

export const ALERT_DOMAINS = ["binary_sensor"];

export const COVER_DOMAINS = ["cover"];

export const TOGGLE_DOMAINS = ["light", "switch", "fan"];

export const CLIMATE_DOMAINS = ["climate"];

export const OTHER_DOMAINS = ["vacuum", "media_player", "lock", "valve", "humidifier", "lawn_mower", "siren"];

export const DEVICE_CLASSES = {
    sensor: ["temperature", "humidity"],
    // Safety first, then openings, then presence and the rest; this is the
    // order of the badges on the area tile.
    binary_sensor: [
      "smoke", "carbon_monoxide", "gas", "moisture", "problem", "safety",
      "door", "window", "opening", "garage_door", "lock",
      "motion", "occupancy", "presence", "vibration", "running",
    ],
    cover: ["garage","shutter"],
  };

// Status text of a badge in the house status bar: "2 open", "1 detected".
export const OPEN_DEVICE_CLASSES = ["door", "window", "opening", "garage_door", "lock"];
export const DETECTED_DEVICE_CLASSES = ["smoke", "carbon_monoxide", "gas", "moisture", "problem", "safety"];

export const DEVICE_ICONS = {

  };

export const DOMAIN_STATE_ICONS = {
    light: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
    switch: { on: "mdi:power-plug", off: "mdi:power-plug" },
    fan: { on: "mdi:fan", off: "mdi:fan-off" },
    sensor: { humidity: "mdi:water-percent", temperature: "mdi:thermometer" },
    binary_sensor: {
      motion: "mdi:motion-sensor",
      occupancy: "mdi:home-account",
      presence: "mdi:motion-sensor",
      door: "mdi:door-open",
      window: "mdi:window-open-variant",
      opening: "mdi:square-outline",
      garage_door: "mdi:garage-open",
      // A sensor that reports a lock open, unlike a lock you can operate.
      lock: "mdi:shield-lock-open",
      vibration: "mdi:vibrate",
      moisture: "mdi:water-alert",
      smoke: "mdi:smoke-detector-variant-alert",
      carbon_monoxide: "mdi:molecule-co",
      gas: "mdi:gas-cylinder",
      problem: "mdi:alert-circle",
      safety: "mdi:shield-alert",
      running: "mdi:play",
    },
    cover: {
      garage: "mdi:garage",
      shutter: "mdi:window-shutter",
    },
    vacuum: { on: "mdi:robot-vacuum" },
    media_player: { on: "mdi:cast-connected" },
    lock: { on: "mdi:lock-open-variant" },
    valve: { on: "mdi:valve-open" },
    humidifier: { on: "mdi:air-humidifier" },
    lawn_mower: { on: "mdi:robot-mower" },
    siren: { on: "mdi:bullhorn" },
    climate: { on: "mdi:thermostat"},
  };

  export const DOMAIN_ICONS = {
    light: "mdi:lightbulb",
    climate: "mdi:thermostat",
    switch: "mdi:power-plug",
    fan: "mdi:fan",
    sensor: "mdi:eye",
    humidity: "mdi:water-percent",
    temperature: "mdi:thermometer",
    binary_sensor: "mdi:radiobox-blank",
    motion: "mdi:motion-sensor",
    occupancy: "mdi:home-account",
    presence: "mdi:motion-sensor",
    door: "mdi:door-open",
    window: "mdi:window-open-variant",
    vibration: "mdi:vibrate",
    moisture: "mdi:water-alert",
    vacuum: "mdi:robot-vacuum",
    media_player: "mdi:cast-connected",
    camera: "mdi:video",
    cover: "mdi:window-shutter",
    remote: "mdi:remote",
    scene: "mdi:palette",
    number: "mdi:ray-vertex",
    button: "mdi:gesture-tap-button",
    water_heater: "mdi:thermometer",
    select: "mdi:format-list-bulleted",
    lock: "mdi:lock",
    device_tracker: "mdi:radar",
    person: "mdi:account-multiple",
    weather: "mdi:weather-cloudy",
    automation: "mdi:robot-outline",
    alarm_control_panel: "mdi:shield-home",
    siren: "mdi:alarm-light-outline",
    valve: "mdi:valve",
    humidifier: "mdi:air-humidifier",
    lawn_mower: "mdi:robot-mower",
    unknown: "mdi:help-circle-outline",
    text: "mdi:format-text",
    event: "mdi:calendar-clock",
    update: "mdi:cloud-upload",
    script: "mdi:file-document-outline",
    time: "mdi:clock-outline",
    input_boolean: "mdi:toggle-switch",
    group: "mdi:account-group",
    input_datetime: "mdi:calendar-clock",
    tts: "mdi:volume-high",
    zone: "mdi:map-marker-radius",
  };

  export const SUPPORTED_CARDS_WITH_ENTITY = [
    "button",
    "calendar",
    "entity",
    "gauge",
    "history-graph",
    "light",
    "media-control",
    "picture-entity",
    "sensor",
    "thermostat",
    "weather-forecast",
    "custom:button-card",
    "custom:mushroom-fan-card",
    "custom:mushroom-cover-card",
    "custom:mushroom-entity-card",
    "custom:mushroom-light-card",
  ];
