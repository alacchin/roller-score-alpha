import {
  createScore
} from "./models.js";

import {
  appState,
  getCurrentRace,
  getCurrentParticipant,
  getParticipants
} from "./state.js";

import {
  saveRaces
} from "./storage.js";

import {
  goToNextParticipant
} from "./raceController.js";

import {
  render
} from "./renderer.js";

/*
==================================================
SALVATAGGIO PUNTEGGI
==================================================
*/

export function saveCurrentScore() {
  const currentRace =
    getCurrentRace();

  const currentParticipant =
    getCurrentParticipant();

  if (
    !currentRace ||
    !currentParticipant
  ) {
    alert(
      "Nessuna partecipante selezionata."
    );

    return;
  }

  const technicalScores =
    readScoreInputs(
      "[data-score-technical]"
    );

  const artisticScores =
    readScoreInputs(
      "[data-score-artistic]"
    );

  if (
    technicalScores.includes(
      null
    ) ||
    artisticScores.includes(
      null
    )
  ) {
    alert(
      "Inserisci tutti i punteggi tecnico e artistico."
    );

    return;
  }

  const penalty =
    readPenalty();

  const note =
    readNote();

  currentParticipant.scores =
    createScore({
      technical:
        technicalScores,

      artistic:
        artisticScores,

      penalty,

      note
    });

  currentParticipant.status =
    "completed";

  currentRace.updatedAt =
    new Date().toISOString();

  const nextParticipant =
    getNextParticipant(
      currentRace,
      currentParticipant
    );

  if (
    nextParticipant &&
    nextParticipant.status !==
      "completed"
  ) {
    resetOtherCurrentParticipants(
      currentRace,
      nextParticipant.id
    );

    nextParticipant.status =
      "current";
  }

  saveRaces(
    appState.races
  );

  render();

  if (
    nextParticipant
  ) {
    goToNextParticipant();

    return;
  }

  alert(
    "Ultima partecipante salvata. Gara completata."
  );
}

/*
==================================================
LETTURA PUNTEGGI
==================================================
*/

function readScoreInputs(
  selector
) {
  return Array.from(
    document.querySelectorAll(
      selector
    )
  ).map(
    (input) => {
      const cleanValue =
        cleanScoreValue(
          input.value
        );

      input.value =
        cleanValue;

      if (
        cleanValue === ""
      ) {
        return null;
      }

      return Number(
        cleanValue
      );
    }
  );
}

function cleanScoreValue(
  value
) {
  return String(
    value || ""
  )
    .replace(
      /\D/g,
      ""
    )
    .slice(
      0,
      2
    );
}

/*
==================================================
PENALITÀ
==================================================
*/

function readPenalty() {
  const penaltyInput =
    document.getElementById(
      "score-penalty"
    );

  if (
    !penaltyInput
  ) {
    return null;
  }

  const value =
    String(
      penaltyInput.value || ""
    ).trim();

  if (
    value === ""
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : null;
}

/*
==================================================
NOTA PRESTAZIONE
==================================================
*/

function readNote() {
  const noteInput =
    document.getElementById(
      "score-note"
    );

  return String(
    noteInput?.value || ""
  ).trim();
}

/*
==================================================
PARTECIPANTE SUCCESSIVA
==================================================
*/

function getNextParticipant(
  race,
  participant
) {
  const participants =
    getParticipants(
      race
    );

  const currentIndex =
    participants.findIndex(
      (item) =>
        item.id ===
        participant.id
    );

  if (
    currentIndex < 0
  ) {
    return null;
  }

  return (
    participants[
      currentIndex + 1
    ] || null
  );
}

/*
==================================================
GESTIONE STATO "IN CORSO"
==================================================

Manteniamo una sola partecipante "In corso"
alla volta.

Le partecipanti completate non vengono modificate.
*/

function resetOtherCurrentParticipants(
  race,
  nextParticipantId
) {
  getParticipants(
    race
  ).forEach(
    (participant) => {
      if (
        participant.id ===
        nextParticipantId
      ) {
        return;
      }

      if (
        participant.status ===
        "current"
      ) {
        participant.status =
          "todo";
      }
    }
  );
}