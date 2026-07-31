#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { Resvg } = require("@resvg/resvg-js");

const ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const TEMPLATE = path.resolve(__dirname, "..", "src", "index.template.html");
const CORE_I18N_DIR = path.join(REPO_ROOT, "packages", "core", "i18n");
const CORE_ENTRY = path.join(REPO_ROOT, "packages", "core", "src", "index.ts");
const CORE_BUNDLE_OUT = path.join(ROOT, "public", "core-bundle.js");

/**
 * `@ipasounddrill/core`（判定ロジック + 型 + loader）を単一 ESM バンドルへ esbuild する
 * （Issue #213 Phase 4）。`apps/web/src/index.template.html` はこのバンドルを
 * `<script type="module">` から import する。データ内容・見た目には影響しない
 * ビルド時変換のみ（`apps/web/.gitignore` により生成物は未追跡）。
 */
function bundleCore() {
  if (!fs.existsSync(CORE_ENTRY)) {
    console.error("Missing core entry:", CORE_ENTRY);
    process.exit(1);
  }
  esbuild.buildSync({
    entryPoints: [CORE_ENTRY],
    outfile: CORE_BUNDLE_OUT,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
  });
  console.log("Wrote", path.relative(ROOT, CORE_BUNDLE_OUT));
}
const LANGS = ["en", "ja", "ko", "zh-Hans", "zh-Hant", "fil"];
const OG_LOCALE = {
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
  fil: "fil_PH",
};

function hreflangBlock() {
  const lines = LANGS.map(
    (lang) =>
      `<link rel="alternate" hreflang="${lang}" href="https://ipasounddrill.app/${lang}/">`
  );
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/">`
  );
  return lines.join("\n");
}

const FAQ_EN = [
  {
    q: "What is IPA (the International Phonetic Alphabet)?",
    a: "IPA is a standardized set of symbols that represents every distinct sound in human speech. English uses about 44 phonemes, and IPA lets learners see and drill each sound explicitly instead of guessing from spelling.",
  },
  {
    q: "What is the difference between General American (GA) and Received Pronunciation (RP)?",
    a: "GA is the mainstream US accent; RP is a reference British accent. Key differences include rhoticity (GA pronounces r after vowels; RP typically drops it), the LOT/CLOTH vowel (GA ɑ/ɔ vs RP ɒ), the BATH vowel (GA æ vs RP ɑː), and the flap t in GA. IPA Sound Drill shows both accents side-by-side for every word and phrase.",
  },
  {
    q: "What are weak forms in English?",
    a: "Weak forms are reduced pronunciations of function words (a, the, of, to, and, have, was, can, etc.) in unstressed positions. For example, 'of' becomes /əv/ or /ə/ rather than /ʌv/. Native speakers use weak forms constantly; learning them is the fastest way to sound natural. IPA Sound Drill covers 36 weak forms with both weak and strong IPA.",
  },
  {
    q: "What is connected speech?",
    a: "Connected speech is how sounds change and link when words run together: linking (an apple → a-napple), glide insertion (I am → I-yam), assimilation (did you → didju), and elision. IPA Sound Drill includes 201 phrase-level patterns for drilling these transitions.",
  },
  {
    q: "Is IPA Sound Drill free?",
    a: "Yes. No ads, no sign-up, no account required. Cookieless analytics only. The full source code and data are open on GitHub at https://github.com/nkhippo/IPASoundDrill.",
  },
];

