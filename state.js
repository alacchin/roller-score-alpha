import {
  normalizeAthlete,
  normalizeRace
} from "./models.js";

/*
==================================================
STATO GLOBALE DELL'APP
==================================================
*/

export const appState = {
  version: "0.2",

  races: [],
  athletes: [],

  settings: {
    theme: "dark",
    version: "0.2"
  },

  currentRaceId: null,
  currentParticipantId: null,

  draftParticipants: []
};

/*
==================================================
INIZIALIZZAZIONE
==================================================
*/

export function setInitialState({
  races = [],
  athletes = [],
  settings = null,
  currentRaceId = null
}) {
  appState.races = Array.isArray(races)
    ? races.map(normalizeRace)
    : [];

  appState.athletes = Array.isArray(athletes)
    ? athletes.map(normalizeAthlete)
    : [];

  appState.settings =
    settings || {
      theme: "dark",
      version: "0.2"
    };

  const validCurrentRaceId =
    appState.races.some(
      (race) => race.id === currentRaceId
    )
      ? currentRaceId
      : appState.races[0]?.id || null;

  appState.currentRaceId =
    validCurrentRaceId;

  const currentRace =
    getCurrentRace();

  const startingParticipant =
    getStartingParticipant(
      currentRace
    );

  appState.currentParticipantId =
    startingParticipant?.id || null;

  appState.draftParticipants = [];
}

/*
==================================================
GARA ATTIVA
==================================================
*/

export function getCurrentRace() {
  return (
    appState.races.find(
      (race) =>
        race.id ===
        appState.currentRaceId
    ) || null
  );
}

export function setCurrentRaceId(
  raceId
) {
  const raceExists =
    appState.races.some(
      (race) =>
        race.id === raceId
    );

  appState.currentRaceId =
    raceExists
      ? raceId
      : null;

  const currentRace =
    getCurrentRace();

  const startingParticipant =
    getStartingParticipant(
      currentRace
    );

  appState.currentParticipantId =
    startingParticipant?.id || null;
}

export function addRaceToState(
  race
) {
  if (!race?.id) {
    return false;
  }

  const existingRaceIndex =
    appState.races.findIndex(
      (item) =>
        item.id === race.id
    );

  if (
    existingRaceIndex >= 0
  ) {
    appState.races[
      existingRaceIndex
    ] = normalizeRace(race);
  } else {
    appState.races.push(
      normalizeRace(race)
    );
  }

  return true;
}

export function removeRaceFromState(
  raceId
) {
  appState.races =
    appState.races.filter(
      (race) =>
        race.id !== raceId
    );

  if (
    appState.currentRaceId ===
    raceId
  ) {
    const nextRaceId =
      appState.races[0]?.id ||
      null;

    setCurrentRaceId(
      nextRaceId
    );
  }
}

/*
==================================================
PARTECIPANTI DELLA GARA
==================================================
*/

export function getParticipants(
  race = getCurrentRace()
) {
  if (!race) {
    return [];
  }

  return Array.isArray(
    race.participants
  )
    ? race.participants
    : [];
}

export function getCurrentParticipant() {
  return (
    getParticipants().find(
      (participant) =>
        participant.id ===
        appState.currentParticipantId
    ) || null
  );
}

export function setCurrentParticipantId(
  participantId
) {
  const participantExists =
    getParticipants().some(
      (participant) =>
        participant.id ===
        participantId
    );

  appState.currentParticipantId =
    participantExists
      ? participantId
      : null;
}

export function getStartingParticipant(
  race
) {
  const participants =
    getParticipants(race);

  if (
    participants.length === 0
  ) {
    return null;
  }

  return (
    participants.find(
      (participant) =>
        participant.status ===
        "current"
    ) ||
    participants.find(
      (participant) =>
        participant.status ===
        "todo"
    ) ||
    participants.find(
      (participant) =>
        participant.status ===
        "missing"
    ) ||
    participants[0]
  );
}

export function getFavoriteParticipant(
  race = getCurrentRace()
) {
  return (
    getParticipants(race).find(
      (participant) =>
        participant.isFavorite
    ) || null
  );
}

