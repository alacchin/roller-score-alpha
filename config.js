// ======================================
// CONFIG.JS
// Configurazione Roller Score
// Alpha 0.0.7
// ======================================

export const APP_CONFIG = {
  appName: "Roller Score",

  // Cambia questo numero ogni volta che vuoi
  // ripartire con dati demo puliti.
  version: "0.0.7-reset-02",

  storagePrefix: "rollerScoreAlpha007Reset02",
};

export const STORAGE_KEYS = {
  races: `${APP_CONFIG.storagePrefix}:races`,
  athletes: `${APP_CONFIG.storagePrefix}:athletes`,
  settings: `${APP_CONFIG.storagePrefix}:settings`,
  activeRaceId: `${APP_CONFIG.storagePrefix}:activeRaceId`,
};

export const DEFAULT_RACE_ID = "race-001";

export const SCORE_STATUS = {
  TODO: "todo",
  CURRENT: "current",
  COMPLETED: "completed",
  MISSING: "missing",
};

export const DEFAULT_SETTINGS = {
  favoriteAthleteId: "athlete-003",

  scoringMethod: "sum_all",

  theme: "dark",
};
