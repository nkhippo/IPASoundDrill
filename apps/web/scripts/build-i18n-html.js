#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { Resvg } = require("@resvg/resvg-js");

const ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const TEMPLATE = path.resolve(__dirname, "..", "src", "index.template.html");
const SOUND_TEMPLATE = path.resolve(__dirname, "..", "src", "sound-detail.template.html");
const SOUND_WORDS_TEMPLATE = path.resolve(__dirname, "..", "src", "sound-words.template.html");
const WEAK_TEMPLATE = path.resolve(__dirname, "..", "src", "weak-form-detail.template.html");
const PHRASE_TEMPLATE = path.resolve(__dirname, "..", "src", "phrase-detail.template.html");
const DATASET_TEMPLATE = path.resolve(__dirname, "..", "src", "dataset-landing.template.html");
const CORE_I18N_DIR = path.join(REPO_ROOT, "packages", "core", "i18n");
const CORE_PHONEMES_DIR = path.join(CORE_I18N_DIR, "phonemes");
const CORE_DATA_DIR = path.join(REPO_ROOT, "packages", "core", "data");
const CORE_ENTRY = path.join(REPO_ROOT, "packages", "core", "src", "index.ts");
const CORE_BUNDLE_OUT = path.join(ROOT, "public", "core-bundle.js");
const { PHONEMES, IPA_TO_SLUG, SLUG_TO_ENTRY } = require("./phoneme-slugs");

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
  const rootAlternates = LANGS.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/"/>`
  ).join("\n");
  const xDefaultRoot = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/"/>`;
  const rootUrls = LANGS.map(
    (lang) => `  <url>
    <loc>https://ipasounddrill.app/${lang}/</loc>
${rootAlternates}
${xDefaultRoot}
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  ).join("\n");

  // Deep URL: sound-detail pages (Phase 1, EPIC #243)
  const soundUrls = [];
  for (const lang of LANGS) {
    for (const p of PHONEMES) {
      const alts = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/sounds/${p.slug}/"/>`
      ).join("\n");
      const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/sounds/${p.slug}/"/>`;
      soundUrls.push(`  <url>
    <loc>https://ipasounddrill.app/${lang}/sounds/${p.slug}/</loc>
${alts}
${xd}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  // Deep URL: weak-form pages (Phase 2, EPIC #243)
  const weakUrls = [];
  const weakForms = loadWeakForms();
  for (const lang of LANGS) {
    for (const w of weakForms) {
      const slug = encodeURIComponent(w.w);
      const alts = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/weak-forms/${slug}/"/>`
      ).join("\n");
      const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/weak-forms/${slug}/"/>`;
      weakUrls.push(`  <url>
    <loc>https://ipasounddrill.app/${lang}/weak-forms/${slug}/</loc>
${alts}
${xd}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  // Deep URL: sound → words pages (Phase 4, EPIC #243)
  const soundWordsUrls = [];
  for (const lang of LANGS) {
    for (const p of PHONEMES) {
      const alts = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/sounds/${p.slug}/words/"/>`
      ).join("\n");
      const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/sounds/${p.slug}/words/"/>`;
      soundWordsUrls.push(`  <url>
    <loc>https://ipasounddrill.app/${lang}/sounds/${p.slug}/words/</loc>
${alts}
${xd}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  // Deep URL: connected-speech phrase pages (Phase 3, EPIC #243)
  const phraseUrls = [];
  const phrases = loadConnectedSpeech();
  for (const lang of LANGS) {
    for (const p of phrases) {
      const slug = phraseSlug(p.w);
      const alts = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/phrases/${slug}/"/>`
      ).join("\n");
      const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/phrases/${slug}/"/>`;
      phraseUrls.push(`  <url>
    <loc>https://ipasounddrill.app/${lang}/phrases/${slug}/</loc>
${alts}
${xd}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  // Deep URL: dataset landing pages (Issue #251)
  const datasetUrls = LANGS.map((lang) => {
    const alts = LANGS.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/data/"/>`
    ).join("\n");
    const xd = `    <xhtml:link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/data/"/>`;
    return `  <url>
    <loc>https://ipasounddrill.app/${lang}/data/</loc>
${alts}
${xd}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rootUrls}
${soundUrls.join("\n")}
${soundWordsUrls.join("\n")}
${weakUrls.join("\n")}
${phraseUrls.join("\n")}
${datasetUrls.join("\n")}
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

// PWA icons — favicon.svg is the shared canvas, maskable variant lives at src/pwa-icon-maskable.svg
const PWA_ICON_SRC = path.join(ROOT, "public", "favicon.svg");
const PWA_MASKABLE_SRC = path.join(ROOT, "src", "pwa-icon-maskable.svg");
const PWA_OUT_DIR = path.join(ROOT, "public", "icons");
// [size, sourceSvgPath, outputBasename]
const PWA_TARGETS = [
  [180, PWA_ICON_SRC, "apple-touch-icon.png"],
  [192, PWA_ICON_SRC, "icon-192.png"],
  [512, PWA_ICON_SRC, "icon-512.png"],
  [512, PWA_MASKABLE_SRC, "icon-512-maskable.png"],
];

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtTpl(tpl, vars) {
  return String(tpl || "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? "" : String(vars[k])));
}

function buildSoundPage(lang, i18nRoot, phonemesI18n, entry) {
  const seo = (i18nRoot && i18nRoot.seo && i18nRoot.seo.sounds) || {};
  const pIpa = phonemesI18n[entry.ipa] || {};
  const label = pIpa.lab || entry.label;
  const mouth = pIpa.mouth || "";
  const trap = pIpa.trap || "";
  const ex = pIpa.ex || "";
  const brandName = (i18nRoot.brand && i18nRoot.brand.name) || "IPA Sound Drill";

  const url = `https://ipasounddrill.app/${lang}/sounds/${entry.slug}/`;
  const homeUrl = `/${lang}/`;
  const soundsUrl = `/${lang}/sounds/`;
  const catKey = "category_" + entry.category;
  const categoryLabel = seo[catKey] || entry.category;
  const title = fmtTpl(seo.title_tpl, { label, ipa: entry.ipa }) || `${label} (IPA ${entry.ipa})`;
  const metaDesc = fmtTpl(seo.meta_desc_tpl, { label, ipa: entry.ipa });
  const seoH1 = fmtTpl(seo.h1_tpl, { label, ipa: entry.ipa });

  // Scope badge
  let scopeBadge = "";
  if (entry.scope === "ga") {
    scopeBadge = `<span class="sd-hero-scope">${escHtml(seo.scope_ga || "GA only")}</span>`;
  } else if (entry.scope === "rp") {
    scopeBadge = `<span class="sd-hero-scope">${escHtml(seo.scope_rp || "RP only")}</span>`;
  }

  // GA vs RP section
  let gaRpBlock = "";
  const noteMap = { shared: seo.gr_same, ga: seo.gr_ga_only, rp: seo.gr_rp_only };
  const note = noteMap[entry.scope] || seo.gr_same;
  if (note) {
    gaRpBlock = `<section class="sd-section">
      <h2>${escHtml(seo.gr_section_title || "GA vs RP")}</h2>
      <p>${escHtml(note)}</p>
    </section>`;
  }

  // Cross-link to Phase 4 sound-words page (EPIC #243 Phase 4)
  const seeWordsTpl = seo.see_words_link_tpl || "See {n} common words with this sound →";
  const wordsLinkText = fmtTpl(seeWordsTpl, { n: "20" });
  const wordsLinkBlock = `<p style="text-align:center;margin:8px 0 0"><a href="/${lang}/sounds/${entry.slug}/words/" style="display:inline-block;padding:10px 20px;border:1px solid var(--signal);background:var(--signal-soft);color:var(--signal);border-radius:99px;font-size:14px;font-weight:600">${escHtml(wordsLinkText)}</a></p>`;

  // Related sounds: same category, up to 6 others, prefer same subgroup first
  const related = PHONEMES.filter((p) => p.slug !== entry.slug && p.category === entry.category);
  related.sort((a, b) => {
    const aSub = a.subgroup === entry.subgroup ? 0 : 1;
    const bSub = b.subgroup === entry.subgroup ? 0 : 1;
    return aSub - bSub;
  });
  const relatedHtml = related
    .slice(0, 6)
    .map((r) => {
      const rlab = (phonemesI18n[r.ipa] && phonemesI18n[r.ipa].lab) || r.label;
      return `<li><a href="/${lang}/sounds/${r.slug}/"><span class="sd-ipa-mini">${escHtml(r.ipa)}</span><span>${escHtml(rlab)}</span></a></li>`;
    })
    .join("\n        ");

  // hreflang
  const hreflang = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/sounds/${entry.slug}/">`
  )
    .concat([`<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/sounds/${entry.slug}/">`])
    .join("\n");

  // JSON-LD
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: title,
        description: metaDesc,
        url,
        inLanguage: lang,
        learningResourceType: "Article",
        teaches: `English phoneme ${entry.ipa} (${label})`,
        educationalUse: ["Practice", "Self-study"],
        isAccessibleForFree: true,
        isPartOf: { "@id": `https://ipasounddrill.app/${lang}/#webapp` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: seo.breadcrumb_home || "Home", item: `https://ipasounddrill.app/${lang}/` },
          { "@type": "ListItem", position: 2, name: seo.breadcrumb_root || "Sounds", item: `https://ipasounddrill.app/${lang}/sounds/` },
          { "@type": "ListItem", position: 3, name: label },
        ],
      },
    ],
  });

  // Example word for TTS: extract first word from `ex` (e.g. "cup /kʌp/" -> "cup")
  const exWord = (ex.match(/^([A-Za-z][A-Za-z\-']*)/) || [null, ""])[1];
  const exAccent = entry.scope === "rp" ? "rp" : "ga";

  const template = fs.readFileSync(SOUND_TEMPLATE, "utf8");
  let html = template;
  const rep = (k, v) => (html = replaceAll(html, `<!-- SD:${k} -->`, v));
  rep("HTML_LANG", lang);
  rep("TITLE", escHtml(title));
  rep("META_DESC", escHtml(metaDesc));
  rep("CANONICAL", url);
  rep("HREFLANG", hreflang);
  rep("OG_TITLE", escHtml(title));
  rep("OG_LOCALE", OG_LOCALE[lang]);
  rep("JSON_LD", jsonLd);
  rep("SEO_H1", escHtml(seoH1));
  rep("HOME_URL", homeUrl);
  rep("SOUNDS_URL", soundsUrl);
  rep("CRUMB_HOME", escHtml(seo.breadcrumb_home || "Home"));
  rep("CRUMB_SOUNDS", escHtml(seo.breadcrumb_root || "Sounds"));
  rep("CRUMB_CURRENT", escHtml(entry.ipa));
  rep("IPA", escHtml(entry.ipa));
  rep("LABEL", escHtml(label));
  rep("CATEGORY_LABEL", escHtml(categoryLabel));
  rep("SCOPE_BADGE", scopeBadge);
  rep("EX_WORD", escHtml(exWord));
  rep("EX_ACCENT", exAccent);
  rep("BTN_LISTEN", escHtml(seo.play_audio || "Listen"));
  rep("SEC_HOW", escHtml(seo.sec_how || "How to make this sound"));
  rep("LBL_EXAMPLE", escHtml(seo.lbl_example || "Example"));
  rep("LBL_MOUTH", escHtml(seo.lbl_mouth || "Mouth"));
  rep("LBL_TRAP", escHtml(seo.lbl_trap || "Common trap"));
  rep("EX_TEXT", escHtml(ex));
  rep("MOUTH", escHtml(mouth));
  rep("TRAP", escHtml(trap));
  rep("GA_RP_SECTION", gaRpBlock);
  rep("WORDS_LINK", wordsLinkBlock);
  rep("REL_TITLE", escHtml(seo.related_title || "Related sounds"));
  rep("REL_LIST", relatedHtml);
  rep("CTA_LEAD", escHtml(seo.cta_lead || "Practice this sound in the app."));
  rep("CTA_BUTTON", escHtml(seo.cta_button || "Open IPA Sound Drill"));
  rep("BACK_TOP", escHtml(seo.back_top || "Home"));

  return html;
}

// ---- EPIC #243 Phase 2: Weak forms ----

const WEAK_FORMS_JSON = path.join(CORE_DATA_DIR, "weak_forms.json");

function loadWeakForms() {
  return JSON.parse(fs.readFileSync(WEAK_FORMS_JSON, "utf8"));
}

function renderCarriers(carriers, word) {
  return carriers
    .map((c) => {
      const filled = String(c).replace(/\{P\}/g, `<span class="wf-word-hl">${escHtml(word)}</span>`);
      return `<li>${filled}</li>`;
    })
    .join("\n        ");
}

function buildWeakFormPage(lang, i18nRoot, entry, allEntries) {
  const seo = (i18nRoot && i18nRoot.seo && i18nRoot.seo.weakForms) || {};
  const word = entry.w;
  const weakIpa = entry.ipa;
  const strongIpa = entry.ipa_strong;
  const rpWeak = entry.rp_ipa || weakIpa;
  const rpStrong = entry.rp_ipa_strong || strongIpa;
  const url = `https://ipasounddrill.app/${lang}/weak-forms/${encodeURIComponent(word)}/`;
  const homeUrl = `/${lang}/`;
  const weakformsUrl = `/${lang}/weak-forms/`;
  const rule = (entry.cs_rule && entry.cs_rule[lang]) || (entry.cs_rule && entry.cs_rule.en) || "";
  const title = fmtTpl(seo.title_tpl, { word, weak_ipa: weakIpa, strong_ipa: strongIpa }) || `${word} — weak form`;
  const metaDesc = fmtTpl(seo.meta_desc_tpl, { word, weak_ipa: weakIpa, strong_ipa: strongIpa });
  const seoH1 = fmtTpl(seo.h1_tpl, { word, weak_ipa: weakIpa, strong_ipa: strongIpa });

  // Related: 6 other weak forms by CEFR proximity
  const related = allEntries
    .filter((x) => x.w !== word)
    .sort((a, b) => Math.abs((a.level || 1) - (entry.level || 1)) - Math.abs((b.level || 1) - (entry.level || 1)))
    .slice(0, 6);
  const relatedHtml = related
    .map((r) => `<li><a href="/${lang}/weak-forms/${encodeURIComponent(r.w)}/"><span>${escHtml(r.w)}</span><span class="wf-ipa-mini">${escHtml(r.ipa)}</span></a></li>`)
    .join("\n        ");

  const hreflang = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/weak-forms/${encodeURIComponent(word)}/">`
  )
    .concat([`<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/weak-forms/${encodeURIComponent(word)}/">`])
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: title,
        description: metaDesc,
        url,
        inLanguage: lang,
        learningResourceType: "Article",
        teaches: `English weak form: ${word} (weak ${weakIpa}, strong ${strongIpa})`,
        educationalUse: ["Practice", "Self-study"],
        isAccessibleForFree: true,
        educationalLevel: entry.cefr || undefined,
        isPartOf: { "@id": `https://ipasounddrill.app/${lang}/#webapp` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: seo.breadcrumb_root ? (i18nRoot.seo.sounds && i18nRoot.seo.sounds.breadcrumb_home) || "Home" : "Home", item: `https://ipasounddrill.app/${lang}/` },
          { "@type": "ListItem", position: 2, name: seo.breadcrumb_root || "Weak forms", item: `https://ipasounddrill.app/${lang}/weak-forms/` },
          { "@type": "ListItem", position: 3, name: word },
        ],
      },
    ],
  });

  const template = fs.readFileSync(WEAK_TEMPLATE, "utf8");
  const crumbHome = (i18nRoot.seo && i18nRoot.seo.sounds && i18nRoot.seo.sounds.breadcrumb_home) || "Home";
  let html = template;
  const rep = (k, v) => (html = replaceAll(html, `<!-- WF:${k} -->`, v));
  rep("HTML_LANG", lang);
  rep("TITLE", escHtml(title));
  rep("META_DESC", escHtml(metaDesc));
  rep("CANONICAL", url);
  rep("HREFLANG", hreflang);
  rep("OG_TITLE", escHtml(title));
  rep("OG_LOCALE", OG_LOCALE[lang]);
  rep("JSON_LD", jsonLd);
  rep("SEO_H1", escHtml(seoH1));
  rep("HOME_URL", homeUrl);
  rep("WEAKFORMS_URL", weakformsUrl);
  rep("CRUMB_HOME", escHtml(crumbHome));
  rep("CRUMB_ROOT", escHtml(seo.breadcrumb_root || "Weak forms"));
  rep("WORD", escHtml(word));
  rep("CEFR", escHtml(entry.cefr || ""));
  rep("LBL_WEAK", escHtml(seo.lbl_weak || "Weak form"));
  rep("LBL_STRONG", escHtml(seo.lbl_strong || "Strong form"));
  rep("LBL_RP", escHtml(seo.lbl_rp || "RP"));
  rep("WEAK_IPA", escHtml(weakIpa));
  rep("STRONG_IPA", escHtml(strongIpa));
  rep("RP_WEAK_IPA", escHtml(rpWeak));
  rep("RP_STRONG_IPA", escHtml(rpStrong));
  rep("BTN_LISTEN_GA", escHtml(seo.play_ga || "Listen (GA)"));
  rep("BTN_LISTEN_RP", escHtml(seo.play_rp || "Listen (RP)"));
  rep("SEC_RULE", escHtml(seo.sec_rule || "When to use the weak form"));
  rep("RULE", escHtml(rule));
  rep("SEC_EXAMPLES", escHtml(seo.sec_examples || "Example sentences"));
  rep("CARRIERS", renderCarriers(entry.carriers || [], word));
  rep("REL_TITLE", escHtml(seo.related_title || "Related weak forms"));
  rep("REL_LIST", relatedHtml);
  rep("CTA_LEAD", escHtml(seo.cta_lead || "Drill weak forms in the app."));
  rep("CTA_BUTTON", escHtml(seo.cta_button || "Open IPA Sound Drill"));
  rep("BACK_TOP", escHtml(seo.back_top || "Home"));

  return html;
}

