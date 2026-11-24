import { isSafeAsset, isEmail, isAllowedOutboundUrl, assignOutboundLink, el, clear } from "./safe.js";
import { arm } from "./animations.js";
import { applySeo } from "./seo.js";

function positive(value) {
  return Number.isFinite(value) && value > 0;
}

function showExtras(key) {
  document.querySelectorAll(`[data-nav-extra="${key}"]`).forEach((node) => {
    node.hidden = false;
  });
}

function mountImage(frame, image, priority) {
  if (!frame || !image || !isSafeAsset(image.src) || typeof image.alt !== "string" || !image.alt.trim()) return;
  const img = document.createElement("img");
  img.src = image.src;
  img.alt = image.alt.trim();
  img.width = positive(Number(image.width)) ? Number(image.width) : 1200;
  img.height = positive(Number(image.height)) ? Number(image.height) : 1500;
  img.decoding = "async";
  if (priority === true) {
    img.fetchPriority = "high";
    img.loading = "eager";
  } else if (priority === "eager") {
    img.loading = "eager";
  } else {
    img.loading = "lazy";
  }
  frame.replaceChildren(img);
  if (frame.id === "about-frame") frame.setAttribute("data-mask", "");
}

function formatRateLabel(data, group) {
  const currency = typeof data.currency === "string" && /^[A-Z]{3}$/.test(data.currency) ? data.currency : "EUR";
  const fallback =
    typeof data.priceLabel === "string" && data.priceLabel.trim() ? data.priceLabel.trim() : "A consultar";
  if (group && positive(Number(group.price))) {
    try {
      return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(
        Number(group.price)
      );
    } catch {
      return fallback;
    }
  }
  if (typeof group?.priceLabel === "string" && group.priceLabel.trim()) return group.priceLabel.trim();
  return fallback;
}

function buildGroupCards(host, groups, footnoteForGroup) {
  if (!host || !Array.isArray(groups)) return;
  clear(host);
  groups.forEach((group) => {
    if (!group || typeof group.title !== "string" || !group.title.trim()) return;
    const items = Array.isArray(group.items) ? group.items : [];
    const formats = items.filter((item) => item && typeof item.name === "string" && item.name.trim());
    if (!formats.length) return;

    const card = document.createElement("article");
    card.className = "rate-card";
    card.append(el("h3", "rate-card__title", group.title.trim()));

    const list = document.createElement("ul");
    list.className = "rate-card__formats";
    formats.forEach((item) => {
      const row = document.createElement("li");
      row.className = "rate-card__format";
      row.append(el("h4", "rate-card__format-name", item.name.trim()));
      if (typeof item.summary === "string" && item.summary.trim()) {
        row.append(el("p", null, item.summary.trim()));
      }
      list.append(row);
    });
    card.append(list);

    const foot = footnoteForGroup ? footnoteForGroup(group) : "";
    if (foot) card.append(el("p", "rate-card__price", foot));

    host.append(card);
  });
}

function renderRates(data) {
  const host = document.getElementById("rate-groups");
  const note = document.getElementById("rate-note");
  if (note && typeof data?.note === "string" && data.note.trim()) note.textContent = data.note.trim();
  if (!host || !Array.isArray(data?.groups)) return;
  buildGroupCards(host, data.groups, (group) => formatRateLabel(data, group));
}

function renderCollaborations(data) {
  const host = document.getElementById("collab-groups");
  const note = document.getElementById("collab-note");
  if (note && typeof data?.note === "string" && data.note.trim()) note.textContent = data.note.trim();
  if (!host || !Array.isArray(data?.groups)) return;
  buildGroupCards(host, data.groups, null);
}

function renderAudience(rows) {
  const list = document.getElementById("audience-list");
  const note = document.getElementById("audience-note");
  if (!list || !Array.isArray(rows)) return;
  clear(list);
  let published = 0;
  rows.forEach((row) => {
    if (!row || typeof row.label !== "string" || !row.label.trim()) return;
    const value = typeof row.value === "string" ? row.value.trim() : "";
    if (!value) return;
    published += 1;
    list.append(el("dt", null, row.label.trim()), el("dd", null, value));
  });
  if (note) note.hidden = published > 0;
}

function renderInsightsPeriod(value) {
  const node = document.getElementById("audience-source");
  if (!node) return;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    node.hidden = true;
    return;
  }
  node.textContent = text;
  node.hidden = false;
}

function validFeaturedReel(item) {
  return (
    item &&
    typeof item.title === "string" &&
    item.title.trim() &&
    isAllowedOutboundUrl(item.url) &&
    isSafeAsset(item.cover) &&
    typeof item.alt === "string" &&
    item.alt.trim()
  );
}

function renderFeaturedReels(items) {
  const host = document.getElementById("featured-reels");
  const block = document.getElementById("featured-reels-block");
  if (!host) return;
  clear(host);
  if (!block) return;
  if (!Array.isArray(items)) {
    block.hidden = true;
    return;
  }
  const published = items.filter(validFeaturedReel);
  if (!published.length) {
    block.hidden = true;
    return;
  }
  published.forEach((item) => {
    const li = document.createElement("li");
    li.className = "reel-covers__item";
    const link = document.createElement("a");
    link.className = "reel-cover";
    if (!assignOutboundLink(link, item.url)) return;
    const aria = `${item.title.trim()}. Ver en Instagram`;
    link.setAttribute("aria-label", aria);
    const frame = el("div", "frame reel-cover__frame");
    const img = document.createElement("img");
    img.src = item.cover;
    img.alt = item.alt.trim();
    img.width = positive(Number(item.width)) ? Number(item.width) : 290;
    img.height = positive(Number(item.height)) ? Number(item.height) : 500;
    img.loading = "lazy";
    img.decoding = "async";
    frame.append(img);
    link.append(frame, el("span", "reel-cover__title", item.title.trim()));
    link.append(el("span", "visually-hidden", " (se abre en una pestaña nueva)"));
    li.append(link);
    host.append(li);
  });
  block.hidden = false;
}

