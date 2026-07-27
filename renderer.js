import {
  appState,
  getCurrentRace,
  getCurrentParticipant,
  getFavoriteParticipant,
  getParticipantPosition,
  getParticipants,
  getRaceStatistics,
} from "./state.js";

import {
  formatNotesCount,
  getNotesClass,
  getScoreStatusClass,
  getScoreStatusIcon,
  getStatusLabel,
} from "./ui.js";

import { getRaceStatusInfo } from "./raceUtils.js";

/*
==================================================
RENDER GENERALE
==================================================
*/

export function render() {
  const currentRace = getCurrentRace();

  renderHome(currentRace);

  renderRaceList(appState.races);

  if (!currentRace) {
    renderEmptyDashboard();
    renderEmptyAthleteList();
    renderEmptyScoreEntry();
    return;
  }

  renderDashboard(currentRace);

  renderAthleteList(currentRace);

  renderScoreEntry(currentRace, getCurrentParticipant());

  renderAthleteSheet(getCurrentParticipant());
}

/*
==================================================
HOME
==================================================
*/

function renderHome(race) {
  const raceName = document.getElementById("home-race-name");

  const raceInfo = document.getElementById("home-race-info");

  const favoriteName = document.getElementById("home-favorite-athlete");

  const favoriteStatus = document.getElementById("home-favorite-live-status");

  const favoritePosition = document.getElementById("home-favorite-position");

  const favoriteEntryNumber = document.getElementById(
    "home-favorite-entry-number",
  );

  const categoryStartTime = document.getElementById("home-category-start-time");

  const estimatedTime = document.getElementById("home-favorite-estimated-time");

  renderHomeRaceProgress(race);

  if (!race) {
    setText(raceName, "Nessuna gara");

    setText(raceInfo, "Premi “Nuova gara” per iniziare");

    setText(favoriteName, "⭐ Nessuna atleta preferita");

    setText(favoriteStatus, "---");

    setText(favoritePosition, "-- atleta di --");

    setText(favoriteEntryNumber, "--");

    setText(categoryStartTime, "--:--");

    setText(estimatedTime, "--:--");

    return;
  }

  setText(raceName, race.name);

  setText(raceInfo, buildRaceInfo(race));

  const favorite = getFavoriteParticipant(race);

  if (!favorite) {
    setText(favoriteName, "⭐ Nessuna atleta preferita");

    setText(favoriteStatus, "---");

    setText(favoritePosition, "-- atleta di --");

    setText(favoriteEntryNumber, "--");

    setText(categoryStartTime, race.startTime || "--:--");

    setText(estimatedTime, "--:--");

    return;
  }

  setText(favoriteName, `⭐ ${favorite.name}`);

  setText(favoriteStatus, getFavoriteLiveStatus(race, favorite));

  setText(favoritePosition, formatParticipantPosition(race, favorite));

  setText(favoriteEntryNumber, favorite.entryNumber);

  setText(categoryStartTime, race.startTime || "--:--");

  setText(estimatedTime, getEstimatedTime(race, favorite));
}

