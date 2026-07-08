// ======================================
// NAVIGATION.JS
// Gestisce il cambio schermata dell'app.
// ======================================

const screens = document.querySelectorAll(".screen");

export function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(screenId);

  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}

function connectButton(buttonId, screenId) {
  const button = document.getElementById(buttonId);

  if (button) {
    button.addEventListener("click", () => {
      showScreen(screenId);
    });
  }
}

export function initNavigation() {
  connectButton("go-new-race", "new-race-screen");
  connectButton("go-race-dashboard", "race-dashboard-screen");

  connectButton("go-athlete-list", "athlete-list-screen");

  connectButton("go-score-entry-home", "score-entry-screen");
  connectButton("go-score-entry-dashboard", "score-entry-screen");
  connectButton("go-score-entry-list", "score-entry-screen");

  connectButton("go-acquire-race", "acquire-race-screen");
  connectButton("go-manual-race", "manual-race-screen");

  connectButton("back-home-1", "home-screen");
  connectButton("back-home-2", "home-screen");

  connectButton("back-new-race-1", "new-race-screen");
  connectButton("back-new-race-2", "new-race-screen");

  connectButton("back-dashboard-1", "race-dashboard-screen");
  connectButton("back-athlete-list-1", "athlete-list-screen");
}
