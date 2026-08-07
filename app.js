import { createAthlete, createParticipant, createRace } from "./models.js";

import {
  getRaces,
  saveRaces,
  getAthletes,
  saveAthletes,
  getSettings,
  getActiveRaceId,
  setActiveRaceId,
} from "./storage.js";

import {
  appState,
  setInitialState,
  getCurrentRace,
  setCurrentRaceId,
  addRaceToState,
  updateRaceInState,
  addAthleteToState,
  findAthleteInState,
  addDraftParticipant,
  removeDraftParticipant,
  clearDraftParticipants,
  getDraftParticipants,
  enterRaceCreateMode,
  enterRaceEditMode,
  exitRaceEditMode,
  isRaceEditMode,
  getEditingRaceId,
  getEditingRace,
} from "./state.js";

import { goBack, initNavigation, showScreen } from "./navigation.js";

import {
  startRace,
  selectParticipantById,
  goToPreviousParticipant,
  goToNextParticipant,
} from "./raceController.js";

import { clearCurrentScore, saveCurrentScore } from "./scoreController.js";

import { initAthleteSheet } from "./athleteSheet.js";

import { render } from "./renderer.js";

import { initDialog, showConfirmDialog } from "./dialog.js";

import { getRaceStatusInfo } from "./raceUtils.js";

/*
==================================================
AVVIO APP
Roller Score — Alpha 0.3.1
==================================================
*/

initializeApp();

function initializeApp() {
  const races = getRaces();
  const athletes = getAthletes();
  const settings = getSettings();

  const savedActiveRaceId = getActiveRaceId();

  const currentRaceId = races.some((race) => race.id === savedActiveRaceId)
    ? savedActiveRaceId
    : races[0]?.id || null;

  setInitialState({
    races,
    athletes,
    settings,
    currentRaceId,
  });

  if (currentRaceId) {
    setActiveRaceId(currentRaceId);
  }

  selectPreferredRaceForHome();

  initNavigation();
  initAthleteSheet();
  initDialog();
  initAppEvents();

  populateAthleteArchive();
  renderDraftParticipants();
  updateRaceFormModeUI();
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
  connectRankingList();
  connectRaceForm();
  connectParticipantForm();
  connectAthleteSearch();
  connectAthleteArchiveSelection();
  connectNavigationRefresh();
}

/*
==================================================
CLASSIFICA LIVE
==================================================
*/

function connectRankingList() {
  const rankingList = document.getElementById("ranking-list-container");

  if (!rankingList) {
    return;
  }

  rankingList.addEventListener("click", (event) => {
    const rankingRow = event.target.closest("[data-ranking-participant-id]");

    if (!rankingRow) {
      return;
    }

    const isExpanded = rankingRow.classList.contains("ranking-row-expanded");

    rankingList.querySelectorAll(".ranking-row-expanded").forEach((row) => {
      row.classList.remove("ranking-row-expanded");

      row.setAttribute("aria-expanded", "false");
    });

    if (isExpanded) {
      return;
    }

    rankingRow.classList.add("ranking-row-expanded");

    rankingRow.setAttribute("aria-expanded", "true");
  });
}

function connectNavigationRefresh() {
  window.addEventListener("popstate", () => {
    const activeScreen = document.querySelector(".screen.active");

    if (activeScreen?.id === "home-screen") {
      selectPreferredRaceForHome();
    }

    render();
  });
}

function selectPreferredRaceForHome() {
  const preferredRace = getPreferredOpenRace();

  if (!preferredRace || preferredRace.id === appState.currentRaceId) {
    return;
  }

  setCurrentRaceId(preferredRace.id);
  setActiveRaceId(preferredRace.id);
}

function getPreferredOpenRace() {
  const openRaces = appState.races
    .filter((race) => {
      const status = getRaceStatusInfo(race);

      return status.key !== "completed" && status.key !== "archived";
    })
    .sort(
      (firstRace, secondRace) =>
        getRaceStartTimestamp(firstRace) - getRaceStartTimestamp(secondRace),
    );

  return openRaces[0] || getCurrentRace();
}

