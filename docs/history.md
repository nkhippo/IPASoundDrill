# history.md — 日付付きログの集約ホーム

evergreen な仕様ドキュメントから日付ログ（Phase 完了記録・スナップショット・変更履歴）を剥がして集約する
（`docs/_conventions.md` 規約3: evergreen/dated 分離）。

## D で移した範囲（Issue #172）

本ファイルは Issue D（#172）で新設。D で移設したのは **`docs/PURPOSE.md`** と **`docs/REPOSITORY-STRUCTURE.md`** 由来の日付ログのみ:

- `docs/PURPOSE.md` §「Phase 1: B1語彙拡充」「Phase 2: B2語彙拡充 M2」「Phase R: RP パイプライン品質修正」（→ §1 以下）
- `docs/PURPOSE.md` §「変更履歴」（→ §3 以下）
- `docs/REPOSITORY-STRUCTURE.md` §「Wordlist snapshot」「UI behaviour snapshot」（→ §2 以下）

`docs/DESIGN.md` / `docs/SPECIFICATION.md` 内の日付ログ・実装状況（§5 実装状況、変更履歴 等）は **Issue E**（DESIGN/SPEC 退役時）で本ファイルへ追記する。
重複移設を避けるため、E 実施者は着手前に本節を確認し、本節にリストされた範囲は再移設しないこと。

---

## 1. Phase 完了ログ（`docs/PURPOSE.md` 由来）

### Phase 1: B1語彙拡充 — 完了 (2026-07-09)

CEFR-J Wordlist v1.5 のB1語彙(単一語2,332語)のうち、既存app未収録だった1,769語を
M1(180)+M2(400)+M3(400)+M4(400)+M5(389)の5バッチに分けて拡充完了。

最終結果:
- app内 B1語数: 2,116語（オリジナル347語 + Phase1拡充1,769語）
- gloss(en/ja/zh/ko/fil) 5言語完成: 全4,828語
- narrow IPA・respelling: 既存パイプラインで生成済み（R4 pending分は別途TTSレビュー予定）

次フェーズ（当時）: `neighbors`再計算、B2語彙拡充 → いずれも完了（2026-07-10）

### Phase 2: B2語彙拡充 M2 — 完了 (2026-07-10)

CEFR-J v1.5 B2 のうち **569 語**を pilot(179) + M2a–d(390) で追加。`rp_ipa` は Claude バッチ同梱方式。

- 総語数: **5,397**（B2=**899**）
- サマリ: `docs/reference/phase2-m2-completion-summary.md`
- R4 pending 累計: **127 語**（`data/pipeline/r4_pending_review_list.*`）

次フェーズ: Phase 2 M3+（B2 残り）、Phase 3（C1）

### Phase R: RP パイプライン品質修正 — 完了 (2026-07-10)

Opus レビューで判明した分類器 dead-code・happY rp_ipa 破損（91語）・`ga_to_rp.py` latent bug を修正。

- **R1:** `gen_ga_rp_same.py` — `cot_caught` / `square_near_cure` / BATH+weak composite を活性化（フラグ数不変、reason 再分類）
- **R2:** `gen_rp_ipa.py` happY ルール + `fix_happy_i.py` で rp_ipa 91語是正（82 過剰伸長 + 9 Jones `/ɪ/`）
- **R3:** `phonology_lexicon.py` 新規、`ga_to_rp.py` PALM/happY/yod 修正
- **R4:** neighbors 再生成、ドキュメント更新

詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`

---

## 2. スナップショット（`docs/REPOSITORY-STRUCTURE.md` 由来）

### Wordlist snapshot (2026-07-10)

| Metric | Value |
|--------|------:|
| Total words | **5,397** |
| CEFR A1 | 1,187 |
| CEFR A2 | 1,195 |
| CEFR B1 | 2,116 |
| CEFR B2 | **899**（Phase 2 M2 完了: pilot 179 + M2 390） |
| `rp_ipa` | 5,397（100%） |
| `ga_rp_same` | 5,397（100% 付与）。same=2,674 / different=2,723（Phase R 後） |
| `neighbors` 非空 | 5,113（94%） |
| 全体 0 近傍率 | 5% |
| `ipa_actual_ga`（flap 候補） | ~529 |
| R4 pending（TTS review） | **127** |
| `respell_ga` drafted | ~5,260 |
| gloss 5 langs | 5,397 |

### Connected speech & weak forms（スナップショット）

| File | Count | Notes |
|------|------:|-------|
| `data/connected_speech.json` | 201 | `cefr` + `ga_rp_same`; vocab browser Phrases タブに CEFR バッジ表示 |
| `data/weak_forms.json` | 36 | 同上; 練習時 Connected Speech Type=weak で出題 |

### UI behaviour snapshot (2026-07-10)

| Feature | Implementation |
|---------|----------------|
| Progress checks | `ept_checks_v1` — 3 slots × 3 modes（`d`/`e`/`l`）; vocab browser + Reveal + Mode B Study |
| Frequency weighting | `weightedShuffle` + `frequencyWeight` in session pool build |
| Alt-accent same display | `/ipa/（同じ）` via `ga_rp_same` flag（`scripts/gen_ga_rp_same.py`） |
| Vocab browser（`3b`） | exclusive full-page `#vocabPage`（`body.vocab-page`）；hash `#/vocab` / `#/vocab/phrases`；sticky filter（綴り/IPA segmented・CEFR pills・search）；Words 仮想化 ~20–30 行；Phrases 非仮想化；CEFR 初期は全選択 |
| IPA symbol picker（`3c`） | `#symbolPickerPage`（`body.symbol-picker-page`）；hash `#/vocab/ipa`；query chips + IPA chart palette；live IPA substring + `--signal` highlight |
| Session exit | `#exitConfirmModal` on drill screens |
| CEFR setup filters | Pills with 0 results disabled; Mode A: A1/A2/B1（B2 は Mode B バンドで利用） |
| TTS first-question | Phase T: body-first prefetch、`?urls=1` Drive 直 fetch、setup preread |

