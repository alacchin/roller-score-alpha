import {
  calculateRanking,
  getFavoriteRanking,
  getParticipantRanking,
} from "./ranking.js";

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
    renderEmptyRanking();
    renderEmptyAthleteList();
    renderEmptyScoreEntry();

    return;
  }

  renderDashboard(currentRace);

  renderRanking(currentRace);

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

  const otherRacesCount = document.getElementById("home-other-races-count");

  const favoriteName = document.getElementById("home-favorite-athlete");

  const favoriteStatus = document.getElementById("home-favorite-live-status");

  const favoritePosition = document.getElementById("home-favorite-position");

  const favoriteEntryNumber = document.getElementById(
    "home-favorite-entry-number",
  );

  const favoriteCategory = document.getElementById("home-favorite-category");

  const categoryStartTime = document.getElementById("home-category-start-time");

  const estimatedTime = document.getElementById("home-favorite-estimated-time");

  renderHomeRaceProgress(race);

  if (!race) {
    setText(raceName, "Nessuna gara");

    setText(raceInfo, "Premi “Nuova gara” per iniziare");

    setText(otherRacesCount, "Nessun'altra gara programmata");

    setText(favoriteName, "⭐ Nessuna atleta preferita");

    setText(favoriteStatus, "---");

    setText(favoritePosition, "-- atleta di --");

    setText(favoriteCategory, "--");

    setText(favoriteEntryNumber, "--");

    setText(categoryStartTime, "--:--");

    setText(estimatedTime, "--:--");

    return;
  }

  setText(raceName, race.name);

  setText(raceInfo, buildRaceInfo(race));

  setText(otherRacesCount, formatOtherOpenRacesCount(race));

  const favorite = getFavoriteParticipant(race);

  setText(favoriteCategory, race.category || "--");

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

    const favoriteRanking = getFavoriteRanking(race);

    const showFavoritePlacement =
      (status.key === "completed" || status.key === "archived") &&
      favoriteRanking?.isEvaluated;

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
          showFavoritePlacement
            ? `
      <div class="race-card-favorite-result">
        ⭐ La nostra atleta:
        <strong>
          ${formatFullRankingPosition(
            favoriteRanking.position,
          )} su ${participants.length}
        </strong>
      </div>
    `
            : ""
        }

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

  updateDashboardPrimaryButton(raceStatus);

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

  const favoriteCard = document.getElementById("dashboard-favorite-card");

  if (favoriteCard) {
    favoriteCard.hidden = !favorite;
  }

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

function updateDashboardPrimaryButton(raceStatus) {
  const button = document.getElementById("go-score-entry-dashboard");

  if (!button) {
    return;
  }

  const buttonLabels = {
    prepared: "▶ Inizia gara",
    "in-progress": "▶ Continua gara",
    completed: "🔎 Riapri punteggi",
    archived: "🔎 Rivedi punteggi",
  };

  button.textContent = buttonLabels[raceStatus?.key] || "▶ Inizia gara";
}

/*
==================================================
CLASSIFICA LIVE
==================================================
*/

function renderRanking(race) {
  const raceNameElement = document.getElementById("ranking-race-name");

  const raceInfoElement = document.getElementById("ranking-race-info");

  const evaluatedCountElement = document.getElementById(
    "ranking-evaluated-count",
  );

  const raceStatusElement = document.getElementById("ranking-race-status");

  const container = document.getElementById("ranking-list-container");

  if (
    !raceNameElement ||
    !raceInfoElement ||
    !evaluatedCountElement ||
    !raceStatusElement ||
    !container
  ) {
    return;
  }

  const ranking = calculateRanking(race);

  const evaluatedCount = ranking.filter((result) => result.isEvaluated).length;

  const raceStatus = getRaceStatusInfo(race);

  renderRankingLegend(race);

  setText(raceNameElement, race.name || "Gara");

  setText(raceInfoElement, buildRaceInfo(race));

  setText(evaluatedCountElement, `${evaluatedCount} / ${ranking.length}`);

  setText(raceStatusElement, `${raceStatus.icon} ${raceStatus.label}`);

  if (ranking.length === 0) {
    container.innerHTML = `
      <p class="small-muted">
        Nessuna atleta presente nella gara.
      </p>
    `;

    return;
  }

  container.innerHTML = ranking.map(buildRankingRow).join("");
}

