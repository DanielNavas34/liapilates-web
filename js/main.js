import { initNavigation } from "./navigation.js";
import { initMotion } from "./animations.js";
import { initPremiumMotion, initAudienceCounters } from "./premium.js";
import { initTypewriter } from "./typewriter.js";
import { initLightbox } from "./lightbox.js";
import { initContent, showContentError } from "./content.js";
import "./cookies.js";

const preloader = document.getElementById("preloader");
const started = performance.now();
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let dismissed = false;

function dismissPreloader() {
  if (dismissed || !preloader) return;
  dismissed = true;
  const elapsed = performance.now() - started;
  preloader.classList.add(reduced || elapsed < 280 ? "is-instant" : "is-done");
  document.documentElement.classList.add("is-ready");
  document.body.removeAttribute("aria-busy");
  preloader.setAttribute("aria-hidden", "true");
  preloader.inert = true;
}

if (!reduced) document.body.setAttribute("aria-busy", "true");
initNavigation();
if (reduced) {
  document.documentElement.classList.add("is-ready");
  document.body.removeAttribute("aria-busy");
}
initMotion();
initPremiumMotion();
initTypewriter();
const lightbox = initLightbox();

function loadJson(url) {
  return fetch(url, { credentials: "omit", headers: { Accept: "application/json" } }).then((response) => {
    if (!response.ok) throw new Error(url);
    return response.json();
  });
}

Promise.all([loadJson("data/site.json"), loadJson("data/rates.json"), loadJson("data/collaborations.json")])
  .then(([site, rates, collaborations]) => {
    initContent(site, rates, collaborations);
    initAudienceCounters();
  })
  .catch(() => {
    showContentError();
  });

if (document.readyState === "complete") dismissPreloader();
else window.addEventListener("load", dismissPreloader, { once: true });
setTimeout(dismissPreloader, 1200);
