import { isSafeAsset, el, clear } from "./safe.js";
import { arm } from "./animations.js";

const FILTERS = [
  { id: "all", label: "Todo" },
  { id: "fitness", label: "Fitness" },
  { id: "moda", label: "Moda y belleza" },
  { id: "lifestyle", label: "Lifestyle" },
];

const CATEGORIES = {
  fitness: "Fitness",
  moda: "Moda y belleza",
  lifestyle: "Lifestyle",
};

function validItem(item) {
  return (
    item &&
    typeof item.caption === "string" &&
    item.caption.trim() &&
    typeof item.category === "string" &&
    /^[a-z-]{3,24}$/.test(item.category)
  );
}

export function initGallery(data, lightbox) {
  const root = document.getElementById("gallery");
  const toolbar = document.getElementById("gallery-filters");
  const status = document.getElementById("gallery-status");
  if (!root || !toolbar) return;

  const items = Array.isArray(data?.items) ? data.items.filter(validItem) : [];
  let current = "all";
  let announce = false;

  FILTERS.forEach((filter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
    button.addEventListener("click", () => {
      current = filter.id;
      toolbar.querySelectorAll("button").forEach((node) => node.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      draw();
    });
    toolbar.append(button);
  });

  function visibleItems() {
    return items.filter((item) => current === "all" || item.category === current);
  }

  function draw() {
    const visible = visibleItems();
    clear(root);

    if (!visible.length) {
      root.append(el("p", "empty-note", "No hay piezas en esta categoría."));
    }

    visible.forEach((item, itemIndex) => {
      const real = item.placeholder !== true && isSafeAsset(item.src) && typeof item.alt === "string" && item.alt.trim();
      const orientation = item.orientation === "landscape" ? "landscape" : "portrait";
      const button = document.createElement("button");
      button.type = "button";
      button.className = `shot is-${orientation}`;

      const frame = el("span", "frame");
      frame.dataset.mask = "";

      if (real && item.type === "video") {
        if (isSafeAsset(item.poster)) {
          const poster = document.createElement("img");
          poster.src = item.poster;
          poster.alt = "";
          poster.width = Number(item.width) > 0 ? Number(item.width) : 900;
          poster.height = Number(item.height) > 0 ? Number(item.height) : 1200;
          poster.loading = "lazy";
          poster.decoding = "async";
          frame.append(poster);
        }
        frame.append(el("span", "kicker", "Vídeo"));
      } else if (real) {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = "";
        img.width = Number(item.width) > 0 ? Number(item.width) : 900;
        img.height = Number(item.height) > 0 ? Number(item.height) : 1200;
        img.loading = "lazy";
        img.decoding = "async";
        frame.append(img);
      } else {
        frame.append(el("span", "kicker", item.type === "video" ? "Vídeo pendiente" : "Fotografía pendiente"));
      }

      const caption = el("span", "shot__caption");
      caption.append(
        el("span", "kicker", CATEGORIES[item.category] || item.category),
        el("span", null, item.caption.trim())
      );

      const kind = item.type === "video" ? "vídeo" : "imagen";
      const pending = real ? "" : " Archivo pendiente.";
      button.setAttribute("aria-label", `${item.caption.trim()}. Ampliar ${kind}.${pending}`);
      button.append(frame, caption);
      button.addEventListener("click", () => lightbox.open(visible, itemIndex));
      root.append(button);
    });

    if (status && announce) {
      const names = {
        all: "todas las categorías",
        fitness: "fitness",
        moda: "moda y belleza",
        lifestyle: "lifestyle",
      };
      const count = visible.length;
      status.textContent = `Mostrando ${count} ${count === 1 ? "pieza" : "piezas"} de ${names[current] || current}.`;
    }
    announce = true;

    arm(root);
  }

  draw();
}
