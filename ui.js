/*
==================================================
UI.JS
Funzioni di formattazione e supporto grafico
Versione: Alpha 0.2
==================================================
*/

/*
==================================================
NOTE ATLETA
==================================================
*/

export function formatNotesCount(
  notes = []
) {
  const normalizedNotes =
    Array.isArray(notes)
      ? notes
      : [];

  if (
    normalizedNotes.length === 0
  ) {
    return "📝 Nessuna nota";
  }

  if (
    normalizedNotes.length === 1
  ) {
    return "📝 1 nota";
  }

  return `📝 ${normalizedNotes.length} note`;
}

export function getNotesClass(
  notes = []
) {
  const normalizedNotes =
    Array.isArray(notes)
      ? notes
      : [];

  return normalizedNotes.length > 0
    ? "notes-active"
    : "notes-empty";
}

/*
==================================================
STATO PARTECIPANTE
==================================================
*/

export function getScoreStatusClass(
  status
) {
  switch (status) {
    case "completed":
      return "status-completed";

    case "current":
      return "status-current";

    case "missing":
      return "status-missing";

    case "todo":
    default:
      return "status-todo";
  }
}

export function getScoreStatusIcon(
  status
) {
  switch (status) {
    case "completed":
      return "✓";

    case "current":
      return "▶";

    case "missing":
      return "!";

    case "todo":
    default:
      return "○";
  }
}

export function getStatusLabel(
  status
) {
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

/*
==================================================
NOME ATLETA
==================================================
*/

export function formatAthleteName(
  athlete
) {
  if (!athlete) {
    return "---";
  }

  const name =
    String(
      athlete.name || ""
    ).trim();

  if (!name) {
    return "Atleta senza nome";
  }

  return athlete.isFavorite
    ? `⭐ ${name}`
    : name;
}

/*
==================================================
INFORMAZIONI GARA
==================================================
*/

export function formatRaceInfo(
  race
) {
  if (!race) {
    return "---";
  }

  const parts = [
    race.federation,
    race.discipline,
    race.category
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" • ")
    : "---";
}

export function formatRaceDate(
  dateValue
) {
  if (!dateValue) {
    return "Data non indicata";
  }

  const date =
    new Date(
      `${dateValue}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(date);
}

/*
==================================================
PUNTEGGI
==================================================
*/

export function formatScoreValue(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "--";
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "--";
  }

  return numericValue
    .toFixed(1)
    .replace(".", ",");
}

export function calculateScoreTotal(
  scores
) {
  if (!scores) {
    return null;
  }

  const technical =
    Array.isArray(
      scores.technical
    )
      ? scores.technical
      : [];

  const artistic =
    Array.isArray(
      scores.artistic
    )
      ? scores.artistic
      : [];

  const penalty =
    Number(
      scores.penalty || 0
    );

  const technicalTotal =
    technical.reduce(
      (total, value) =>
        total +
        Number(value || 0),
      0
    );

  const artisticTotal =
    artistic.reduce(
      (total, value) =>
        total +
        Number(value || 0),
      0
    );

  return (
    technicalTotal +
    artisticTotal +
    penalty
  );
}

/*
==================================================
TESTI DI SUPPORTO
==================================================
*/

export function pluralizeAthletes(
  count
) {
  return Number(count) === 1
    ? "1 atleta"
    : `${count} atlete`;
}

export function formatEntryNumber(
  entryNumber
) {
  const numericValue =
    Number(entryNumber);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return "--";
  }

  return String(
    numericValue
  );
}

/*
==================================================
SICUREZZA HTML
==================================================
*/

export function escapeHtml(
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