// ---- EPIC #243 Phase 3: Connected speech phrases ----

const CONNECTED_SPEECH_JSON = path.join(CORE_DATA_DIR, "connected_speech.json");

function loadConnectedSpeech() {
  return JSON.parse(fs.readFileSync(CONNECTED_SPEECH_JSON, "utf8"));
}

function phraseSlug(w) {
  return String(w)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderPhraseCarriers(carriers, phrase) {
  return carriers
    .map((c) => {
      const filled = String(c).replace(/\{P\}/g, `<span class="ph-word-hl">${escHtml(phrase)}</span>`);
      return `<li>${filled}</li>`;
    })
    .join("\n        ");
}

function buildPhrasePage(lang, i18nRoot, entry, allEntries) {
  const seo = (i18nRoot && i18nRoot.seo && i18nRoot.seo.phrases) || {};
  const phrase = entry.w;
  const slug = phraseSlug(phrase);
  const ipa = entry.ipa;
  const rpIpa = entry.rp_ipa || ipa;
  const url = `https://ipasounddrill.app/${lang}/phrases/${slug}/`;
  const homeUrl = `/${lang}/`;
  const phrasesUrl = `/${lang}/phrases/`;
  const rule = (entry.cs_rule && entry.cs_rule[lang]) || (entry.cs_rule && entry.cs_rule.en) || "";
  const glossLangKey = lang === "zh-Hans" ? "zh-Hans" : lang;
  const gloss = (entry.gloss && (entry.gloss[glossLangKey] || entry.gloss.en)) || "";
  const typeKey = "type_" + (entry.cs_type || "");
  const typeLabel = seo[typeKey] || entry.cs_type || "";

  const title = fmtTpl(seo.title_tpl, { phrase, ipa, type: typeLabel }) || `${phrase} (${ipa})`;
  const metaDesc = fmtTpl(seo.meta_desc_tpl, { phrase, ipa });
  const seoH1 = fmtTpl(seo.h1_tpl, { phrase, ipa });

  const glossBlock = gloss
    ? `<p class="ph-hero-gloss">${escHtml(seo.lbl_gloss || "Meaning")}: ${escHtml(gloss)}</p>`
    : "";

  // Related: 6 other phrases of same cs_type, then fill from other types
  const sameType = allEntries.filter((x) => x.w !== phrase && x.cs_type === entry.cs_type);
  const otherType = allEntries.filter((x) => x.w !== phrase && x.cs_type !== entry.cs_type);
  const related = sameType.slice(0, 6).concat(otherType).slice(0, 6);
  const relatedHtml = related
    .map((r) => `<li><a href="/${lang}/phrases/${phraseSlug(r.w)}/"><span>${escHtml(r.w)}</span><span class="ph-ipa-mini">${escHtml(r.ipa)}</span></a></li>`)
    .join("\n        ");

  const hreflang = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/phrases/${slug}/">`
  )
    .concat([`<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/phrases/${slug}/">`])
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: title,
        description: metaDesc,
        url,
        inLanguage: lang,
        learningResourceType: "Article",
        teaches: `English connected speech (${entry.cs_type}): ${phrase} → ${ipa}`,
        educationalUse: ["Practice", "Self-study"],
        isAccessibleForFree: true,
        educationalLevel: entry.cefr || undefined,
        isPartOf: { "@id": `https://ipasounddrill.app/${lang}/#webapp` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: (i18nRoot.seo && i18nRoot.seo.sounds && i18nRoot.seo.sounds.breadcrumb_home) || "Home", item: `https://ipasounddrill.app/${lang}/` },
          { "@type": "ListItem", position: 2, name: seo.breadcrumb_root || "Connected speech", item: `https://ipasounddrill.app/${lang}/phrases/` },
          { "@type": "ListItem", position: 3, name: phrase },
        ],
      },
    ],
  });

  const template = fs.readFileSync(PHRASE_TEMPLATE, "utf8");
  const crumbHome = (i18nRoot.seo && i18nRoot.seo.sounds && i18nRoot.seo.sounds.breadcrumb_home) || "Home";
  let html = template;
  const rep = (k, v) => (html = replaceAll(html, `<!-- PH:${k} -->`, v));
  rep("HTML_LANG", lang);
  rep("TITLE", escHtml(title));
  rep("META_DESC", escHtml(metaDesc));
  rep("CANONICAL", url);
  rep("HREFLANG", hreflang);
  rep("OG_TITLE", escHtml(title));
  rep("OG_LOCALE", OG_LOCALE[lang]);
  rep("JSON_LD", jsonLd);
  rep("SEO_H1", escHtml(seoH1));
  rep("HOME_URL", homeUrl);
  rep("PHRASES_URL", phrasesUrl);
  rep("CRUMB_HOME", escHtml(crumbHome));
  rep("CRUMB_ROOT", escHtml(seo.breadcrumb_root || "Connected speech"));
  rep("PHRASE", escHtml(phrase));
  rep("CEFR", escHtml(entry.cefr || ""));
  rep("CS_TYPE_LABEL", escHtml(typeLabel));
  rep("IPA", escHtml(ipa));
  rep("LBL_RP", escHtml(seo.lbl_rp || "RP"));
  rep("RP_IPA", escHtml(rpIpa));
  rep("GLOSS_BLOCK", glossBlock);
  rep("BTN_LISTEN_GA", escHtml(seo.play_ga || "Listen (GA)"));
  rep("BTN_LISTEN_RP", escHtml(seo.play_rp || "Listen (RP)"));
  rep("SEC_RULE", escHtml(seo.sec_rule || "What happens in this phrase"));
  rep("RULE", escHtml(rule));
  rep("SEC_EXAMPLES", escHtml(seo.sec_examples || "Example sentences"));
  rep("CARRIERS", renderPhraseCarriers(entry.carriers || [], phrase));
  rep("REL_TITLE", escHtml(seo.related_title || "Related phrases"));
  rep("REL_LIST", relatedHtml);
  rep("CTA_LEAD", escHtml(seo.cta_lead || "Drill in the app."));
  rep("CTA_BUTTON", escHtml(seo.cta_button || "Open IPA Sound Drill"));
  rep("BACK_TOP", escHtml(seo.back_top || "Home"));

  return html;
}

