/**
 * packages/core/src/types.ts
 *
 * ランタイム契約 4 JSON（wordlist / connected_speech / weak_forms / guide）の
 * TypeScript 型定義。正本は `docs/data-contract.md` §1-3。
 * フィールドは実データ（`packages/core/data/*.json`）+ 実装
 * （`apps/web/src/index.template.html`）参照箇所を突合して定義する
 * （Recon: `docs/cursor/recon/pre-issue-recon-20260730-scoring-map.md` §4）。
 *
 * データ内容・スキーマは不変（型のみを新規追加、既存 JSON は編集しない）。
 */

export type Accent = "ga" | "rp";

export type Cefr = "A1" | "A2" | "B1" | "B2";

/** GA/RP が学習者にとって実質同じ発音かの判定理由（`docs/data-contract.md` §2）。 */
export type GaRpSameReason = string;

export interface Gloss {
  en?: string;
  ja?: string;
  zh?: string;
  ko?: string;
  fil?: string;
  [lang: string]: string | undefined;
}

/** `wordlist_GA_a1a2_plus_phonics.json`（`packages/core/data/wordlist.json`）の 1 エントリ。 */
export interface WordlistEntry {
  w: string;
  ipa: string;
  rp_ipa?: string | null;
  cefr?: Cefr | null;
  pos?: string | null;
  src?: string | null;
  pattern?: string | null;
  group?: string | null;
  gloss?: Gloss;
  ipa_actual_ga?: string | null;
  ipa_actual_rp?: string | null;
  respell_ga?: string | null;
  respell_rp?: string | null;
  def?: string | null;
  neighbors?: string[];
  neighbors_rp?: string[];
  ga_rp_same?: boolean;
  ga_rp_same_reason?: GaRpSameReason;
  id?: string;
}

export type Wordlist = WordlistEntry[];

/** `data/connected_speech.json`（`packages/core/data/connected_speech.json`）の 1 エントリ。 */
export interface ConnectedSpeechEntry {
  id: string;
  w: string;
  ipa: string;
  rp_ipa?: string | null;
  cs_type: string;
  level: number;
  cefr?: Cefr | null;
  cs_rule?: Record<string, string>;
  gloss?: Gloss;
  carriers?: string[];
  src?: string;
  ga_rp_same?: boolean;
  ga_rp_same_reason?: GaRpSameReason;
}

export type ConnectedSpeechData = ConnectedSpeechEntry[];

/** `data/weak_forms.json`（`packages/core/data/weak_forms.json`）の 1 エントリ。 */
export interface WeakFormEntry {
  id: string;
  w: string;
  ipa: string;
  ipa_strong?: string | null;
  rp_ipa?: string | null;
  rp_ipa_strong?: string | null;
  level: number;
  cefr?: Cefr | null;
  cs_rule?: Record<string, string>;
  carriers?: string[];
  src?: string;
  ga_rp_same?: boolean;
  ga_rp_same_reason?: GaRpSameReason;
}

export type WeakFormsData = WeakFormEntry[];

/** `data/guide.json`（`packages/core/data/guide.json`）: 各言語キー配下 8 セクション。 */
export interface GuideSection {
  [key: string]: unknown;
}

export interface GuideLangEntry {
  welcome?: GuideSection;
  philosophy?: GuideSection;
  solves?: GuideSection;
  modes?: GuideSection;
  decode_encode?: GuideSection;
  connected?: GuideSection;
  accents?: GuideSection;
  how_to_use?: GuideSection;
  [section: string]: unknown;
}

export type GuideData = Record<string, GuideLangEntry>;

/** i18n top-level keys（`docs/data-contract.md` §5）。値は locale ごとにネストしたオブジェクト/文字列。 */
export type I18nTopLevelKey =
  | "brand"
  | "meta"
  | "lead_html"
  | "lead_connected_html"
  | "lead_weak_html"
  | "tab"
  | "mode"
  | "modeb"
  | "cs"
  | "weak"
  | "focus"
  | "reg"
  | "pool"
  | "setup"
  | "dir"
  | "lvl"
  | "grp"
  | "accent"
  | "guide"
  | "about"
  | "onboarding"
  | "vocab"
  | "symbol"
  | "reveal"
  | "lang_opts"
  | "reflect"
  | "exit_confirm"
  | "note"
  | "patterns"
  | "summary"
  | "info"
  | "kbd"
  | "pos"
  | "cefr"
  | "checks"
  | "progress"
  | "start"
  | "loading"
  | "load_fail"
  | "wordlist_fail"
  | "back_top"
  | "settings_more"
  | "listen"
  | "input_ph"
  | "input_phrase"
  | "check"
  | "clear"
  | "next"
  | "build_ph"
  | "tips_head"
  | "you"
  | "see_answer"
  | "top"
  | "drill"
  | "mark"
  | "footer"
  | "language"
  | "ipa_info";

/** i18n JSON 全体。key ごとの中身は文字列またはネストしたオブジェクト（`docs/data-contract.md` §5）。 */
export type I18n = Partial<Record<I18nTopLevelKey, unknown>> & Record<string, unknown>;

/** Phoneme help i18n（`i18n/phonemes/{lang}.json`）。記号 → 解説文字列。 */
export type PhonemeI18n = Record<string, unknown>;
