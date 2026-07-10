import {
  createAthlete,
  createParticipant,
  createRace
} from "./models.js";

import {
  getRaces,
  saveRaces,
  getAthletes,
  saveAthletes,
  getSettings,
  getActiveRaceId,
  setActiveRaceId
} from "./storage.js";

import {
  appState,
  setInitialState,
  getCurrentRace,
  setCurrentRaceId,
  addRaceToState,
  addAthleteToState,
  findAthleteInState,
  addDraftParticipant,
  removeDraftParticipant,
  clearDraftParticipants,
  getDraftParticipants
} from "./state.js";

import {
  initNavigation,
  showScreen
} from "./navigation.js";

import {
  startRace,
  selectParticipantById,
  goToPreviousParticipant,
  goToNextParticipant
} from "./raceController.js";

import {
  saveCurrentScore
} from "./scoreController.js";

import {
  initAthleteSheet
} from "./athleteSheet.js";

import {
  render
} from "./renderer.js";

/*
==================================================
AVVIO APP
==================================================
*/

initializeApp();

function initializeApp() {
  const races = getRaces();
  const athletes = getAthletes();
  const settings = getSettings();

  const savedActiveRaceId =
    getActiveRaceId();

  const currentRaceId =
    races.some(
      (race) =>
        race.id ===
        savedActiveRaceId
    )
      ? savedActiveRaceId
      : races[0]?.id || null;

  setInitialState({
    races,
    athletes,
    settings,
    currentRaceId
  });

  if (currentRaceId) {
    setActiveRaceId(
      currentRaceId
    );
  }

  initNavigation();
  initAthleteSheet();
  initAppEvents();

  populateAthleteArchive();
  renderDraftParticipants();
  render();
}

/*
==================================================
COLLEGAMENTO EVENTI
==================================================
*/

function initAppEvents() {
  connectRaceButtons();
  connectScoreButtons();
  connectAthleteList();
  connectRaceForm();
  connectParticipantForm();
  connectAthleteSearch();
  connectAthleteArchiveSelection();
}

/*
==================================================
PULSANTI GARA
==================================================
*/

function connectRaceButtons() {
  const openRaceButton =
    document.getElementById(
      "go-race-dashboard"
    );

  const startFromHomeButton =
    document.getElementById(
      "go-score-entry-home"
    );

  const startFromDashboardButton =
    document.getElementById(
      "go-score-entry-dashboard"
    );

  const newRaceButton =
    document.getElementById(
      "go-new-race"
    );

  if (openRaceButton) {
    openRaceButton.addEventListener(
      "click",
      () => {
        if (!getCurrentRace()) {
          showScreen(
            "new-race-screen"
          );

          return;
        }

        render();

        showScreen(
          "race-dashboard-screen"
        );
      }
    );
  }

  if (startFromHomeButton) {
    startFromHomeButton.addEventListener(
      "click",
      () => {
        startRace();
      }
    );
  }

  if (startFromDashboardButton) {
    startFromDashboardButton.addEventListener(
      "click",
      () => {
        startRace();
      }
    );
  }

  if (newRaceButton) {
    newRaceButton.addEventListener(
      "click",
      () => {
        resetRaceForm();
      }
    );
  }
}

/*
==================================================
PULSANTI INSERIMENTO PUNTEGGI
==================================================
*/

function connectScoreButtons() {
  const previousButton =
    document.getElementById(
      "previous-athlete"
    );

  const nextButton =
    document.getElementById(
      "next-athlete"
    );

  const saveButton =
    document.getElementById(
      "save-and-next-athlete"
    );

  if (previousButton) {
    previousButton.addEventListener(
      "click",
      () => {
        goToPreviousParticipant();
      }
    );
  }

  if (nextButton) {
    nextButton.addEventListener(
      "click",
      () => {
        goToNextParticipant();
      }
    );
  }

  if (saveButton) {
    saveButton.addEventListener(
      "click",
      () => {
        saveCurrentScore();
      }
    );
  }
}

/*
==================================================
ELENCO ATLETE DELLA GARA
==================================================
*/

function connectAthleteList() {
  const athleteList =
    document.getElementById(
      "athlete-list-container"
    );

  if (!athleteList) {
    return;
  }

  athleteList.addEventListener(
    "click",
    (event) => {
      const athleteRow =
        event.target.closest(
          "[data-participant-id]"
        );

      if (!athleteRow) {
        return;
      }

      selectParticipantById(
        athleteRow.dataset
          .participantId
      );
    }
  );
}

/*
==================================================
FORM CREAZIONE GARA
==================================================
*/

function connectRaceForm() {
  const raceForm =
    document.getElementById(
      "manual-race-form"
    );

  if (!raceForm) {
    return;
  }

  raceForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      createRealRace();
    }
  );
}