function writePhrasePages() {
  if (!fs.existsSync(PHRASE_TEMPLATE)) {
    console.error("Missing phrase template:", PHRASE_TEMPLATE);
    process.exit(1);
  }
  const phrases = loadConnectedSpeech();
  let count = 0;
  for (const lang of LANGS) {
    const i18nRoot = JSON.parse(fs.readFileSync(path.join(CORE_I18N_DIR, `${lang}.json`), "utf8"));
    for (const entry of phrases) {
      const html = buildPhrasePage(lang, i18nRoot, entry, phrases);
      const slug = phraseSlug(entry.w);
      const outDir = path.join(ROOT, "public", lang, "phrases", slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      count++;
    }
  }
  console.log(`Wrote ${count} phrase pages (${LANGS.length} langs × ${phrases.length} phrases)`);
}

function writeWeakFormPages() {
  if (!fs.existsSync(WEAK_TEMPLATE)) {
    console.error("Missing weak-form template:", WEAK_TEMPLATE);
    process.exit(1);
  }
  const weakForms = loadWeakForms();
  let count = 0;
  for (const lang of LANGS) {
    const i18nRoot = JSON.parse(fs.readFileSync(path.join(CORE_I18N_DIR, `${lang}.json`), "utf8"));
    for (const entry of weakForms) {
      const html = buildWeakFormPage(lang, i18nRoot, entry, weakForms);
      const outDir = path.join(ROOT, "public", lang, "weak-forms", entry.w);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      count++;
    }
  }
  console.log(`Wrote ${count} weak-form pages (${LANGS.length} langs × ${weakForms.length} weak forms)`);
}

// ---- EPIC #243 Phase 4: Sound → word list ("Words with the X sound") ----

const WORDLIST_JSON = path.join(CORE_DATA_DIR, "wordlist.json");
const IPAS_SORTED_BY_LEN = [...PHONEMES].sort((a, b) => b.ipa.length - a.ipa.length);
const CEFR_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const WORDS_PER_PAGE = 20;

function loadWordlist() {
  return JSON.parse(fs.readFileSync(WORDLIST_JSON, "utf8"));
}

// Normalize an IPA string so that RP-only variants collapse onto the GA phoneme
// used as the page key (e.g. ɒ→ɑ, ɜ→ɝ, əʊ→oʊ, strip length marks).
function normalizeIpa(s) {
  if (!s) return "";
  return String(s)
    .replace(/[/ˈˌ.]/g, "")
    .replace(/ː/g, "")
    .replace(/ɒ/g, "ɑ")
    .replace(/ɜ/g, "ɝ")
    .replace(/əʊ/g, "oʊ");
}

function extractPhonemes(ipa) {
  const s = normalizeIpa(ipa);
  const found = new Set();
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const p of IPAS_SORTED_BY_LEN) {
      if (s.slice(i, i + p.ipa.length) === p.ipa) {
        found.add(p.ipa);
        i += p.ipa.length;
        matched = true;
        break;
      }
    }
    if (!matched) i++;
  }
  return found;
}

