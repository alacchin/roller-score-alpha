// ======================================
// RENDERER.JS
// Aggiorna la UI leggendo lo stato unico
// Versione: Alpha 0.0.8
// ======================================

import {
  getCurrentRace,
  getCurrentAthlete,
  getFavoriteAthlete,
  getAthletePosition,
} from "./state.js";

import { DOM } from "./dom.js";

import {
  formatAthleteName,
  formatNotesCount,
  getNotesClass,
  getScoreStatusClass,
  getScoreStatusIcon,
} from "./ui.js";

export function render() {
  const race = getCurrentRace();
  const currentAthlete = getCurrentAthlete();
  const favoriteAthlete = getFavoriteAthlete();

  if (!race) return;

  renderHome(race, favoriteAthlete);
  renderDashboard(race, favoriteAthlete);
  renderAthleteList(race);
  renderScoreEntry(race, currentAthlete);
  renderAthleteSheet(currentAthlete);
}

function renderHome(race, favoriteAthlete) {
  setText(DOM.home.raceName(), race.name);
  setText(DOM.home.raceInfo(), `${race.federation} • ${race.category}`);

  if (!favoriteAthlete) return;

  setText(DOM.home.favoriteTitle(), "⭐ La nostra atleta");
  setText(
    DOM.home.favoriteLiveStatus(),
    getFavoriteLiveStatus(race, favoriteAthlete)
  );
  setText(
    DOM.home.favoritePosition(),
    formatAthletePosition(race, favoriteAthlete)
  );
  setText(DOM.home.favoriteEntryNumber(), favoriteAthlete.order);
  setText(
    DOM.home.categoryStartTime(),
    getCategoryStartTime(race, favoriteAthlete)
  );
  setText(
    DOM.home.favoriteEstimatedTime(),
    getAthleteEstimatedTime(race, favoriteAthlete)
  );
}

function renderDashboard(race, favoriteAthlete) {
  const totalCount = race.athletes.length;
  const completedCount = race.athletes.filter(
    (athlete) => athlete.status === "completed"
  ).length;
  const missingCount = race.athletes.filter(
    (athlete) => athlete.status === "missing"
  ).length;
  const todoCount = totalCount - completedCount;

  setText(DOM.dashboard.raceName(), race.name);
  setText(DOM.dashboard.raceInfo(), `${race.category} • ${race.location}`);
  setText(DOM.dashboard.progressText(), `${completedCount} / ${totalCount}`);
  setText(DOM.dashboard.athletesCount(), totalCount);
  setText(DOM.dashboard.completedCount(), completedCount);
  setText(DOM.dashboard.todoCount(), todoCount);
  setText(DOM.dashboard.missingCount(), missingCount);

  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  setWidth(DOM.dashboard.progressFill(), `${progressPercent}%`);

  updateRaceStatus(completedCount, totalCount);

  if (!favoriteAthlete) return;

  setText(
    DOM.dashboard.favoritePosition(),
    formatAthletePosition(race, favoriteAthlete)
  );
  setText(DOM.dashboard.favoriteEntryNumber(), favoriteAthlete.order);
  setText(
    DOM.dashboard.categoryStartTime(),
    getCategoryStartTime(race, favoriteAthlete)
  );
  setText(
    DOM.dashboard.favoriteEstimatedTime(),
    getAthleteEstimatedTime(race, favoriteAthlete)
  );
}

function renderAthleteList(race) {
  const list = DOM.athleteList.container();

  setText(DOM.athleteList.title(), race.category);
  setText(
    DOM.athleteList.subtitle(),
    `${race.name} • ${race.athletes.length} atlete`
  );

  if (!list) return;

  list.innerHTML = "";

  race.athletes.forEach((athlete) => {
    const row = document.createElement("button");
    row.className = `athlete-row ${
      athlete.isFavorite ? "athlete-highlight" : ""
    }`;
    row.type = "button";
    row.dataset.athleteId = athlete.id;

    row.innerHTML = `
      <div class="athlete-number">${athlete.order}</div>
      <div class="athlete-info">
        <strong>${formatAthleteName(athlete)}</strong>
        <span>${athlete.club}</span>
        <small class="${getNotesClass(athlete.notes)}">
          ${formatNotesCount(athlete.notes)}
        </small>
      </div>
      <div class="athlete-status ${getScoreStatusClass(athlete.status)}">
        ${getScoreStatusIcon(athlete.status)}
      </div>
    `;

    list.appendChild(row);
  });
}

