// ======================================
// UI.JS
// Utility grafiche comuni Roller Score
// Versione: v0.0.5
// ======================================

export function getScoreStatusIcon(status) {
  switch (status) {
    case "completed":
      return "✔";
    case "current":
      return "▶";
    case "missing":
      return "!";
    case "todo":
    default:
      return "○";
  }
}

export function getScoreStatusClass(status) {
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

export function formatAthleteName(athlete) {
  return athlete.isFavorite ? `⭐ ${athlete.name}` : athlete.name;
}

export function formatNotesCount(notes = []) {
  if (!notes.length) {
    return "📝 Nessuna nota";
  }

  if (notes.length === 1) {
    return "📝 1 nota";
  }

  return `📝 ${notes.length} note`;
}

export function getNotesClass(notes = []) {
  return notes.length ? "notes-active" : "notes-empty";
}