function renderHomeRaceProgress(race) {
  const statusElement = document.getElementById("home-race-status");

  const progressText = document.getElementById("home-progress-text");

  const progressFill = document.getElementById("home-progress-fill");

  const nextAthleteElement = document.getElementById("home-next-athlete");

  const primaryButton = document.getElementById("go-score-entry-home");

  if (!race) {
    setText(statusElement, "---");
    setText(progressText, "0 / 0");
    setText(nextAthleteElement, "Nessuna gara attiva");

    if (progressFill) {
      progressFill.style.width = "0%";
    }

    if (primaryButton) {
      primaryButton.textContent = "▶ Inizia gara";
      primaryButton.disabled = true;
    }

    return;
  }

  const statistics = getRaceStatistics(race);

  const participants = getParticipants(race);

  const raceStatus = getRaceStatusInfo(race);

  const progressPercentage =
    statistics.total > 0
      ? Math.round((statistics.completed / statistics.total) * 100)
      : 0;

  const nextParticipant =
    participants.find((participant) => participant.status === "current") ||
    participants.find((participant) => participant.status === "todo") ||
    participants.find((participant) => participant.status === "missing") ||
    null;

  setText(statusElement, `${raceStatus.icon} ${raceStatus.label}`);

  setText(
    progressText,
    `${statistics.completed} / ${statistics.total} · ${progressPercentage}%`,
  );

  if (progressFill) {
    progressFill.style.width = `${progressPercentage}%`;
  }

  if (!nextParticipant) {
    setText(nextAthleteElement, "Gara completata");
  } else {
    setText(
      nextAthleteElement,
      `N. ${nextParticipant.entryNumber} — ${nextParticipant.name}`,
    );
  }

  if (!primaryButton) {
    return;
  }

  primaryButton.disabled = false;

  if (raceStatus.key === "in-progress") {
    primaryButton.textContent = "▶ Riprendi gara";
    return;
  }

  if (raceStatus.key === "completed") {
    primaryButton.textContent = "🔎 Rivedi punteggi";
    return;
  }

  primaryButton.textContent = "▶ Inizia gara";
}
function renderRaceList(races = []) {
  const container = document.getElementById("race-list-container");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(races) || races.length === 0) {
    container.innerHTML = `
      <div class="race-list-empty">
        <p>Nessuna gara salvata.</p>
      </div>
    `;

    return;
  }

  const sortedRaces = [...races].sort(
    (firstRace, secondRace) =>
      getRaceTimestamp(secondRace) - getRaceTimestamp(firstRace),
  );

  sortedRaces.forEach((race) => {
    const status = getRaceStatusInfo(race);

    const participants = getParticipants(race);

    const completedCount = participants.filter(
      (participant) => participant.status === "completed",
    ).length;

    const card = document.createElement("button");

    card.type = "button";

    card.className = `race-card race-card-${getRaceStatusCssClass(status.key)}`;

    card.dataset.raceId = race.id;

    card.innerHTML = `
        <div class="race-card-header">
          <span class="race-status-badge">
            ${status.icon}
            ${status.label}
          </span>

          <span class="race-card-arrow">
            ›
          </span>
        </div>

        <strong class="race-card-title">
          ${escapeHtml(race.name || "Gara senza nome")}
        </strong>

        <span class="race-card-info">
          ${escapeHtml(buildRaceInfo(race) || "Informazioni non disponibili")}
        </span>

        <div class="race-card-details">
          <span>
            📅 ${formatRaceDate(race.date)}
          </span>

          <span>
            👤 ${participants.length}
            ${participants.length === 1 ? "atleta" : "atlete"}
          </span>
        </div>

        ${
          status.key === "in-progress"
            ? `
              <div class="race-card-progress">
                <div class="race-card-progress-text">
                  <span>Avanzamento</span>

                  <strong>
                    ${completedCount} / ${participants.length}
                  </strong>
                </div>

                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style="width: ${getRaceProgressPercentage(participants)}%"
                  ></div>
                </div>
              </div>
            `
            : ""
        }
      `;

    container.appendChild(card);
  });
}
/*
==================================================
DASHBOARD GARA
==================================================
*/

function renderDashboard(race) {
  const statistics = getRaceStatistics(race);

  setTextById("dashboard-race-name", race.name);

  setTextById("dashboard-race-info", buildRaceInfo(race));

  const raceStatus = getRaceStatusInfo(race);

  setTextById(
    "dashboard-race-status",
    `${raceStatus.icon} ${raceStatus.label}`,
  );

  setTextById(
    "dashboard-progress-text",
    `${statistics.completed} / ${statistics.total}`,
  );

  setTextById("dashboard-athletes-count", statistics.total);

  setTextById("dashboard-completed-count", statistics.completed);

  setTextById("dashboard-todo-count", statistics.todo);

  setTextById("dashboard-missing-count", statistics.missing);

  const progressFill = document.getElementById("dashboard-progress-fill");

  if (progressFill) {
    const percentage =
      statistics.total > 0
        ? (statistics.completed / statistics.total) * 100
        : 0;

    progressFill.style.width = `${percentage}%`;
  }

  const favorite = getFavoriteParticipant(race);

  if (!favorite) {
    setTextById("dashboard-favorite-position", "-- atleta di --");

    setTextById("dashboard-favorite-entry-number", "--");

    setTextById("dashboard-category-start-time", race.startTime || "--:--");

    setTextById("dashboard-favorite-estimated-time", "--:--");

    return;
  }

  setTextById(
    "dashboard-favorite-position",
    formatParticipantPosition(race, favorite),
  );

  setTextById("dashboard-favorite-entry-number", favorite.entryNumber);

  setTextById("dashboard-category-start-time", race.startTime || "--:--");

  setTextById(
    "dashboard-favorite-estimated-time",
    getEstimatedTime(race, favorite),
  );
}

