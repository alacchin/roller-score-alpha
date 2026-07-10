/*
==================================================
GESTIONE SCHERMATE
==================================================
*/

export function showScreen(
  screenId
) {
  const screens =
    document.querySelectorAll(
      ".screen"
    );

  screens.forEach(
    (screen) => {
      screen.classList.remove(
        "active"
      );
    }
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

  targetScreen.classList.add(
    "active"
  );

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

/*
==================================================
INIZIALIZZAZIONE NAVIGAZIONE
==================================================
*/

export function initNavigation() {
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

  connectButton(
    "back-home-1",
    "home-screen"
  );

  /*
  ACQUISIZIONE
  */

  connectButton(
    "back-new-race-1",
    "new-race-screen"
  );

  /*
  INSERIMENTO MANUALE
  */

  connectButton(
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

  connectButton(
    "back-home-2",
    "home-screen"
  );

  /*
  ELENCO ATLETE
  */

  connectButton(
    "back-dashboard-1",
    "race-dashboard-screen"
  );

  /*
  INSERIMENTO PUNTEGGI
  */

  connectButton(
    "back-athlete-list-1",
    "athlete-list-screen"
  );
}