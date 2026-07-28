# data-contract.md — ランタイム契約・JSON スキーマ・データ整合性の単一ホーム

ランタイム 8 パス契約・wordlist / connected_speech / weak_forms / guide の JSON スキーマ・localStorage・i18n スキーマ・
データ整合性チェック義務の**唯一のホーム**（`docs/doc-map.md` 登録）。旧 `docs/REPOSITORY-STRUCTURE.md`「Runtime data contract」「i18n schema」、
旧 `docs/SPECIFICATION.md` §5.1–5.5、旧 `CLAUDE.md` 品質基準 3–5 を統合継承。

---

## 1. ランタイム 8 パス契約

これらのパスは `src/index.template.html` に**ハードコード**されている（`<base href="/">` により言語サブディレクトリからもルート相対で解決）。
`src/index.template.html` を更新せずに移動しないこと。

| Asset | Path |
|-------|------|
| Wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
| Connected speech | `data/connected_speech.json` |
| Weak forms | `data/weak_forms.json` |
| Guide | `data/guide.json` |
| UI i18n | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` |
| Phoneme help | `i18n/phonemes/{lang}.json` |
| IPA font | `fonts/DoulosSIL-Regular.woff2` |
| TTS | External `GAS_TTS_URL` in `src/index.template.html` → `gas/Code.gs` deployment |

**フラグ義務**: 上記 8 パスのいずれかに触れる Issue は、Issue 本文で明示的にフラグを立て、Complexity Level を L3 として扱い、
下記「§6 データ整合性チェック義務表」の対応する完了定義を含めること（`docs/guardrails.md` §3 のレビュー段階化と連動）。

---

## 2. wordlist スキーマ — `wordlist_GA_a1a2_plus_phonics.json`

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
  "gloss": { "en": "...", "ja": "...", "zh": "...", "ko": "...", "fil": "..." },
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
| `ga_rp_same` | GA と RP が学習者にとって実質同じか（`scripts/gen_ga_rp_same.py` で付与） |
| `ga_rp_same_reason` | 判定理由（`identical`, `rhoticity`, `square_near_cure`, `ga_allophony` 等） |

### `cefr` フィールドの現状

- 値: `"A1"` / `"A2"` / `"B1"` / `"B2"`（**word-level タグ**。全目的横断）
- 分布: A1=1,187 / A2=1,195 / B1=2,116 / B2=899
- `src: "phonics"` の 652語は CEFR-J Wordlist v1.5 一次データ照合で B1/B2 正当語彙と確認済み
- プロフィール（`3a`）で複数レベル選択。ドリル STEP 行にタグ表示。Connected（`2d`）はタグ表示のみ・UI フィルタなし

**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `data/pipeline/`。バッチソースは `data/batches/`。コマンド詳細は `docs/pipeline.md`。

### GA / RP 「実質同じ」判定 (`ga_rp_same`)

各語彙エントリ（wordlist / connected_speech / weak_forms）に以下 2 フィールドを追加:

| フィールド | 型 | 意味 |
|---|---|---|
| `ga_rp_same` | `boolean` | GA と RP が学習者にとって実質同じ発音か |
| `ga_rp_same_reason` | `string` | 判定理由（同じ / 異なる、いずれの場合も付与） |

`scripts/gen_ga_rp_same.py` により全語彙一括で生成される派生フィールドで、`ipa` / `rp_ipa` / `ipa_actual_ga` から決定的に導出される（LLM 判定なし）。

**「same」の定義**（以下の差異のみを持つペアを same と判定・STRICT）:
1. 長音記号 `ː` の有無（GA 系辞書は緊張母音に付けない慣習）
2. 第二強勢 `ˌ` の有無・位置差（辞書ソース間の揺れ）
3. DRESS 母音の表記差（`ɛ` ↔ `e`、同一音素の表記慣習差）

第一強勢 `ˈ` は削除しない — 強勢の syllable 位置が異なるペアは different。

**「different」となる主な差異:**

| 種類 | reason 値 | 例 |
|---|---|---|
| GA 内音（フラップ T 等） | `ga_allophony` | `city` (`[ˈsɪɾi]`), `water` (`[ˈwɔɾɚ]`) |
| 第一強勢位置差 | `stress_placement` | `baseball`, `discount` |
| Non-rhotic 差 | `rhoticity` | `actor`, `winner` |
| GOAT 母音 | `goat_vowel` | `boat`, `ago` |
| LOT 母音 | `lot_vowel` | `hot`, `block` |
| TRAP-BATH | `trap_bath` | `path`, `bath`, `after` |
| COT-CAUGHT | `cot_caught` | `bought` |
| SQUARE / NEAR / CURE | `square_near_cure` | `bear`, `dear` |
| 弱母音の質差 | `weak_vowel` | `biscuit` (`ə`/`ɪ`) |
| Yod-dropping | `yod` | `new`, `due` |
| 語彙音韻差 | `lexical` | `schedule`, `vitamin` |
| その他構造差 | `structural_other` / `composite_structural` | 目視レビュー対象 |

**GA-only 異音カーブアウト（重要）**: `ipa_actual_ga`（narrow 転写）が存在し `ipa`（phonemic）と異なる語は、
phonemic レベルで RP と一致していても different と判定する。Flap T・音節主音子音・声門閉鎖など、GA でのみ生じる異音を
audibly-different として扱う（例: `city`）。

**UI 挙動**: (1) Reveal 画面の反対アクセント表示（`altAccentValue`）— same のとき `/ipa/（同じ）` 表示。(2) 語彙ブラウザの RP 行表示 — 同上。(3) 語彙リスト(3b)カードの **「GA=RP」印**（app-5）。
判定は `c.ga_rp_same` を参照。未設定時は旧ロジック（文字列一致）にフォールバック。

> **設計意図（重要・再質問防止）**: 「同じ」/「GA=RP」印は **「学習者にとって実質同じ音」** を意味し、**IPA 文字列の完全一致ではない**。
> 上記 STRICT 正規化（長音 `ː`・第二強勢 `ˌ`・DRESS `ɛ↔e` の表記差のみ吸収）を経て same 判定するため、
> **表示上 IPA 文字列が違って見えても「GA=RP」印が出るのは正しい挙動**（例: `M` の GA `/ɛm/` と RP `/em/` は `ɛ↔e` 正規化で same）。
> これは仕様であり不具合ではない。フラップ T 等の GA 異音や強勢位置差など「聞いて分かる差」は different（上表）。

**分布統計（Phase R 後）:**

| ファイル | 総数 | same | different |
|---|---:|---:|---:|
| wordlist | 5,397 | 2,674 (50%) | 2,723 (50%) |
| connected_speech | 201 | 94 (47%) | 107 (53%) |
| weak_forms | 36 | 30 (83%) | 6 (17%) |

wordlist の主な `ga_rp_same_reason`（different）: `rhoticity` 691, `structural_other` 615, `ga_allophony` 529, `goat_vowel` 288, `square_near_cure` 105, `cot_caught` 11。

**更新手順**（`ipa` / `rp_ipa` / `ipa_actual_ga` を変更した場合）:

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
# rp_ipa バッチ追加後に happY 過剰伸長が疑われる場合:
python3 scripts/fix_happy_i.py   # その後 gen_ga_rp_same を再実行
```