function getRaceStartTimestamp(race) {
  if (!race?.date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const startTime = race.startTime || "23:59";

  const timestamp = new Date(`${race.date}T${startTime}:00`).getTime();

  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

/*
==================================================
PULSANTI GARA
==================================================
*/

function connectRaceButtons() {
  const openRaceButton = document.getElementById("go-race-dashboard");

  const startFromHomeButton = document.getElementById("go-score-entry-home");

  const startFromDashboardButton = document.getElementById(
    "go-score-entry-dashboard",
  );

  const raceListButton = document.getElementById("go-race-list");

  const raceListContainer = document.getElementById("race-list-container");

  const backHomeFromRaceListButton = document.getElementById(
    "back-home-from-race-list",
  );

  const newRaceButton = document.getElementById("go-new-race");

  const manualRaceButton = document.getElementById("go-manual-race");

  const editRaceButton = document.getElementById("edit-race-button");

  const cancelEditButton = document.getElementById("cancel-race-edit-button");

  if (openRaceButton) {
    openRaceButton.addEventListener("click", () => {
      if (!getCurrentRace()) {
        showScreen("new-race-screen");

        return;
      }

      render();

      showScreen("race-dashboard-screen");
    });
  }

  if (startFromHomeButton) {
    startFromHomeButton.addEventListener("click", startRace);
  }

  if (startFromDashboardButton) {
    startFromDashboardButton.addEventListener("click", startRace);
  }

  if (raceListButton) {
    raceListButton.addEventListener("click", () => {
      showScreen("race-list-screen");
    });
  }

  if (raceListContainer) {
    raceListContainer.addEventListener("click", (event) => {
      const raceCard = event.target.closest("[data-race-id]");

      if (!raceCard) {
        return;
      }

      const raceId = raceCard.dataset.raceId;

      setCurrentRaceId(raceId);

      setActiveRaceId(raceId);

      render();

      showScreen("race-dashboard-screen");
    });
  }

  if (backHomeFromRaceListButton) {
    backHomeFromRaceListButton.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      showScreen("home-screen", {
        addToHistory: false,
        replaceHistory: true,
      });
    });
  }

  if (newRaceButton) {
    newRaceButton.addEventListener("click", () => {
      prepareNewRaceForm();
    });
  }

  if (manualRaceButton) {
    manualRaceButton.addEventListener("click", () => {
      prepareNewRaceForm();

      showScreen("manual-race-screen");
    });
  }

  if (editRaceButton) {
    editRaceButton.addEventListener("click", () => {
      openCurrentRaceForEditing();
    });
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => {
      cancelRaceEditing();
    });
  }
}

/*
==================================================
APERTURA MODIFICA GARA
==================================================
*/

async function openCurrentRaceForEditing() {
  const currentRace = getCurrentRace();

  if (!currentRace) {
    await showMessageDialog({
      title: "Modifica gara",
      message: "Non è presente una gara da modificare.",
      buttonText: "OK",
      variant: "primary",
    });

    return;
  }

  const enteredEditMode = enterRaceEditMode(currentRace.id);

  if (!enteredEditMode) {
    await showMessageDialog({
      title: "Modifica gara",
      message: "Non è stato possibile aprire la gara in modifica.",
      buttonText: "OK",
      variant: "primary",
    });

    return;
  }

  populateRaceForm(currentRace);

  updateRaceFormModeUI();
  renderDraftParticipants();

  showScreen("manual-race-screen");
}

function populateRaceForm(race) {
  setInputValue("editing-race-id", race.id);

  setInputValue("race-name-input", race.name);

  setInputValue("race-date-input", race.date);

  setInputValue("race-location-input", race.location);

  setInputValue("race-federation-input", race.federation);

  setInputValue("race-discipline-input", race.discipline);

  setInputValue("race-category-input", race.category);

  setInputValue("race-start-time-input", race.startTime);

  setInputValue("race-minutes-input", race.minutesPerAthlete || 4);

  clearParticipantInputs();
  hideRaceFormError();
}

/*
==================================================
MODALITÀ FORM
==================================================
*/

function prepareNewRaceForm() {
  enterRaceCreateMode();

  resetRaceFormFields();
  updateRaceFormModeUI();
  renderDraftParticipants();
}

function cancelRaceEditing() {
  exitRaceEditMode();

  resetRaceFormFields();
  updateRaceFormModeUI();
  renderDraftParticipants();

  render();

  goBack("race-dashboard-screen");
}

