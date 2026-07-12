#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE = path.join(ROOT, "src", "index.template.html");
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
    `<link rel="alternate" hreflang="x-default" href="https://ipasounddrill.app/">`
  );
  return lines.join("\n");
}

function jsonLd(lang, brandName, description) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: brandName,
    description,
    url: `https://ipasounddrill.app/${lang}/`,
    inLanguage: lang,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "LanguageLearning",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript enabled",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
  return JSON.stringify(payload);
}

function replaceAll(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

function build() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error("Missing template:", TEMPLATE);
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE, "utf8");
  const alternates = hreflangBlock();

  for (const lang of LANGS) {
    const i18nPath = path.join(ROOT, "i18n", `${lang}.json`);
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

    const outDir = path.join(ROOT, lang);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "index.html");
    fs.writeFileSync(outFile, html, "utf8");
    console.log("Wrote", path.relative(ROOT, outFile));
  }
}

build();