function buildRankingRow(result) {
  const favoriteClass = result.isFavorite ? " ranking-row-favorite" : "";

  const pendingClass = result.isEvaluated ? "" : " ranking-row-pending";

  const positionLabel = result.isEvaluated
    ? formatFullRankingPosition(result.position)
    : "—";

  const medal = result.isEvaluated ? getRankingMedal(result.position) : "";

  const favoriteStar = result.isFavorite ? "⭐ " : "";

  const totalLabel = result.isEvaluated
    ? formatRankingTotal(result.total)
    : "In attesa";

  const expandableAttributes = result.isEvaluated
    ? `
        data-ranking-participant-id="${escapeHtml(result.participantId)}"
        role="button"
        tabindex="0"
        aria-expanded="false"
      `
    : "";

  return `
    <article
      class="ranking-row${favoriteClass}${pendingClass}"
      ${expandableAttributes}
    >
      <div class="ranking-row-summary">
        <div class="ranking-position">
          <strong>
            ${medal}${escapeHtml(positionLabel)}
          </strong>
        </div>

        <div class="ranking-athlete">
          <strong>
            ${favoriteStar}${escapeHtml(result.name || "Atleta")}
          </strong>

          <span>
            ${escapeHtml(result.club || "Società non indicata")}
          </span>
        </div>

        <div class="ranking-total">
          <strong>
            ${escapeHtml(totalLabel)}
          </strong>

          ${
            result.isEvaluated
              ? `
                <span>
                  T ${formatRankingTotal(result.technicalTotal)}
                  ·
                  A ${formatRankingTotal(result.artisticTotal)}
                </span>
              `
              : ""
          }
        </div>
      </div>

      ${result.isEvaluated ? buildRankingDetails(result) : ""}
    </article>
  `;
}

function buildRankingDetails(result) {
  const judgeRows = result.technicalScores
    .map((technicalScore, index) => {
      const artisticScore = result.artisticScores[index];

      return `
        <div class="ranking-judge-row">
          <span>G${index + 1}</span>

          <strong>
            T ${formatRankingTotal(technicalScore, 1)}
          </strong>

          <strong>
            A ${formatRankingTotal(artisticScore, 1)}
          </strong>
        </div>
      `;
    })
    .join("");

  return `
    <div class="ranking-row-details" aria-hidden="true">
      <div class="ranking-detail-summary">
        <div>
          <span>Tecnico</span>
          <strong>${formatRankingTotal(result.technicalTotal)}</strong>
        </div>

        <div>
          <span>Artistico</span>
          <strong>${formatRankingTotal(result.artisticTotal)}</strong>
        </div>

        <div>
          <span>Penalità</span>
          <strong>${formatRankingPenalty(result.penalty)}</strong>
        </div>
      </div>

      <div class="ranking-judge-list">
        <span class="ranking-detail-title">Dettaglio giudici</span>

        ${judgeRows}
      </div>

      <span class="ranking-detail-hint">
        Tocca di nuovo per chiudere
      </span>
    </div>
  `;
}

function renderRankingLegend(race) {
  const legend = document.querySelector("#ranking-screen .ranking-legend");

  if (!legend) {
    return;
  }

  const favoriteRanking = getFavoriteRanking(race);

  if (!favoriteRanking) {
    legend.hidden = true;
    legend.innerHTML = "";
    return;
  }

  legend.hidden = false;

  if (!favoriteRanking.isEvaluated) {
    legend.innerHTML = `
      <span>⭐ La nostra atleta — In attesa</span>
    `;
    return;
  }

  legend.innerHTML = `
    <span>
      ⭐ La nostra atleta:
      <strong>
        ${escapeHtml(formatFullRankingPosition(favoriteRanking.position))}
        posizione provvisoria
      </strong>
    </span>
  `;
}

function formatRankingPenalty(penalty) {
  const numericPenalty = Number(penalty);

  if (!Number.isFinite(numericPenalty) || numericPenalty === 0) {
    return "—";
  }

  return `-${formatRankingTotal(numericPenalty)}`;
}

