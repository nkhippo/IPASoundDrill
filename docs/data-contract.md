# data-contract.md — ランタイム契約・JSON スキーマ・データ整合性の単一ホーム

ランタイム 8 パス契約・wordlist / connected_speech / weak_forms / guide の JSON スキーマ・localStorage・i18n スキーマ・
データ整合性チェック義務の**唯一のホーム**（`docs/doc-map.md` 登録）。旧 `docs/REPOSITORY-STRUCTURE.md`「Runtime data contract」「i18n schema」、
旧 `docs/SPECIFICATION.md` §5.1–5.5、旧 `CLAUDE.md` 品質基準 3–5 を統合継承。

---

## 1. ランタイム 8 パス契約

これらの**公開 URL**は `apps/web/src/index.template.html` に**ハードコード**されている（`<base href="/">` により言語サブディレクトリからもルート相対で解決）。
`apps/web/src/index.template.html` を更新せずに移動しないこと。**正本ファイル**は monorepo 化（#EPIC-02）後 `packages/core/` 配下に移設済みで、
Web ビルド時に `apps/web/public/` へコピーされ公開 URL として配信される（`旧 wordlist_GA_a1a2_plus_phonics.json` は `apps/web/vercel.json` の rewrite により互換 URL として維持）。

| Asset | 公開 URL | 正本ファイル |
|-------|------|------|
| Wordlist | `/data/wordlist.json`（`/wordlist_GA_a1a2_plus_phonics.json` は rewrite 互換） | `packages/core/data/wordlist.json` |
| Connected speech | `/data/connected_speech.json` | `packages/core/data/connected_speech.json` |
| Weak forms | `/data/weak_forms.json` | `packages/core/data/weak_forms.json` |
| Guide | `/data/guide.json` | `packages/core/data/guide.json` |
| UI i18n | `/i18n/{lang}.json`（現行 14 言語: en/ja/ko/zh-Hans/zh-Hant/fil/es/pt-BR/vi/id/ru/th/hi/tr） | `packages/core/i18n/{lang}.json` |
| Phoneme help | `/i18n/phonemes/{lang}.json`（現行 6 言語: en/ja/ko/zh-Hans/zh-Hant/fil。他 8 言語は build 時 en fallback — `apps/web/scripts/build-i18n-html.js` の `readI18nWithFallback`） | `packages/core/i18n/phonemes/{lang}.json` |
| IPA font | `/fonts/DoulosSIL-Regular.woff2` | `packages/core/fonts/DoulosSIL-Regular.woff2` |
| TTS | External `GAS_TTS_URL` in `apps/web/src/index.template.html` → `tools/tts/gas/Code.gs` deployment | — |

**フラグ義務**: 上記 8 パスのいずれかに触れる Issue は、Issue 本文で明示的にフラグを立て、Complexity Level を L3 として扱い、
下記「§6 データ整合性チェック義務表」の対応する完了定義を含めること（`docs/guardrails.md` §3 のレビュー段階化と連動）。

---

## 2. wordlist スキーマ — `packages/core/data/wordlist.json`（公開 URL `/data/wordlist.json`）

約 **5,397 語**（オリジナル 3,059 + Phase 1 B1 +1,769 + Phase 2 B2 +569）。主要フィールド:

```json
{
  "w": "colour",
  "ipa": "/ˈkʌlər/",
  "rp_ipa": "/ˈkʌlə/",
  "cefr": "A1",
  "pos": "名詞",
  "src": "cefr",
  "pattern": null,
  "group": null,
  "gloss": { "en": "...", "ja": "...", "ko": "...", "fil": "...", "zh-Hans": "...", "zh-Hant": "..." },
  "ipa_actual_ga": "/ˈpɑrɾi/",
  "ipa_actual_rp": null,
  "respell_ga": "PAR-dee",
  "respell_rp": "PAH-tee",
  "def": "A small watercraft used to travel on water such as rivers and lakes.",
  "neighbors": ["caller", "collar", "..."],
  "ga_rp_same": true,
  "ga_rp_same_reason": "identical"
}
```

