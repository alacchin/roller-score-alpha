import {
  normalizeAthlete,
  normalizeRace,
  normalizeParticipant
} from "./models.js";

/*
==================================================
STATO GLOBALE DELL'APP
Roller Score — Alpha 0.3.1
==================================================
*/

export const appState = {
  version: "0.3.1",

  races: [],
  athletes: [],

  settings: {
    theme: "dark",
    version: "0.3.1"
  },

  currentRaceId: null,
  currentParticipantId: null,

  draftParticipants: [],

  raceFormMode: "create",
  editingRaceId: null
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
      version: "0.3.1"
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

  appState.raceFormMode =
    "create";

  appState.editingRaceId =
    null;
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

export function getRaceById(
  raceId
) {
  return (
    appState.races.find(
      (race) =>
        race.id === raceId
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

  const normalizedRace =
    normalizeRace(race);

  const existingRaceIndex =
    appState.races.findIndex(
      (item) =>
        item.id ===
        normalizedRace.id
    );

  if (
    existingRaceIndex >= 0
  ) {
    appState.races[
      existingRaceIndex
    ] = normalizedRace;
  } else {
    appState.races.push(
      normalizedRace
    );
  }

  return true;
}

export function updateRaceInState(
  raceId,
  changes = {}
) {
  const raceIndex =
    appState.races.findIndex(
      (race) =>
        race.id === raceId
    );

  if (
    raceIndex < 0
  ) {
    return false;
  }

  const currentRace =
    appState.races[
      raceIndex
    ];

  const updatedRace =
    normalizeRace({
      ...currentRace,
      ...changes,
      id: currentRace.id,
      createdAt:
        currentRace.createdAt,
      updatedAt:
        new Date().toISOString()
    });

  appState.races[
    raceIndex
  ] = updatedRace;

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

  if (
    appState.editingRaceId ===
    raceId
  ) {
    exitRaceEditMode();
  }
}

/*
==================================================
MODALITÀ CREAZIONE / MODIFICA GARA
==================================================
*/

export function getRaceFormMode() {
  return appState.raceFormMode;
}

export function isRaceEditMode() {
  return (
    appState.raceFormMode ===
      "edit" &&
    Boolean(
      appState.editingRaceId
    )
  );
}

export function getEditingRaceId() {
  return appState.editingRaceId;
}

export function getEditingRace() {
  if (
    !isRaceEditMode()
  ) {
    return null;
  }

  return getRaceById(
    appState.editingRaceId
  );
}

export function enterRaceCreateMode() {
  appState.raceFormMode =
    "create";

  appState.editingRaceId =
    null;

  clearDraftParticipants();
}

export function enterRaceEditMode(
  raceId
) {
  const race =
    getRaceById(
      raceId
    );

  if (!race) {
    return false;
  }

  appState.raceFormMode =
    "edit";

  appState.editingRaceId =
    race.id;

  appState.draftParticipants =
    getParticipants(race).map(
      cloneParticipant
    );

  sortDraftParticipants();

  return true;
}

export function exitRaceEditMode() {
  appState.raceFormMode =
    "create";

  appState.editingRaceId =
    null;

  clearDraftParticipants();
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
  ] = normalizeParticipant({
    ...race.participants[
      participantIndex
    ],
    ...changes
  });

  race.participants.sort(
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

  const normalizedAthlete =
    normalizeAthlete(
      athlete
    );

  const existingAthleteIndex =
    appState.athletes.findIndex(
      (item) =>
        item.id ===
        normalizedAthlete.id
    );

  if (
    existingAthleteIndex >= 0
  ) {
    appState.athletes[
      existingAthleteIndex
    ] = normalizedAthlete;
  } else {
    appState.athletes.push(
      normalizedAthlete
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
    normalizeSearchValue(
      name
    );

  const normalizedClub =
    normalizeSearchValue(
      club
    );

  return (
    appState.athletes.find(
      (athlete) =>
        normalizeSearchValue(
          athlete.name
        ) ===
          normalizedName &&
        normalizeSearchValue(
          athlete.club
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

export function setDraftParticipants(
  participants = []
) {
  appState.draftParticipants =
    Array.isArray(participants)
      ? participants.map(
          cloneParticipant
        )
      : [];

  sortDraftParticipants();
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
    clearFavoriteFromDraftParticipants();
  }

  appState.draftParticipants.push(
    cloneParticipant(
      participant
    )
  );

  sortDraftParticipants();

  return true;
}

export function updateDraftParticipant(
  participantId,
  changes = {}
) {
  const participantIndex =
    appState.draftParticipants.findIndex(
      (participant) =>
        participant.id ===
        participantId
    );

  if (
    participantIndex < 0
  ) {
    return false;
  }

  const nextEntryNumber =
    Number(
      changes.entryNumber ??
      appState.draftParticipants[
        participantIndex
      ].entryNumber
    );

  const entryAlreadyUsed =
    appState.draftParticipants.some(
      (participant, index) =>
        index !==
          participantIndex &&
        Number(
          participant.entryNumber
        ) ===
          nextEntryNumber
    );

  if (
    entryAlreadyUsed
  ) {
    return false;
  }

  if (
    changes.isFavorite ===
    true
  ) {
    clearFavoriteFromDraftParticipants(
      participantId
    );
  }

  appState.draftParticipants[
    participantIndex
  ] = normalizeParticipant({
    ...appState.draftParticipants[
      participantIndex
    ],
    ...changes,
    entryNumber:
      nextEntryNumber,
    order:
      nextEntryNumber
  });

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

function clearFavoriteFromDraftParticipants(
  excludedParticipantId = null
) {
  appState.draftParticipants =
    appState.draftParticipants.map(
      (participant) => {
        if (
          participant.id ===
          excludedParticipantId
        ) {
          return participant;
        }

        return {
          ...participant,
          isFavorite: false
        };
      }
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

/*
==================================================
FUNZIONI DI SUPPORTO
==================================================
*/

function cloneParticipant(
  participant
) {
  return normalizeParticipant({
    ...participant,

    notes:
      Array.isArray(
        participant.notes
      )
        ? [
            ...participant.notes
          ]
        : [],

    previousResults:
      Array.isArray(
        participant.previousResults
      )
        ? [
            ...participant.previousResults
          ]
        : [],

    scores:
      participant.scores
        ? {
            ...participant.scores,

            technical:
              Array.isArray(
                participant.scores
                  .technical
              )
                ? [
                    ...participant
                      .scores
                      .technical
                  ]
                : [],

            artistic:
              Array.isArray(
                participant.scores
                  .artistic
              )
                ? [
                    ...participant
                      .scores
                      .artistic
                  ]
                : []
          }
        : null
  });
}

function normalizeSearchValue(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLocaleLowerCase(
      "it-IT"
    );
}