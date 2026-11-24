const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

function parseLeadingNumber(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^([\d]+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;
  const number = Number(match[1].replace(",", "."));
  if (!Number.isFinite(number)) return null;
  return { number, suffix: match[2] ? ` ${match[2]}` : "", raw: value.trim() };
}

function formatAnimatedNumber(value, template) {
  const usesComma = template.includes(",");
  const decimals = template.includes(",") || template.includes(".") ? 1 : 0;
  let text = decimals ? value.toFixed(1) : String(Math.round(value));
  if (usesComma) text = text.replace(".", ",");
  return text;
}

function animateStat(node, parsed) {
  const duration = 1300;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    const current = parsed.number * eased;
    node.textContent = `${formatAnimatedNumber(current, String(parsed.number))}${parsed.suffix}`;
    if (t < 1) requestAnimationFrame(step);
    else node.textContent = parsed.raw;
  };
  requestAnimationFrame(step);
}

export function initAudienceCounters() {
  if (reduced.matches) return;
  const list = document.getElementById("audience-list");
  if (!list) return;

  const run = () => {
    list.querySelectorAll("dd").forEach((dd) => {
      if (dd.dataset.counted === "1") return;
      const parsed = parseLeadingNumber(dd.textContent);
      if (!parsed || parsed.number > 2_000_000) return;
      dd.dataset.counted = "1";
      dd.textContent = `${formatAnimatedNumber(0, String(parsed.number))}${parsed.suffix}`;
      animateStat(dd, parsed);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run();
        observer.disconnect();
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(list);
}

export function initHeroParallax() {
  if (reduced.matches) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const lead = hero.querySelector(".hero__lead");
  if (!lead) return;

  const onScroll = () => {
    const limit = hero.offsetHeight * 0.85;
    const y = Math.min(Math.max(window.scrollY, 0), limit);
    lead.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function initSectionProgress() {
  if (reduced.matches) return;
  const sections = document.querySelectorAll(".section[data-section-progress]");
  if (!sections.length) return;

  const paint = () => {
    const vh = window.innerHeight;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight;
      const span = Math.max(total - vh * 0.35, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), span);
      section.style.setProperty("--section-fill", String(traveled / span));
    });
  };

  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint, { passive: true });
}

export function initPremiumMotion() {
  initHeroParallax();
  initSectionProgress();
}