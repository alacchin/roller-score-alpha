// ======================================
// SCORECONTROLLER.JS
// Gestione inserimento e salvataggio punteggi
// Versione: Alpha 0.0.7
// ======================================

import { getCurrentRace, getCurrentAthlete } from "./state.js";
import { createScore } from "./models.js";
import { saveRaces } from "./storage.js";
import { goToNextAthlete } from "./raceController.js";
import { render } from "./renderer.js";
import { DOM } from "./dom.js";

export function saveCurrentScore() {
  const race = getCurrentRace();
  const athlete = getCurrentAthlete();

  if (!race || !athlete) return;

  athlete.scores = createScore({
    technical: readScoreInputs(DOM.scoreEntry.technicalInputs()),
    artistic: readScoreInputs(DOM.scoreEntry.artisticInputs()),
    penalty: readPenalty(),
    note: readNote(),
  });

  athlete.status = "completed";

  const nextAthlete = getNextAthlete(race, athlete);

  if (nextAthlete) {
    nextAthlete.status = "current";
  }

  saveRaces([race]);

  render();

  if (nextAthlete) {
    goToNextAthlete();
  }
}

function getNextAthlete(race, athlete) {
  const currentIndex = race.athletes.findIndex(
    (item) => item.id === athlete.id
  );

  if (currentIndex === -1) return null;

  return race.athletes[currentIndex + 1] || null;
}

function readScoreInputs(inputs) {
  return Array.from(inputs).map((input) => {
    const cleanValue = cleanScoreValue(input.value);

    input.value = cleanValue;

    if (cleanValue === "") {
      return null;
    }

    return Number(cleanValue);
  });
}

function readPenalty() {
  const penaltyInput = DOM.scoreEntry.penaltyInput();

  if (!penaltyInput || penaltyInput.value === "") {
    return null;
  }

  return Number(penaltyInput.value);
}

function readNote() {
  const noteInput = DOM.scoreEntry.noteInput();

  return noteInput?.value || "";
}

function cleanScoreValue(value) {
  return value.replace(/\D/g, "").slice(0, 2);
}