function updateRaceFormModeUI() {
  const editing = isRaceEditMode();

  setTextById(
    "race-form-label",
    editing ? "MODIFICA GARA" : "INSERIMENTO MANUALE",
  );

  setTextById("race-form-title", editing ? "Modifica gara" : "Crea gara");

  setTextById(
    "race-form-description",
    editing
      ? "Aggiorna i dati della competizione e le partecipanti."
      : "Compila i dati della competizione e aggiungi le partecipanti.",
  );

  setTextById(
    "create-race-button",
    editing ? "💾 Salva modifiche" : "💾 Crea gara",
  );

  const warning = document.getElementById("race-edit-warning");

  const cancelButton = document.getElementById("cancel-race-edit-button");

  const backButton = document.getElementById("back-new-race-2");

  if (warning) {
    warning.hidden = !editing;
  }

  if (cancelButton) {
    cancelButton.hidden = !editing;
  }

  if (backButton) {
    backButton.hidden = editing;
  }
}

/*
==================================================
PULSANTI INSERIMENTO PUNTEGGI
==================================================
*/

function connectScoreButtons() {
  document
    .getElementById("previous-athlete")
    ?.addEventListener("click", goToPreviousParticipant);

  document
    .getElementById("next-athlete")
    ?.addEventListener("click", goToNextParticipant);

  document
    .getElementById("save-and-next-athlete")
    ?.addEventListener("click", saveCurrentScore);

  document
    .getElementById("clear-current-score")
    ?.addEventListener("click", async () => {
      const confirmed = await showConfirmDialog({
        title: "Cancella punteggi?",
        message:
          "Stai per eliminare tutti i punteggi salvati per questa atleta.\n\n" +
          "L'atleta tornerà nello stato 'Da fare' e verrà rimossa dalla classifica.",
        confirmText: "Cancella",
        cancelText: "Annulla",
        variant: "danger",
      });

      if (!confirmed) {
        return;
      }

      clearCurrentScore();
    });
}

/*
==================================================
ELENCO ATLETE DELLA GARA
==================================================
*/

function connectAthleteList() {
  const athleteList = document.getElementById("athlete-list-container");

  if (!athleteList) {
    return;
  }

  athleteList.addEventListener("click", (event) => {
    const athleteRow = event.target.closest("[data-participant-id]");

    if (!athleteRow) {
      return;
    }

    selectParticipantById(athleteRow.dataset.participantId);
  });
}

/*
==================================================
FORM CREAZIONE / MODIFICA GARA
==================================================
*/

function connectRaceForm() {
  const raceForm = document.getElementById("manual-race-form");

  if (!raceForm) {
    return;
  }

  raceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    saveRaceForm();
  });
}

function saveRaceForm() {
  hideRaceFormError();

  const formData = readRaceFormData();

  const validationError = validateRaceForm(formData);

  if (validationError) {
    showRaceFormError(validationError);

    return;
  }

  if (isRaceEditMode()) {
    updateExistingRace(formData);
  } else {
    createNewRace(formData);
  }
}

function readRaceFormData() {
  return {
    name: getInputValue("race-name-input"),

    date: getInputValue("race-date-input"),

    location: getInputValue("race-location-input"),

    federation: getInputValue("race-federation-input"),

    discipline: getInputValue("race-discipline-input"),

    category: getInputValue("race-category-input"),

    startTime: getInputValue("race-start-time-input"),

    minutesPerAthlete: Number(getInputValue("race-minutes-input")),

    participants: getDraftParticipants(),
  };
}

function validateRaceForm(formData) {
  if (!formData.name) {
    return "Inserisci il nome della gara.";
  }

  if (!formData.date) {
    return "Inserisci la data della gara.";
  }

  if (!formData.category) {
    return "Inserisci la categoria.";
  }

  if (!formData.startTime) {
    return "Inserisci l'orario di inizio della categoria.";
  }

  if (
    !Number.isFinite(formData.minutesPerAthlete) ||
    formData.minutesPerAthlete < 1
  ) {
    return "Inserisci una durata valida per atleta.";
  }

  if (formData.participants.length === 0) {
    return "Aggiungi almeno una partecipante.";
  }

  return null;
}

/*
==================================================
CREAZIONE NUOVA GARA
==================================================
*/