function groupWordsByPhoneme() {
  const wl = loadWordlist();
  const map = {};
  for (const p of PHONEMES) map[p.ipa] = [];
  for (const w of wl) {
    const phs = new Set([
      ...extractPhonemes(w.ipa),
      ...extractPhonemes(w.rp_ipa),
    ]);
    for (const p of phs) {
      if (map[p]) map[p].push(w);
    }
  }
  for (const p of PHONEMES) {
    map[p.ipa].sort((a, b) => {
      const ca = CEFR_ORDER[a.cefr] || 99;
      const cb = CEFR_ORDER[b.cefr] || 99;
      if (ca !== cb) return ca - cb;
      return String(a.w).localeCompare(String(b.w));
    });
  }
  return map;
}

function renderWordsTable(words, seoSW) {
  if (!words.length) {
    return `<div class="sw-empty">${escHtml(seoSW.no_words || "No graded examples yet for this sound.")}</div>`;
  }
  const rows = words
    .map((w) => {
      const ga = w.ipa || "";
      const rp = w.rp_ipa && w.rp_ipa !== ga ? w.rp_ipa : "";
      const cefr = w.cefr || "";
      const rpCell = rp
        ? `<span class="sw-ipa">${escHtml(rp)}</span>`
        : `<span style="color:var(--faint);font-size:12px">—</span>`;
      const cefrCell = cefr
        ? `<span class="sw-cefr">${escHtml(cefr)}</span>`
        : `<span style="color:var(--faint);font-size:12px">—</span>`;
      return `<tr>
          <td class="sw-w">${escHtml(w.w)}</td>
          <td><span class="sw-ipa">${escHtml(ga)}</span></td>
          <td>${rpCell}</td>
          <td>${cefrCell}</td>
          <td><button class="sw-listen" type="button" data-word="${escHtml(w.w)}" data-accent="ga" aria-label="${escHtml(seoSW.th_listen || "Listen")}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span>${escHtml(seoSW.th_listen || "Listen")}</span>
          </button></td>
        </tr>`;
    })
    .join("\n        ");
  return `<div class="sw-table-wrap">
      <table class="sw-tbl">
        <thead><tr>
          <th>${escHtml(seoSW.th_word || "Word")}</th>
          <th>${escHtml(seoSW.th_ga || "GA")}</th>
          <th>${escHtml(seoSW.th_rp || "RP")}</th>
          <th>${escHtml(seoSW.th_cefr || "Level")}</th>
          <th>${escHtml(seoSW.th_listen || "Listen")}</th>
        </tr></thead>
        <tbody>
        ${rows}
        </tbody>
      </table>
    </div>`;
}

