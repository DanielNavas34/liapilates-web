let observer = null;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

function mark(el) {
  if (reduced.matches || !observer) {
    el.classList.add("is-in");
    return;
  }
  const rect = el.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  if (inView) el.classList.add("is-in");
  else {
    el.classList.add("is-armed");
    observer.observe(el);
  }
}

function armStaggerChildren(parent) {
  if (!parent.hasAttribute("data-stagger") || !parent.classList.contains("is-in")) return;
  parent.querySelectorAll(":scope > *").forEach((child, index) => {
    child.style.setProperty("--stagger", `${index * 0.09}s`);
  });
}

export function arm(scope) {
  const root = scope && scope.querySelectorAll ? scope : document;
  root.querySelectorAll("[data-reveal], [data-mask], [data-stagger]").forEach((el) => {
    mark(el);
    if (el.classList.contains("is-in")) armStaggerChildren(el);
  });
}

export function initMotion() {
  const header = document.querySelector("[data-header]");
  const desktopHeader = window.matchMedia("(min-width: 900px)");
  if (header) {
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      header.classList.toggle("is-scrolled", scrolled);
      document.body.classList.toggle(
        "header-compact",
        scrolled && desktopHeader.matches
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktopHeader.addEventListener("change", onScroll);
  }

  if (!reduced.matches) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          armStaggerChildren(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
  }

  arm(document);
}