| フィールド | 用途 |
|-----------|------|
| `w` | 正解綴り・TTS 入力 |
| `ipa` | GA IPA（Decode/Encode/reveal） |
| `rp_ipa` | RP IPA（accent=rp 時） |
| `ipa_actual_ga` / `ipa_actual_rp` | narrow IPA（表示専用。採点・音素カバーには不使用） |
| `respell_ga` / `respell_rp` | データ保持（UI 非表示・2026-07-06） |
| `neighbors` | Mode B MCQ distractor（RP でも GA リスト流用） |
| `neighbors_rp` | （将来用・未生成） |
| `gloss` | reveal・Mode B |
| `def` | Mode B Study reveal（英語 UI・`gloss.en === w` 時の定義文） |
| `src` | letter / contraction / irregular_* / casual / cefr / phonics 等 |
| `pattern` / `group` | 規則語フィルタ・発音ポイント |
| `cefr` | CEFR レベル（`A1` / `A2` / `B1` / `B2`） |
| `ga_rp_same` | GA と RP が学習者にとって実質同じか（`tools/data-pipeline/gen_ga_rp_same.py` で付与） |
| `ga_rp_same_reason` | 判定理由（`identical`, `rhoticity`, `square_near_cure`, `ga_allophony` 等） |

### `cefr` フィールドの現状

- 値: `"A1"` / `"A2"` / `"B1"` / `"B2"`（**word-level タグ**。全目的横断）
- 分布: A1=1,187 / A2=1,195 / B1=2,116 / B2=899
- `src: "phonics"` の 652語は CEFR-J Wordlist v1.5 一次データ照合で B1/B2 正当語彙と確認済み
- プロフィール（`3a`）で複数レベル選択。ドリル STEP 行にタグ表示。Connected（`2d`）はタグ表示のみ・UI フィルタなし

**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `tools/data-pipeline/pipeline/`。バッチソースは `tools/data-pipeline/batches/`。コマンド詳細は `docs/pipeline.md`。

### GA / RP 「実質同じ」判定 (`ga_rp_same`)

各語彙エントリ（wordlist / connected_speech / weak_forms）に以下 2 フィールドを追加:

| フィールド | 型 | 意味 |
|---|---|---|
| `ga_rp_same` | `boolean` | GA と RP が学習者にとって実質同じ発音か |
| `ga_rp_same_reason` | `string` | 判定理由（同じ / 異なる、いずれの場合も付与） |

`tools/data-pipeline/gen_ga_rp_same.py` により全語彙一括で生成される派生フィールドで、`ipa` / `rp_ipa` / `ipa_actual_ga` から決定的に導出される（LLM 判定なし）。

**「same」の定義**（以下の差異のみを持つペアを same と判定・STRICT）:
1. 長音記号 `ː` の有無（GA 系辞書は緊張母音に付けない慣習）
2. 第二強勢 `ˌ` の有無・位置差（辞書ソース間の揺れ）
3. DRESS 母音の表記差（`ɛ` ↔ `e`、同一音素の表記慣習差）

第一強勢 `ˈ` は削除しない — 強勢の syllable 位置が異なるペアは different。

**`ga_rp_same_reason` 完全列挙**（`ga_rp_same` の値ごと。値は wordlist / connected_speech / weak_forms 全体で共通の語彙）:

`same`（差異が STRICT 正規化で吸収される）:

| reason 値 | 意味 | 例 |
|---|---|---|
| `identical` | 正規化前から完全一致 | 多数 |
| `length_marking_only` | 長音記号 `ː` の有無のみの差 | — |
| `dress_notation_only` | DRESS 母音の表記差（`ɛ`↔`e`）のみ | `M` (`/ɛm/` vs `/em/`) |
| `notation_composite` | 上記複数要因の複合（いずれも same 側） | — |
| `rhotic_vowel_notation` | 母音表記の rhotic 関連差（same 側） | — |
| `stress_marking_only` | 第二強勢 `ˌ` の有無・位置差のみ | — |

`different`（学習者にとって聞いて分かる差）:

