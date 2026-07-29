# screen-inventory.md — 全画面 項目定義一覧

索引: `docs/features/README.md`。React 化デグレ確認用の俯瞰表（Issue #204）。
各画面の詳細な観測可能挙動・採点則・i18n キーは対応する `docs/features/<id>.md` を正本とする。
本ファイルは **DOM セレクタ・要素名・表示条件・状態パターン** の横断一覧のみを扱う（重複記述しない）。

`src/index.template.html` 実装が正本。CSS: ~L90-1035、HTML: ~L1080-1650、JS: ~L1760-5876。

---

## body 状態クラス（全画面共通の表示条件スイッチ）

| クラス | 意味 | 主な影響 |
|---|---|---|
| `top-home` | トップ画面（`1a`）表示中 | `.topbar` フル表示レイアウト |
| `in-play` | ドリル実行中（`2a`–`2d` のいずれかのプロンプト/答えペイン表示） | `.topbar` / `.play-line` / `.card-top` / `.drill-progress` / `#backTopBtn` を非表示化し、`.drill-accent-badge` 等の集約 UI に切替 |
| `drill-two-pane` | PC（`min-width:1024px`）でプロンプト+答えペインを左右 2 カラム表示 | `#cardDecode` 等 `.hidden` でも左ペインとして表示され得る |
| `drill-mode-<id>`（例: `drill-mode-2a`） | 現在の出題ドリル種別 | ドリル別の表示切替（`2d` の CEFR タグ表示条件等） |
| `drill-answered` | 現在の設問に回答済み | プロンプト側の input/button を `pointer-events:none; opacity:.5` に |
| `vocab-page` | `3b` 語彙ブラウザ表示中（exclusive full-page） | `#vocabPage` 表示、他画面 fixed overlay |
| `symbol-picker-page` | `3c` IPA 記号ピッカー表示中 | `#symbolPickerPage` 表示 |
| `progress-page` | `3d` 学習状況表示中 | `#learningStatusPage` 表示 |
| `info-page` | `3e`（IPA って何?）/ 言語設定 モーダル表示中 | `#ipaInfoPage` / `#languagePage` 表示 |
| `pc-support` | PC 幅レイアウト補助 | `body.pc-support` 系 CSS（Accent card grid 横並び等） |
| `scroll-locked` | モーダル/exclusive page 表示中の背面スクロール抑制 | `overflow:hidden` |

---

## 画面一覧

| 画面 ID | DOM ルート | 表示条件（主） | feature spec |
|---|---|---|---|
| `1a` トップページ | `#purposeStub`（`data-frame="1a"`） | 初期表示・`body.top-home` | `docs/features/1a.md` |
| `3a` 学習プロフィール | `#setup`（`data-frame="3a"` / `.profile-3a`） | 目的カード選択後、毎セッション必ず通過 | `docs/features/3a.md` |
| `2a` Decode | `#cardDecode`（`data-frame="2a"`） | `.drill-pane.drill-pane-prompt`、`body.in-play.drill-mode-2a` | `docs/features/2a.md` |
| `2b` Encode | `#cardEncode`（`data-frame="2b"`） | `body.in-play.drill-mode-2b` | `docs/features/2b.md` |
| `2c` Study STEP1 | `#cardModeBStudy`（`data-frame="2c"`） | `body.in-play.drill-mode-2c`、プロンプト面 | `docs/features/2c.md` |
| `2c` Study STEP2（答え） | `#cardModeBStudyAnswer`（`data-frame="2c"`） | STEP1 回答後（`.drill-pane-answer`） | `docs/features/2c.md` |
| `2c` Quiz MCQ（凍結） | `#cardModeBMcq`（`data-frame="2c-quiz"`） | `MODEB_QUIZ_ENABLED=false` のため現行到達不能。コード温存 | `docs/features/2c.md` |
| `2c` Quiz Dictation（凍結） | `#cardModeBDict`（`data-frame="2c-dict"`） | 同上 | `docs/features/2c.md` |
| `2d` Connected Speech | `#cardDecode` 再利用（`tab=connected`） | `body.in-play.drill-mode-2d` | `docs/features/2d.md` |
| `reveal` 解答 | `#reveal`（`data-frame="reveal"`） | 各ドリル回答後（`.drill-pane-answer`） | `docs/features/reveal.md` |
| `summary` サマリー | `#summary` | プール全問消化で自動表示 | `docs/features/summary.md` |
| `3b` 語彙ブラウザ | `#vocabPage`（`body.vocab-page`） | ヘッダー `#vocabBtn` から起動、exclusive full-page | `docs/features/3b.md` |
| `3c` IPA 記号ピッカー | `#symbolPickerPage`（`body.symbol-picker-page`） | hash `#/vocab/ipa`。**現行 UI に遷移トリガーなし（既知の乖離、`3c.md` 参照）** | `docs/features/3c.md` |
| `3d` 学習状況 | `#learningStatusPage`（`body.progress-page`） | ヘッダー `#progressBtn` から起動、exclusive full-page | `docs/features/3d.md` |
| `3e` IPA って何? | `#ipaInfoPage`（`body.info-page`） | ヘッダー `#topIpaLink` から起動（モーダル的 overlay、`top-home` 保持） | 未採番（`docs/features/1a.md` から参照リンクのみ、独立 spec なし） |
| 言語設定 | `#languagePage`（`body.info-page`） | `#langSwitcher` / `#langMenu` から起動 | `docs/features/_common.md`（ヘッダー言語スイッチャー） |
| `3g` オンボーディング | `#onboardingModal`（`.modal`, `data-frame="3g"`） | 初回訪問時などにモーダル表示 | 未採番（`docs/features/_common.md` Modals テーブルに一覧のみ） |
| `3h` このアプリについて | `#aboutModal` 内 `#aboutBlock`（`data-frame="3h"`） | フッター等から起動するモーダル。DOM always-on（クローラビリティ用） | `docs/features/3h.md` |
| 終了確認モーダル | `#exitConfirmModal`（`.modal`） | ドリル中に離脱操作をした場合 | `docs/features/_common.md` Modals テーブル |

