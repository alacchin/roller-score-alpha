/*
==================================================
GESTIONE SCHERMATE
==================================================
*/

let currentScreenId = null;

function getActiveScreenId() {
  const activeScreen =
    document.querySelector(
      ".screen.active"
    );

  return activeScreen
    ? activeScreen.id
    : "home-screen";
}

export function showScreen(
  screenId,
  options = {}
) {
  const {
    addToHistory = true,
    replaceHistory = false
  } = options;

  const screens =
    document.querySelectorAll(
      ".screen"
    );

  const targetScreen =
    document.getElementById(
      screenId
    );

  if (!targetScreen) {
    console.error(
      `Schermata non trovata: ${screenId}`
    );

    return;
  }

  screens.forEach(
    (screen) => {
      screen.classList.remove(
        "active"
      );
    }
  );

  targetScreen.classList.add(
    "active"
  );

  currentScreenId = screenId;

  if (replaceHistory) {
    window.history.replaceState(
      { screenId },
      "",
      window.location.href
    );
  } else if (addToHistory) {
    const historyScreenId =
      window.history.state
        ?.screenId;

    if (
      historyScreenId !==
      screenId
    ) {
      window.history.pushState(
        { screenId },
        "",
        window.location.href
      );
    }
  }

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}

/*
==================================================
COLLEGAMENTO PULSANTI
==================================================
*/

function connectButton(
  buttonId,
  screenId
) {
  const button =
    document.getElementById(
      buttonId
    );

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      showScreen(
        screenId
      );
    }
  );
}

function connectBackButton(
  buttonId,
  fallbackScreenId
) {
  const button =
    document.getElementById(
      buttonId
    );

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      if (
        window.history.length > 1
      ) {
        window.history.back();
        return;
      }

      showScreen(
        fallbackScreenId,
        {
          addToHistory: false,
          replaceHistory: true
        }
      );
    }
  );
}

/*
==================================================
TASTO INDIETRO TELEFONO / BROWSER
==================================================
*/

function connectBrowserHistory() {
  window.addEventListener(
    "popstate",
    (event) => {
      const screenId =
        event.state
          ?.screenId ||
        "home-screen";

      showScreen(
        screenId,
        {
          addToHistory: false
        }
      );
    }
  );
}

/*
==================================================
INIZIALIZZAZIONE NAVIGAZIONE
==================================================
*/

export function initNavigation() {
  const initialScreenId =
    getActiveScreenId();

  currentScreenId =
    initialScreenId;

  window.history.replaceState(
    {
      screenId:
        initialScreenId
    },
    "",
    window.location.href
  );

  connectBrowserHistory();

  /*
  HOME
  */

  connectButton(
    "go-new-race",
    "new-race-screen"
  );

  connectButton(
    "go-race-dashboard",
    "race-dashboard-screen"
  );

  /*
  NUOVA GARA
  */

  connectButton(
    "go-acquire-race",
    "acquire-race-screen"
  );

  connectButton(
    "go-manual-race",
    "manual-race-screen"
  );

  connectBackButton(
    "back-home-1",
    "home-screen"
  );

  /*
  ACQUISIZIONE
  */

  connectBackButton(
    "back-new-race-1",
    "new-race-screen"
  );

  /*
  INSERIMENTO MANUALE
  */

  connectBackButton(
    "back-new-race-2",
    "new-race-screen"
  );

  /*
  DASHBOARD
  */

  connectButton(
    "go-athlete-list",
    "athlete-list-screen"
  );

  connectBackButton(
    "back-home-2",
    "home-screen"
  );

  /*
  ELENCO ATLETE
  */

  connectBackButton(
    "back-dashboard-1",
    "race-dashboard-screen"
  );

  /*
  INSERIMENTO PUNTEGGI
  */

  connectBackButton(
    "back-athlete-list-1",
    "athlete-list-screen"
  );
}