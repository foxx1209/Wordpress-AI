import { gsap } from "gsap";

// Mirrors tokens.css --ease-out-quart / --ease-out-expo
const EASE_QUART_OUT = "cubic-bezier(0.25, 1, 0.5, 1)";
const EASE_EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

export function initLoader() {
  const loader = document.querySelector(".js-loader");
  if (!loader) return;

  const logo = loader.querySelector(".js-loader-logo");
  const html = document.documentElement;

  const finish = () => {
    html.classList.remove("is-loading");
    loader.remove();
    window.dispatchEvent(new CustomEvent("loader:complete"));
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    loader.classList.add("is-reduced");
    finish();
    return;
  }

  gsap
    .timeline({ onComplete: finish })
    .set(logo, { filter: "blur(0px)" })
    .fromTo(logo, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.9, ease: EASE_QUART_OUT })
    .to({}, { duration: 0.4 })
    .to(logo, { opacity: 0, scale: 6, filter: "blur(20px)", duration: 1.2, ease: EASE_QUART_OUT })
    .to(loader, { autoAlpha: 0, duration: 1.3, ease: EASE_EXPO_OUT }, "<0.6");
}
