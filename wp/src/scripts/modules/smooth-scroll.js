const PENDING_SCROLL_KEY = "pendingScrollTarget";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  return true;
}

function runPendingScroll() {
  const id = sessionStorage.getItem(PENDING_SCROLL_KEY);
  if (!id) return;
  sessionStorage.removeItem(PENDING_SCROLL_KEY);
  scrollToId(id);
}

// 同一ページ内のアンカーはその場でスムーススクロール、
// 別ページのセクションへのリンクは遷移後にスクロールできるよう sessionStorage 経由で引き継ぐ
export function initSmoothScroll() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin || !url.hash || url.hash === "#") return;

    const id = decodeURIComponent(url.hash.slice(1));

    if (url.pathname === window.location.pathname) {
      if (!scrollToId(id)) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      return;
    }

    event.preventDefault();
    sessionStorage.setItem(PENDING_SCROLL_KEY, id);
    window.location.href = url.pathname + url.search;
  });

  if (document.querySelector(".js-loader")) {
    window.addEventListener("loader:complete", runPendingScroll, { once: true });
  } else {
    runPendingScroll();
  }
}
