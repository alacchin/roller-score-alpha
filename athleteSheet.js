// ======================================
// ATHLETE SHEET
// Gestisce l'apertura e chiusura della
// scheda atleta in formato bottom sheet.
// ======================================

export function initAthleteSheet() {
  const openButton = document.getElementById("open-athlete-sheet");
  const closeButton = document.getElementById("close-athlete-sheet");
  const sheet = document.getElementById("athlete-sheet");

  if (openButton && sheet) {
    openButton.addEventListener("click", () => {
      sheet.classList.add("active");
    });
  }

  if (closeButton && sheet) {
    closeButton.addEventListener("click", () => {
      sheet.classList.remove("active");
    });
  }
}