function buildSoundWordsPage(lang, i18nRoot, phonemesI18n, phEntry, allWords) {
  const seoSW = (i18nRoot && i18nRoot.seo && i18nRoot.seo.soundWords) || {};
  const seoSounds = (i18nRoot && i18nRoot.seo && i18nRoot.seo.sounds) || {};
  const pIpa = phonemesI18n[phEntry.ipa] || {};
  const label = pIpa.lab || phEntry.label;
  const words = allWords.slice(0, WORDS_PER_PAGE);
  const totalCount = allWords.length;
  const url = `https://ipasounddrill.app/${lang}/sounds/${phEntry.slug}/words/`;
  const soundUrl = `/${lang}/sounds/${phEntry.slug}/`;
  const homeUrl = `/${lang}/`;
  const soundsUrl = `/${lang}/sounds/`;
  const title = fmtTpl(seoSW.title_tpl, { label, ipa: phEntry.ipa });
  const metaDesc = fmtTpl(seoSW.meta_desc_tpl, { label, ipa: phEntry.ipa });
  const seoH1 = fmtTpl(seoSW.h1_tpl, { label, ipa: phEntry.ipa });
  const backToSound = fmtTpl(seoSW.back_to_sound_tpl, { label });
  const ctaLead = fmtTpl(seoSW.cta_lead_tpl, { count: String(totalCount) });

  const hreflang = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/sounds/${phEntry.slug}/words/">`
  )
    .concat([`<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/sounds/${phEntry.slug}/words/">`])
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: title,
        description: metaDesc,
        url,
        inLanguage: lang,
        learningResourceType: "Article",
        teaches: `Common English words with the ${label} sound (IPA ${phEntry.ipa})`,
        educationalUse: ["Practice", "Self-study"],
        isAccessibleForFree: true,
        isPartOf: { "@id": `https://ipasounddrill.app/${lang}/#webapp` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: seoSounds.breadcrumb_home || "Home", item: `https://ipasounddrill.app/${lang}/` },
          { "@type": "ListItem", position: 2, name: seoSounds.breadcrumb_root || "Sounds", item: `https://ipasounddrill.app/${lang}/sounds/` },
          { "@type": "ListItem", position: 3, name: phEntry.ipa, item: `https://ipasounddrill.app/${lang}/sounds/${phEntry.slug}/` },
          { "@type": "ListItem", position: 4, name: seoSW.breadcrumb_words || "Words" },
        ],
      },
    ],
  });

  const template = fs.readFileSync(SOUND_WORDS_TEMPLATE, "utf8");
  let html = template;
  const rep = (k, v) => (html = replaceAll(html, `<!-- SW:${k} -->`, v));
  rep("HTML_LANG", lang);
  rep("TITLE", escHtml(title));
  rep("META_DESC", escHtml(metaDesc));
  rep("CANONICAL", url);
  rep("HREFLANG", hreflang);
  rep("OG_TITLE", escHtml(title));
  rep("OG_LOCALE", OG_LOCALE[lang]);
  rep("JSON_LD", jsonLd);
  rep("SEO_H1", escHtml(seoH1));
  rep("HOME_URL", homeUrl);
  rep("SOUNDS_URL", soundsUrl);
  rep("SOUND_URL", soundUrl);
  rep("CRUMB_HOME", escHtml(seoSounds.breadcrumb_home || "Home"));
  rep("CRUMB_SOUNDS", escHtml(seoSounds.breadcrumb_root || "Sounds"));
  rep("CRUMB_WORDS", escHtml(seoSW.breadcrumb_words || "Words"));
  rep("IPA", escHtml(phEntry.ipa));
  rep("LABEL", escHtml(label));
  rep("SEC_TITLE", escHtml(seoSW.sec_title || "Common English words with this sound"));
  rep("INTRO", escHtml(seoSW.sec_intro || ""));
  rep("TABLE", renderWordsTable(words, seoSW));
  rep("BACK_TO_SOUND", escHtml(backToSound));
  rep("CTA_LEAD", escHtml(ctaLead));
  rep("CTA_BUTTON", escHtml(seoSounds.cta_button || "Open IPA Sound Drill"));
  rep("BACK_TOP", escHtml(seoSounds.back_top || "Home"));

  return html;
}