| reason 値 | 意味 | 例 |
|---|---|---|
| `rhoticity` | Non-rhotic 差 | `actor`, `winner` |
| `structural_other` | その他構造差（目視レビュー対象） | — |
| `ga_allophony` | GA 内音（フラップ T 等） | `city` (`[ˈsɪɾi]`), `water` (`[ˈwɔɾɚ]`) |
| `goat_vowel` | GOAT 母音 | `boat`, `ago` |
| `lot_vowel` | LOT 母音 | `hot`, `block` |
| `square_near_cure` | SQUARE / NEAR / CURE | `bear`, `dear` |
| `weak_vowel` | 弱母音の質差 | `biscuit` (`ə`/`ɪ`) |
| `trap_bath` | TRAP-BATH | `path`, `bath`, `after` |
| `stress_placement` | 第一強勢位置差 | `baseball`, `discount` |
| `yod` | Yod-dropping | `new`, `due` |
| `cot_caught` | COT-CAUGHT | `bought` |
| `composite_structural` | 複数の構造差の複合 | 目視レビュー対象 |

> 上記は wordlist 実データ（5,397 語）から機械的に集計した全 reason 値（2026-07-29 時点）。新しい reason 値が
> `tools/data-pipeline/gen_ga_rp_same.py` の改修で追加された場合、本表を更新すること。

**GA-only 異音カーブアウト（重要）**: `ipa_actual_ga`（narrow 転写）が存在し `ipa`（phonemic）と異なる語は、
phonemic レベルで RP と一致していても different と判定する。Flap T・音節主音子音・声門閉鎖など、GA でのみ生じる異音を
audibly-different として扱う（例: `city`）。

**UI 挙動**: (1) Reveal 画面の反対アクセント表示（`altAccentValue`）— same のとき `/ipa/（同じ）` 表示。(2) 語彙ブラウザの RP 行表示 — 同上。(3) 語彙リスト(3b)カードの **「GA=RP」印**（app-5）。
判定は `c.ga_rp_same` を参照。未設定時は旧ロジック（文字列一致）にフォールバック。

> **設計意図（重要・再質問防止）**: 「同じ」/「GA=RP」印は **「学習者にとって実質同じ音」** を意味し、**IPA 文字列の完全一致ではない**。
> 上記 STRICT 正規化（長音 `ː`・第二強勢 `ˌ`・DRESS `ɛ↔e` の表記差のみ吸収）を経て same 判定するため、
> **表示上 IPA 文字列が違って見えても「GA=RP」印が出るのは正しい挙動**（例: `M` の GA `/ɛm/` と RP `/em/` は `ɛ↔e` 正規化で same）。
> これは仕様であり不具合ではない。フラップ T 等の GA 異音や強勢位置差など「聞いて分かる差」は different（上表）。

**分布統計（Issue #288 複合軸マッチング対応後）:**

| ファイル | 総数 | same | different |
|---|---:|---:|---:|
| wordlist | 5,397 | 2,713 (50%) | 2,684 (50%) |
| connected_speech | 201 | 90 (45%) | 111 (55%) |
| weak_forms | 36 | 30 (83%) | 6 (17%) |

wordlist の `ga_rp_same_reason` 内訳（different）: `rhoticity` 558, `structural_other` 453, `ga_allophony` 375, `lot_vowel` 313, `goat_vowel` 270, `cot_caught` 223, `composite_structural` 157, `square_near_cure` 154, `trap_bath` 74, `weak_vowel` 66, `yod` 34, `stress_placement` 7。
wordlist の `ga_rp_same_reason` 内訳（same）: `identical` 1,908, `length_marking_only` 502, `dress_notation_only` 187, `stress_marking_only` 47, `notation_composite` 35, `rhotic_vowel_notation` 34。

> `rhoticity` / `square_near_cure` は GA の介母音 `/r/`（母音間・onset 位置）を誤って脱落させないよう文脈依存（トークン単位）で判定する。`composite_structural` は 2 軸以上の構造差を組み合わせないと説明できない語（例: `airport` = square_near_cure + cot_caught、`forest` = lot_vowel + weak_vowel、`better` = フラップT正規化 + rhoticity）。フラップT `ɾ` / 声門閉鎖 `ʔ` が `ipa` に直接埋め込まれている語は、判定前に `t`/`d`/`t` へ正規化してから軸判定する（該当語のみ `ga_allophony` または `composite_structural`）。