function renderEmptyDashboard() {
  setTextById("dashboard-race-name", "Nessuna gara");

  setTextById("dashboard-race-info", "---");

  setTextById("dashboard-progress-text", "0 / 0");

  setTextById("dashboard-athletes-count", "0");

  setTextById("dashboard-completed-count", "0");

  setTextById("dashboard-todo-count", "0");

  setTextById("dashboard-missing-count", "0");
}

/*
==================================================
ELENCO ATLETE
==================================================
*/

function renderAthleteList(race) {
  const participants = getParticipants(race);

  setTextById("athlete-list-title", race.category);

  setTextById(
    "athlete-list-subtitle",
    `${race.name} • ${participants.length} atlete`,
  );

  const container = document.getElementById("athlete-list-container");

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
    const button = document.createElement("button");

    button.type = "button";

    button.dataset.participantId = participant.id;

    button.className = participant.isFavorite
      ? "athlete-row athlete-highlight"
      : "athlete-row";

    button.innerHTML = `
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

          <small class="${getNotesClass(participant.notes)}">
            ${formatNotesCount(participant.notes)}
          </small>
        </div>

        <div class="athlete-status ${getScoreStatusClass(participant.status)}">
          ${getScoreStatusIcon(participant.status)}
        </div>
      `;

    container.appendChild(button);
  });
}

function renderEmptyAthleteList() {
  setTextById("athlete-list-title", "Nessuna gara");

  setTextById("athlete-list-subtitle", "---");

  const container = document.getElementById("athlete-list-container");

  if (container) {
    container.innerHTML = `
      <p class="small-muted">
        Crea una gara e aggiungi le partecipanti.
      </p>
    `;
  }
}

/*
==================================================
INSERIMENTO PUNTEGGI
==================================================
*/

function renderScoreEntry(race, participant) {
  if (!participant) {
    renderEmptyScoreEntry();
    return;
  }

  setTextById(
    "score-entry-order",
    formatParticipantPosition(race, participant),
  );

  setTextById("score-entry-athlete-name", participant.name);

  setTextById(
    "score-entry-athlete-club",
    participant.club || "Società non indicata",
  );

  setTextById("score-entry-notes-count", formatNotesCount(participant.notes));

  setTextById("score-entry-status-label", getStatusLabel(participant.status));

  const statusBadge = document.getElementById("score-entry-status-badge");

  if (statusBadge) {
    statusBadge.className = `score-status-badge ${getScoreStatusClass(
      participant.status,
    )}`;

    statusBadge.textContent = getScoreStatusIcon(participant.status);
  }

  const technicalInputs = document.querySelectorAll("[data-score-technical]");

  technicalInputs.forEach((input, index) => {
    input.value = participant.scores?.technical?.[index] ?? "";
  });

  const artisticInputs = document.querySelectorAll("[data-score-artistic]");

  artisticInputs.forEach((input, index) => {
    input.value = participant.scores?.artistic?.[index] ?? "";
  });

  const penaltyInput = document.getElementById("score-penalty");

  if (penaltyInput) {
    penaltyInput.value = participant.scores?.penalty ?? "";
  }

  const noteInput = document.getElementById("score-note");

  if (noteInput) {
    noteInput.value = participant.scores?.note ?? "";
  }

  updateNavigationButtons(race, participant);
}

function renderEmptyScoreEntry() {
  setTextById("score-entry-order", "-- atleta di --");

  setTextById("score-entry-athlete-name", "Nessuna atleta");

  setTextById("score-entry-athlete-club", "---");

  setTextById("score-entry-notes-count", "📝 Nessuna nota");

  setTextById("score-entry-status-label", "Da fare");

  clearScoreInputs();
}

/*
==================================================
SCHEDA ATLETA
==================================================
*/