function writeSoundWordsPages() {
  if (!fs.existsSync(SOUND_WORDS_TEMPLATE)) {
    console.error("Missing sound-words template:", SOUND_WORDS_TEMPLATE);
    process.exit(1);
  }
  const grouped = groupWordsByPhoneme();
  let count = 0;
  for (const lang of LANGS) {
    const i18nRoot = JSON.parse(fs.readFileSync(path.join(CORE_I18N_DIR, `${lang}.json`), "utf8"));
    const phonemesI18n = JSON.parse(fs.readFileSync(path.join(CORE_PHONEMES_DIR, `${lang}.json`), "utf8"));
    for (const entry of PHONEMES) {
      const words = grouped[entry.ipa] || [];
      const html = buildSoundWordsPage(lang, i18nRoot, phonemesI18n, entry, words);
      const outDir = path.join(ROOT, "public", lang, "sounds", entry.slug, "words");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      count++;
    }
  }
  console.log(`Wrote ${count} sound-words pages (${LANGS.length} langs × ${PHONEMES.length} phonemes)`);
}

function writeSoundPages() {
  if (!fs.existsSync(SOUND_TEMPLATE)) {
    console.error("Missing sound template:", SOUND_TEMPLATE);
    process.exit(1);
  }
  let count = 0;
  for (const lang of LANGS) {
    const i18nRoot = JSON.parse(fs.readFileSync(path.join(CORE_I18N_DIR, `${lang}.json`), "utf8"));
    const phonemesI18n = JSON.parse(fs.readFileSync(path.join(CORE_PHONEMES_DIR, `${lang}.json`), "utf8"));
    for (const entry of PHONEMES) {
      const html = buildSoundPage(lang, i18nRoot, phonemesI18n, entry);
      const outDir = path.join(ROOT, "public", lang, "sounds", entry.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      count++;
    }
  }
  console.log(`Wrote ${count} sound-detail pages (${LANGS.length} langs × ${PHONEMES.length} phonemes)`);
}

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

// ---- Public dataset publication (Issue #251, CC BY 4.0) ----

const DATASET_OUT_DIR = path.join(ROOT, "public", "data");

// Public dataset only: normalize pos to English. In-app UI keeps Japanese
// pos as an i18n key (packages/core/i18n/{lang}.json pos.*), so wordlist.json
// itself stays untouched — this map runs only when writing CSV/JSON exports.
const POS_JA_TO_EN = {
  "名詞": "noun",
  "動詞": "verb",
  "形容詞": "adjective",
  "副詞": "adverb",
  "代名詞": "pronoun",
  "前置詞": "preposition",
  "接続詞": "conjunction",
  "限定詞": "determiner",
  "数詞": "numeral",
  "助動詞": "auxiliary verb",
  "間投詞": "interjection",
  "文字": "letter",
  "短縮形": "contraction",
  "口語表現": "colloquial",
  "be動詞": "be-verb",
  "動詞（不規則変化）": "verb (irregular)",
  "名詞（不規則複数）": "noun (irregular plural)",
};

function posToEnglish(raw) {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  // Compound like "名詞 / 動詞" → "noun / verb"; unknown parts pass through as-is.
  if (trimmed.indexOf("/") >= 0) {
    return trimmed
      .split("/")
      .map((p) => {
        const k = p.trim();
        return POS_JA_TO_EN[k] || k;
      })
      .join(" / ");
  }
  return POS_JA_TO_EN[trimmed] || trimmed;
}

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeDataset() {
  const wl = loadWordlist();
  fs.mkdirSync(DATASET_OUT_DIR, { recursive: true });

  // CSV (6 columns, UTF-8 BOM for Excel). pos is English-normalized for the
  // public dataset — see POS_JA_TO_EN above.
  const header = ["word", "ipa_ga", "ipa_rp", "cefr", "pos", "gloss_en"];
  const rows = wl.map((w) => [
    w.w,
    w.ipa || "",
    w.rp_ipa || "",
    w.cefr || "",
    posToEnglish(w.pos),
    (w.gloss && w.gloss.en) || w.def || "",
  ]);
  const csv =
    "﻿" +
    header.join(",") +
    "\n" +
    rows.map((r) => r.map(csvEscape).join(",")).join("\n") +
    "\n";
  fs.writeFileSync(path.join(DATASET_OUT_DIR, "wordlist-ga-rp-cefr.csv"), csv, "utf8");

  // JSON (full records, pretty-printed). Same English pos normalization applied
  // to the exported copy; in-app wordlist.json remains untouched.
  const wlPublic = wl.map((w) => ({ ...w, pos: posToEnglish(w.pos) }));
  fs.writeFileSync(
    path.join(DATASET_OUT_DIR, "wordlist-ga-rp-cefr.json"),
    JSON.stringify(wlPublic, null, 2) + "\n",
    "utf8"
  );

  // LICENSE.txt (CC BY 4.0 human-readable summary + link to full text)
  const license = `IPA Sound Drill — Wordlist Dataset (GA + RP + CEFR)
====================================================

Copyright (c) IPA Sound Drill contributors
https://ipasounddrill.app

This dataset is licensed under the Creative Commons Attribution 4.0
International License (CC BY 4.0).

You are free to:

  Share  — copy and redistribute the material in any medium or format
  Adapt  — remix, transform, and build upon the material for any purpose,
           even commercially.

Under the following terms:

  Attribution — You must give appropriate credit, provide a link to the
  license, and indicate if changes were made. You may do so in any
  reasonable manner, but not in any way that suggests the licensor
  endorses you or your use.

Suggested attribution:

  Data: IPA Sound Drill (https://ipasounddrill.app), CC BY 4.0

Full legal text:

  https://creativecommons.org/licenses/by/4.0/legalcode

Human-readable summary:

  https://creativecommons.org/licenses/by/4.0/

`;
  fs.writeFileSync(path.join(DATASET_OUT_DIR, "LICENSE.txt"), license, "utf8");

  // README.md (field definitions + usage)
  const readme = `# IPA Sound Drill — Wordlist Dataset

**${wl.length} CEFR-graded English words** with General American (GA) and Received
Pronunciation (RP) IPA transcriptions.

- License: **CC BY 4.0** — free for any use with attribution
- Source: https://ipasounddrill.app/data/
- Attribution line: \`Data: IPA Sound Drill (https://ipasounddrill.app), CC BY 4.0\`

## Files

- \`wordlist-ga-rp-cefr.csv\` — Spreadsheet-friendly, 6 columns, UTF-8 with BOM
- \`wordlist-ga-rp-cefr.json\` — Programmatic use, full metadata array
- \`LICENSE.txt\` — CC BY 4.0 text and attribution notice

## CSV columns

| Column | Description |
|---|---|
| \`word\` | English word (lowercase) |
| \`ipa_ga\` | General American IPA in slash notation |
| \`ipa_rp\` | Received Pronunciation IPA in slash notation |
| \`cefr\` | CEFR level A1–C2 (may be empty) |
| \`pos\` | Part of speech |
| \`gloss_en\` | Short English gloss / definition |

## JSON additional fields

- \`respell_ga\` / \`respell_rp\` — Respelling (pronunciation hint using English letters)
- \`neighbors\` — Similar-sounding words (rhymes / minimal pairs)
- \`gloss\` — Multi-language gloss object (\`en\`, \`ja\`, \`ko\`, \`zh-Hans\`, \`zh-Hant\`, \`fil\`)
- \`ga_rp_same\` — Boolean: GA and RP transcriptions match

## Attribution examples

### Academic paper

> We used the IPA Sound Drill wordlist (https://ipasounddrill.app, CC BY 4.0)
> for CEFR-graded pronunciation data.

### Software project (README)

\`\`\`
## Data attribution

English IPA dataset: [IPA Sound Drill](https://ipasounddrill.app) — CC BY 4.0
\`\`\`

### Product credits

> Includes pronunciation data from IPA Sound Drill (CC BY 4.0).

## Contact

Issues or corrections: https://github.com/nkhippo/IPASoundDrill/issues
`;
  fs.writeFileSync(path.join(DATASET_OUT_DIR, "README.md"), readme, "utf8");

  const csvSize = fs.statSync(path.join(DATASET_OUT_DIR, "wordlist-ga-rp-cefr.csv")).size;
  const jsonSize = fs.statSync(path.join(DATASET_OUT_DIR, "wordlist-ga-rp-cefr.json")).size;
  console.log(
    `Wrote dataset (${wl.length} words): CSV ${(csvSize / 1024).toFixed(1)}KB, JSON ${(jsonSize / 1024).toFixed(1)}KB, LICENSE, README`
  );
  return { csvSize, jsonSize };
}

function writeDatasetLandingPages(sizes) {
  if (!fs.existsSync(DATASET_TEMPLATE)) {
    console.error("Missing dataset template:", DATASET_TEMPLATE);
    process.exit(1);
  }
  const wl = loadWordlist();
  const csvKb = `${((sizes.csvSize) / 1024).toFixed(0)} KB`;
  const jsonKb = `${((sizes.jsonSize) / 1024 / 1024).toFixed(1)} MB`;

  for (const lang of LANGS) {
    const i18nRoot = JSON.parse(fs.readFileSync(path.join(CORE_I18N_DIR, `${lang}.json`), "utf8"));
    const seo = (i18nRoot.seo && i18nRoot.seo.dataset) || {};
    const seoSounds = (i18nRoot.seo && i18nRoot.seo.sounds) || {};
    const url = `https://ipasounddrill.app/${lang}/data/`;
    const title = seo.title_tpl || `IPA Sound Drill Dataset`;
    const metaDesc = seo.meta_desc_tpl || "";
    const seoH1 = seo.h1_tpl || title;

    const hreflang = LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="https://ipasounddrill.app/${l}/data/">`
    )
      .concat([`<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/en/data/">`])
      .join("\n");

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Dataset",
          "@id": `${url}#dataset`,
          name: "IPA Sound Drill Wordlist Dataset",
          description:
            "5,397 CEFR-graded English words with General American (GA) and Received Pronunciation (RP) IPA transcriptions.",
          url,
          license: "https://creativecommons.org/licenses/by/4.0/",
          creator: { "@type": "Organization", name: "IPA Sound Drill", url: "https://ipasounddrill.app/" },
          keywords: ["English pronunciation", "IPA", "General American", "Received Pronunciation", "CEFR", "wordlist"],
          inLanguage: "en",
          isAccessibleForFree: true,
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "text/csv",
              contentUrl: "https://ipasounddrill.app/data/wordlist-ga-rp-cefr.csv",
            },
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: "https://ipasounddrill.app/data/wordlist-ga-rp-cefr.json",
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: seoSounds.breadcrumb_home || "Home", item: `https://ipasounddrill.app/${lang}/` },
            { "@type": "ListItem", position: 2, name: seo.crumb_data || "Data" },
          ],
        },
      ],
    });

    const template = fs.readFileSync(DATASET_TEMPLATE, "utf8");
    let html = template;
    const rep = (k, v) => (html = replaceAll(html, `<!-- DS:${k} -->`, v));
    rep("HTML_LANG", lang);
    rep("TITLE", escHtml(title));
    rep("META_DESC", escHtml(metaDesc));
    rep("CANONICAL", url);
    rep("HREFLANG", hreflang);
    rep("OG_TITLE", escHtml(title));
    rep("OG_LOCALE", OG_LOCALE[lang]);
    rep("JSON_LD", jsonLd);
    rep("SEO_H1", escHtml(seoH1));
    rep("HOME_URL", `/${lang}/`);
    rep("CRUMB_HOME", escHtml(seoSounds.breadcrumb_home || "Home"));
    rep("CRUMB_DATA", escHtml(seo.crumb_data || "Data"));
    rep("LICENSE_FREE", escHtml(seo.license_free || "Free for any use with attribution"));
    rep("HERO_TITLE", escHtml(seo.hero_title || title));
    rep("HERO_SUB", escHtml(seo.hero_sub || ""));
    rep("STAT_WORDS", escHtml(seo.stat_words || "CEFR-graded words"));
    rep("STAT_ACCENTS", escHtml(seo.stat_accents || "Both accents"));
    rep("STAT_CEFR", escHtml(seo.stat_cefr || "Levels covered"));
    rep("DL_CSV_DESC", escHtml(seo.dl_csv_desc || ""));
    rep("DL_JSON_DESC", escHtml(seo.dl_json_desc || ""));
    rep("DL_LICENSE_DESC", escHtml(seo.dl_license_desc || ""));
    rep("DL_BTN", escHtml(seo.dl_btn || "Download"));
    rep("DL_CSV_SIZE", csvKb);
    rep("DL_JSON_SIZE", jsonKb);
    rep("SEC_ATTRIBUTION", escHtml(seo.sec_attribution || "How to credit"));
    rep("SEC_ATTRIBUTION_LEAD", escHtml(seo.sec_attribution_lead || ""));
    rep("SEC_FIELDS", escHtml(seo.sec_fields || "Fields"));
    rep("SEC_FIELDS_LEAD", escHtml(seo.sec_fields_lead || ""));
    rep("FIELD_NAME", escHtml(seo.field_name || "Column"));
    rep("FIELD_DESC", escHtml(seo.field_desc || "Description"));
    rep("FIELD_EX", escHtml(seo.field_ex || "Example"));
    rep("FIELD_WORD", escHtml(seo.field_word || ""));
    rep("FIELD_GA", escHtml(seo.field_ga || ""));
    rep("FIELD_RP", escHtml(seo.field_rp || ""));
    rep("FIELD_CEFR", escHtml(seo.field_cefr || ""));
    rep("FIELD_POS", escHtml(seo.field_pos || ""));
    rep("FIELD_GLOSS", escHtml(seo.field_gloss || ""));
    rep("SEC_USAGE", escHtml(seo.sec_usage || "Usage"));
    rep("SEC_USAGE_LEAD", escHtml(seo.sec_usage_lead || ""));
    rep("CTA_LEAD", escHtml(seo.cta_lead || ""));
    rep("CTA_BUTTON", escHtml(seo.cta_button || "Open IPA Sound Drill"));
    rep("BACK_TOP", escHtml(seo.back_top || "Home"));

    const outDir = path.join(ROOT, "public", lang, "data");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  }
  console.log(`Wrote ${LANGS.length} dataset landing pages (/{lang}/data/)`);
}

function writePwaIcons() {
  fs.mkdirSync(PWA_OUT_DIR, { recursive: true });
  for (const [size, src, name] of PWA_TARGETS) {
    if (!fs.existsSync(src)) {
      console.error("Missing PWA icon source:", src);
      process.exit(1);
    }
    const svg = fs.readFileSync(src, "utf8");
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
    const pngData = resvg.render().asPng();
    const out = path.join(PWA_OUT_DIR, name);
    fs.writeFileSync(out, pngData);
    console.log("Wrote", path.relative(ROOT, out));
  }
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

  writeSoundPages();
  writeSoundWordsPages();
  writeWeakFormPages();
  writePhrasePages();
  const datasetSizes = writeDataset();
  writeDatasetLandingPages(datasetSizes);
  writeSitemap();
  writeOgImage();
  writePwaIcons();
}

build();