**更新手順**（`ipa` / `rp_ipa` / `ipa_actual_ga` を変更した場合）:

```bash
python3 tools/data-pipeline/gen_ga_rp_same.py --report tools/data-pipeline/pipeline/ga_rp_same_report.json
# rp_ipa バッチ追加後に happY 過剰伸長が疑われる場合:
python3 tools/data-pipeline/fix_happy_i.py   # その後 gen_ga_rp_same を再実行
```

---

## 3. connected_speech / weak_forms / guide スキーマ

### `packages/core/data/connected_speech.json`（公開 URL `/data/connected_speech.json`、201句）

フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level`（1–3）, `cefr`（A1–B2）, `cs_rule`（en/ja/fil/ko/zh-Hans/zh-Hant）, `gloss`（同 6 言語）, `carriers`（キャリア文テンプレート配列）。**`cs_rule` / `gloss` の 8 言語（es/pt-BR/vi/id/ru/th/hi/tr）拡張は Issue #303 で backlog 対応。** 未拡張言語では runtime で en fallback。

**Connected phrase TTS（現行）**: SPA からの API 呼び出しは `phrase=&accent=ga` 固定。`BatchWarm.gs` の暖機ループも GA 固定。RP 連結 TTS は将来対応予定（React 化以降）。

### `packages/core/data/weak_forms.json`（公開 URL `/data/weak_forms.json`、36語）

フィールド: `id`, `w`（機能語）, `ipa`（弱形）, `strong_ipa`, `level`（1–3）, `cefr`（A2/B1）, `cs_rule`（en/ja/fil/ko/zh-Hans/zh-Hant）, `carrier`（キャリア文テンプレート）。Decode のみ。TTS は `?weak=/IPA/&ww=word&accent=ga|rp`。**8 言語（es/pt-BR/vi/id/ru/th/hi/tr）拡張は Issue #303 で backlog 対応。** 未拡張言語では runtime で en fallback。

### `packages/core/data/guide.json`（公開 URL `/data/guide.json`）

UI i18n とは独立。各言語キー（**現行 14 言語**: `en`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `fil`, `es`, `pt-BR`, `vi`, `id`, `ru`, `th`, `hi`, `tr` — Issue #303 PR-D1 で 6→14 拡張済み）に 8 セクション（`welcome` … `how_to_use`）。段落数: welcome 4 / philosophy 3 / solves 2 / modes 3 / decode_encode 3 / connected 3 / accents 1 / how_to_use 3（合計 22 段落 / lang）。モーダルで閲覧。

---

## 4. localStorage（永続）+ セッション状態

### localStorage キー

| キー | 内容 | Phase 1 扱い |
|------|------|----------------|
| `app_lang` | UI 言語 | 維持（ヘッダー言語スイッチャー） |
| `app_accent` | `ga` / `rp` | プロフィール固定 |
| `app_mode` | 内部レガシー state `a`/`b`（`LS.appMode`） | UI 選択導線（`#modeField`/`#modeOpts`）は `hidden` 化済み。目的 4 カードに置換済みだが内部 state・LS キーは残存 |
| `ept_hist_v1` | 単語 SRS（Leitner） | 維持 |
| `ept_sym_v1` | 記号弱点（Encode） | 維持 |
| `ept_vocab_v1` | Study 語彙 SRS | 維持 |
| `ept_checks_v1` | 旧手動進捗 d/e/l | `ept_marks_v1` への lazy migration ソースとして残存（`migrateChecksToMarksIfNeeded()`） |
| `ept_marks_v1` | マーキング 0..3（仕様の正）。単一 JSON オブジェクト `{"{drill_id}:{word_id}": 0..3}` | Phase 1-C で実装 |
| `ept_marks_migrated_v1` | `ept_checks_v1` → `ept_marks_v1` migration 完了フラグ（`"1"`） | 一度のみ実行 |
| `onboarding_completed_v1` | オンボーディング完了 | Phase 1-F |
| `prev_settings_v1` | プロフィール前回値 | — |
| `va-disable` | Analytics オプトアウト | 維持 |

> `ept_vocab_band`（旧 Mode B バンド）は実装から削除済み（本表から除去、2026-07-29 確認）。

