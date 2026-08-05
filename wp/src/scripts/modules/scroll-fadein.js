// .js-fadein を付けた要素だけ、画面内に入ったタイミングで下からフェードインさせる
export function initScrollFadein() {
  const elements = document.querySelectorAll(".js-fadein");
  if (!elements.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((el) => {
      el.classList.add("is-inview");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" },
  );

  elements.forEach((el) => {
    observer.observe(el);
  });
}