---

## 3. connected_speech / weak_forms / guide スキーマ

### `data/connected_speech.json`（201句）

フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level`（1–3）, `cefr`（A1–B2）, `cs_rule`（en/ja/fil/ko/zh-Hans/zh-Hant）, `gloss`, `carriers`（キャリア文テンプレート配列）。

**Connected phrase TTS（現行）**: SPA からの API 呼び出しは `phrase=&accent=ga` 固定。`BatchWarm.gs` の暖機ループも GA 固定。RP 連結 TTS は将来対応予定（React 化以降）。

### `data/weak_forms.json`（36語）

フィールド: `id`, `w`（機能語）, `ipa`（弱形）, `strong_ipa`, `level`（1–3）, `cefr`（A2/B1）, `cs_rule`（en/ja/fil）, `carrier`（キャリア文テンプレート）。Decode のみ。TTS は `?weak=/IPA/&ww=word&accent=ga|rp`。

### `data/guide.json`

UI i18n とは独立。各言語キー（`en`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `fil`）に 8 セクション（`welcome` … `how_to_use`）。段落数: welcome 4 / philosophy 3 / solves 2 / modes 3 / decode_encode 3 / connected 3 / accents 1 / how_to_use 3。モーダルで閲覧。

---

## 4. localStorage（永続）+ セッション状態

### localStorage キー

| キー | 内容 | Phase 1 扱い |
|------|------|----------------|
| `app_lang` | UI 言語 | 維持（ヘッダー言語スイッチャー） |
| `app_accent` | `ga` / `rp` | プロフィール固定へ |
| `app_mode` | 旧 `a` / `b` | 目的 4 カード化で廃止予定 |
| `ept_hist_v1` | 単語 SRS（Leitner） | 維持 |
| `ept_sym_v1` | 記号弱点（Encode） | 維持 |
| `ept_vocab_v1` | Study 語彙 SRS | 維持 |
| `ept_vocab_band` | 旧 Mode B バンド | 廃止予定 |
| `ept_checks_v1` | 旧手動進捗 d/e/l | マーキングへ移行予定 |
| `mark:{drill_id}:{word_id}` | マーキング 0..3（仕様の正） | Phase 1-C で実装 |
| `onboarding_completed_v1` | オンボーディング完了 | Phase 1-F |
| `prev_settings_v1`（仮） | プロフィール前回値 | — |
| `va-disable` | Analytics オプトアウト | 維持 |

**TTS キャッシュキー**: Prefix `ipa_tts_v2:`（定数 `LS_TTS_PREFIX`）。キー形式: `ipa_tts_v2:{ga|rp}:{slug}`（単語）、`ipa_tts_v2:{ga|rp}:p4_{slug}`（連結）、`ipa_tts_v2:{ga|rp}:weak_{slug}`（弱形）。Legacy 形式（`ipa_tts_v1:*`）は読取時に v2 へマイグレーション。

### セッション状態（メモリ `S`）

現行: `appMode`, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, `cefrLevels`, `csFilter`, `csLevel`, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `mbPhase`, `curCarrier`, `revealed`, `built`, `mbQuiz`。

定数: `SESSION_INITIAL=6`, `SESSION_REFILL=5`, `MODEB_QUIZ_ENABLED=false`, `MODEB_SESSION={newCount:10, reviewCount:10}`, `PREFETCH={warmChunk:6, warmParallel:2, bodyParallel:3}`。

`S.cefrLevels`: 全目的横断の CEFR フィルタ状態。プロフィール（`3a`）が正。初期値は既定 `{"A1","A2"}`。
`S.mbPhase`: Study（`2c`）の内部フェーズ。Quiz 凍結時は Study のみ。

---

## 5. i18n スキーマ

**Files**: `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（6言語） + `i18n/phonemes/{lang}.json`（音素解説、47記号）