function createRealRace() {
  hideRaceFormError();

  const raceName =
    getInputValue(
      "race-name-input"
    );

  const raceDate =
    getInputValue(
      "race-date-input"
    );

  const raceLocation =
    getInputValue(
      "race-location-input"
    );

  const federation =
    getInputValue(
      "race-federation-input"
    );

  const discipline =
    getInputValue(
      "race-discipline-input"
    );

  const category =
    getInputValue(
      "race-category-input"
    );

  const startTime =
    getInputValue(
      "race-start-time-input"
    );

  const minutesPerAthlete =
    Number(
      getInputValue(
        "race-minutes-input"
      )
    );

  const participants =
    getDraftParticipants();

  if (!raceName) {
    showRaceFormError(
      "Inserisci il nome della gara."
    );

    return;
  }

  if (!raceDate) {
    showRaceFormError(
      "Inserisci la data della gara."
    );

    return;
  }

  if (!category) {
    showRaceFormError(
      "Inserisci la categoria."
    );

    return;
  }

  if (!startTime) {
    showRaceFormError(
      "Inserisci l'orario di inizio della categoria."
    );

    return;
  }

  if (
    !Number.isFinite(
      minutesPerAthlete
    ) ||
    minutesPerAthlete < 1
  ) {
    showRaceFormError(
      "Inserisci una durata valida per atleta."
    );

    return;
  }

  if (
    participants.length === 0
  ) {
    showRaceFormError(
      "Aggiungi almeno una partecipante."
    );

    return;
  }

  const newRace =
    createRace({
      name: raceName,
      date: raceDate,
      location: raceLocation,
      federation,
      discipline,
      category,
      startTime,
      minutesPerAthlete,
      participants
    });

  addRaceToState(
    newRace
  );

  saveRaces(
    appState.races
  );

  setCurrentRaceId(
    newRace.id
  );

  setActiveRaceId(
    newRace.id
  );

  clearDraftParticipants();

  resetRaceForm();
  render();

  showScreen(
    "race-dashboard-screen"
  );
}

/*
==================================================
AGGIUNTA PARTECIPANTE
==================================================
*/

function connectParticipantForm() {
  const addParticipantButton =
    document.getElementById(
      "add-race-participant"
    );

  const participantList =
    document.getElementById(
      "race-participants-list"
    );

  if (addParticipantButton) {
    addParticipantButton.addEventListener(
      "click",
      () => {
        createDraftParticipant();
      }
    );
  }

  if (participantList) {
    participantList.addEventListener(
      "click",
      (event) => {
        const removeButton =
          event.target.closest(
            "[data-remove-participant]"
          );

        if (!removeButton) {
          return;
        }

        removeDraftParticipant(
          removeButton.dataset
            .removeParticipant
        );

        renderDraftParticipants();
      }
    );
  }
}

function createDraftParticipant() {
  hideRaceFormError();

  const name =
    getInputValue(
      "participant-name-input"
    );

  const club =
    getInputValue(
      "participant-club-input"
    );

  const entryNumber =
    Number(
      getInputValue(
        "participant-entry-input"
      )
    );

  const isFavorite =
    getInputValue(
      "participant-favorite-input"
    ) === "true";

  if (!name) {
    showRaceFormError(
      "Inserisci il nome dell'atleta."
    );

    return;
  }

  if (
    !Number.isInteger(
      entryNumber
    ) ||
    entryNumber < 1
  ) {
    showRaceFormError(
      "Inserisci un numero di entrata valido."
    );

    return;
  }

  const existingEntryNumber =
    getDraftParticipants().some(
      (participant) =>
        Number(
          participant.entryNumber
        ) === entryNumber
    );

  if (existingEntryNumber) {
    showRaceFormError(
      "Questo numero di entrata è già stato utilizzato."
    );

    return;
  }

  const archiveAthlete =
    getOrCreateArchiveAthlete(
      name,
      club
    );

  const participant =
    createParticipant({
      athleteId:
        archiveAthlete.id,

      name:
        archiveAthlete.name,

      club:
        archiveAthlete.club,

      entryNumber,
      isFavorite,

      notes:
        archiveAthlete.notes,

      previousResults:
        archiveAthlete
          .previousResults
    });

  const added =
    addDraftParticipant(
      participant
    );

  if (!added) {
    showRaceFormError(
      "Non è stato possibile aggiungere la partecipante."
    );

    return;
  }

  clearParticipantInputs();
  populateAthleteArchive();
  renderDraftParticipants();
}

/*
==================================================
ARCHIVIO ATLETE
==================================================
*/

function getOrCreateArchiveAthlete(
  name,
  club
) {
  const existingAthlete =
    findAthleteInState(
      name,
      club
    );

  if (existingAthlete) {
    return existingAthlete;
  }

  const newAthlete =
    createAthlete({
      name,
      club
    });

  addAthleteToState(
    newAthlete
  );

  saveAthletes(
    appState.athletes
  );

  return newAthlete;
}

function populateAthleteArchive() {
  const datalist =
    document.getElementById(
      "athlete-archive-options"
    );

  if (!datalist) {
    return;
  }

  datalist.innerHTML = "";

  appState.athletes
    .slice()
    .sort(
      (
        firstAthlete,
        secondAthlete
      ) =>
        firstAthlete.name.localeCompare(
          secondAthlete.name,
          "it-IT"
        )
    )
    .forEach(
      (athlete) => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          athlete.name;

        option.label =
          athlete.club ||
          "Società non indicata";

        datalist.appendChild(
          option
        );
      }
    );
}