function createNewRace(formData) {
  const newRace = createRace({
    ...formData,
  });

  addRaceToState(newRace);

  saveRaces(appState.races);

  setCurrentRaceId(newRace.id);

  setActiveRaceId(newRace.id);

  finishRaceForm("race-dashboard-screen");
}

/*
==================================================
SALVATAGGIO MODIFICHE GARA
==================================================
*/

function updateExistingRace(formData) {
  const editingRaceId = getEditingRaceId();

  const editingRace = getEditingRace();

  if (!editingRaceId || !editingRace) {
    showRaceFormError("La gara da modificare non è più disponibile.");

    return;
  }

  const updated = updateRaceInState(editingRaceId, {
    ...formData,
    participants: formData.participants,
  });

  if (!updated) {
    showRaceFormError("Non è stato possibile salvare le modifiche.");

    return;
  }

  saveRaces(appState.races);

  setCurrentRaceId(editingRaceId);

  setActiveRaceId(editingRaceId);

  finishRaceForm("race-dashboard-screen", {
    returnToPreviousScreen: true,
  });
}

/*
==================================================
CHIUSURA FORM
==================================================
*/

function finishRaceForm(targetScreen, options = {}) {
  const { returnToPreviousScreen = false } = options;

  exitRaceEditMode();

  resetRaceFormFields();
  updateRaceFormModeUI();
  renderDraftParticipants();

  render();

  if (returnToPreviousScreen) {
    goBack(targetScreen);
    return;
  }

  showScreen(targetScreen);
}

/*
==================================================
AGGIUNTA PARTECIPANTE
==================================================
*/

function connectParticipantForm() {
  const addParticipantButton = document.getElementById("add-race-participant");

  const participantList = document.getElementById("race-participants-list");

  if (addParticipantButton) {
    addParticipantButton.addEventListener("click", createDraftParticipant);
  }

  if (participantList) {
    participantList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-participant]");

      if (!removeButton) {
        return;
      }

      const participantId = removeButton.dataset.removeParticipant;

      const participant = getDraftParticipants().find(
        (item) => item.id === participantId,
      );

      const confirmed = confirm(
        `Rimuovere ${participant?.name || "questa partecipante"} dalla gara?`,
      );

      if (!confirmed) {
        return;
      }

      removeDraftParticipant(participantId);

      renderDraftParticipants();
    });
  }
}

