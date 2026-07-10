/*
==================================================
DOM.JS
Riferimenti centralizzati agli elementi HTML
Versione: Alpha 0.2
==================================================
*/

function getById(elementId) {
  return document.getElementById(
    elementId
  );
}

function getAll(selector) {
  return document.querySelectorAll(
    selector
  );
}

export const DOM = {
  /*
  ================================================
  SCHERMATE
  ================================================
  */

  screens: () =>
    getAll(".screen"),

  /*
  ================================================
  HOME
  ================================================
  */

  home: {
    raceName: () =>
      getById(
        "home-race-name"
      ),

    raceInfo: () =>
      getById(
        "home-race-info"
      ),

    favoriteAthlete: () =>
      getById(
        "home-favorite-athlete"
      ),

    favoriteLiveStatus: () =>
      getById(
        "home-favorite-live-status"
      ),

    favoritePosition: () =>
      getById(
        "home-favorite-position"
      ),

    favoriteEntryNumber: () =>
      getById(
        "home-favorite-entry-number"
      ),

    categoryStartTime: () =>
      getById(
        "home-category-start-time"
      ),

    favoriteEstimatedTime: () =>
      getById(
        "home-favorite-estimated-time"
      )
  },

  /*
  ================================================
  DASHBOARD GARA
  ================================================
  */

  dashboard: {
    raceName: () =>
      getById(
        "dashboard-race-name"
      ),

    raceInfo: () =>
      getById(
        "dashboard-race-info"
      ),

    progressText: () =>
      getById(
        "dashboard-progress-text"
      ),

    progressFill: () =>
      getById(
        "dashboard-progress-fill"
      ),

    athletesCount: () =>
      getById(
        "dashboard-athletes-count"
      ),

    completedCount: () =>
      getById(
        "dashboard-completed-count"
      ),

    todoCount: () =>
      getById(
        "dashboard-todo-count"
      ),

    missingCount: () =>
      getById(
        "dashboard-missing-count"
      ),

    favoritePosition: () =>
      getById(
        "dashboard-favorite-position"
      ),

    favoriteEntryNumber: () =>
      getById(
        "dashboard-favorite-entry-number"
      ),

    categoryStartTime: () =>
      getById(
        "dashboard-category-start-time"
      ),

    favoriteEstimatedTime: () =>
      getById(
        "dashboard-favorite-estimated-time"
      )
  },

  /*
  ================================================
  ELENCO ATLETE
  ================================================
  */

  athleteList: {
    title: () =>
      getById(
        "athlete-list-title"
      ),

    subtitle: () =>
      getById(
        "athlete-list-subtitle"
      ),

    searchInput: () =>
      getById(
        "athlete-search-input"
      ),

    container: () =>
      getById(
        "athlete-list-container"
      )
  },

  /*
  ================================================
  INSERIMENTO PUNTEGGI
  ================================================
  */

  scoreEntry: {
    order: () =>
      getById(
        "score-entry-order"
      ),

    athleteName: () =>
      getById(
        "score-entry-athlete-name"
      ),

    athleteClub: () =>
      getById(
        "score-entry-athlete-club"
      ),

    notesCount: () =>
      getById(
        "score-entry-notes-count"
      ),

    statusBadge: () =>
      getById(
        "score-entry-status-badge"
      ),

    statusLabel: () =>
      getById(
        "score-entry-status-label"
      ),

    technicalInputs: () =>
      getAll(
        "[data-score-technical]"
      ),

    artisticInputs: () =>
      getAll(
        "[data-score-artistic]"
      ),

    penaltyInput: () =>
      getById(
        "score-penalty"
      ),

    noteInput: () =>
      getById(
        "score-note"
      ),

    previousButton: () =>
      getById(
        "previous-athlete"
      ),

    nextButton: () =>
      getById(
        "next-athlete"
      ),

    saveButton: () =>
      getById(
        "save-and-next-athlete"
      )
  },

  /*
  ================================================
  NUOVA GARA
  ================================================
  */

  raceForm: {
    form: () =>
      getById(
        "manual-race-form"
      ),

    nameInput: () =>
      getById(
        "race-name-input"
      ),

    dateInput: () =>
      getById(
        "race-date-input"
      ),

    locationInput: () =>
      getById(
        "race-location-input"
      ),

    federationInput: () =>
      getById(
        "race-federation-input"
      ),

    disciplineInput: () =>
      getById(
        "race-discipline-input"
      ),

    categoryInput: () =>
      getById(
        "race-category-input"
      ),

    startTimeInput: () =>
      getById(
        "race-start-time-input"
      ),

    minutesInput: () =>
      getById(
        "race-minutes-input"
      ),

    error: () =>
      getById(
        "race-form-error"
      ),

    createButton: () =>
      getById(
        "create-race-button"
      )
  },

  /*
  ================================================
  PARTECIPANTI PROVVISORIE
  ================================================
  */

  participants: {
    nameInput: () =>
      getById(
        "participant-name-input"
      ),

    clubInput: () =>
      getById(
        "participant-club-input"
      ),

    entryInput: () =>
      getById(
        "participant-entry-input"
      ),

    favoriteInput: () =>
      getById(
        "participant-favorite-input"
      ),

    addButton: () =>
      getById(
        "add-race-participant"
      ),

    count: () =>
      getById(
        "race-participants-count"
      ),

    list: () =>
      getById(
        "race-participants-list"
      ),

    archiveOptions: () =>
      getById(
        "athlete-archive-options"
      )
  },

  /*
  ================================================
  SCHEDA ATLETA
  ================================================
  */

  athleteSheet: {
    sheet: () =>
      getById(
        "athlete-sheet"
      ),

    name: () =>
      getById(
        "sheet-athlete-name"
      ),

    club: () =>
      getById(
        "sheet-athlete-club"
      ),

    notes: () =>
      getById(
        "sheet-athlete-notes"
      ),

    results: () =>
      getById(
        "sheet-athlete-results"
      ),

    openButton: () =>
      getById(
        "open-athlete-sheet"
      ),

    closeButton: () =>
      getById(
        "close-athlete-sheet"
      )
  },

  /*
  ================================================
  PULSANTI PRINCIPALI
  ================================================
  */

  buttons: {
    newRace: () =>
      getById(
        "go-new-race"
      ),

    openRace: () =>
      getById(
        "go-race-dashboard"
      ),

    startRaceFromHome: () =>
      getById(
        "go-score-entry-home"
      ),

    startRaceFromDashboard: () =>
      getById(
        "go-score-entry-dashboard"
      ),

    athleteList: () =>
      getById(
        "go-athlete-list"
      ),

    acquireRace: () =>
      getById(
        "go-acquire-race"
      ),

    manualRace: () =>
      getById(
        "go-manual-race"
      )
  }
};