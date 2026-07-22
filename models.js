export function createId(prefix = "item") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

/*
==================================================
ANAGRAFICA ATLETA
==================================================

Il numero di entrata NON viene salvato qui.

L'anagrafica contiene solamente i dati permanenti
dell'atleta, riutilizzabili nelle gare successive.
*/

export function createAthlete({
  id = createId("athlete"),
  name,
  club = "",
  notes = [],
  previousResults = []
}) {
  const now = new Date().toISOString();

  return {
    id,
    name: String(name || "").trim(),
    club: String(club || "").trim(),
    notes: Array.isArray(notes)
      ? notes
      : [],
    previousResults: Array.isArray(previousResults)
      ? previousResults
      : [],
    createdAt: now,
    updatedAt: now
  };
}

/*
==================================================
PARTECIPAZIONE DELL'ATLETA ALLA GARA
==================================================

Qui vengono salvati i dati validi solo per quella gara:

- numero di entrata
- posizione
- atleta preferita
- stato
- punteggi
*/

export function createParticipant({
  id = createId("participant"),
  athleteId,
  name,
  club = "",
  entryNumber,
  isFavorite = false,
  status = "todo",
  notes = [],
  previousResults = [],
  scores = null
}) {
  const normalizedEntryNumber =
    Number(entryNumber);

  return {
    id,
    athleteId,
    name: String(name || "").trim(),
    club: String(club || "").trim(),

    entryNumber:
      normalizedEntryNumber,

    order:
      normalizedEntryNumber,

    isFavorite:
      Boolean(isFavorite),

    status,

    notes: Array.isArray(notes)
      ? notes
      : [],

    previousResults:
      Array.isArray(previousResults)
        ? previousResults
        : [],

    scores
  };
}

/*
==================================================
GARA
==================================================
*/

export function createRace({
  id = createId("race"),
  name,
  date,
  location = "",
  federation,
  discipline,
  category,
  startTime,
  minutesPerAthlete = 4,
  participants = [],
  status = "prepared"
}) {
  const now =
    new Date().toISOString();

  const sortedParticipants =
    [...participants].sort(
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

  return {
    id,

    name:
      String(name || "").trim(),

    date,

    location:
      String(location || "").trim(),

    federation,
    discipline,

    category:
      String(category || "").trim(),

    startTime,

    minutesPerAthlete:
      Number(minutesPerAthlete),

    participants:
      sortedParticipants,

    status:
      normalizeRaceStatus(status),

    createdAt: now,
    updatedAt: now
  };
}

/*
==================================================
PUNTEGGIO
==================================================
*/

export function createScore({
  technical = [],
  artistic = [],
  penalty = null,
  note = ""
}) {
  return {
    technical:
      Array.isArray(technical)
        ? technical
        : [],

    artistic:
      Array.isArray(artistic)
        ? artistic
        : [],

    penalty:
      penalty === null ||
        penalty === ""
        ? null
        : Number(penalty),

    note:
      String(note || "").trim(),

    savedAt:
      new Date().toISOString()
  };
}

/*
==================================================
FUNZIONI DI SUPPORTO
==================================================
*/

export function sortParticipantsByEntryNumber(
  participants = []
) {
  return [...participants].sort(
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

export function normalizeParticipant(
  participant
) {
  const entryNumber =
    Number(
      participant.entryNumber ??
      participant.order
    );

  return {
    ...participant,

    entryNumber,
    order: entryNumber,

    isFavorite:
      Boolean(
        participant.isFavorite
      ),

    notes:
      Array.isArray(
        participant.notes
      )
        ? participant.notes
        : [],

    previousResults:
      Array.isArray(
        participant.previousResults
      )
        ? participant.previousResults
        : [],

    status:
      participant.status ||
      "todo",

    scores:
      participant.scores ||
      null
  };
}

export function normalizeRace(
  race
) {
  const participants =
    race.participants ||
    race.athletes ||
    [];

  const normalizedParticipants =
    sortParticipantsByEntryNumber(
      participants.map(
        normalizeParticipant
      )
    );

  return {
    ...race,

    minutesPerAthlete:
      Number(
        race.minutesPerAthlete ||
        4
      ),

    participants:
      normalizedParticipants,

    status:
      getNormalizedRaceStatus(
        race,
        normalizedParticipants
      ),

    updatedAt:
      race.updatedAt ||
      race.createdAt ||
      new Date().toISOString()
  };
}

export function normalizeAthlete(
  athlete
) {
  return {
    ...athlete,

    name:
      String(
        athlete.name || ""
      ).trim(),

    club:
      String(
        athlete.club || ""
      ).trim(),

    notes:
      Array.isArray(
        athlete.notes
      )
        ? athlete.notes
        : [],

    previousResults:
      Array.isArray(
        athlete.previousResults
      )
        ? athlete.previousResults
        : []
  };
}

/*
==================================================
NORMALIZZAZIONE STATO GARA
==================================================
*/

function getNormalizedRaceStatus(
  race,
  participants
) {
  const savedStatus =
    normalizeRaceStatus(
      race.status
    );

  /*
  Lo stato archiviato è manuale e deve essere
  conservato anche se la gara viene modificata.
  */

  if (
    savedStatus ===
    "archived"
  ) {
    return "archived";
  }

  if (
    participants.length === 0
  ) {
    return "prepared";
  }

  const completedCount =
    participants.filter(
      (participant) =>
        participant.status ===
        "completed"
    ).length;

  if (
    completedCount === 0
  ) {
    return "prepared";
  }

  if (
    completedCount ===
    participants.length
  ) {
    return "completed";
  }

  return "in-progress";
}

function normalizeRaceStatus(
  status
) {
  const validStatuses = [
    "prepared",
    "in-progress",
    "completed",
    "archived"
  ];

  if (
    validStatuses.includes(
      status
    )
  ) {
    return status;
  }

  /*
  Compatibilità con eventuali denominazioni
  utilizzate nelle versioni precedenti.
  */

  const legacyStatusMap = {
    planned: "prepared",
    ready: "prepared",
    current: "in-progress",
    started: "in-progress",
    finished: "completed"
  };

  return (
    legacyStatusMap[status] ||
    "prepared"
  );
}