function faqPageNode() {
  return {
    "@type": "FAQPage",
    mainEntity: FAQ_EN.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function jsonLd(lang, brandName, description) {
  const url = `https://ipasounddrill.app/${lang}/`;
  const graph = [
    {
      "@type": "WebApplication",
      "@id": `${url}#webapp`,
      name: brandName,
      description,
      url,
      inLanguage: LANGS,
      applicationCategory: "EducationalApplication",
      applicationSubCategory: "LanguageLearning",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript enabled",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      featureList: [
        "Decode mode: read IPA, type the English word",
        "Encode mode: transcribe English words to IPA using an on-screen keyboard",
        "Sound to Vocabulary (Mode B): listen and identify the correct word from context",
        "Connected Speech: 201 phrase-level patterns for linking, glide insertion, and assimilation",
        "Weak Forms: 36 function words with weak and strong IPA (GA and RP)",
        "Vocabulary Browser: 5,397 CEFR-graded English words with GA and RP IPA",
        "Both General American (GA) and Received Pronunciation (RP) shown for every entry",
        "Multilingual interface: English, Japanese, Korean, Simplified Chinese, Traditional Chinese, Filipino",
      ],
    },
    {
      "@type": "LearningResource",
      "@id": `${url}#learning-resource`,
      name: brandName,
      description,
      url,
      inLanguage: lang,
      learningResourceType: "Interactive Resource",
      educationalUse: ["Practice", "Self-study", "Classroom activity"],
      teaches: [
        "International Phonetic Alphabet",
        "English pronunciation",
        "General American pronunciation",
        "Received Pronunciation",
        "English weak forms",
        "English connected speech",
      ],
      audience: {
        "@type": "EducationalAudience",
        educationalRole: ["Student", "Teacher", "Self-learner"],
      },
      isAccessibleForFree: true,
    },
    {
      "@type": "Organization",
      "@id": "https://ipasounddrill.app/#org",
      name: "IPA Sound Drill",
      url: "https://ipasounddrill.app/",
      logo: "https://ipasounddrill.app/favicon.svg",
      sameAs: ["https://github.com/nkhippo/IPASoundDrill"],
    },
    faqPageNode(),
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function buildSitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const alternatesXml = LANGS.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/"/>`
  ).join("\n");
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/"/>`;
  const urls = LANGS.map(
    (lang) => `  <url>
    <loc>https://ipasounddrill.app/${lang}/</loc>
${alternatesXml}
${xDefault}
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function writeSitemap() {
  const out = path.join(ROOT, "public", "sitemap.xml");
  fs.writeFileSync(out, buildSitemapXml(), "utf8");
  console.log("Wrote", path.relative(ROOT, out));
}

const OG_SVG_SRC = path.join(ROOT, "src", "og", "og-default.svg");
const OG_PNG_OUT = path.join(ROOT, "public", "og", "og-default.png");

function writeOgImage() {
  if (!fs.existsSync(OG_SVG_SRC)) {
    console.error("Missing OGP SVG source:", OG_SVG_SRC);
    process.exit(1);
  }
  const svg = fs.readFileSync(OG_SVG_SRC, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "DejaVu Sans",
    },
  });
  const pngData = resvg.render().asPng();
  fs.mkdirSync(path.dirname(OG_PNG_OUT), { recursive: true });
  fs.writeFileSync(OG_PNG_OUT, pngData);
  console.log("Wrote", path.relative(ROOT, OG_PNG_OUT));
}

function replaceAll(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

function build() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error("Missing template:", TEMPLATE);
    process.exit(1);
  }
  bundleCore();
  const template = fs.readFileSync(TEMPLATE, "utf8");
  const alternates = hreflangBlock();

  for (const lang of LANGS) {
    const i18nPath = path.join(CORE_I18N_DIR, `${lang}.json`);
    if (!fs.existsSync(i18nPath)) {
      console.error("Missing i18n file:", i18nPath);
      process.exit(1);
    }
    const i18n = JSON.parse(fs.readFileSync(i18nPath, "utf8"));
    const meta = i18n.meta || {};
    const brandName = (i18n.brand && i18n.brand.name) || "IPA Sound Drill";

    let html = template;
    html = replaceAll(html, "<!-- BUILD:HTML_LANG -->", lang);
    html = replaceAll(html, "<!-- BUILD:META_TITLE -->", meta.title || brandName);
    html = replaceAll(
      html,
      "<!-- BUILD:META_DESCRIPTION -->",
      meta.description || ""
    );
    html = replaceAll(html, "<!-- BUILD:OG_TITLE -->", meta.ogTitle || meta.title || brandName);
    html = replaceAll(
      html,
      "<!-- BUILD:OG_DESCRIPTION -->",
      meta.ogDescription || meta.description || ""
    );
    html = replaceAll(
      html,
      "<!-- BUILD:OG_URL -->",
      `https://ipasounddrill.app/${lang}/`
    );
    html = replaceAll(html, "<!-- BUILD:OG_LOCALE -->", OG_LOCALE[lang]);
    html = replaceAll(
      html,
      "<!-- BUILD:CANONICAL -->",
      `https://ipasounddrill.app/${lang}/`
    );
    html = replaceAll(html, "<!-- BUILD:HREFLANG_ALTERNATES -->", alternates);
    html = replaceAll(
      html,
      "<!-- BUILD:JSON_LD -->",
      jsonLd(lang, brandName, meta.description || "")
    );

    const outDir = path.join(ROOT, "public", lang);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "index.html");
    fs.writeFileSync(outFile, html, "utf8");
    console.log("Wrote", path.relative(ROOT, outFile));
  }

  writeSitemap();
  writeOgImage();
}

build();
