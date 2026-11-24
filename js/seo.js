function absoluteUrl(siteUrl, path) {
  const base = typeof siteUrl === "string" ? siteUrl.trim().replace(/\/+$/, "") : "";
  if (!base || !/^https:\/\/[^\s/]+$/i.test(base)) return null;
  const suffix = typeof path === "string" && path.trim() ? path.trim() : "/";
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${base}${normalized}`;
}

function setMeta(property, content) {
  if (!content) return;
  let node = document.head.querySelector(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("property", property);
    document.head.append(node);
  }
  node.setAttribute("content", content);
}

export function applySeo(seo = {}) {
  const home = absoluteUrl(seo.siteUrl, "/");
  if (!home) return;

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = home;

  setMeta("og:url", home);

  const ogImage = absoluteUrl(seo.siteUrl, seo.ogImagePath || "/assets/images/og.png");
  if (ogImage) {
    setMeta("og:image", ogImage);
    const twitterImage = document.head.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute("content", ogImage);
  }

  const hreflang = document.head.querySelector('link[rel="alternate"][hreflang="es"]');
  if (hreflang) hreflang.href = home;
}