import { gsap } from "gsap";

// Mirrors tokens.css --ease-out-quart / --ease-out-expo / --ease-out-circ
const EASE_QUART_OUT = "cubic-bezier(0.25, 1, 0.5, 1)";
const EASE_EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_CIRC_OUT = "cubic-bezier(0, 0.55, 0.45, 1)";

const SHAPES = [
  {
    key: "green",
    from: { x: -40, y: -24, scale: 0.6 },
    enterEase: EASE_QUART_OUT,
    enterDuration: 0.9,
    idleScale: 1.05,
    idleRotation: 3,
    idleDuration: 3.6,
    idleDriftX: 16,
    idleDriftY: 8,
    idleDriftDuration: 4.2,
  },
  {
    key: "blue",
    from: { x: 50, y: -30, scale: 0.7 },
    enterEase: EASE_EXPO_OUT,
    enterDuration: 1.1,
    idleScale: 1.06,
    idleRotation: -3,
    idleDuration: 4.4,
    idleDriftX: -20,
    idleDriftY: 10,
    idleDriftDuration: 4.8,
  },
  {
    key: "red",
    from: { x: 34, y: 40, scale: 0.65 },
    enterEase: EASE_CIRC_OUT,
    enterDuration: 1,
    idleScale: 0.95,
    idleRotation: 2,
    idleDuration: 3.9,
    idleDriftX: 18,
    idleDriftY: -10,
    idleDriftDuration: 4.4,
  },
  {
    key: "yellow",
    from: { x: -34, y: 54, scale: 0.6 },
    enterEase: EASE_QUART_OUT,
    enterDuration: 1.2,
    idleScale: 1.04,
    idleRotation: -2,
    idleDuration: 5,
    idleDriftX: -22,
    idleDriftY: 12,
    idleDriftDuration: 5.4,
  },
];

function playIdle(el, shape) {
  gsap.to(el, {
    x: shape.idleDriftX,
    y: shape.idleDriftY,
    duration: shape.idleDriftDuration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(el, {
    scale: shape.idleScale,
    duration: shape.idleDuration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(el, {
    rotation: shape.idleRotation,
    duration: shape.idleDuration * 1.2,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}

export function initShapeBg() {
  const root = document.querySelector("[data-shape-bg]");
  if (!root) return;

  const items = SHAPES.map((shape) => ({
    shape,
    el: root.querySelector(`[data-shape-el="${shape.key}"]`),
  })).filter((item) => item.el);

  if (!items.length) return;

  const elements = items.map((item) => item.el);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(elements, { opacity: 1 });
    return;
  }

  gsap.set(elements, { transformOrigin: "50% 50%" });
  items.forEach(({ shape, el }) => {
    gsap.set(el, { opacity: 0, ...shape.from });
  });

  const tl = gsap.timeline({
    onComplete: () => {
      items.forEach(({ shape, el }) => {
        playIdle(el, shape);
      });
    },
  });

  items.forEach(({ shape, el }, index) => {
    tl.to(
      el,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: shape.enterDuration,
        ease: shape.enterEase,
      },
      index === 0 ? 0 : "<0.15",
    );
  });
}
