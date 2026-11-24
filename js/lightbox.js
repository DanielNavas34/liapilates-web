import { isSafeAsset, el, clear } from "./safe.js";

function isReal(item) {
  return Boolean(item) && item.placeholder !== true && isSafeAsset(item.src) && typeof item.alt === "string" && item.alt.trim();
}

export function initLightbox() {
  const dialog = document.getElementById("lightbox");
  const media = dialog?.querySelector("[data-media]");
  const caption = dialog?.querySelector("[data-caption]");
  const prev = dialog?.querySelector("[data-prev]");
  const next = dialog?.querySelector("[data-next]");
  const close = dialog?.querySelector("[data-close]");
  if (!dialog || !media || !caption || !prev || !next || !close) return { open() {} };
  let items = [];
  let index = 0;
  let lastFocus = null;

  function render() {
    const item = items[index];
    clear(media);
    if (!item) return;

    if (isReal(item) && item.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = item.src;
      if (isSafeAsset(item.poster)) video.poster = item.poster;
      media.append(video);
    } else if (isReal(item)) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt.trim();
      img.width = Number(item.width) > 0 ? Number(item.width) : 1200;
      img.height = Number(item.height) > 0 ? Number(item.height) : 1500;
      media.append(img);
    } else {
      const pending = el("div", "frame frame--lightbox");
      pending.append(el("p", "kicker", "Fotografía pendiente"));
      media.append(pending);
    }

    caption.textContent = item.caption || "Imagen";
    const single = items.length < 2;
    prev.hidden = single;
    next.hidden = single;
  }

  function move(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    render();
  }

  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  close.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    media.querySelectorAll("video").forEach((video) => video.pause());
    if (lastFocus && typeof lastFocus.focus === "function" && lastFocus.isConnected) {
      lastFocus.focus();
    }
    lastFocus = null;
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  return {
    open(list, start) {
      items = Array.isArray(list) ? list : [];
      index = start >= 0 && start < items.length ? start : 0;
      render();
      if (!dialog.open) {
        lastFocus = document.activeElement;
        dialog.showModal();
        close.focus();
      }
    },
  };
}
