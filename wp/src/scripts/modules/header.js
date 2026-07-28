function getFocusables(container) {
  if (!container) return [];
  const selector = ["a[href]", "button:not([disabled])", "[tabindex]:not([tabindex='-1'])"].join(", ");
  return Array.from(container.querySelectorAll(selector));
}

export function initHeader() {
  const hamburger = document.querySelector("[data-drawer-open]");
  const drawer = document.querySelector("[data-drawer]");
  const closeButton = document.querySelector("[data-drawer-close]");
  const overlay = document.querySelector("[data-drawer-overlay]");
  const panel = document.querySelector("[data-drawer-panel]");

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.removeAttribute("aria-hidden");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "メニューを閉じる");
    document.body.classList.add("is-drawer-open");
    getFocusables(panel)[0]?.focus();
  }

  function closeDrawer(restoreFocus = true) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("is-drawer-open");
    if (restoreFocus) hamburger.focus();
  }

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";
    isOpen ? closeDrawer() : openDrawer();
  });

  closeButton?.addEventListener("click", () => closeDrawer());
  overlay?.addEventListener("click", () => closeDrawer());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });

  panel?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusables = getFocusables(panel);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  panel?.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => closeDrawer(false));
  });
}
