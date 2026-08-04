/*
==================================================
GESTIONE SCHERMATE
Roller Score — Alpha 0.4.6.1
==================================================
*/

const APP_HISTORY_KEY = "rollerScore";

let currentScreenId = null;

/*
==================================================
FUNZIONI BASE
==================================================
*/

function getActiveScreenId() {
  const activeScreen = document.querySelector(".screen.active");

  return activeScreen?.id || "home-screen";
}

function getCurrentHistoryDepth() {
  const state = window.history.state;

  if (state?.app !== APP_HISTORY_KEY) {
    return 0;
  }

  return Number.isInteger(state.depth) ? state.depth : 0;
}

function activateScreen(screenId) {
  const targetScreen = document.getElementById(screenId);

  if (!targetScreen) {
    console.error(`Schermata non trovata: ${screenId}`);
    return false;
  }

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  targetScreen.classList.add("active");
  currentScreenId = screenId;

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });

  return true;
}

/*
==================================================
APERTURA SCHERMATA
==================================================
*/

export function showScreen(screenId, options = {}) {
  const { addToHistory = true, replaceHistory = false } = options;

  const targetScreen = document.getElementById(screenId);

  if (!targetScreen) {
    console.error(`Schermata non trovata: ${screenId}`);
    return;
  }

  /*
  Evita di aggiungere due volte la stessa schermata.
  È importante perché alcuni pulsanti possono essere
  collegati sia qui sia nei controller dell'app.
  */

  if (currentScreenId === screenId && !replaceHistory) {
    return;
  }

  const currentDepth = getCurrentHistoryDepth();

  if (replaceHistory) {
    window.history.replaceState(
      {
        app: APP_HISTORY_KEY,
        screenId,
        depth: currentDepth,
      },
      "",
      window.location.href,
    );
  } else if (addToHistory) {
    window.history.pushState(
      {
        app: APP_HISTORY_KEY,
        screenId,
        depth: currentDepth + 1,
      },
      "",
      window.location.href,
    );
  }

  activateScreen(screenId);
}

/*
==================================================
NAVIGAZIONE INDIETRO
==================================================
*/

export function goBack(fallbackScreenId = "home-screen") {
  const currentDepth = getCurrentHistoryDepth();

  if (currentDepth > 0) {
    window.history.back();
    return;
  }

  showScreen(fallbackScreenId, {
    addToHistory: false,
    replaceHistory: true,
  });
}

function goHome() {
  const currentDepth = getCurrentHistoryDepth();

  /*
  Torna direttamente alla prima schermata dell'app
  senza aggiungere una nuova Home alla cronologia.
  */

  if (currentDepth > 0) {
    window.history.go(-currentDepth);
    return;
  }

  showScreen("home-screen", {
    addToHistory: false,
    replaceHistory: true,
  });
}

/*
==================================================
COLLEGAMENTO PULSANTI
==================================================
*/

function connectButton(buttonId, screenId) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    showScreen(screenId);
  });
}

function connectBackButton(buttonId, fallbackScreenId) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    goBack(fallbackScreenId);
  });
}

function connectHomeButton(buttonId) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    goHome();
  });
}

/*
==================================================
TASTO INDIETRO TELEFONO / BROWSER
==================================================
*/

function connectBrowserHistory() {
  window.addEventListener("popstate", (event) => {
    const state = event.state;

    /*
    Lo stato non appartiene a Roller Score:
    il browser sta uscendo dalla navigazione interna.
    */

    if (state?.app !== APP_HISTORY_KEY) {
      return;
    }

    activateScreen(state.screenId || "home-screen");
  });
}

/*
==================================================
INIZIALIZZAZIONE NAVIGAZIONE
==================================================
*/

export function initNavigation() {
  const initialScreenId = getActiveScreenId();

  currentScreenId = initialScreenId;

  /*
  La prima schermata diventa la radice della
  navigazione interna dell'app.
  */

  window.history.replaceState(
    {
      app: APP_HISTORY_KEY,
      screenId: initialScreenId,
      depth: 0,
    },
    "",
    window.location.href,
  );

  connectBrowserHistory();

  /*
  HOME
  */

  connectButton("go-new-race", "new-race-screen");
  connectButton("go-race-dashboard", "race-dashboard-screen");

  /*
  NUOVA GARA
  */

  connectButton("go-acquire-race", "acquire-race-screen");
  connectButton("go-manual-race", "manual-race-screen");

  connectBackButton("back-home-1", "home-screen");

  /*
  ACQUISIZIONE
  */

  connectBackButton("back-new-race-1", "new-race-screen");

  /*
  INSERIMENTO MANUALE
  */

  connectBackButton("back-new-race-2", "new-race-screen");

  /*
  DASHBOARD
  */

  connectButton("go-athlete-list", "athlete-list-screen");
  connectButton("go-ranking-dashboard", "ranking-screen");
  connectHomeButton("back-home-2");

  /*
  ELENCO ATLETE
  */

  connectBackButton("back-dashboard-1", "race-dashboard-screen");

  /*
  INSERIMENTO PUNTEGGI
  */

  connectButton("go-ranking-score-entry", "ranking-screen");
  connectBackButton("back-athlete-list-1", "athlete-list-screen");

  /*
CLASSIFICA
*/

  connectBackButton("back-from-ranking", "race-dashboard-screen");
}