**検証ガード**: `tools/validate_i18n.py` が local / CI（`.github/workflows/validate-i18n.yml`）の唯一のガード。`i18n/*.json` または `src/index.template.html` の i18n 参照を編集したら必ず実行:

```bash
python3 tools/validate_i18n.py
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
| `vocab` | object | 語彙ブラウザ（`vocab.filter.ipa` / `vocab.filter.all`） |
| `symbol` | object | IPA 記号ピッカー（`symbol.picker.*` / `symbol.group.*.{en,sub}` / `symbol.height.*.{en,sub}`） |
| `reveal` | object | Reveal 画面（GA / RP 表記） |
| `lang_opts` | object | 言語切替 dropdown（6言語） |
| `reflect`, `exit_confirm`, `note`, `patterns`, `summary`, `info`, `kbd`, `pos`, `cefr`, `checks`, `progress` | object | 各機能セクション |
| `start`, `loading`, `load_fail`, `wordlist_fail`, `back_top`, `settings_*`, `listen`, `input_ph`, `input_phrase`, `check`, `clear`, `next`, `build_ph`, `tips_head`, `you`, `see_answer` | string | 各種 UI 文字列 |
| `meta` | object | `title` / `description` / `ogTitle` / `ogDescription`（build-only、`brand` 直後に挿入） |

**Notes:**
- 総 leaf 数（正本・SPEC §5.5 由来・Issue #122 PR-3 時点）: **246**（Phase 1-E PR-3。237→246、新規 `about.*` +9）
- HTML 埋め込みキーは `_html` サフィックス
- 動的置換プレースホルダ: `{n}`, `{band}`, `{pct}`, `{m}`, `{t}`, `{c}`, `{list}`, `{p}`, `{sy}`, `{s}`, `{a}`
- LS 追加キー: `onboarding_completed_v1`（`"true"` で初回オンボ完了。スキップも完了扱い）
- **leaf 数はコード変更（Issue #147/#150 等の UI 改修）のたびに増減しうる。本節の数値と実ファイルの `キー数(en)` が乖離した場合は `python3 tools/validate_i18n.py` の実測値を正とし、本節を更新すること**（doc-sync 対象、`docs/guardrails.md` §6）。

---

## 6. データ整合性チェック義務表（触る対象 → 必須完了定義）

以下のファイル・機能に触る変更は、必ず対応するデータ整合性チェックを Issue 本文の完了定義に含めること:

| 触る対象 | 必須の完了定義 |
|---|---|
| `wordlist_GA_a1a2_plus_phonics.json` | 総語数・CEFR 別内訳の再カウント |
| `rp_ipa` フィールド | `scripts/gen_ga_rp_same.py` 再実行、same/different 内訳の再確認 |
| `neighbors` フィールド | `scripts/gen_neighbors.py` 再実行、0近傍率の変化確認 |
| `data/connected_speech.json` | 総フレーズ数・CEFR バッジ整合性 |
| `data/weak_forms.json` | 総エントリ数、type=weak の出題確認 |
| `i18n/*.json` | 6 言語すべての key 網羅性（`tools/validate_i18n.py` 実行） |
| `gas/BatchWords.gs` | `scripts/export_batch_words.py` で再生成 |

## 7. 多言語 UI への影響（必須記載）

UI 文言を変える Issue は、以下を必須記載すること:
- ja / en / ko / zh-Hans / zh-Hant / fil の 6 言語すべての文言変更有無
- `i18n/*.json` の更新対象 key リスト
- 現行 UI i18n leaf 数（正本は本ファイル §5。数値は固定引用せず本ファイルを参照）
- 英語・日本語の完全性を最優先、他 4 言語は差分マージ可

---

_旧 `docs/REPOSITORY-STRUCTURE.md`「Runtime data contract」「i18n schema」節、旧 `docs/SPECIFICATION.md` §5.1–5.5、旧 `CLAUDE.md` 品質基準 3–5 を統合継承（Issue #172）。_
