/**
 * F2 root router: Accept-Language / Cookie / Bot handling for `/`.
 * EPIC #243 Phase 1: also handles unsupported-locale fallback and
 * IPA-symbol slug redirects under `/{lang}/sounds/<ipa>/`.
 *
 * Matcher list is enumerated to avoid catching static assets or the
 * canonical language pages (which serve directly from public/).
 */
export const config = {
  matcher: [
    "/",
    // unsupported-locale bare paths: /it/, /fi/, /zu/, etc. — GSC 404 fix
    // Anything that looks like a 2- or 5-char locale but isn't in LANGS.
    "/:locale([a-z]{2}|[a-z]{2}-[A-Za-z]{2,4})/",
    // IPA-symbol slug redirects: /{lang}/sounds/<ipa>/
    // Slug may contain non-ASCII (θ, ə, ...) — matcher stays permissive; handler validates.
    "/:lang(en|ja|ko|zh-Hans|zh-Hant|fil)/sounds/:slug/",
  ],
};

const LANGS = ["en", "ja", "ko", "zh-Hans", "zh-Hant", "fil"] as const;
type Lang = (typeof LANGS)[number];

/**
 * IPA symbol → SEO slug map (EPIC #243 Phase 1).
 * Mirror of apps/web/scripts/phoneme-slugs.js. Keep in sync.
 * Only 45 phonemes need redirect; the SEO-slug URLs are served
 * from public/{lang}/sounds/<slug>/index.html directly.
 */
const IPA_TO_SLUG: Record<string, string> = {
  "i": "long-e", "ɪ": "short-i", "ɛ": "short-e", "æ": "short-a",
  "ə": "schwa", "ʌ": "short-u-cup", "ɑ": "short-o-ah", "ɔ": "aw",
  "ʊ": "short-u-book", "u": "long-oo", "ɝ": "er-stressed", "ɚ": "er-unstressed",
  "eɪ": "long-a", "aɪ": "long-i", "ɔɪ": "oy", "oʊ": "long-o", "aʊ": "ow",
  "θ": "th-voiceless", "ð": "th-voiced", "ʃ": "sh", "ʒ": "zh",
  "tʃ": "ch", "dʒ": "j-sound", "ŋ": "ng",
  "r": "r", "l": "l", "v": "v", "f": "f", "w": "w", "j": "y-sound", "h": "h",
  "b": "b", "d": "d", "ɡ": "g", "k": "k", "p": "p", "t": "t", "m": "m", "n": "n",
  "s": "s", "z": "z",
  "ɾ": "flap-t", "ʔ": "glottal-stop", "n̩": "syllabic-n", "l̩": "syllabic-l",
};

const KNOWN_SLUGS = new Set(Object.values(IPA_TO_SLUG));

const BOT_UA =
  /Googlebot|Bingbot|GPTBot|anthropic-ai|ClaudeBot|Baiduspider|YandexBot|Slurp|DuckDuckBot|facebookexternalhit|Twitterbot|LinkedInBot|Applebot/i;

function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

function cookieLang(cookieHeader: string | null): Lang | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)app_lang=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1].trim());
  return isLang(value) ? value : null;
}

function pickFromAcceptLanguage(header: string | null): Lang {
  if (!header) return "en";
  const parts = header
    .split(",")
    .map((raw) => {
      const [tagPart, ...params] = raw.trim().split(";");
      const tag = (tagPart || "").trim().toLowerCase();
      let quality = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=([0-9.]+)$/i);
        if (m) quality = parseFloat(m[1]) || 0;
      }
      return { tag, quality };
    })
    .filter((p) => p.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of parts) {
    for (const lang of LANGS) {
      if (tag === lang.toLowerCase()) return lang;
    }
    if (tag.startsWith("zh-cn") || tag === "zh-hans") return "zh-Hans";
    if (tag.startsWith("zh-tw") || tag.startsWith("zh-hk") || tag === "zh-hant") {
      return "zh-Hant";
    }
    if (tag === "zh") return "zh-Hans";
    if (tag.startsWith("ja")) return "ja";
    if (tag.startsWith("ko")) return "ko";
    if (tag.startsWith("fil") || tag.startsWith("tl")) return "fil";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

function redirectTo(request: Request, lang: Lang, status = 302): Response {
  const url = new URL(request.url);
  url.pathname = `/${lang}/`;
  return Response.redirect(url, status);
}

function redirectToUrl(url: URL, status: number): Response {
  return Response.redirect(url, status);
}

// Vercel Edge Middleware contract: return `Response` to short-circuit,
// or `undefined` to fall through to origin (static file, etc.).
export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url);
  const path = url.pathname;

  // ---- EPIC #243 Phase 1: Deep URL routing ----

  // Case A: /{lang}/sounds/<slug>/ — IPA symbol → SEO slug 301 redirect.
  //   If <slug> is a canonical SEO slug (matches KNOWN_SLUGS), fall through
  //   so Vercel serves the static file at public/{lang}/sounds/<slug>/index.html.
  //   If <slug> is an IPA symbol (matches IPA_TO_SLUG), 301 to canonical.
  //   Otherwise, fall through (Vercel serves 404).
  const soundsMatch = path.match(
    /^\/(en|ja|ko|zh-Hans|zh-Hant|fil)\/sounds\/([^/]+)\/?$/,
  );
  if (soundsMatch) {
    const lang = soundsMatch[1];
    const rawSlug = decodeURIComponent(soundsMatch[2]);
    if (KNOWN_SLUGS.has(rawSlug)) {
      return undefined; // passthrough → static file
    }
    const targetSlug = IPA_TO_SLUG[rawSlug];
    if (targetSlug) {
      url.pathname = `/${lang}/sounds/${targetSlug}/`;
      return redirectToUrl(url, 301);
    }
    return undefined; // let Vercel 404
  }

  // Case B: /{locale}/ — unsupported locale → /en/ fallback (GSC 404 fix).
  //   Supported locales fall through so Vercel serves public/{lang}/index.html.
  const localeMatch = path.match(/^\/([A-Za-z]{2}(?:-[A-Za-z]{2,4})?)\/?$/);
  if (localeMatch) {
    const candidate = localeMatch[1];
    if (isLang(candidate)) {
      return undefined; // passthrough → static file
    }
    url.pathname = "/en/";
    return redirectToUrl(url, 302);
  }

  // ---- Original F2 root router: `/` only ----
  if (path !== "/") {
    return undefined;
  }

  const ua = request.headers.get("user-agent") || "";

  // Bots: send to English. Prefer rewrite when platform helpers exist; 302 keeps
  // language URLs independently crawlable and works without @vercel/functions.
  if (BOT_UA.test(ua)) {
    return redirectTo(request, "en", 302);
  }

  const fromCookie = cookieLang(request.headers.get("cookie"));
  if (fromCookie) {
    return redirectTo(request, fromCookie, 302);
  }

  const lang = pickFromAcceptLanguage(request.headers.get("accept-language"));
  return redirectTo(request, lang, 302);
}
