export function isSafeAsset(src) {
  return (
    typeof src === "string" &&
    /^assets\/(images|videos|files)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(src) &&
    !src.includes("..")
  );
}

export function isEmail(value) {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
  );
}

const ALLOWED_OUTBOUND_HOSTS = new Set([
  "www.instagram.com",
  "instagram.com",
  "www.linkedin.com",
  "linkedin.com",
]);

export function isHttpsUrl(value) {
  if (typeof value !== "string" || value.length > 400) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

export function isAllowedOutboundUrl(value) {
  if (!isHttpsUrl(value)) return false;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return ALLOWED_OUTBOUND_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function assignOutboundLink(anchor, href) {
  if (!(anchor instanceof HTMLAnchorElement) || !isAllowedOutboundUrl(href)) return false;
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  return true;
}

export function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value != null) node.textContent = value;
  return node;
}

export function clear(node) {
  node.replaceChildren();
}
