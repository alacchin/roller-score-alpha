// ======================================
// ROLLER SCORE - APP.JS
// Bootstrap principale dell'app
// Versione: Alpha 0.0.6
// ======================================

import { initNavigation } from "./navigation.js";
import { initAthleteSheet } from "./athleteSheet.js";

import { DEFAULT_RACE_ID, SCORE_STATUS } from "./config.js";
import { createAthlete, createRace, createScore } from "./models.js";

import {
  getRaces,
  saveRaces,
  getAthletes,
  saveAthletes,
  getSettings,
  getActiveRaceId,
  setActiveRaceId,
} from "./storage.js";

import { setInitialState, appState } from "./state.js";
import { render } from "./renderer.js";

import {
  startRace,
  selectAthleteById,
  goToPreviousAthlete,
  goToNextAthlete,
} from "./raceController.js";

import { saveCurrentScore } from "./scoreController.js";

// ======================================
// AVVIO APP
// ======================================

initDemoDataIfNeeded();
initializeApp();

// ======================================
// INIZIALIZZAZIONE
// ======================================

function initializeApp() {
  const races = getRaces();
  const athletes = getAthletes();
  const settings = getSettings();

  const activeRaceId = getActiveRaceId() || DEFAULT_RACE_ID;
  const currentRace =
    races.find((race) => race.id === activeRaceId) || races[0] || null;

  const currentRaceId = currentRace?.id || null;

  if (currentRaceId) {
    setActiveRaceId(currentRaceId);
  }

  setInitialState({
    races,
    athletes,
    settings,
    currentRaceId,
  });

  initNavigation();
  initAthleteSheet();
  initAppEvents();

  render();
}

// ======================================
// EVENTI APP
// ======================================

function initAppEvents() {
  connectStartRaceButtons();
  connectAthleteList();
  connectScoreNavigationButtons();
  connectSaveScoreButton();
}

function connectStartRaceButtons() {
  const startButtons = [
    document.getElementById("go-score-entry-home"),
    document.getElementById("go-score-entry-dashboard"),
  ];

  startButtons.forEach((button) => {
    if (!button) return;

    button.addEventListener("click", () => {
      startRace();
    });
  });
}

function connectAthleteList() {
  const athleteList = document.getElementById("athlete-list-container");

  if (!athleteList) return;

  athleteList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-athlete-id]");

    if (!row) return;

    selectAthleteById(row.dataset.athleteId);
  });
}

function connectScoreNavigationButtons() {
  const previousButton = document.getElementById("previous-athlete");
  const nextButton = document.getElementById("next-athlete");

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      goToPreviousAthlete();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToNextAthlete();
    });
  }
}

function connectSaveScoreButton() {
  const saveButton = document.getElementById("save-and-next-athlete");

  if (!saveButton) return;

  saveButton.addEventListener("click", () => {
    saveCurrentScore();
  });
}

// ======================================
// DATI DEMO INIZIALI
// ======================================

function initDemoDataIfNeeded() {
  const existingRaces = getRaces();

  if (existingRaces.length > 0) {
    return;
  }

  const athletes = [
    createAthlete({
      id: "athlete-001",
      order: 10,
      name: "Giulia Bianchi",
      club: "Skating Club Verona",
      status: SCORE_STATUS.COMPLETED,
      notes: [],
      scores: createScore({
        technical: [55, 56, 57],
        artistic: [54, 55, 56],
        penalty: null,
        note: "Prova pulita",
      }),
    }),

    createAthlete({
      id: "athlete-002",
      order: 11,
      name: "Sara Verdi",
      club: "Roller Team Padova",
      status: SCORE_STATUS.COMPLETED,
      notes: ["Buona velocità in ingresso"],
      scores: createScore({
        technical: [56, 55, 55],
        artistic: [55, 54, 56],
        penalty: null,
        note: "Buona interpretazione",
      }),
    }),

    createAthlete({
      id: "athlete-003",
      order: 12,
      name: "Anna Rossi",
      club: "ASD Roller Bassano",
      isFavorite: true,
      status: SCORE_STATUS.TODO,
      notes: ["Buona velocità", "Ottime trottole"],
      previousResults: [
        "Summer Trophy — Tecnico 5.4 / Artistico 5.3",
        "Vidor — Tecnico 5.2 / Artistico 5.4",
      ],
      scores: createScore({
        technical: [57, 55, 54],
        artistic: [51, 52, 57],
        penalty: -2,
        note: "prova nota",
      }),
    }),

    createAthlete({
      id: "athlete-004",
      order: 13,
      name: "Martina Neri",
      club: "Pattinaggio Vicenza",
      status: SCORE_STATUS.CURRENT,
      notes: [],
      previousResults: [],
    }),

    createAthlete({
      id: "athlete-005",
      order: 14,
      name: "Elisa Costa",
      club: "Roll Club Verona",
      status: SCORE_STATUS.MISSING,
      notes: ["Da rivedere salto", "Caduta su trottola", "Buona presenza"],
      previousResults: ["Regionale AICS — Tecnico 5.1 / Artistico 5.0"],
    }),
  ];

  const race = createRace({
    id: DEFAULT_RACE_ID,
    name: "Summer Trophy",
    federation: "AICS",
    discipline: "Libero",
    category: "Junior Basic",
    location: "Misano Adriatico",
    date: "2026-07-07",
    startTime: "14:42",
    minutesPerAthlete: 4,
    athletes,
  });

  saveAthletes(athletes);
  saveRaces([race]);
  setActiveRaceId(race.id);
}

window.rollerScoreState = appState;
// ======================================
// Service Worker
// ======================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.log("✅ Service Worker registrato");
    } catch (error) {
      console.error("❌ Errore Service Worker:", error);
    }
  });
}
