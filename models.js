// ======================================
// MODELS.JS
// Modelli dati principali Roller Score
// Versione: v0.0.5
// ======================================

import { SCORE_STATUS } from "./config.js";

export function createAthlete({
  id,
  order,
  name,
  club,
  isFavorite = false,
  notes = [],
  previousResults = [],
  status = SCORE_STATUS.TODO,
  scores = null,
}) {
  return {
    id,
    order,
    name,
    club,
    isFavorite,
    notes,
    previousResults,
    status,
    scores,
  };
}

export function createRace({
  id,
  name,
  federation,
  discipline,
  category,
  location,
  date,
  startTime,
  minutesPerAthlete,
  athletes = [],
}) {
  return {
    id,
    name,
    federation,
    discipline,
    category,
    location,
    date,
    startTime,
    minutesPerAthlete,
    athletes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createScore({
  technical = [],
  artistic = [],
  penalty = null,
  note = "",
}) {
  return {
    technical,
    artistic,
    penalty,
    note,
    savedAt: new Date().toISOString(),
  };
}
