/* --------- 　ここから編集禁止  ------------- */
import "vite/modulepreload-polyfill";
console.info(
  "\n %c Orelop WP - https://github.com/hilosiva/orelop-wp \n",
  "color: #66ffa5; background: #001010; padding:8px 0;",
);
import.meta.glob(["../assets/images/**"]);
/* --------- 　ここまで編集禁止  ------------- */

import "../styles/global.css";

import { initShapeBg } from "./modules/shape-bg.js";

initShapeBg();


  !(function () {
    const viewport = document.querySelector('meta[name="viewport"]');
    function switchViewport() {
      const value =
        window.outerWidth > 375
          ? 'width=device-width,initial-scale=1'
          : 'width=375';
      if (viewport.getAttribute('content') !== value) {
        viewport.setAttribute('content', value);
      }
    }
    addEventListener('resize', switchViewport, false);
    switchViewport();
  })();
