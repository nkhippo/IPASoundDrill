/**
 * F2 root router: Accept-Language / Cookie / Bot handling for `/` only.
 * Matcher excludes language subdirectories to prevent redirect loops.
 */
export const config = {
  matcher: "/",
};

const LANGS = ["en", "ja", "ko", "zh-Hans", "zh-Hant", "fil"] as const;
type Lang = (typeof LANGS)[number];

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

export default function middleware(request: Request): Response {
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