function renderScoreEntry(race, athlete) {
  if (!athlete) return;

  setText(DOM.scoreEntry.order(), formatAthletePosition(race, athlete));
  setText(DOM.scoreEntry.athleteName(), formatAthleteName(athlete));
  setText(DOM.scoreEntry.athleteClub(), athlete.club);
  setText(DOM.scoreEntry.notesCount(), formatNotesCount(athlete.notes));
  setText(DOM.scoreEntry.statusLabel(), getStatusLabel(athlete.status));

  const statusBadge = DOM.scoreEntry.statusBadge();

  if (statusBadge) {
    statusBadge.className = `score-status-badge ${getScoreStatusClass(
      athlete.status
    )}`;
    statusBadge.textContent = getScoreStatusIcon(athlete.status);
  }

  DOM.scoreEntry.technicalInputs().forEach((input, index) => {
    input.value = athlete.scores?.technical?.[index] ?? "";
  });

  DOM.scoreEntry.artisticInputs().forEach((input, index) => {
    input.value = athlete.scores?.artistic?.[index] ?? "";
  });

  const penaltyInput = DOM.scoreEntry.penaltyInput();
  const noteInput = DOM.scoreEntry.noteInput();

  if (penaltyInput) penaltyInput.value = athlete.scores?.penalty ?? "";
  if (noteInput) noteInput.value = athlete.scores?.note ?? "";

  updateScoreNavigationButtons(race, athlete);
}

function renderAthleteSheet(athlete) {
  if (!athlete) return;

  setText(DOM.athleteSheet.name(), formatAthleteName(athlete));
  setText(DOM.athleteSheet.club(), athlete.club);

  const notesContainer = DOM.athleteSheet.notes();
  const resultsContainer = DOM.athleteSheet.results();

  if (notesContainer) {
    notesContainer.innerHTML = "";

    if (!athlete.notes.length) {
      notesContainer.innerHTML = "<p>• Nessuna nota precedente</p>";
    } else {
      athlete.notes.forEach((note) => {
        const p = document.createElement("p");
        p.textContent = `• ${note}`;
        notesContainer.appendChild(p);
      });
    }
  }

  if (resultsContainer) {
    resultsContainer.innerHTML = "";

    if (!athlete.previousResults.length) {
      resultsContainer.innerHTML = "<p>Nessuna gara precedente registrata</p>";
    } else {
      athlete.previousResults.forEach((result) => {
        const p = document.createElement("p");
        p.textContent = result;
        resultsContainer.appendChild(p);
      });
    }
  }
}

function getFavoriteLiveStatus(race, favoriteAthlete) {
  if (favoriteAthlete.status === "completed") {
    return "✅ VALUTAZIONE COMPLETATA";
  }

  if (favoriteAthlete.status === "current") {
    return "🔵 IN PISTA";
  }

  const favoritePosition = getAthletePosition(favoriteAthlete.id);

  if (!favoritePosition) {
    return "---";
  }

  const athletesBefore = race.athletes.slice(0, favoritePosition - 1);

  const pendingBeforeCount = athletesBefore.filter(
    (athlete) => athlete.status !== "completed"
  ).length;

  if (pendingBeforeCount === 0) {
    return "🟠 PROSSIMA ATLETA";
  }

  if (pendingBeforeCount === 1) {
    return "🟡 TRA 1 ATLETA";
  }

  return `🟡 TRA ${pendingBeforeCount} ATLETE`;
}

function updateRaceStatus(completedCount, totalCount) {
  const statusElement = document.querySelector(".status-box strong");

  if (!statusElement) return;

  if (completedCount === 0) {
    statusElement.textContent = "🟢 Preparata";
    return;
  }

  if (completedCount >= totalCount) {
    statusElement.textContent = "✅ Completata";
    return;
  }

  statusElement.textContent = "🔵 In corso";
}

function updateScoreNavigationButtons(race, athlete) {
  const position = getAthletePosition(athlete.id);
  const previousButton = DOM.scoreEntry.previousButton();
  const nextButton = DOM.scoreEntry.nextButton();

  if (!position) return;

  if (previousButton) previousButton.disabled = position === 1;
  if (nextButton) nextButton.disabled = position === race.athletes.length;
}

function formatAthletePosition(race, athlete) {
  const position = getAthletePosition(athlete.id);
  if (!position) return "-- atleta di --";
  return `${position}ª atleta di ${race.athletes.length}`;
}

function getCategoryStartTime(race, athlete) {
  const position = getAthletePosition(athlete.id);
  if (!position) return "--:--";
  return calculateEstimatedTime(race.startTime, 1, race.minutesPerAthlete);
}

function getAthleteEstimatedTime(race, athlete) {
  const position = getAthletePosition(athlete.id);
  if (!position) return "--:--";
  return calculateEstimatedTime(
    race.startTime,
    position,
    race.minutesPerAthlete
  );
}

function getStatusLabel(status) {
  switch (status) {
    case "completed":
      return "Completata";
    case "current":
      return "In corso";
    case "missing":
      return "Da completare";
    case "todo":
    default:
      return "Da fare";
  }
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function setWidth(element, value) {
  if (element) element.style.width = value;
}

function calculateEstimatedTime(startTime, position, minutesPerAthlete) {
  if (!startTime || !position || !minutesPerAthlete) return "--:--";

  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();

  startDate.setHours(hours);
  startDate.setMinutes(minutes);
  startDate.setSeconds(0);

  const estimatedDate = new Date(
    startDate.getTime() + (position - 1) * minutesPerAthlete * 60000
  );

  return estimatedDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
