const STORAGE_KEYS = {
  races: "roller-score-races",
  athletes: "roller-score-athletes",
  activeRaceId: "roller-score-active-race-id",
  settings: "roller-score-settings"
};

/*
==================================================
FUNZIONI GENERICHE
==================================================
*/

function readJson(key, fallbackValue) {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(
      `Errore durante la lettura di "${key}" dal dispositivo:`,
      error
    );

    return fallbackValue;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      `Errore durante il salvataggio di "${key}" sul dispositivo:`,
      error
    );

    return false;
  }
}

/*
==================================================
GARE
==================================================
*/

export function getRaces() {
  const races = readJson(
    STORAGE_KEYS.races,
    []
  );

  return Array.isArray(races)
    ? races
    : [];
}

export function saveRaces(races) {
  const normalizedRaces = Array.isArray(races)
    ? races
    : [];

  return writeJson(
    STORAGE_KEYS.races,
    normalizedRaces
  );
}

export function getRaceById(raceId) {
  return (
    getRaces().find(
      (race) => race.id === raceId
    ) || null
  );
}

export function saveRace(race) {
  if (!race?.id) {
    console.error(
      "Impossibile salvare la gara: ID mancante."
    );

    return false;
  }

  const races = getRaces();

  const existingRaceIndex =
    races.findIndex(
      (item) => item.id === race.id
    );

  if (existingRaceIndex >= 0) {
    races[existingRaceIndex] = race;
  } else {
    races.push(race);
  }

  return saveRaces(races);
}

export function deleteRace(raceId) {
  const remainingRaces =
    getRaces().filter(
      (race) => race.id !== raceId
    );

  const saved = saveRaces(
    remainingRaces
  );

  if (
    getActiveRaceId() === raceId
  ) {
    setActiveRaceId(
      remainingRaces[0]?.id || null
    );
  }

  return saved;
}

/*
==================================================
ARCHIVIO ATLETE
==================================================
*/

export function getAthletes() {
  const athletes = readJson(
    STORAGE_KEYS.athletes,
    []
  );

  return Array.isArray(athletes)
    ? athletes
    : [];
}

export function saveAthletes(athletes) {
  const normalizedAthletes =
    Array.isArray(athletes)
      ? athletes
      : [];

  return writeJson(
    STORAGE_KEYS.athletes,
    normalizedAthletes
  );
}

export function getAthleteById(
  athleteId
) {
  return (
    getAthletes().find(
      (athlete) =>
        athlete.id === athleteId
    ) || null
  );
}

export function findAthleteByNameAndClub(
  name,
  club = ""
) {
  const normalizedName =
    String(name || "")
      .trim()
      .toLocaleLowerCase("it-IT");

  const normalizedClub =
    String(club || "")
      .trim()
      .toLocaleLowerCase("it-IT");

  return (
    getAthletes().find(
      (athlete) =>
        String(athlete.name || "")
          .trim()
          .toLocaleLowerCase("it-IT") ===
          normalizedName &&
        String(athlete.club || "")
          .trim()
          .toLocaleLowerCase("it-IT") ===
          normalizedClub
    ) || null
  );
}

export function saveAthlete(
  athlete
) {
  if (!athlete?.id) {
    console.error(
      "Impossibile salvare l'atleta: ID mancante."
    );

    return false;
  }

  const athletes = getAthletes();

  const existingAthleteIndex =
    athletes.findIndex(
      (item) =>
        item.id === athlete.id
    );

  if (existingAthleteIndex >= 0) {
    athletes[existingAthleteIndex] =
      athlete;
  } else {
    athletes.push(athlete);
  }

  return saveAthletes(athletes);
}

export function deleteAthlete(
  athleteId
) {
  const remainingAthletes =
    getAthletes().filter(
      (athlete) =>
        athlete.id !== athleteId
    );

  return saveAthletes(
    remainingAthletes
  );
}

/*
==================================================
GARA ATTIVA
==================================================
*/

export function getActiveRaceId() {
  return localStorage.getItem(
    STORAGE_KEYS.activeRaceId
  );
}

export function setActiveRaceId(
  raceId
) {
  try {
    if (!raceId) {
      localStorage.removeItem(
        STORAGE_KEYS.activeRaceId
      );

      return true;
    }

    localStorage.setItem(
      STORAGE_KEYS.activeRaceId,
      raceId
    );

    return true;
  } catch (error) {
    console.error(
      "Errore durante il salvataggio della gara attiva:",
      error
    );

    return false;
  }
}

/*
==================================================
IMPOSTAZIONI
==================================================
*/

export function getSettings() {
  return readJson(
    STORAGE_KEYS.settings,
    {
      theme: "dark",
      version: "0.2"
    }
  );
}

export function saveSettings(
  settings
) {
  return writeJson(
    STORAGE_KEYS.settings,
    settings || {}
  );
}

/*
==================================================
BACKUP E RIPRISTINO
==================================================
*/

export function createLocalBackup() {
  return {
    version: "0.2",
    createdAt:
      new Date().toISOString(),
    races: getRaces(),
    athletes: getAthletes(),
    activeRaceId:
      getActiveRaceId(),
    settings: getSettings()
  };
}

export function restoreLocalBackup(
  backup
) {
  if (!backup) {
    return false;
  }

  const racesSaved = saveRaces(
    backup.races || []
  );

  const athletesSaved =
    saveAthletes(
      backup.athletes || []
    );

  const settingsSaved =
    saveSettings(
      backup.settings || {}
    );

  setActiveRaceId(
    backup.activeRaceId || null
  );

  return (
    racesSaved &&
    athletesSaved &&
    settingsSaved
  );
}

/*
==================================================
RESET DATI TEST
==================================================
*/

export function clearAllData() {
  try {
    Object.values(
      STORAGE_KEYS
    ).forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error(
      "Errore durante la cancellazione dei dati:",
      error
    );

    return false;
  }
}