export function getParticipantPosition(
  participantId,
  race = getCurrentRace()
) {
  const index =
    getParticipants(race).findIndex(
      (participant) =>
        participant.id ===
        participantId
    );

  return index >= 0
    ? index + 1
    : null;
}

export function updateParticipantInCurrentRace(
  participantId,
  changes = {}
) {
  const race =
    getCurrentRace();

  if (!race) {
    return false;
  }

  const participantIndex =
    getParticipants(race).findIndex(
      (participant) =>
        participant.id ===
        participantId
    );

  if (
    participantIndex < 0
  ) {
    return false;
  }

  race.participants[
    participantIndex
  ] = {
    ...race.participants[
      participantIndex
    ],
    ...changes
  };

  race.updatedAt =
    new Date().toISOString();

  return true;
}

/*
==================================================
ARCHIVIO ATLETE
==================================================
*/

export function addAthleteToState(
  athlete
) {
  if (!athlete?.id) {
    return false;
  }

  const existingAthleteIndex =
    appState.athletes.findIndex(
      (item) =>
        item.id === athlete.id
    );

  if (
    existingAthleteIndex >= 0
  ) {
    appState.athletes[
      existingAthleteIndex
    ] = normalizeAthlete(
      athlete
    );
  } else {
    appState.athletes.push(
      normalizeAthlete(athlete)
    );
  }

  return true;
}

export function removeAthleteFromState(
  athleteId
) {
  appState.athletes =
    appState.athletes.filter(
      (athlete) =>
        athlete.id !==
        athleteId
    );
}

export function findAthleteInState(
  name,
  club = ""
) {
  const normalizedName =
    String(name || "")
      .trim()
      .toLocaleLowerCase(
        "it-IT"
      );

  const normalizedClub =
    String(club || "")
      .trim()
      .toLocaleLowerCase(
        "it-IT"
      );

  return (
    appState.athletes.find(
      (athlete) =>
        String(
          athlete.name || ""
        )
          .trim()
          .toLocaleLowerCase(
            "it-IT"
          ) ===
          normalizedName &&
        String(
          athlete.club || ""
        )
          .trim()
          .toLocaleLowerCase(
            "it-IT"
          ) ===
          normalizedClub
    ) || null
  );
}

/*
==================================================
PARTECIPANTI PROVVISORIE
==================================================
*/

export function getDraftParticipants() {
  return (
    appState.draftParticipants
  );
}

export function addDraftParticipant(
  participant
) {
  if (
    !participant?.id
  ) {
    return false;
  }

  const entryAlreadyUsed =
    appState.draftParticipants.some(
      (item) =>
        Number(
          item.entryNumber
        ) ===
        Number(
          participant.entryNumber
        )
    );

  if (
    entryAlreadyUsed
  ) {
    return false;
  }

  if (
    participant.isFavorite
  ) {
    appState.draftParticipants =
      appState.draftParticipants.map(
        (item) => ({
          ...item,
          isFavorite: false
        })
      );
  }

  appState.draftParticipants.push(
    participant
  );

  sortDraftParticipants();

  return true;
}

export function removeDraftParticipant(
  participantId
) {
  appState.draftParticipants =
    appState.draftParticipants.filter(
      (participant) =>
        participant.id !==
        participantId
    );
}

export function clearDraftParticipants() {
  appState.draftParticipants = [];
}

export function sortDraftParticipants() {
  appState.draftParticipants.sort(
    (
      firstParticipant,
      secondParticipant
    ) =>
      Number(
        firstParticipant.entryNumber
      ) -
      Number(
        secondParticipant.entryNumber
      )
  );
}

/*
==================================================
STATISTICHE GARA
==================================================
*/

export function getRaceStatistics(
  race = getCurrentRace()
) {
  const participants =
    getParticipants(race);

  const completed =
    participants.filter(
      (participant) =>
        participant.status ===
        "completed"
    ).length;

  const current =
    participants.filter(
      (participant) =>
        participant.status ===
        "current"
    ).length;

  const missing =
    participants.filter(
      (participant) =>
        participant.status ===
        "missing"
    ).length;

  const todo =
    participants.filter(
      (participant) =>
        participant.status ===
          "todo" ||
        participant.status ===
          "current"
    ).length;

  return {
    total:
      participants.length,
    completed,
    current,
    missing,
    todo
  };
}