function renderEmptyRanking() {
  const legend = document.querySelector("#ranking-screen .ranking-legend");

  if (legend) {
    legend.hidden = true;
    legend.innerHTML = "";
  }

  setTextById("ranking-race-name", "Nessuna gara");

  setTextById("ranking-race-info", "---");

  setTextById("ranking-evaluated-count", "0 / 0");

  setTextById("ranking-race-status", "Preparata");

  const container = document.getElementById("ranking-list-container");

  if (container) {
    container.innerHTML = `
      <p class="small-muted">
        Crea o apri una gara per visualizzare la classifica.
      </p>
    `;
  }
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

  renderScoreEntryRanking(race, participant);

  setTextById(
    "score-entry-athlete-name",
    participant.isFavorite ? `⭐ ${participant.name}` : participant.name,
  );

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

  const clearScoreButton = document.getElementById("clear-current-score");

  if (clearScoreButton) {
    clearScoreButton.hidden = !participant.scores;
  }

  updateNavigationButtons(race, participant);
}

function renderEmptyScoreEntry() {
  setTextById("score-ranking-position", "In attesa");

  setTextById("score-ranking-total", "--");
  document
    .getElementById("score-ranking-card")
    ?.classList.remove("ranking-evaluated");
  setTextById("score-entry-order", "-- atleta di --");

  setTextById("score-entry-athlete-name", "Nessuna atleta");

  setTextById("score-entry-athlete-club", "---");

  setTextById("score-entry-notes-count", "📝 Nessuna nota");

  setTextById("score-entry-status-label", "Da fare");

  const clearScoreButton = document.getElementById("clear-current-score");

  if (clearScoreButton) {
    clearScoreButton.hidden = true;
  }

  clearScoreInputs();
}

function renderScoreEntryRanking(race, participant) {
  const rankingCard = document.getElementById("score-ranking-card");

  const positionElement = document.getElementById("score-ranking-position");

  const totalElement = document.getElementById("score-ranking-total");

  if (!rankingCard || !positionElement || !totalElement) {
    return;
  }

  const rankingResult = getParticipantRanking(race, participant.id);

  if (!rankingResult?.isEvaluated) {
    positionElement.textContent = "In attesa";
    totalElement.textContent = "--";

    rankingCard.classList.remove("ranking-evaluated");

    return;
  }

  const evaluatedCount = calculateRanking(race).filter(
    (result) => result.isEvaluated,
  ).length;

  positionElement.textContent = formatRankingPosition(
    rankingResult.position,
    evaluatedCount,
  );

  totalElement.textContent = formatRankingTotal(
    rankingResult.total,
    race?.scoringProfile?.decimals,
  );

  rankingCard.classList.add("ranking-evaluated");
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

function formatOtherOpenRacesCount(currentRace) {
  const otherOpenRaces = appState.races.filter((race) => {
    if (race.id === currentRace.id) {
      return false;
    }

    const status = getRaceStatusInfo(race);

    return status.key !== "completed" && status.key !== "archived";
  });

  if (otherOpenRaces.length === 0) {
    return "Nessun'altra gara programmata";
  }

  if (otherOpenRaces.length === 1) {
    return "＋ 1 altra gara programmata";
  }

  return `＋ ${otherOpenRaces.length} altre gare programmate`;
}

function buildRaceInfo(race) {
  const dateLabel = formatRaceDate(race.date);

  const timeLabel = race.startTime ? `Ore ${race.startTime}` : null;

  const parts = [
    dateLabel !== "--" ? dateLabel : null,
    timeLabel,
    race.federation,
    race.discipline,
    race.category,
  ].filter(Boolean);

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
  if (!race?.date) {
    return 0;
  }

  const startTime = race.startTime || "00:00";

  const timestamp = new Date(`${race.date}T${startTime}:00`).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
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

function formatRankingPosition(position, evaluatedCount) {
  if (!position) {
    return "In attesa";
  }

  const ordinal = `${position}ª`;

  return `${ordinal} su ${evaluatedCount}`;
}

function formatRankingTotal(total, decimals = 2) {
  if (!Number.isFinite(Number(total))) {
    return "--";
  }

  const validDecimals =
    Number.isInteger(Number(decimals)) &&
    Number(decimals) >= 0 &&
    Number(decimals) <= 4
      ? Number(decimals)
      : 2;

  return Number(total).toFixed(validDecimals);
}

function formatFullRankingPosition(position) {
  if (!position) {
    return "—";
  }

  return `${position}ª`;
}

function getRankingMedal(position) {
  const medals = {
    1: "🥇 ",
    2: "🥈 ",
    3: "🥉 ",
  };

  return medals[position] || "";
}
