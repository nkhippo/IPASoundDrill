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
const WEAK_TEMPLATE = path.resolve(__dirname, "..", "src", "weak-form-detail.template.html");
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rootUrls}
${soundUrls.join("\n")}
${weakUrls.join("\n")}
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
  writeWeakFormPages();
  writeSitemap();
  writeOgImage();
}

build();