**TTS キャッシュキー**: Prefix `ipa_tts_v2:`（定数 `LS_TTS_PREFIX`）。キー形式: `ipa_tts_v2:{ga|rp}:{slug}`（単語）、`ipa_tts_v2:{ga|rp}:p4_{slug}`（連結）、`ipa_tts_v2:{ga|rp}:weak_{slug}`（弱形）。Legacy 形式（`ipa_tts_v1:*`）は読取時に v2 へマイグレーション。

### セッション状態（メモリ `S`）

現行: `appMode`, `lastDrill`（直近選択した目的 ID、既定 `"2a"`）, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, `cefrLevels`, `csFilter`, `csLevel`, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `mbPhase`, `curCarrier`, `revealed`, `built`, `mbQuiz`。

定数: `SESSION_INITIAL=6`, `SESSION_REFILL=5`, `MODEB_QUIZ_ENABLED=false`, `MODEB_SESSION={newCount:10, reviewCount:10}`, `PREFETCH={warmChunk:6, warmParallel:2, bodyParallel:3}`。

`S.cefrLevels`: 全目的横断の CEFR フィルタ状態。プロフィール（`3a`）が正。初期値は既定 `{"A1","A2"}`。
`S.mbPhase`: Study（`2c`）の内部フェーズ。Quiz 凍結時は Study のみ。

---

## 5. i18n スキーマ

**Files**: `packages/core/i18n/{lang}.json`（**14 言語**: en/ja/ko/zh-Hans/zh-Hant/fil/es/pt-BR/vi/id/ru/th/hi/tr、公開 URL `/i18n/{lang}.json`） + `packages/core/i18n/phonemes/{lang}.json`（音素解説、47 記号、**現行 6 言語**: en/ja/ko/zh-Hans/zh-Hant/fil、公開 URL `/i18n/phonemes/{lang}.json`）

**Fallback 設計（2 段構え）**:
- **Build 時 fallback**: `apps/web/scripts/build-i18n-html.js` の `readI18nWithFallback` により、phonemes に無い 8 言語（es/pt-BR/vi/id/ru/th/hi/tr）は en を読んで埋める（SEO 静的 HTML 生成用）
- **Runtime fallback**: `apps/web/src/index.template.html` の `loadLocale()` は UI / PH 各々 4xx 応答時に `i18n/en.json` を fetch して差し替え
- 上記により、phonemes 側の 8 言語未整備でも動作は成立する（Issue #297 で確立、validator `[B]` は `PH ⊆ UI` の subset に緩和）

**検証ガード**: `tools/validate/validate_i18n.py` が local / CI（`.github/workflows/validate-i18n.yml`）の唯一のガード。`packages/core/i18n/*.json` または `apps/web/src/index.template.html` の i18n 参照を編集したら必ず実行:

```bash
python3 tools/validate/validate_i18n.py
```

**Top-level keys**（`en.json` を基準、他言語も同一構造）:

| Key | Type | 役割 |
|---|---|---|
| `brand` | object | ブランド名（`name`, `home`） |
| `lead_html` / `lead_connected_html` / `lead_weak_html` | string | 各モードの導入テキスト |
| `tab` | object | 練習モードタブ |
| `mode` / `modeb` | object | 学習モードラベル / Mode B 関連 |
| `cs` / `weak` | object | Connected speech フィルタ / Weak forms ラベル |
| `focus` / `reg` | object | 音素フォーカスフィルタ / 綴りパターンフィルタ |
| `pool` | object | 対象語数表示 |
| `setup` / `dir` / `lvl` / `grp` / `accent` | object | 設定パネル・方向・CEFR レベル・綴り規則・GA/RP |
| `guide` | object | サイトガイドモーダル |
| `about` | object | About（`lead`, `why_ipa_html`, `features.*`, `contact_html`） |
| `onboarding` | object | オンボーディング（`slide_1`〜`slide_4`.`title`/`body`、`next`/`skip`/`start` 等） |
| `vocab` | object | 語彙ブラウザ（`vocab.filter.ipa` / `vocab.filter.all` / `vocab.az.hint`＝A–Z ジャンプ導線のヒント文言） |
| `symbol` | object | IPA 記号ピッカー（`symbol.picker.*` / `symbol.group.*.{en,sub}` / `symbol.height.*.{en,sub}`） |
| `reveal` | object | Reveal 画面（GA / RP 表記） |
| `lang_opts` | object | 言語切替 dropdown（14 言語の自称名。値は全言語共通） |
| `reflect`, `exit_confirm`, `note`, `patterns`, `summary`, `info`, `kbd`, `pos`, `cefr`, `checks`, `progress` | object | 各機能セクション |
| `start`, `loading`, `load_fail`, `wordlist_fail`, `back_top`, `settings_*`, `listen`, `input_ph`, `input_phrase`, `check`, `clear`, `next`, `build_ph`, `tips_head`, `you`, `see_answer` | string | 各種 UI 文字列 |
| `meta` | object | `title` / `description` / `ogTitle` / `ogDescription`（build-only、`brand` 直後に挿入） |

