"use strict";

// The values below an area name in the area dialog: per sensor type shown
// as an average, the area's sensors of that type and the one chosen instead
// of the average (none: the average); every other chosen sensor is an extra
// value. All of it is one list in areas.yaml (sensor_entities).

function areaSensorChoices({ deviceClasses, areaSensorIds, chosenIds, deviceClassOf }) {
  const typed = new Set(deviceClasses);
  // A chosen sensor that left the area stays selectable.
  const candidates = [...new Set([...areaSensorIds, ...chosenIds])];
  const types = deviceClasses
    .map((deviceClass) => ({
      deviceClass,
      sensors: candidates.filter((entityId) => deviceClassOf(entityId) === deviceClass),
      chosen: chosenIds.find((entityId) => deviceClassOf(entityId) === deviceClass),
    }))
    .filter((type) => type.sensors.length);
  return {
    types,
    extras: chosenIds.filter((entityId) => !typed.has(deviceClassOf(entityId))),
    extraCandidates: candidates.filter((entityId) => !typed.has(deviceClassOf(entityId))),
  };
}

// The list with `entityId` chosen for a type, or none (the average).
function chooseTypeSensor(chosenIds, deviceClass, entityId, deviceClassOf) {
  const others = chosenIds.filter((id) => deviceClassOf(id) !== deviceClass);
  return entityId ? [...others, entityId] : others;
}

// The list with `extras` as the extra values; the choices per type stay.
function chooseExtraSensors(chosenIds, extras, deviceClasses, deviceClassOf) {
  const typed = new Set(deviceClasses);
  return [...chosenIds.filter((id) => typed.has(deviceClassOf(id))), ...extras];
}

module.exports = { areaSensorChoices, chooseExtraSensors, chooseTypeSensor };
