export function initNavigation() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  const main = document.getElementById("contenido-principal");
  const footer = document.querySelector(".site-footer");
  const mq = window.matchMedia("(max-width: 899px)");

  function compactNav() {
    return mq.matches || Boolean(header?.classList.contains("is-scrolled"));
  }

  function setOpen(open) {
    const compact = compactNav();
    const show = open && compact;
    nav.classList.toggle("is-open", show);
    toggle.setAttribute("aria-expanded", show ? "true" : "false");
    toggle.setAttribute("aria-label", show ? "Cerrar menú principal" : "Abrir menú principal");
    document.body.classList.toggle("nav-open", show);
    nav.inert = compact && !open;
    if (main) main.inert = show;
    if (footer) footer.inert = show;
    if (show) nav.querySelector("a")?.focus();
  }

  function sync() {
    if (!compactNav()) {
      setOpen(false);
      nav.inert = false;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
    } else if (!nav.classList.contains("is-open")) {
      nav.inert = true;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
    }
  }

  toggle.addEventListener("click", () => {
    if (!compactNav()) return;
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (compactNav()) setOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  const onScroll = () => {
    const wasCompact = nav.classList.contains("is-open");
    sync();
    if (!compactNav() && wasCompact) setOpen(false);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  mq.addEventListener("change", sync);
  sync();
}