### JS map 同期日

`docs/repo-map.md` §「src/index.template.html JS map」の行番号スナップショット: **2026-07-12** 時点。
`docs/data-contract.md` §5 i18n スキーマの `_last synced` 情報: **2026-07-24（Issue #150 PC header follow-up）** 時点。

---

## 3. 変更履歴（`docs/PURPOSE.md` 由来）

| 日付 | 版 | 内容 |
|------|----|------|
| 2026-07-18 | v4.0 | Phase 1 UI/UX 実装前の仕様先行改訂（Issue #75）。目的 4 カード構成、タグライン確定、GA/RP セッション固定、CEFR 全目的横断、Mode B Band 廃止、マーキング / プロフィール一元通過 / オンボーディング追加、採点 near 廃止。旧 2 モードは §5 履歴化。 |
| 2026-07-10 | v3.24 | パッケージ B (Phase 2 バッチ品質監査): 全 569 語独立 Opus 監査完了。wordlist 波及 typo 2件 (`comprehensive`/`corporal` gloss.zh 的的)、POS 正規化 1件 (`damn` 感嘆詞→間投詞)、Fil 翻訳更新 13件 (Opus 提案)。バッチファイル 86件をwordlistと同期 (dignify/dignity + happy-i 68語 + typo/POS/Fil)。i18n 複合 POS キー追加。 |
| 2026-07-10 | v3.23 | Phase V: 語彙ブラウザをモーダルから独立ページ (`#vocabPage`) に移設。Hash routing (`#/vocab`, `#/vocab/phrases`) 対応。UI 整備 (2段組行・sticky header・CEFR バッジ全タブ表示・A-Z 横スクロール・空/ローディング状態)。i18n `vocab.back` 追加。Menu ボタンと独立。 |
| 2026-07-10 | v3.22 | Phase T: TTS 1問目遅延解消。fast-path body-first、warm de-gating、Start時RP warm skip、Drive 直リンク URL API (`?urls=1`)、setup 画面 preread。cold-start 20s→5s / warm-start 20s→500ms。 |
| 2026-07-10 | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
| 2026-07-10 | v3.20 | Phase 2 M2 完了（B2 +569、総 5,397）。進捗チェック（`ept_checks_v1`）、Phrases CEFR バッジ、`dignify` RP ホットフィックス。リポジトリ README 整備（`data/README.md` 等）。 |
| 2026-07-09 | v3.14 | Phase 1 M5（最終）: B1 拡充 389語（`restrict`〜`yoga`）をマージ。総語数 4,828、B1=2,116。Phase 1 B1 拡充完了。 |
| 2026-07-09 | v3.13 | 反対アクセント同一表示を `/ipa/（同じ）` 形式に変更。GA/RP ラベルを `GA`/`RP` のみに簡素化。振り返りフローティングボタンを廃止し、離脱時（Menu/ブランド）に Yes/No 確認→サマリーへ。CEFR 選択に連動して 0 件の詳細フィルタピルを非活性化。 |
| 2026-07-09 | v3.12 | セッションをプール全件の重複なし消化に変更（6 問初期 / ストック&lt;5 で 5 問先読み）。全モード TTS 先読み。振り返りボタン・サマリー TOP へ。Mode B は Study のみ（Quiz UI 非表示・コード温存）。 |
| 2026-07-09 | v3.11 | リポジトリ構成を整理（`data/batches`・`data/pipeline`・`data/patches`・`docs/cursor` 等）。`docs/REPOSITORY-STRUCTURE.md` 追加（**Issue #172 でこの旧ファイルは retire、内容は data-contract/tts-design/pipeline/repo-map/history へ移設**）。`scripts/paths.py` でパス正本化。 |
| 2026-07-09 | v3.10 | Phase 1 M4: B1 拡充 400語（`marked`〜`restore`）を IPA/pos/def/gloss5言語付きでマージ。総語数 4,439、B1=1,727。 |
| 2026-07-09 | v3.9 | 連結句 201句・弱形 36語に `cefr` フィールドを付与（Claude 提案を算出結果どおり採用）。UI バッジ表示は別途。 |
| 2026-07-09 | v3.8.1 | `friendliness` の GA IPA 誤記（RP 用 `ː` 混入）を訂正。respelling 例外を解消（`FREHND-lee-nuhs`）。 |
| 2026-07-09 | v3.8 | Phase 1 M3: B1 拡充 400語（`entertain`〜`marine`）を IPA/pos/def/gloss5言語付きでマージ。総語数 4,039、B1=1,327。`merge_respelling.py` の pending クリア問題を恒久修正。 |
| 2026-07-08 | v3.7 | Phase 1 M2: B1 拡充 400語（`biography`〜`enrich`）を IPA/pos/def/gloss5言語付きでマージ。総語数 3,639、B1=927。 |
| 2026-07-07 | v3.6 | Phase 1 M1: パイロット180語の gloss 5言語（ja/zh/ko/fil）翻訳を追加。Claude によるスタイル準拠翻訳、同義語ペアの整合性確認済み。 |
| 2026-07-07 | v3.5 | Phase 1 M1 パイロット: CEFR-J B1 拡充対象の先頭 180 語を wordlist に追加（3,239語）。gloss ja/zh/ko/fil は未着手。 |
| 2026-07-07 | v3.4 | Phase 0-b: Mode A に CEFR 複数選択フィルタを追加（A1/A2/B1、デフォルト A1+A2）。Mode B の空バンド解放防止。C1 は UI 非表示（キー残置）。 |
| 2026-07-07 | v3.3.1 | Phase 0-a の訂正: phonics 652語の cefr null化を復元。CEFR-J 一次データとの照合で 652語全てが正当な B1/B2 語彙と判明したため。詳細は `docs/reference/wordlist-cefr-audit.md` 訂正セクション参照。 |
| 2026-07-07 | v3.3 | Phase 0-a: 誤った前提に基づく変更として phonics 652語の cefr を null 化（後日 v3.3.1 で訂正）。 |
| 2026-07-06 | v3.2 | 学習モード名称を行為ベースに刷新（IPA読み書き / 聞いて覚える 等）。反対アクセント全画面表示。respelling は UI 非表示（データは保持）。 |
| 2026-07-02 | v3.1.1 | respelling v2 品質パッチ（18語の `respell_ga` 可読性修正）。 |
| 2026-07-02 | v3.1 | narrow IPA + respelling を全3,059語で完了。VntV 52語は TTS 実音判定（nasal=kept, consonant=plain）で確定。 |
| 2026-07-02 | v3.0 | 語彙ブラウザ・TTS プリフェッチ・GA バッチ warm・`def` 完走・i18n 156 キーを反映。 |
| 2026-06-29 | v2.10 | 語彙ブラウザ・学習ガイド全章置換・`def` batch01–08 マージ。 |
| 2026-06-23 | v1 | 本丸をIPAリテラシーに確定（単一モード前提）。 |
| 2026-06-24 | v2 | 2モード構成に拡張。Mode A＝音素カバー軸の本丸、Mode B＝CEFR軸の語彙サブテーマ。 |
| 2026-06-26 | v2.1 | Mode A/B・GA/RP・連結句・RP TTS の実装完了を反映。依存表を実装状況に更新。 |
| 2026-06-28 | v2.9 | 練習タブ統一: Connected Speech ⊃ Weak Forms（2タブ化）。 |
| 2026-06-27 | v2.7 | gloss.fil batch04 更新 + batch17–20 追加（1,600/3,059語）。 |
| 2026-06-27 | v2.6 | gloss.fil batch02/06–08 更新 + batch13–16 追加（1,280/3,059語）。 |
| 2026-06-27 | v2.5 | gloss.fil batch02–05 更新 + batch09–12 追加（960/3,059語）。 |
| 2026-06-27 | v2.4 | gloss.fil batch03–08 追加マージ（640/3,059語）。 |
| 2026-06-26 | v2.3 | gloss.fil batch01–02 マージ（160/3,059語）・`merge_gloss_fil.py` 追加。 |

---

_Issue #172（Issue D）で新設。旧 `docs/PURPOSE.md`「Phase 1/2/R」「変更履歴」、旧 `docs/REPOSITORY-STRUCTURE.md`「Wordlist snapshot」「UI behaviour snapshot」を移設・統合。DESIGN/SPEC 由来の日付ログは Issue E で追記予定。_
