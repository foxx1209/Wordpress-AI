export function initContactForm() {
  document.querySelectorAll(".wpcf7-list-item-label").forEach((label) => {
    label.addEventListener("click", () => {
      const item = label.closest(".wpcf7-list-item");
      const radio = item?.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList?.contains("wpcf7-not-valid-tip")) {
          const form = node.closest(".wpcf7-form");
          if (form && !form.classList.contains("invalid") && !form.classList.contains("unaccepted")) {
            node.remove();
            const control = node.parentElement?.querySelector(".wpcf7-not-valid");
            control?.classList.remove("wpcf7-not-valid");
          }
        }
      });
    });
  });

  document.querySelectorAll(".wpcf7-form").forEach((form) => {
    observer.observe(form, { childList: true, subtree: true });
  });
}
