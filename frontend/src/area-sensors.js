"use strict";

/**
 * Values shown below an area name: averages per configured sensor device
 * class plus explicitly selected sensor entities.
 *
 * An explicit sensor is shown only on the tile of its own area. When it has
 * a device class whose average is shown, it replaces that average in this
 * area, so a user can pick "the" temperature sensor of a room instead of
 * averaging every temperature sensor in it.
 */
function collectAreaSensorValues({
  areaId,
  deviceClasses,
  average,
  explicitEntityIds,
  states,
  unavailableStates,
  belongsToArea,
  displayName,
}) {
  const explicit = [];
  for (const entityId of explicitEntityIds || []) {
    if (!entityId?.startsWith("sensor.") || !belongsToArea(entityId, areaId)) continue;
    const entity = states[entityId];
    if (!entity || unavailableStates.includes(entity.state)) continue;
    explicit.push(entity);
  }

  const values = [];
  const shownExplicit = new Set();
  for (const deviceClass of deviceClasses) {
    const chosen = explicit.filter(
      (entity) => entity.attributes.device_class === deviceClass,
    );
    if (chosen.length) {
      for (const entity of chosen) {
        values.push(formatSensor(entity, displayName));
        shownExplicit.add(entity.entity_id);
      }
      continue;
    }
    const value = average(deviceClass);
    if (value) values.push(value);
  }
  for (const entity of explicit) {
    if (!shownExplicit.has(entity.entity_id)) {
      values.push(formatSensor(entity, displayName));
    }
  }
  return values;
}

function numericValue(entity) {
  if (entity.state === "" || entity.state === null) return undefined;
  const value = Number(entity.state);
  return Number.isFinite(value) ? value : undefined;
}

function formatSensor(entity, displayName) {
  const unit = entity.attributes.unit_of_measurement;
  const value = numericValue(entity);
  // Same compact form as the averages ("21.5°C"); text states need the name
  // for context ("Regen: Dry").
  if (value !== undefined && unit) return `${Math.round(value * 10) / 10}${unit}`;
  const state = value !== undefined ? String(value) : entity.state;
  return `${displayName(entity.entity_id)}: ${unit ? `${state}${unit}` : state}`;
}

module.exports = { collectAreaSensorValues };
