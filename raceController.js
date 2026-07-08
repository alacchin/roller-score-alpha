// ======================================
// RACECONTROLLER.JS
// Gestione gara e selezione atleta
// Versione: Alpha 0.0.6
// ======================================

import {
  getCurrentRace,
  getCurrentAthlete,
  getStartingAthlete,
  setCurrentAthleteId,
} from "./state.js";

import { showScreen } from "./navigation.js";
import { render } from "./renderer.js";

export function startRace() {
  const race = getCurrentRace();

  if (!race) return;

  const startingAthlete = getStartingAthlete(race);

  if (!startingAthlete) return;

  setCurrentAthleteId(startingAthlete.id);
  render();
  showScreen("score-entry-screen");
}

export function selectAthleteById(athleteId) {
  const race = getCurrentRace();

  if (!race) return;

  const athlete = race.athletes.find((item) => item.id === athleteId);

  if (!athlete) return;

  setCurrentAthleteId(athlete.id);
  render();
  showScreen("score-entry-screen");
}

export function goToPreviousAthlete() {
  const previousAthlete = getRelativeAthlete(-1);

  if (!previousAthlete) return;

  setCurrentAthleteId(previousAthlete.id);
  render();
}

export function goToNextAthlete() {
  const nextAthlete = getRelativeAthlete(1);

  if (!nextAthlete) return;

  setCurrentAthleteId(nextAthlete.id);
  render();
}

function getRelativeAthlete(direction) {
  const race = getCurrentRace();
  const currentAthlete = getCurrentAthlete();

  if (!race || !currentAthlete) return null;

  const currentIndex = race.athletes.findIndex(
    (athlete) => athlete.id === currentAthlete.id
  );

  if (currentIndex === -1) return null;

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= race.athletes.length) {
    return null;
  }

  return race.athletes[nextIndex];
}