function renderAthleteSheet(participant) {
  if (!participant) {
    setTextById("sheet-athlete-name", "Nessuna atleta");

    setTextById("sheet-athlete-club", "---");

    return;
  }

  setTextById("sheet-athlete-name", participant.name);

  setTextById("sheet-athlete-club", participant.club || "Società non indicata");

  const notesContainer = document.getElementById("sheet-athlete-notes");

  if (notesContainer) {
    if (participant.notes?.length) {
      notesContainer.innerHTML = participant.notes
        .map(
          (note) => `
              <p>
                • ${escapeHtml(note)}
              </p>
            `,
        )
        .join("");
    } else {
      notesContainer.innerHTML = `
        <p class="small-muted">
          Nessuna nota precedente.
        </p>
      `;
    }
  }

  const resultsContainer = document.getElementById("sheet-athlete-results");

  if (resultsContainer) {
    if (participant.previousResults?.length) {
      resultsContainer.innerHTML = participant.previousResults
        .map(
          (result) => `
              <p>
                ${escapeHtml(result)}
              </p>
            `,
        )
        .join("");
    } else {
      resultsContainer.innerHTML = `
        <p class="small-muted">
          Nessuna gara precedente registrata.
        </p>
      `;
    }
  }
}

/*
==================================================
FUNZIONI DI SUPPORTO
==================================================
*/

function buildRaceInfo(race) {
  const parts = [race.federation, race.discipline, race.category].filter(
    Boolean,
  );

  return parts.join(" • ");
}

function formatParticipantPosition(race, participant) {
  const position = getParticipantPosition(participant.id, race);

  const total = getParticipants(race).length;

  if (!position) {
    return "-- atleta di --";
  }

  return `${position}ª atleta di ${total}`;
}

function getFavoriteLiveStatus(race, favorite) {
  if (favorite.status === "completed") {
    return "✅ VALUTAZIONE COMPLETATA";
  }

  if (favorite.status === "current") {
    return "🔵 IN PISTA";
  }

  const position = getParticipantPosition(favorite.id, race);

  if (!position) {
    return "---";
  }

  const participantsBefore = getParticipants(race).slice(0, position - 1);

  const pendingBefore = participantsBefore.filter(
    (participant) => participant.status !== "completed",
  ).length;

  if (pendingBefore === 0) {
    return "🟠 PROSSIMA ATLETA";
  }

  if (pendingBefore === 1) {
    return "🟡 TRA 1 ATLETA";
  }

  return `🟡 TRA ${pendingBefore} ATLETE`;
}

function getEstimatedTime(race, participant) {
  const position = getParticipantPosition(participant.id, race);

  if (!position || !race.startTime) {
    return "--:--";
  }

  const [hours, minutes] = race.startTime.split(":").map(Number);

  const estimatedDate = new Date();

  estimatedDate.setHours(hours, minutes, 0, 0);

  estimatedDate.setMinutes(
    estimatedDate.getMinutes() +
      (position - 1) * Number(race.minutesPerAthlete || 4),
  );

  return estimatedDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateNavigationButtons(race, participant) {
  const position = getParticipantPosition(participant.id, race);

  const total = getParticipants(race).length;

  const previousButton = document.getElementById("previous-athlete");

  const nextButton = document.getElementById("next-athlete");

  if (previousButton) {
    previousButton.disabled = position === 1;
  }

  if (nextButton) {
    nextButton.disabled = position === total;
  }
}

function clearScoreInputs() {
  document
    .querySelectorAll("[data-score-technical], [data-score-artistic]")
    .forEach((input) => {
      input.value = "";
    });

  const penaltyInput = document.getElementById("score-penalty");

  if (penaltyInput) {
    penaltyInput.value = "";
  }

  const noteInput = document.getElementById("score-note");

  if (noteInput) {
    noteInput.value = "";
  }
}

function getRaceStatusCssClass(status) {
  const cssClassMap = {
    prepared: "planned",
    "in-progress": "in-progress",
    completed: "completed",
    archived: "archived",
  };

  return cssClassMap[status] || "planned";
}

function getRaceTimestamp(race) {
  if (!race.date) {
    return 0;
  }

  return new Date(race.date).getTime();
}

function formatRaceDate(date) {
  if (!date) {
    return "--";
  }

  return new Date(date).toLocaleDateString("it-IT");
}

function getRaceProgressPercentage(participants) {
  if (!participants.length) {
    return 0;
  }

  const completed = participants.filter(
    (participant) => participant.status === "completed",
  ).length;

  return Math.round((completed / participants.length) * 100);
}

function setTextById(elementId, value) {
  const element = document.getElementById(elementId);

  setText(element, value);
}

function setText(element, value) {
  if (element) {
    element.textContent = value ?? "";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
