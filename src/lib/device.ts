// Browser-only: a stable per-browser device id (random id + light browser fingerprint).
const KEY = "ia_device_id";

function hash(str: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(36);
}

export function getDeviceId(): string {
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing && /^[A-Za-z0-9_-]{8,128}$/.test(existing)) return existing;
  } catch {
    /* storage blocked */
  }
  const fp = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? "",
  ].join("|");
  const rand = crypto.randomUUID().replace(/-/g, "");
  const id = `fp${hash(fp)}_${rand}`;
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}
