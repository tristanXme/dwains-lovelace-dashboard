import translateEngine from './translate-engine';

// Name of a device type (an entity domain): the dashboard's own string, else
// Home Assistant's name for the domain ("Datum/Uhrzeit"), else the domain
// itself, so a type the dashboard does not know is not called "unknown".
export function deviceTypeName(hass, domain) {
  return translateEngine(hass, `device.${domain}`, undefined, '')
    || hass?.localize?.(`component.${domain}.entity_component._.name`)
    || hass?.localize?.(`component.${domain}.title`)
    || String(domain).replace(/_/g, ' ');
}
