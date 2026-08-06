/*
==================================================
ROLLER SCORE DIALOG
==================================================
*/

let activeDialogResolve = null;
let hideDialogTimer = null;

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

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      dialog.classList.add("active");
      confirmButton.focus();
    });
  });

  return new Promise((resolve) => {
    activeDialogResolve = resolve;
  });
}

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
    if (event.key === "Escape" && dialog.classList.contains("active")) {
      closeActiveDialog(false);
    }
  });
}

function closeActiveDialog(result) {
  const dialog = document.getElementById("app-dialog");

  if (!dialog) {
    resolveActiveDialog(result);

    return;
  }

  cancelPendingHide();

  dialog.classList.remove("active");

  document.body.classList.remove("dialog-open");

  hideDialogTimer = window.setTimeout(() => {
    dialog.hidden = true;
    hideDialogTimer = null;
  }, 180);

  resolveActiveDialog(result);
}

function cancelPendingHide() {
  if (!hideDialogTimer) {
    return;
  }

  window.clearTimeout(hideDialogTimer);
  hideDialogTimer = null;
}

function resolveActiveDialog(result) {
  if (!activeDialogResolve) {
    return;
  }

  const resolve = activeDialogResolve;

  activeDialogResolve = null;

  resolve(Boolean(result));
}

function getConfirmButtonClass(variant) {
  const buttonClasses = {
    danger: "dialog-button dialog-button-danger",
    primary: "dialog-button dialog-button-primary",
    success: "dialog-button dialog-button-success",
  };

  return buttonClasses[variant] || buttonClasses.primary;
}
