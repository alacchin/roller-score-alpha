// ======================================
// STORAGE.JS
// Gestione LocalStorage Roller Score
// Versione: v0.0.5
// ======================================

import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./config.js";

function readJson(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Errore lettura LocalStorage: ${key}`, error);
    return fallbackValue;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Errore scrittura LocalStorage: ${key}`, error);
  }
}

export function getRaces() {
  return readJson(STORAGE_KEYS.races, []);
}

export function saveRaces(races) {
  writeJson(STORAGE_KEYS.races, races);
}

export function getAthletes() {
  return readJson(STORAGE_KEYS.athletes, []);
}

export function saveAthletes(athletes) {
  writeJson(STORAGE_KEYS.athletes, athletes);
}

export function getSettings() {
  return readJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function getActiveRaceId() {
  return localStorage.getItem(STORAGE_KEYS.activeRaceId);
}

export function setActiveRaceId(raceId) {
  localStorage.setItem(STORAGE_KEYS.activeRaceId, raceId);
}

export function clearRollerScoreStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
