export function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  const label = toggle.querySelector(".nav-toggle__label");
  const main = document.getElementById("contenido-principal");
  const footer = document.querySelector(".site-footer");
  const mq = window.matchMedia("(max-width: 899px)");

  function setOpen(open) {
    const mobile = mq.matches;
    nav.classList.toggle("is-open", open && mobile);
    toggle.setAttribute("aria-expanded", open && mobile ? "true" : "false");
    toggle.setAttribute("aria-label", open && mobile ? "Cerrar menú principal" : "Abrir menú principal");
    if (label) label.textContent = open && mobile ? "Cerrar" : "Menú";
    document.body.classList.toggle("nav-open", open && mobile);
    nav.inert = mobile && !open;
    if (main) main.inert = mobile && open;
    if (footer) footer.inert = mobile && open;
    if (open && mobile) nav.querySelector("a")?.focus();
  }

  function sync() {
    if (!mq.matches) setOpen(false);
    else if (!nav.classList.contains("is-open")) {
      nav.inert = true;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mq.matches) setOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  mq.addEventListener("change", sync);
  toggle.setAttribute("aria-label", "Abrir menú principal");
  sync();
}
