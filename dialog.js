/*
==================================================
ROLLER SCORE DIALOG
==================================================
*/

let activeDialogResolve = null;
let hideDialogTimer = null;

let isDialogOpen = false;
let hasDialogHistoryEntry = false;

/*
==================================================
APERTURA DIALOG DI CONFERMA
==================================================
*/

export function showConfirmDialog({
  title = "Conferma",
  message = "",
  confirmText = "Conferma",
  cancelText = "Annulla",
  variant = "danger",
} = {}) {
  const dialog = document.getElementById("app-dialog");

  const titleElement = document.getElementById("app-dialog-title");

  const messageElement = document.getElementById("app-dialog-message");

  const confirmButton = document.getElementById("app-dialog-confirm");

  const cancelButton = document.getElementById("app-dialog-cancel");

  if (
    !dialog ||
    !titleElement ||
    !messageElement ||
    !confirmButton ||
    !cancelButton
  ) {
    return Promise.resolve(false);
  }

  cancelPendingHide();

  /*
  Se viene aperto un nuovo dialog mentre uno precedente
  è ancora attivo, il precedente viene annullato.
  */

  if (activeDialogResolve) {
    resolveActiveDialog(false);
  }

  titleElement.textContent = title;

  messageElement.textContent = message;

  confirmButton.textContent = confirmText;

  cancelButton.textContent = cancelText;

  confirmButton.className = getConfirmButtonClass(variant);

  dialog.classList.remove("active");

  dialog.hidden = false;

  document.body.classList.add("dialog-open");

  isDialogOpen = true;

  addDialogHistoryEntry();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (!isDialogOpen) {
        return;
      }

      dialog.classList.add("active");

      confirmButton.focus();
    });
  });

  return new Promise((resolve) => {
    activeDialogResolve = resolve;
  });
}

/*
==================================================
INIZIALIZZAZIONE EVENTI
==================================================
*/

export function initDialog() {
  const dialog = document.getElementById("app-dialog");

  const confirmButton = document.getElementById("app-dialog-confirm");

  const cancelButton = document.getElementById("app-dialog-cancel");

  if (!dialog || !confirmButton || !cancelButton) {
    return;
  }

  confirmButton.addEventListener("click", () => {
    closeActiveDialog(true);
  });

  cancelButton.addEventListener("click", () => {
    closeActiveDialog(false);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeActiveDialog(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isDialogOpen) {
      closeActiveDialog(false);
    }
  });

  /*
  Su Android il tasto Indietro genera un evento popstate.

  La voce temporanea inserita all'apertura del dialog
  viene rimossa e il popup viene chiuso come se
  l'utente avesse premuto "Annulla".

  La schermata sottostante non cambia.
  */

  window.addEventListener("popstate", () => {
    if (!isDialogOpen || !hasDialogHistoryEntry) {
      return;
    }

    hasDialogHistoryEntry = false;

    closeActiveDialog(false, {
      removeHistoryEntry: false,
    });
  });
}

/*
==================================================
CHIUSURA DIALOG
==================================================
*/

function closeActiveDialog(result, { removeHistoryEntry = true } = {}) {
  const dialog = document.getElementById("app-dialog");

  cancelPendingHide();

  isDialogOpen = false;

  if (dialog) {
    dialog.classList.remove("active");
  }

  document.body.classList.remove("dialog-open");

  if (removeHistoryEntry && hasDialogHistoryEntry) {
    hasDialogHistoryEntry = false;

    window.history.back();
  }

  hideDialogTimer = window.setTimeout(() => {
    if (dialog) {
      dialog.hidden = true;
    }

    hideDialogTimer = null;
  }, 180);

  resolveActiveDialog(result);
}

/*
==================================================
CRONOLOGIA TEMPORANEA DEL DIALOG
==================================================
*/

function addDialogHistoryEntry() {
  if (hasDialogHistoryEntry) {
    return;
  }

  const currentState =
    window.history.state && typeof window.history.state === "object"
      ? window.history.state
      : {};

  try {
    window.history.pushState(
      {
        ...currentState,
        rollerScoreDialog: true,
      },
      "",
      window.location.href,
    );

    hasDialogHistoryEntry = true;
  } catch (error) {
    console.warn("Impossibile aggiungere il dialog alla cronologia:", error);

    hasDialogHistoryEntry = false;
  }
}

/*
==================================================
GESTIONE TIMER
==================================================
*/

function cancelPendingHide() {
  if (!hideDialogTimer) {
    return;
  }

  window.clearTimeout(hideDialogTimer);

  hideDialogTimer = null;
}

/*
==================================================
RISOLUZIONE PROMISE
==================================================
*/

function resolveActiveDialog(result) {
  if (!activeDialogResolve) {
    return;
  }

  const resolve = activeDialogResolve;

  activeDialogResolve = null;

  resolve(Boolean(result));
}

/*
==================================================
STILE PULSANTE CONFERMA
==================================================
*/

function getConfirmButtonClass(variant) {
  const buttonClasses = {
    danger: "dialog-button dialog-button-danger",

    primary: "dialog-button dialog-button-primary",

    success: "dialog-button dialog-button-success",
  };

  return buttonClasses[variant] || buttonClasses.primary;
}