---

## 画面別 要素・状態パターン詳細

### `2a` / `2b` / `2c` / `2d`（ドリルカード共通パターン）

| 要素 | セレクタ | 状態パターン |
|---|---|---|
| アクセントバッジ | `.drill-accent-badge[data-role="drill-accent"]` | テキスト `GA` / `RP`（`syncDrillAccentBadges()` でセッション固定アクセントに同期） |
| CEFR タグ | `.cefr`（各カードで `#dCefr` / `#eCefr` / `#mbSCefr` 等 ID 違い） | `hidden` 属性で非表示制御。`.is-unknown` で不明時装飾 |
| Progress meter | `.drill-progress`（各カードで `#dProgress` 等） | **`display:none` で恒久非表示**（2026-07-28 撤廃、DOM のみ温存） |
| 入力/判定 | `.answer input` + `.go` ボタン（`2a`/`2c` Dict）または `.build` + `.kbd`（`2b`） | 判定後 `body.drill-answered` で非活性化 |

### `reveal`

| 要素 | セレクタ | 状態パターン |
|---|---|---|
| Pending プレースホルダ | `#rPending` | `#reveal.is-pending` 時のみ表示、`.reveal` 本体は非表示 |
| 判定バッジ | `#rBadge` | `res-ok` / `res-bad` / `hidden`（`2c` 等・採点なしドリルでは hidden） |
| 発音カード | `#rPronCard` | GA/RP 同一時は RP 行を省略・差分表示切替（`#rPronDiff`） |
| 旧 IPA 表示群 | `.readout`（`#rIpa` 親）/ `#rAltIpa` / `#rRespell` / `#rDictIpa` | **`display:none` で恒久非表示**（2026-07-28、発音カードへ統合済み。DOM のみ温存） |

### `3b` 語彙ブラウザ

| 要素 | セレクタ | 状態パターン |
|---|---|---|
| IPA フィルタ | `#vocabIpaFilterBar` | 選択記号 0–3 個（`vocabIpaQuery`、最大 3）。0 個時は全件表示 |
| 全消去ボタン | `#vocabIpaClear` | 通常 `hidden`（個別 toggle-off のみ運用） |
| リスト行 | `#vocabBody` 内、仮想化スロット | 各行: 単語 + CEFR バッジ / GA+RP IPA（2 行固定） + gloss / 進捗チェック + TTS |

### `3d` 学習状況

| 要素 | セレクタ | 状態パターン |
|---|---|---|
| CEFR フィルタ | `.pill-cefr`（`#progressFilters` 内） | 複数選択、`all` は一括トグル |
| ドリル進捗カード | `.drill-progress-card[data-progress-drill]` | `2a`/`2b`/`2c`/`2d` の 4 枚。タップで `3a`（該当ドリル種別固定）へ遷移 |
| 全体合算カード | （DOM 削除済み、`#progressOverallPct` 等は null-safe 無視） | 2026-07-28 phase-3 round-3 で撤去。復活時のため計算ロジックのみ温存 |

### モーダル群（`docs/features/_common.md` Modals テーブルが正本、本表は横断参照のみ）

| モーダル | セレクタ | 起動元 |
|---|---|---|
| このアプリについて（`3h`） | `#aboutModal` | フッター等 |
| オンボーディング（`3g`） | `#onboardingModal` | 初回訪問等 |
| 終了確認 | `#exitConfirmModal` | ドリル中の離脱操作 |

---

## 検証メモ（Issue #204 突合時点）

- 本ファイルに列挙した全 DOM セレクタは `src/index.template.html` 内に実在することを `grep` で確認済み（テスト観点）
- `3c`（IPA 記号ピッカー）は現行 UI から遷移するトリガーが見当たらず、hash 直打ちでのみ到達可能。別 Issue でのフォローアップ対象として `docs/features/3c.md` に記録済み
- `3d` の SRS queue（単語単位の期限一覧）は撤去済み。旧仕様書の記載を `docs/features/3d.md` で更新済み
- `reveal` の旧 IPA 表示（`.readout` / `#rAltIpa` / `#rRespell` / `#rDictIpa`）は発音カード（`#rPronCard`）へ統合され `display:none` 化。DOM 自体は削除されていない

## 関連

- `docs/features/README.md`（feature ID 索引）
- `docs/features/_common.md`（共通シェル・セッションフロー）
- `docs/doc-map.md`（概念→ホーム索引）
