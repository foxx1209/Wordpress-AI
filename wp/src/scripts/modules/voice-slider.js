import Splide from "@splidejs/splide";

export function initVoiceSlider() {
  const el = document.querySelector(".p-business__voice-slider");
  if (!el) return;

  new Splide(el, {
    type: "loop",
    perPage: 1,
    gap: "1.5rem",
    arrows: true,
    pagination: true,
    autoHeight: true,
  }).mount();
}
