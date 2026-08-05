/* --------- 　ここから編集禁止  ------------- */
import "vite/modulepreload-polyfill";
console.info(
  "\n %c Orelop WP - https://github.com/hilosiva/orelop-wp \n",
  "color: #66ffa5; background: #001010; padding:8px 0;",
);
import.meta.glob(["../assets/images/**"]);
/* --------- 　ここまで編集禁止  ------------- */

import "../styles/global.css";
import "@splidejs/splide/css/core";

import { createModal } from "vaultscript";
import { initContactForm } from "./modules/contact-form.js";
import { initHeader } from "./modules/header.js";
import { initLoader } from "./modules/loading.js";
import { initModalClose } from "./modules/modal.js";
import { initScrollFadein } from "./modules/scroll-fadein.js";
import { initShapeBg } from "./modules/shape-bg.js";
import { initSmoothScroll } from "./modules/smooth-scroll.js";
import { initTitleReveal } from "./modules/title-reveal.js";
import { initVoiceSlider } from "./modules/voice-slider.js";

initSmoothScroll();
initLoader();
initShapeBg();
initHeader();
createModal();
initModalClose();
initVoiceSlider();
initContactForm();
initScrollFadein();
initTitleReveal();

!(() => {
  const viewport = document.querySelector('meta[name="viewport"]');
  function switchViewport() {
    const value = window.outerWidth > 375 ? "width=device-width,initial-scale=1" : "width=375";
    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  }
  addEventListener("resize", switchViewport, false);
  switchViewport();
})();
