"use strict";

const { formatValueWithUnit } = require("./value-format");

/** @typedef {{entity_id: string, state: string, attributes: Record<string, any>}} HassEntity */

function averageEntityStates(
  data,
  domain,
  deviceClass,
  /** @type {{isAvailable?: (entity: HassEntity) => boolean, locale?: string}} */
  { isAvailable = () => true, locale } = {},
) {
  const entities = data?.[domain];
  if (!entities) return undefined;

  let unit;
  const values = entities
    .filter((entity) => !deviceClass
      || entity.attributes.device_class === deviceClass)
    .filter((entity) => {
      if (
        !isAvailable(entity)
        || !entity.attributes.unit_of_measurement
        || Number.isNaN(Number(entity.state))
      ) {
        return false;
      }
      if (!unit) {
        unit = entity.attributes.unit_of_measurement;
        return true;
      }
      return entity.attributes.unit_of_measurement === unit;
    });

  if (!values.length) return undefined;
  const sum = values.reduce((total, entity) => total + Number(entity.state), 0);
  return formatValueWithUnit(sum / values.length, unit, locale);
}

function countActiveEntities(
  data,
  domain,
  deviceClass,
  { unavailableStates, statesOff },
) {
  const entities = data?.[domain];
  if (!entities) return undefined;
  return entities
    .filter((entity) => !deviceClass
      || entity.attributes.device_class === deviceClass)
    .filter((entity) => !unavailableStates.includes(entity.state)
      && !statesOff.includes(entity.state))
    .length;
}

function localizedClimateState(
  data,
  domain,
  { hass, unavailableStates, statesOff },
) {
  const entities = data?.[domain];
  if (!entities) return undefined;
  const labels = [];

  for (const climate of entities) {
    const action = climate.attributes.hvac_action;
    const temperature = climate.attributes.temperature;
    const target = temperature
      ? ` (${formatValueWithUnit(Number(temperature), hass.config.unit_system.temperature, hass.locale?.language || hass.language)})`
      : "";
    if (action && action !== "idle") {
      const actionLabel = hass.localize(`component.climate.entity_component._.state_attributes.hvac_action.state.${action}`)
        || hass.localize(`state_attributes.climate.hvac_action.${action}`)
        || action;
      labels.push(actionLabel + target);
    } else if (
      !action
      && !unavailableStates.includes(climate.state)
      && !statesOff.includes(climate.state)
    ) {
      labels.push(hass.localize(`component.climate.state._.${climate.state}`) + target);
    }
  }
  return labels.join(", ");
}

function groupEntityStatesByDomain(entityIds, {
  states,
  excludedEntities = {},
  domainGroups,
  deviceClasses,
  sensorDeviceClasses,
  registryEntities,
  unavailableStates = [],
}) {
  const entitiesByDomain = {};
  const supportedDomains = new Set(Object.values(domainGroups).flat());

  for (const entityId of entityIds) {
    if (
      excludedEntities[entityId]?.excluded
      || excludedEntities[entityId]?.hidden_in_area
    ) continue;
    const separator = entityId.indexOf(".");
    if (separator === -1) continue;
    const domain = entityId.slice(0, separator);
    if (!supportedDomains.has(domain)) continue;

    const state = states[entityId];
    if (!state) continue;
    const constrained = domainGroups.sensor.includes(domain)
      || domainGroups.alert.includes(domain)
      || domainGroups.cover.includes(domain);
    const allowedDeviceClasses = domainGroups.sensor.includes(domain)
      ? sensorDeviceClasses
      : deviceClasses[domain];
    if (
      constrained
      && !allowedDeviceClasses.includes(state.attributes.device_class || "")
    ) {
      continue;
    }
    (entitiesByDomain[domain] ||= []).push(state);
  }
  if (entitiesByDomain.lock && entitiesByDomain.binary_sensor) {
    const lockDevices = lockDeviceIds(entitiesByDomain.lock, registryEntities, unavailableStates);
    entitiesByDomain.binary_sensor = entitiesByDomain.binary_sensor
      .filter((state) => !isLockSensorOfLock(state, registryEntities, lockDevices));
  }
  return entitiesByDomain;
}

function isEntityHiddenInArea(entityConfig) {
  return entityConfig?.hidden_in_area === true;
}

// Devices of the given lock entities that are counted (available).
function lockDeviceIds(lockStates, registryEntities, unavailableStates = []) {
  const deviceIds = new Set();
  for (const lock of lockStates) {
    const deviceId = registryEntities?.[lock?.entity_id]?.device_id;
    if (deviceId && !unavailableStates.includes(lock.state)) deviceIds.add(deviceId);
  }
  return deviceIds;
}

// Some integrations add a lock binary sensor to a lock device. It reports
// the same lock again, so while that lock entity is counted (lockDevices,
// from lockDeviceIds) the sensor is not. A lock entity left out of the
// dashboard leaves its sensor counted.
function isLockSensorOfLock(stateObj, registryEntities, lockDevices) {
  if (
    !lockDevices.size
    || !stateObj?.entity_id?.startsWith("binary_sensor.")
    || stateObj.attributes?.device_class !== "lock"
  ) {
    return false;
  }
  const deviceId = registryEntities?.[stateObj.entity_id]?.device_id;
  return Boolean(deviceId) && lockDevices.has(deviceId);
}

module.exports = {
  averageEntityStates,
  countActiveEntities,
  groupEntityStatesByDomain,
  isEntityHiddenInArea,
  isLockSensorOfLock,
  localizedClimateState,
  lockDeviceIds,
};
