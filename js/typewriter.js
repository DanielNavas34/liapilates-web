const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

function typeLine(line, text, onDone) {
  const live = line.querySelector(".about__typed-live");
  const caret = line.querySelector(".about__typed-caret");
  if (!live) {
    onDone();
    return;
  }
  let index = 0;
  const step = () => {
    if (index >= text.length) {
      line.classList.add("is-done");
      onDone();
      return;
    }
    live.textContent += text.charAt(index);
    index += 1;
    window.setTimeout(step, 26);
  };
  line.classList.add("is-typing");
  if (caret) caret.classList.add("is-on");
  step();
}

function runSequence(lines) {
  const queue = [...lines];
  const next = () => {
    const line = queue.shift();
    if (!line) return;
    const fallback = line.querySelector(".about__typed-fallback");
    if (!fallback) {
      next();
      return;
    }
    const text = fallback.textContent.trim();
    fallback.remove();
    typeLine(line, text, next);
  };
  next();
}

export function initTypewriter() {
  const root = document.getElementById("sobre-mi");
  const lines = root ? root.querySelectorAll("[data-typewriter]") : [];
  if (!lines.length) return;

  if (reduced.matches) {
    lines.forEach((line) => {
      const fallback = line.querySelector(".about__typed-fallback");
      const live = line.querySelector(".about__typed-live");
      const caret = line.querySelector(".about__typed-caret");
      if (fallback && live) {
        live.textContent = fallback.textContent.trim();
        fallback.remove();
      }
      if (caret) caret.remove();
      line.classList.add("is-done");
    });
    return;
  }

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    runSequence(lines);
  };

  if (!root) return start();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          start();
          observer.disconnect();
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(root);
    const rect = root.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) start();
  } else {
    start();
  }
}