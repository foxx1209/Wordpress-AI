export function initModalClose() {
  document.querySelectorAll("[data-modal-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      closeButton.closest("modal-dialog")?.querySelector(":scope > button")?.click();
    });
  });
}
