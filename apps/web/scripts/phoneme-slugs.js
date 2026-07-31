"use strict";

/**
 * Deep URL EPIC #243 Phase 1 — 音素 IPA → SEO slug 対応表。
 *
 * canonical URL は `/{lang}/sounds/<slug>/`。IPA 記号 URL (`/{lang}/sounds/<ipa>/`) は
 * middleware.ts で 301 redirect する。
 *
 * category: SEO/UI 用の分類。sitemap 優先度や関連リンクの絞り込みに使う。
 * ga: GA でのみ現れる音素 (RP では別記号) → RP バリアント欄を GA と同じにしない
 * rp: RP でのみ現れる音素
 * shared: GA/RP 共通
 */
const PHONEMES = [
  // Monophthongs
  { ipa: "i",   slug: "long-e",         category: "vowel", subgroup: "monophthong", scope: "shared", label: "long ee (see)" },
  { ipa: "ɪ",   slug: "short-i",        category: "vowel", subgroup: "monophthong", scope: "shared", label: "short i (sit)" },
  { ipa: "ɛ",   slug: "short-e",        category: "vowel", subgroup: "monophthong", scope: "shared", label: "short e (bed)" },
  { ipa: "æ",   slug: "short-a",        category: "vowel", subgroup: "monophthong", scope: "shared", label: "short a (cat)" },
  { ipa: "ə",   slug: "schwa",          category: "vowel", subgroup: "monophthong", scope: "shared", label: "schwa" },
  { ipa: "ʌ",   slug: "short-u-cup",    category: "vowel", subgroup: "monophthong", scope: "shared", label: "short u (cup)" },
  { ipa: "ɑ",   slug: "short-o-ah",     category: "vowel", subgroup: "monophthong", scope: "ga",     label: "short o / ah (hot, father)" },
  { ipa: "ɔ",   slug: "aw",             category: "vowel", subgroup: "monophthong", scope: "shared", label: "aw (dog, thought)" },
  { ipa: "ʊ",   slug: "short-u-book",   category: "vowel", subgroup: "monophthong", scope: "shared", label: "short u (book)" },
  { ipa: "u",   slug: "long-oo",        category: "vowel", subgroup: "monophthong", scope: "shared", label: "long oo (food)" },
  { ipa: "ɝ",   slug: "er-stressed",    category: "vowel", subgroup: "r-colored",   scope: "ga",     label: "stressed er (bird)" },
  { ipa: "ɚ",   slug: "er-unstressed",  category: "vowel", subgroup: "r-colored",   scope: "ga",     label: "unstressed er (water)" },

  // Diphthongs
  { ipa: "eɪ",  slug: "long-a",         category: "diphthong", scope: "shared", label: "long a (day)" },
  { ipa: "aɪ",  slug: "long-i",         category: "diphthong", scope: "shared", label: "long i (my)" },
  { ipa: "ɔɪ",  slug: "oy",             category: "diphthong", scope: "shared", label: "oy (boy)" },
  { ipa: "oʊ",  slug: "long-o",         category: "diphthong", scope: "ga",     label: "long o (go)" },
  { ipa: "aʊ",  slug: "ow",             category: "diphthong", scope: "shared", label: "ow (now)" },

  // Consonants — fricatives / affricates
  { ipa: "θ",   slug: "th-voiceless",   category: "consonant", subgroup: "fricative",  scope: "shared", label: "voiceless th (think)" },
  { ipa: "ð",   slug: "th-voiced",      category: "consonant", subgroup: "fricative",  scope: "shared", label: "voiced th (this)" },
  { ipa: "ʃ",   slug: "sh",             category: "consonant", subgroup: "fricative",  scope: "shared", label: "sh (she)" },
  { ipa: "ʒ",   slug: "zh",             category: "consonant", subgroup: "fricative",  scope: "shared", label: "zh (measure)" },
  { ipa: "tʃ",  slug: "ch",             category: "consonant", subgroup: "affricate",  scope: "shared", label: "ch (church)" },
  { ipa: "dʒ",  slug: "j-sound",        category: "consonant", subgroup: "affricate",  scope: "shared", label: "j (judge)" },
  { ipa: "f",   slug: "f",              category: "consonant", subgroup: "fricative",  scope: "shared", label: "f (fan)" },
  { ipa: "v",   slug: "v",              category: "consonant", subgroup: "fricative",  scope: "shared", label: "v (van)" },
  { ipa: "s",   slug: "s",              category: "consonant", subgroup: "fricative",  scope: "shared", label: "s (see)" },
  { ipa: "z",   slug: "z",              category: "consonant", subgroup: "fricative",  scope: "shared", label: "z (zoo)" },
  { ipa: "h",   slug: "h",              category: "consonant", subgroup: "fricative",  scope: "shared", label: "h (hat)" },

  // Consonants — plosives
  { ipa: "p",   slug: "p",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "p (pen)" },
  { ipa: "b",   slug: "b",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "b (bat)" },
  { ipa: "t",   slug: "t",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "t (top)" },
  { ipa: "d",   slug: "d",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "d (dog)" },
  { ipa: "k",   slug: "k",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "k (cat)" },
  { ipa: "ɡ",   slug: "g",              category: "consonant", subgroup: "plosive",   scope: "shared", label: "g (go)" },

  // Consonants — nasals
  { ipa: "m",   slug: "m",              category: "consonant", subgroup: "nasal",     scope: "shared", label: "m (man)" },
  { ipa: "n",   slug: "n",              category: "consonant", subgroup: "nasal",     scope: "shared", label: "n (no)" },
  { ipa: "ŋ",   slug: "ng",             category: "consonant", subgroup: "nasal",     scope: "shared", label: "ng (sing)" },

  // Consonants — approximants
  { ipa: "r",   slug: "r",              category: "consonant", subgroup: "approximant", scope: "shared", label: "r (right)" },
  { ipa: "l",   slug: "l",              category: "consonant", subgroup: "approximant", scope: "shared", label: "l (light)" },
  { ipa: "w",   slug: "w",              category: "consonant", subgroup: "approximant", scope: "shared", label: "w (we)" },
  { ipa: "j",   slug: "y-sound",        category: "consonant", subgroup: "approximant", scope: "shared", label: "y sound (yes)" },

  // Allophones
  { ipa: "ɾ",   slug: "flap-t",         category: "allophone", scope: "ga",     label: "flap / tap t (butter)" },
  { ipa: "ʔ",   slug: "glottal-stop",   category: "allophone", scope: "shared", label: "glottal stop (button)" },
  { ipa: "n̩",   slug: "syllabic-n",     category: "allophone", scope: "shared", label: "syllabic n (button)" },
  { ipa: "l̩",   slug: "syllabic-l",     category: "allophone", scope: "shared", label: "syllabic l (bottle)" },
];

/** Map: IPA symbol → slug (for middleware redirect). */
const IPA_TO_SLUG = {};
/** Map: slug → PHONEMES entry (for build lookup). */
const SLUG_TO_ENTRY = {};
for (const p of PHONEMES) {
  IPA_TO_SLUG[p.ipa] = p.slug;
  SLUG_TO_ENTRY[p.slug] = p;
}

module.exports = { PHONEMES, IPA_TO_SLUG, SLUG_TO_ENTRY };
