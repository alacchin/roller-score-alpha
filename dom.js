// ======================================
// DOM.JS
// Riferimenti centralizzati agli elementi HTML
// Versione: Alpha 0.0.8
// ======================================

export const DOM = {
  screens: () => document.querySelectorAll(".screen"),

  home: {
    raceName: () => document.getElementById("home-race-name"),
    raceInfo: () => document.getElementById("home-race-info"),
    favoriteTitle: () => document.getElementById("home-favorite-athlete"),
    favoriteLiveStatus: () =>
      document.getElementById("home-favorite-live-status"),
    favoritePosition: () => document.getElementById("home-favorite-position"),
    favoriteEntryNumber: () =>
      document.getElementById("home-favorite-entry-number"),
    categoryStartTime: () =>
      document.getElementById("home-category-start-time"),
    favoriteEstimatedTime: () =>
      document.getElementById("home-favorite-estimated-time"),
  },

  dashboard: {
    raceName: () => document.getElementById("dashboard-race-name"),
    raceInfo: () => document.getElementById("dashboard-race-info"),
    progressText: () => document.getElementById("dashboard-progress-text"),
    progressFill: () => document.getElementById("dashboard-progress-fill"),
    athletesCount: () => document.getElementById("dashboard-athletes-count"),
    completedCount: () => document.getElementById("dashboard-completed-count"),
    todoCount: () => document.getElementById("dashboard-todo-count"),
    missingCount: () => document.getElementById("dashboard-missing-count"),
    favoritePosition: () =>
      document.getElementById("dashboard-favorite-position"),
    favoriteEntryNumber: () =>
      document.getElementById("dashboard-favorite-entry-number"),
    categoryStartTime: () =>
      document.getElementById("dashboard-category-start-time"),
    favoriteEstimatedTime: () =>
      document.getElementById("dashboard-favorite-estimated-time"),
  },

  athleteList: {
    title: () => document.getElementById("athlete-list-title"),
    subtitle: () => document.getElementById("athlete-list-subtitle"),
    container: () => document.getElementById("athlete-list-container"),
  },

  scoreEntry: {
    order: () => document.getElementById("score-entry-order"),
    athleteName: () => document.getElementById("score-entry-athlete-name"),
    athleteClub: () => document.getElementById("score-entry-athlete-club"),
    notesCount: () => document.getElementById("score-entry-notes-count"),
    statusBadge: () => document.getElementById("score-entry-status-badge"),
    statusLabel: () => document.getElementById("score-entry-status-label"),
    technicalInputs: () => document.querySelectorAll("[data-score-technical]"),
    artisticInputs: () => document.querySelectorAll("[data-score-artistic]"),
    penaltyInput: () => document.getElementById("score-penalty"),
    noteInput: () => document.getElementById("score-note"),
    previousButton: () => document.getElementById("previous-athlete"),
    nextButton: () => document.getElementById("next-athlete"),
    saveAndNextButton: () => document.getElementById("save-and-next-athlete"),
  },

  athleteSheet: {
    sheet: () => document.getElementById("athlete-sheet"),
    name: () => document.getElementById("sheet-athlete-name"),
    club: () => document.getElementById("sheet-athlete-club"),
    notes: () => document.getElementById("sheet-athlete-notes"),
    results: () => document.getElementById("sheet-athlete-results"),
  },

  buttons: {
    startFromHome: () => document.getElementById("go-score-entry-home"),
    startFromDashboard: () =>
      document.getElementById("go-score-entry-dashboard"),
    athleteList: () => document.getElementById("athlete-list-container"),
  },
};