function renderContacts(contact = {}) {
  document.querySelectorAll("[data-contact='email']").forEach((node) => {
    clear(node);
    if (isEmail(contact.email)) {
      const link = document.createElement("a");
      link.className = "text-link";
      link.href = `mailto:${contact.email}`;
      link.textContent = contact.email;
      node.append(link);
    } else {
      node.textContent = "Escríbeme por @liapilates21";
    }
  });

  if (isAllowedOutboundUrl(contact.instagram)) {
    document.querySelectorAll("[data-instagram]").forEach((link) => {
      assignOutboundLink(link, contact.instagram);
    });
  }

  if (typeof contact.instagramHandle === "string" && /^@[A-Za-z0-9._]{2,30}$/.test(contact.instagramHandle)) {
    document.querySelectorAll("[data-instagram-handle]").forEach((node) => {
      node.textContent = contact.instagramHandle;
    });
  }
}

function renderTestimonials(items) {
  const section = document.getElementById("testimonios");
  const list = document.getElementById("testimonial-list");
  if (!section || !list || !Array.isArray(items)) return;
  clear(list);
  items.forEach((item) => {
    if (!item || typeof item.quote !== "string" || !item.quote.trim()) return;
    if (typeof item.author !== "string" || !item.author.trim()) return;
    const block = document.createElement("blockquote");
    block.append(el("p", null, item.quote.trim()));
    const footer = document.createElement("footer");
    footer.textContent = item.author.trim();
    block.append(footer);
    list.append(block);
  });
  if (!list.childElementCount) return;
  list.className = "extra-list";
  section.hidden = false;
  showExtras("testimonios");
}

function renderCampaigns(items) {
  const section = document.getElementById("campanas");
  const list = document.getElementById("campaign-list");
  if (!section || !list || !Array.isArray(items)) return;
  clear(list);
  items.forEach((item) => {
    if (!item || typeof item.title !== "string" || !item.title.trim()) return;
    const article = document.createElement("article");
    article.append(el("h3", null, item.title.trim()));
    if (typeof item.year === "string" && item.year.trim()) article.append(el("p", "kicker", item.year.trim()));
    if (typeof item.summary === "string" && item.summary.trim()) article.append(el("p", null, item.summary.trim()));
    list.append(article);
  });
  if (!list.childElementCount) return;
  list.className = "extra-list";
  section.hidden = false;
  showExtras("campanas");
}

function renderBrandPartners(items) {
  const host = document.getElementById("brand-partners");
  if (!host) return;
  clear(host);
  const published = (Array.isArray(items) ? items : []).filter((item) => item && typeof item.name === "string" && item.name.trim());
  if (!published.length) {
    const empty = document.createElement("li");
    empty.className = "brand-partners__empty";
    empty.append(el("p", "empty-note", "Aquí irán las marcas con las que trabajo."));
    host.append(empty);
    return;
  }
  published.forEach((item) => {
    const card = document.createElement("li");
    card.className = "brand-card";
    const logoSrc = typeof item.logo === "string" && item.logo.trim() ? item.logo.trim() : "";
    if (isSafeAsset(logoSrc)) {
      const figure = document.createElement("figure");
      figure.className = "brand-card__logo";
      const img = document.createElement("img");
      img.src = logoSrc;
      img.alt =
        typeof item.logoAlt === "string" && item.logoAlt.trim()
          ? item.logoAlt.trim()
          : `Logotipo de ${item.name.trim()}.`;
      img.width = 220;
      img.height = 80;
      img.loading = "lazy";
      img.decoding = "async";
      figure.append(img);
      card.append(figure);
    }
    const body = document.createElement("div");
    body.className = "brand-card__body";
    body.append(el("h3", "brand-card__name", item.name.trim()));
    if (typeof item.note === "string" && item.note.trim()) {
      body.append(el("p", "brand-card__note", item.note.trim()));
    }
    card.append(body);
    host.append(card);
  });
}

export function initContent(site, rates, collaborations) {
  applySeo(site?.seo);
  mountImage(document.getElementById("about-frame"), site?.portrait, "eager");

  renderBrandPartners(site?.completedCollaborations);

  renderRates(rates);
  renderCollaborations(collaborations);
  renderAudience(site?.audience);
  renderInsightsPeriod(site?.insightsPeriod);
  renderFeaturedReels(site?.featuredReels);
  renderContacts(site?.contact);
  renderCampaigns(site?.campaigns);
  renderTestimonials(site?.testimonials);

  [
    document.getElementById("about-frame"),
    document.getElementById("brand-partners"),
    document.getElementById("rate-groups"),
    document.getElementById("collab-groups"),
    document.getElementById("featured-reels"),
  ].forEach((node) => {
    if (node) arm(node);
  });
}

export function showContentError() {
  document.querySelectorAll("[data-dynamic]").forEach((node) => {
    clear(node);
    const message = el("p", "load-error", "No he podido cargar esta parte. Prueba a recargar o vuelve más tarde.");
    if (node.tagName === "OL" || node.tagName === "UL") {
      const li = document.createElement("li");
      li.append(message);
      node.append(li);
    } else {
      node.append(message);
    }
  });
}
