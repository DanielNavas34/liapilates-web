import { el } from "./safe.js";

const NAME = "lia_consent";
const YEAR = 60 * 60 * 24 * 365;
let started = false;
let banner = null;
let panel = null;
let lastFocus = null;

function policyHref() {
  const path = location.pathname;
  if (path.endsWith("/cookies.html") || path.endsWith("cookies.html")) return "#detalle";
  if (path.includes("/legal/")) return "cookies.html";
  return "legal/cookies.html";
}

function readConsent() {
  const rows = document.cookie ? document.cookie.split("; ") : [];
  const row = rows.find((item) => item.startsWith(`${NAME}=`));
  if (!row) return null;
  const match = /^1\.(accept|reject|custom)\.(\d{10,16})$/.exec(row.slice(NAME.length + 1));
  if (!match) return null;
  const time = Number(match[2]);
  if (time > Date.now() + 60000 || Date.now() - time > YEAR * 1000) return null;
  return match[1];
}

function writeConsent(decision) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NAME}=1.${decision}.${Date.now()}; Max-Age=${YEAR}; Path=/; SameSite=Lax${secure}`;
}

function hideBanner() {
  if (!banner) return;
  banner.hidden = true;
  document.body.classList.remove("has-cookie-banner");
}

function showBanner() {
  if (!banner) return;
  banner.hidden = false;
  document.body.classList.add("has-cookie-banner");
}

function focusIfVisible(node) {
  if (!node || typeof node.focus !== "function" || !node.isConnected) return false;
  if (node.closest("[hidden]")) return false;
  node.focus();
  return true;
}

function choose(decision) {
  writeConsent(decision);
  hideBanner();
  if (panel?.open) panel.close();
}

function openPanel() {
  if (!panel) return;
  lastFocus = document.activeElement;
  if (!panel.open) panel.showModal();
}

function actionButton(label, onClick) {
  const button = el("button", "cookie-banner__action", label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function category(name, state, detail) {
  const item = el("li", "cookie-list__item");
  item.append(
    el("p", "cookie-list__name", name),
    el("p", "kicker", state),
    el("p", "cookie-list__detail", detail)
  );
  return item;
}

function buildBanner() {
  banner = el("section", "cookie-banner");
  banner.id = "cookie-banner";
  banner.setAttribute("role", "region");
  const inner = el("div", "cookie-banner__inner");
  const title = el("p", "kicker", "Cookies");
  title.id = "cookie-banner-title";
  banner.setAttribute("aria-labelledby", "cookie-banner-title");
  const text = el("p", "cookie-banner__text");
  const policy = el("a", "text-link", "Política de cookies");
  policy.href = policyHref();
  text.append(
    document.createTextNode(
      "Uso una sola cookie técnica para recordar tu elección. No hay analítica ni publicidad de terceros. Seguir leyendo no cuenta como aceptar. "
    ),
    policy,
    document.createTextNode(".")
  );
  const actions = el("div", "cookie-banner__actions");
  actions.append(
    actionButton("Rechazar", () => choose("reject")),
    actionButton("Configurar", openPanel),
    actionButton("Aceptar", () => choose("accept"))
  );
  inner.append(title, text, actions);
  banner.append(inner);
  banner.hidden = true;
  document.body.append(banner);
}

function buildPanel() {
  panel = document.createElement("dialog");
  panel.className = "cookie-panel";
  panel.setAttribute("aria-labelledby", "cookie-panel-title");
  const kicker = el("p", "kicker", "Detalle");
  const title = el("h2", null, "Configuración de cookies");
  title.id = "cookie-panel-title";
  const intro = el(
    "p",
    null,
    "Solo hay una cookie técnica, para no volver a mostrarte este aviso. No uso herramientas de medición ni publicidad. Aceptar o rechazar guarda tu elección doce meses."
  );
  const list = el("ul", "cookie-list");
  list.append(
    category(
      "Técnicas",
      "Siempre activa",
      "lia_consent, propia. Recuerda la decisión, la versión del aviso y la fecha. No identifica a la persona ni mide visitas."
    ),
    category(
      "Análisis",
      "No se utiliza",
      "No hay herramientas de medición. Esta categoría permanece apagada."
    ),
    category(
      "Publicidad",
      "No se utiliza",
      "No hay píxeles ni cookies de terceros. Esta categoría permanece apagada."
    )
  );
  const actions = el("div", "cookie-banner__actions");
  actions.append(
    actionButton("Rechazar", () => choose("reject")),
    actionButton("Guardar", () => choose("custom")),
    actionButton("Aceptar", () => choose("accept"))
  );
  const back = el(
    "p",
    "cookie-panel__note",
    "Si cierras sin elegir, no guardo tu decisión. Puedes seguir leyendo igual."
  );
  panel.append(kicker, title, intro, list, actions, back);
  panel.addEventListener("close", () => {
    focusIfVisible(lastFocus);
  });
  document.body.append(panel);
}

export function initCookies() {
  if (started) return;
  started = true;
  buildBanner();
  buildPanel();
  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-cookie-settings]") : null;
    if (!trigger) return;
    event.preventDefault();
    openPanel();
  });
  if (readConsent()) hideBanner();
  else showBanner();
}

initCookies();