function connectAthleteArchiveSelection() {
  const nameInput =
    document.getElementById(
      "participant-name-input"
    );

  if (!nameInput) {
    return;
  }

  nameInput.addEventListener(
    "change",
    () => {
      const selectedName =
        nameInput.value
          .trim()
          .toLocaleLowerCase(
            "it-IT"
          );

      const selectedAthlete =
        appState.athletes.find(
          (athlete) =>
            athlete.name
              .trim()
              .toLocaleLowerCase(
                "it-IT"
              ) ===
            selectedName
        );

      if (!selectedAthlete) {
        return;
      }

      const clubInput =
        document.getElementById(
          "participant-club-input"
        );

      if (clubInput) {
        clubInput.value =
          selectedAthlete.club;
      }
    }
  );
}

/*
==================================================
ELENCO PARTECIPANTI PROVVISORIE
==================================================
*/

function renderDraftParticipants() {
  const participants =
    getDraftParticipants();

  const countElement =
    document.getElementById(
      "race-participants-count"
    );

  const container =
    document.getElementById(
      "race-participants-list"
    );

  if (countElement) {
    countElement.textContent =
      participants.length;
  }

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (
    participants.length === 0
  ) {
    container.innerHTML = `
      <p class="small-muted">
        Nessuna partecipante inserita.
      </p>
    `;

    return;
  }

  participants.forEach(
    (participant) => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        participant.isFavorite
          ? "athlete-row athlete-highlight"
          : "athlete-row";

      row.innerHTML = `
        <div class="athlete-number">
          ${escapeHtml(
            participant.entryNumber
          )}
        </div>

        <div class="athlete-info">
          <strong>
            ${
              participant.isFavorite
                ? "⭐ "
                : ""
            }

            ${escapeHtml(
              participant.name
            )}
          </strong>

          <span>
            ${escapeHtml(
              participant.club ||
                "Società non indicata"
            )}
          </span>
        </div>

        <button
          class="ghost-button participant-remove-button"
          type="button"
          data-remove-participant="${participant.id}"
        >
          Rimuovi
        </button>
      `;

      container.appendChild(
        row
      );
    }
  );
}

/*
==================================================
RICERCA ATLETE DELLA GARA
==================================================
*/

function connectAthleteSearch() {
  const searchInput =
    document.getElementById(
      "athlete-search-input"
    );

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener(
    "input",
    () => {
      const searchValue =
        searchInput.value
          .trim()
          .toLocaleLowerCase(
            "it-IT"
          );

      document
        .querySelectorAll(
          "#athlete-list-container .athlete-row"
        )
        .forEach(
          (row) => {
            const rowText =
              row.textContent
                .toLocaleLowerCase(
                  "it-IT"
                );

            row.style.display =
              rowText.includes(
                searchValue
              )
                ? ""
                : "none";
          }
        );
    }
  );
}

/*
==================================================
RESET FORM
==================================================
*/

function resetRaceForm() {
  const form =
    document.getElementById(
      "manual-race-form"
    );

  if (form) {
    form.reset();
  }

  const minutesInput =
    document.getElementById(
      "race-minutes-input"
    );

  if (minutesInput) {
    minutesInput.value = "4";
  }

  clearDraftParticipants();
  clearParticipantInputs();
  hideRaceFormError();
  renderDraftParticipants();
}

function clearParticipantInputs() {
  setInputValue(
    "participant-name-input",
    ""
  );

  setInputValue(
    "participant-club-input",
    ""
  );

  setInputValue(
    "participant-entry-input",
    ""
  );

  setInputValue(
    "participant-favorite-input",
    "false"
  );

  document
    .getElementById(
      "participant-name-input"
    )
    ?.focus();
}

/*
==================================================
MESSAGGI DI ERRORE
==================================================
*/

function showRaceFormError(
  message
) {
  const errorElement =
    document.getElementById(
      "race-form-error"
    );

  if (!errorElement) {
    alert(message);

    return;
  }

  errorElement.textContent =
    message;

  errorElement.hidden = false;

  errorElement.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function hideRaceFormError() {
  const errorElement =
    document.getElementById(
      "race-form-error"
    );

  if (errorElement) {
    errorElement.hidden = true;
    errorElement.textContent =
      "";
  }
}

/*
==================================================
FUNZIONI GENERICHE
==================================================
*/

function getInputValue(
  elementId
) {
  const element =
    document.getElementById(
      elementId
    );

  return String(
    element?.value || ""
  ).trim();
}

function setInputValue(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (element) {
    element.value =
      value;
  }
}

function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

/*
==================================================
DEBUG ALPHA
==================================================
*/

window.rollerScoreState =
  appState;

/*
==================================================
SERVICE WORKER
==================================================
*/

if (
  "serviceWorker" in
  navigator
) {
  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator
            .serviceWorker
            .register(
              "./sw.js"
            );

        registration.update();
      } catch (error) {
        console.error(
          "Errore Service Worker:",
          error
        );
      }
    }
  );
}