**Notes:**
- 総 leaf 数（`tools/validate/validate_i18n.py` 実測値・2026-08-07 時点）: **400 leaves × 14 languages = 5,600 leaves**（全 14 言語 parity 完成、Issue #297/#299/#301 で 6→14 言語追加）
- HTML 埋め込みキーは `_html` サフィックス
- 動的置換プレースホルダ: `{n}`, `{band}`, `{pct}`, `{m}`, `{t}`, `{c}`, `{list}`, `{p}`, `{sy}`, `{s}`, `{a}`
- LS 追加キー: `onboarding_completed_v1`（`"true"` で初回オンボ完了。スキップも完了扱い）
- **leaf 数はコード変更（Issue #147/#150 等の UI 改修）のたびに増減しうる。本節の数値と実ファイルの `キー数(en)` が乖離した場合は `python3 tools/validate/validate_i18n.py` の実測値を正とし、本節を更新すること**（doc-sync 対象、`docs/guardrails.md` §6）。

---

## 6. データ整合性チェック義務表（触る対象 → 必須完了定義）

以下のファイル・機能に触る変更は、必ず対応するデータ整合性チェックを Issue 本文の完了定義に含めること:

| 触る対象 | 必須の完了定義 |
|---|---|
| `packages/core/data/wordlist.json` | 総語数・CEFR 別内訳の再カウント |
| `rp_ipa` フィールド | `tools/data-pipeline/gen_ga_rp_same.py` 再実行、same/different 内訳の再確認 |
| `neighbors` フィールド | `tools/data-pipeline/gen_neighbors.py` 再実行、0近傍率の変化確認 |
| `packages/core/data/connected_speech.json` | 総フレーズ数・CEFR バッジ整合性 |
| `packages/core/data/weak_forms.json` | 総エントリ数、type=weak の出題確認 |
| `packages/core/i18n/*.json` | 14 言語すべての key 網羅性（`tools/validate/validate_i18n.py` 実行、[A] check で en と全キー一致必須） |
| `packages/core/i18n/phonemes/*.json` | 現行 6 言語の記号・フィールド網羅性（validator [B] check は `PH ⊆ UI` の subset 緩和。8 言語追加時は build/runtime fallback 動作を確認） |
| `tools/tts/gas/BatchWords.gs` | `tools/data-pipeline/export_batch_words.py` で再生成 |

## 7. 多言語 UI への影響（必須記載）

UI 文言を変える Issue は、以下を必須記載すること:
- 現行 14 言語（ja / en / ko / zh-Hans / zh-Hant / fil / es / pt-BR / vi / id / ru / th / hi / tr）すべての文言変更有無
- `packages/core/i18n/*.json` の更新対象 key リスト
- 現行 UI i18n leaf 数（正本は本ファイル §5。数値は固定引用せず本ファイルを参照）
- 英語・日本語の完全性を最優先。他 12 言語は差分マージ可（新規言語追加 PR は EPIC 単位、Issue #297/#299/#301 と同型の分割）

---

_旧 `docs/REPOSITORY-STRUCTURE.md`「Runtime data contract」「i18n schema」節、旧 `docs/SPECIFICATION.md` §5.1–5.5、旧 `CLAUDE.md` 品質基準 3–5 を統合継承（Issue #172）。_
