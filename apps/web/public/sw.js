/**
 * IPA Sound Drill — Service Worker (PWA Phase 2, Issue #254).
 *
 * Strategies:
 *   - HTML                    → network-first (fresh deploys visible on reload)
 *   - fonts / core-bundle / icons / favicon → cache-first (immutable, high hit rate)
 *   - i18n / data JSON        → stale-while-revalidate (fast repeat load + eventual refresh)
 *   - everything else         → passthrough (SW does nothing)
 *
 * On SW update, install() wipes non-matching caches and skipWaiting();
 * activate() clients.claim() so a single reload swaps every open tab.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `ipasounddrill-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isHtmlRequest(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

function isCacheFirst(url) {
  return (
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/core-bundle.js") ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/manifest.webmanifest"
  );
}

function isStaleWhileRevalidate(url) {
  return (
    url.pathname.startsWith("/i18n/") ||
    url.pathname.startsWith("/data/") ||
    url.pathname.endsWith(".css")
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle same-origin requests. Google Fonts / GAS TTS / analytics are passthrough.
  if (url.origin !== self.location.origin) return;

  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (isStaleWhileRevalidate(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  // Passthrough: don't respondWith → default network fetch.
});
