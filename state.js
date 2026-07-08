// ======================================
// STATE.JS
// Stato unico Roller Score
// Versione: Alpha 0.0.6
// ======================================

export const appState = {
  version: "0.0.6",

  races: [],
  athletes: [],
  settings: null,

  currentRaceId: null,
  currentAthleteId: null,
};

export function setInitialState({ races, athletes, settings, currentRaceId }) {
  appState.races = races;
  appState.athletes = athletes;
  appState.settings = settings;
  appState.currentRaceId = currentRaceId;

  const race = getCurrentRace();
  const startingAthlete = getStartingAthlete(race);

  appState.currentAthleteId = startingAthlete?.id || null;
}

export function getCurrentRace() {
  return (
    appState.races.find((race) => race.id === appState.currentRaceId) || null
  );
}

export function getCurrentAthlete() {
  const race = getCurrentRace();

  if (!race) return null;

  return (
    race.athletes.find((athlete) => athlete.id === appState.currentAthleteId) ||
    null
  );
}

export function setCurrentRaceId(raceId) {
  appState.currentRaceId = raceId;

  const race = getCurrentRace();
  const startingAthlete = getStartingAthlete(race);

  appState.currentAthleteId = startingAthlete?.id || null;
}

export function setCurrentAthleteId(athleteId) {
  appState.currentAthleteId = athleteId;
}

export function getStartingAthlete(race) {
  if (!race || !race.athletes.length) return null;

  return (
    race.athletes.find((athlete) => athlete.status === "current") ||
    race.athletes.find((athlete) => athlete.status === "todo") ||
    race.athletes.find((athlete) => athlete.status === "missing") ||
    race.athletes[0]
  );
}

export function getFavoriteAthlete() {
  const race = getCurrentRace();

  if (!race) return null;

  return (
    race.athletes.find(
      (athlete) => athlete.id === appState.settings?.favoriteAthleteId
    ) ||
    race.athletes.find((athlete) => athlete.isFavorite) ||
    null
  );
}

export function getAthletePosition(athleteId) {
  const race = getCurrentRace();

  if (!race) return null;

  const index = race.athletes.findIndex((athlete) => athlete.id === athleteId);

  if (index === -1) return null;

  return index + 1;
}
