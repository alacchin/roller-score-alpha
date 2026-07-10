import {
  getCurrentRace,
  getCurrentParticipant,
  getParticipants,
  getStartingParticipant,
  setCurrentParticipantId
} from "./state.js";

import {
  showScreen
} from "./navigation.js";

import {
  render
} from "./renderer.js";

/*
==================================================
AVVIO GARA
==================================================
*/

export function startRace() {
  const currentRace =
    getCurrentRace();

  if (!currentRace) {
    alert(
      "Crea o apri una gara prima di iniziare."
    );

    return;
  }

  const participants =
    getParticipants(
      currentRace
    );

  if (
    participants.length === 0
  ) {
    alert(
      "La gara non contiene partecipanti."
    );

    return;
  }

  const startingParticipant =
    getStartingParticipant(
      currentRace
    );

  if (!startingParticipant) {
    alert(
      "Non è stato possibile individuare la prima partecipante."
    );

    return;
  }

  setCurrentParticipantId(
    startingParticipant.id
  );

  render();

  showScreen(
    "score-entry-screen"
  );
}

/*
==================================================
SELEZIONE PARTECIPANTE
==================================================
*/

export function selectParticipantById(
  participantId
) {
  const participant =
    getParticipants().find(
      (item) =>
        item.id === participantId
    );

  if (!participant) {
    return;
  }

  setCurrentParticipantId(
    participant.id
  );

  render();

  showScreen(
    "score-entry-screen"
  );
}

/*
==================================================
NAVIGAZIONE PRECEDENTE / SUCCESSIVA
==================================================
*/

export function goToPreviousParticipant() {
  moveToRelativeParticipant(
    -1
  );
}

export function goToNextParticipant() {
  moveToRelativeParticipant(
    1
  );
}

function moveToRelativeParticipant(
  direction
) {
  const currentRace =
    getCurrentRace();

  const currentParticipant =
    getCurrentParticipant();

  if (
    !currentRace ||
    !currentParticipant
  ) {
    return;
  }

  const participants =
    getParticipants(
      currentRace
    );

  const currentIndex =
    participants.findIndex(
      (participant) =>
        participant.id ===
        currentParticipant.id
    );

  if (
    currentIndex < 0
  ) {
    return;
  }

  const targetIndex =
    currentIndex + direction;

  if (
    targetIndex < 0 ||
    targetIndex >=
      participants.length
  ) {
    return;
  }

  const targetParticipant =
    participants[targetIndex];

  setCurrentParticipantId(
    targetParticipant.id
  );

  render();
}

/*
==================================================
FUNZIONI DI SUPPORTO
==================================================
*/

export function getPreviousParticipant() {
  return getRelativeParticipant(
    -1
  );
}

export function getNextParticipant() {
  return getRelativeParticipant(
    1
  );
}

function getRelativeParticipant(
  direction
) {
  const currentRace =
    getCurrentRace();

  const currentParticipant =
    getCurrentParticipant();

  if (
    !currentRace ||
    !currentParticipant
  ) {
    return null;
  }

  const participants =
    getParticipants(
      currentRace
    );

  const currentIndex =
    participants.findIndex(
      (participant) =>
        participant.id ===
        currentParticipant.id
    );

  if (
    currentIndex < 0
  ) {
    return null;
  }

  const targetIndex =
    currentIndex + direction;

  if (
    targetIndex < 0 ||
    targetIndex >=
      participants.length
  ) {
    return null;
  }

  return participants[
    targetIndex
  ];
}