function createDraftParticipant() {
  hideRaceFormError();

  const name = getInputValue("participant-name-input");

  const club = getInputValue("participant-club-input");

  const entryNumber = Number(getInputValue("participant-entry-input"));

  const isFavorite = getInputValue("participant-favorite-input") === "true";

  if (!name) {
    showRaceFormError("Inserisci il nome dell'atleta.");

    return;
  }

  if (!Number.isInteger(entryNumber) || entryNumber < 1) {
    showRaceFormError("Inserisci un numero di entrata valido.");

    return;
  }

  const existingEntryNumber = getDraftParticipants().some(
    (participant) => Number(participant.entryNumber) === entryNumber,
  );

  if (existingEntryNumber) {
    showRaceFormError("Questo numero di entrata è già stato utilizzato.");

    return;
  }

  const archiveAthlete = getOrCreateArchiveAthlete(name, club);

  const participant = createParticipant({
    athleteId: archiveAthlete.id,

    name: archiveAthlete.name,

    club: archiveAthlete.club,

    entryNumber,
    isFavorite,

    notes: archiveAthlete.notes,

    previousResults: archiveAthlete.previousResults,
  });

  const added = addDraftParticipant(participant);

  if (!added) {
    showRaceFormError("Non è stato possibile aggiungere la partecipante.");

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

function getOrCreateArchiveAthlete(name, club) {
  const existingAthlete = findAthleteInState(name, club);

  if (existingAthlete) {
    return existingAthlete;
  }

  const newAthlete = createAthlete({
    name,
    club,
  });

  addAthleteToState(newAthlete);

  saveAthletes(appState.athletes);

  return newAthlete;
}

function populateAthleteArchive() {
  const datalist = document.getElementById("athlete-archive-options");

  if (!datalist) {
    return;
  }

  datalist.innerHTML = "";

  appState.athletes
    .slice()
    .sort((firstAthlete, secondAthlete) =>
      firstAthlete.name.localeCompare(secondAthlete.name, "it-IT"),
    )
    .forEach((athlete) => {
      const option = document.createElement("option");

      option.value = athlete.name;

      option.label = athlete.club || "Società non indicata";

      datalist.appendChild(option);
    });
}

function connectAthleteArchiveSelection() {
  const nameInput = document.getElementById("participant-name-input");

  if (!nameInput) {
    return;
  }

  nameInput.addEventListener("change", () => {
    const selectedName = normalizeSearchValue(nameInput.value);

    const selectedAthlete = appState.athletes.find(
      (athlete) => normalizeSearchValue(athlete.name) === selectedName,
    );

    if (!selectedAthlete) {
      return;
    }

    setInputValue("participant-club-input", selectedAthlete.club);
  });
}

/*
==================================================
ELENCO PARTECIPANTI PROVVISORIE
==================================================
*/

function renderDraftParticipants() {
  const participants = getDraftParticipants();

  const countElement = document.getElementById("race-participants-count");

  const container = document.getElementById("race-participants-list");

  if (countElement) {
    countElement.textContent = participants.length;
  }

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (participants.length === 0) {
    container.innerHTML = `
      <p class="small-muted">
        Nessuna partecipante inserita.
      </p>
    `;

    return;
  }

  participants.forEach((participant) => {
    const row = document.createElement("div");

    row.className = participant.isFavorite
      ? "athlete-row athlete-highlight"
      : "athlete-row";

    row.innerHTML = `
        <div class="athlete-number">
          ${escapeHtml(participant.entryNumber)}
        </div>

        <div class="athlete-info">
          <strong>
            ${participant.isFavorite ? "⭐ " : ""}

            ${escapeHtml(participant.name)}
          </strong>

          <span>
            ${escapeHtml(participant.club || "Società non indicata")}
          </span>

          ${
            participant.scores
              ? `
                <small class="notes-active">
                  Punteggi già presenti
                </small>
              `
              : ""
          }
        </div>

        <button
          class="ghost-button participant-remove-button"
          type="button"
          data-remove-participant="${participant.id}"
        >
          Rimuovi
        </button>
      `;

    container.appendChild(row);
  });
}

/*
==================================================
RICERCA ATLETE
==================================================
*/

function connectAthleteSearch() {
  const searchInput = document.getElementById("athlete-search-input");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    const searchValue = normalizeSearchValue(searchInput.value);

    document
      .querySelectorAll("#athlete-list-container .athlete-row")
      .forEach((row) => {
        const rowText = normalizeSearchValue(row.textContent);

        row.style.display = rowText.includes(searchValue) ? "" : "none";
      });
  });
}

/*
==================================================
RESET FORM
==================================================
*/

function resetRaceFormFields() {
  const form = document.getElementById("manual-race-form");

  if (form) {
    form.reset();
  }

  setInputValue("editing-race-id", "");

  setInputValue("race-minutes-input", "4");

  clearDraftParticipants();
  clearParticipantInputs();
  hideRaceFormError();
}

function clearParticipantInputs() {
  setInputValue("participant-name-input", "");

  setInputValue("participant-club-input", "");

  setInputValue("participant-entry-input", "");

  setInputValue("participant-favorite-input", "false");
}

/*
==================================================
MESSAGGI DI ERRORE
==================================================
*/

function showRaceFormError(message) {
  const errorElement = document.getElementById("race-form-error");

  if (!errorElement) {
    alert(message);

    return;
  }

  errorElement.textContent = message;

  errorElement.hidden = false;

  errorElement.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function hideRaceFormError() {
  const errorElement = document.getElementById("race-form-error");

  if (errorElement) {
    errorElement.hidden = true;
    errorElement.textContent = "";
  }
}

/*
==================================================
FUNZIONI GENERICHE
==================================================
*/

function getInputValue(elementId) {
  const element = document.getElementById(elementId);

  return String(element?.value || "").trim();
}

function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.value = value ?? "";
  }
}

function setTextById(elementId, value) {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = value ?? "";
  }
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("it-IT");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*
==================================================
DEBUG ALPHA
==================================================
*/

window.rollerScoreState = appState;

/*
==================================================
SERVICE WORKER
==================================================
*/

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");

      registration.update();
    } catch (error) {
      console.error("Errore Service Worker:", error);
    }
  });
}
