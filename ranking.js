/*
==================================================
MOTORE CLASSIFICA
Roller Score — Alpha 0.5.0
==================================================
*/

/*
==================================================
CLASSIFICA COMPLETA
==================================================
*/

export function calculateRanking(race) {
  const participants = Array.isArray(race?.participants)
    ? race.participants
    : [];

  const scoringProfile = race?.scoringProfile || {};

  const rankedParticipants = participants
    .map((participant) =>
      calculateParticipantResult(participant, scoringProfile),
    )
    .filter((result) => result.isEvaluated)
    .sort(compareRankingResults);

  assignRankingPositions(rankedParticipants);

  const pendingParticipants = participants
    .map((participant) =>
      calculateParticipantResult(participant, scoringProfile),
    )
    .filter((result) => !result.isEvaluated)
    .sort(
      (firstResult, secondResult) =>
        Number(firstResult.entryNumber) - Number(secondResult.entryNumber),
    );

  return [...rankedParticipants, ...pendingParticipants];
}

/*
==================================================
RISULTATO SINGOLA PARTECIPANTE
==================================================
*/

export function calculateParticipantResult(participant, scoringProfile = {}) {
  const technicalScores = normalizeScoreList(participant?.scores?.technical);

  const artisticScores = normalizeScoreList(participant?.scores?.artistic);

  const expectedJudgeCount = getExpectedJudgeCount(scoringProfile);

  const isEvaluated =
    technicalScores.length >= expectedJudgeCount &&
    artisticScores.length >= expectedJudgeCount;

  if (!isEvaluated) {
    return createPendingResult(participant);
  }

  const technicalTotal = sumScores(
    technicalScores.slice(0, expectedJudgeCount),
  );

  const artisticTotal = sumScores(artisticScores.slice(0, expectedJudgeCount));

  const penalty = normalizePenalty(participant?.scores?.penalty);

  const total = roundScore(
    technicalTotal + artisticTotal - penalty,
    scoringProfile.decimals,
  );

  return {
    participantId: participant.id,
    athleteId: participant.athleteId || null,

    name: participant.name || "",
    club: participant.club || "",

    entryNumber: Number(participant.entryNumber),

    isFavorite: Boolean(participant.isFavorite),

    isEvaluated: true,
    position: null,

    technicalScores,
    artisticScores,

    technicalTotal: roundScore(technicalTotal, scoringProfile.decimals),

    artisticTotal: roundScore(artisticTotal, scoringProfile.decimals),

    penalty,

    total,
  };
}

/*
==================================================
RICERCA POSIZIONE PARTECIPANTE
==================================================
*/

export function getParticipantRanking(race, participantId) {
  if (!participantId) {
    return null;
  }

  return (
    calculateRanking(race).find(
      (result) => result.participantId === participantId,
    ) || null
  );
}

export function getFavoriteRanking(race) {
  return calculateRanking(race).find((result) => result.isFavorite) || null;
}

/*
==================================================
ORDINAMENTO
==================================================
*/

function compareRankingResults(firstResult, secondResult) {
  if (secondResult.total !== firstResult.total) {
    return secondResult.total - firstResult.total;
  }

  if (secondResult.artisticTotal !== firstResult.artisticTotal) {
    return secondResult.artisticTotal - firstResult.artisticTotal;
  }

  if (secondResult.technicalTotal !== firstResult.technicalTotal) {
    return secondResult.technicalTotal - firstResult.technicalTotal;
  }

  return Number(firstResult.entryNumber) - Number(secondResult.entryNumber);
}

/*
==================================================
ASSEGNAZIONE POSIZIONI
==================================================
*/

function assignRankingPositions(results) {
  results.forEach((result, index) => {
    if (index === 0) {
      result.position = 1;
      return;
    }

    const previousResult = results[index - 1];

    if (haveSameRankingResult(result, previousResult)) {
      result.position = previousResult.position;
      return;
    }

    result.position = index + 1;
  });
}

function haveSameRankingResult(firstResult, secondResult) {
  return (
    firstResult.total === secondResult.total &&
    firstResult.artisticTotal === secondResult.artisticTotal &&
    firstResult.technicalTotal === secondResult.technicalTotal
  );
}

/*
==================================================
NORMALIZZAZIONE VOTI
==================================================
*/

function normalizeScoreList(scores) {
  if (!Array.isArray(scores)) {
    return [];
  }

  return scores.map(normalizeJudgeScore).filter((score) => score !== null);
}

function normalizeJudgeScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  /*
  Compatibilità con l'inserimento rapido:

  51 -> 5.1
  56 -> 5.6
  85 -> 8.5

  I valori già decimali, come 5.1, restano invariati.
  */

  if (Number.isInteger(numericValue) && numericValue > 10) {
    return numericValue / 10;
  }

  return numericValue;
}

function normalizePenalty(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

/*
==================================================
FUNZIONI MATEMATICHE
==================================================
*/

function sumScores(scores) {
  return scores.reduce((total, score) => total + score, 0);
}

function roundScore(value, decimals = 2) {
  const validDecimals =
    Number.isInteger(Number(decimals)) &&
    Number(decimals) >= 0 &&
    Number(decimals) <= 4
      ? Number(decimals)
      : 2;

  const multiplier = 10 ** validDecimals;

  return Math.round((Number(value) + Number.EPSILON) * multiplier) / multiplier;
}

function getExpectedJudgeCount(scoringProfile) {
  const judgeCount = Number(scoringProfile?.judgeCount);

  return Number.isInteger(judgeCount) && judgeCount > 0 ? judgeCount : 3;
}

/*
==================================================
RISULTATO NON ANCORA VALUTATO
==================================================
*/

function createPendingResult(participant) {
  return {
    participantId: participant?.id || null,
    athleteId: participant?.athleteId || null,

    name: participant?.name || "",
    club: participant?.club || "",

    entryNumber: Number(participant?.entryNumber),

    isFavorite: Boolean(participant?.isFavorite),

    isEvaluated: false,
    position: null,

    technicalScores: [],
    artisticScores: [],

    technicalTotal: null,
    artisticTotal: null,

    penalty: 0,
    total: null,
  };
}
