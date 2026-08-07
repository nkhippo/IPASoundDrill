# _common.md — 全 feature 共通の挙動・シェル

ID 横断で共有される画面シェル・セッションフロー・適応出題ロジック・視覚言語トークンの単一ホーム。
個別 ID の観測可能挙動・画面構造は `docs/features/<id>.md`。feature ID インデックスは `docs/features/README.md`。

---

## 用語

| 略語 / ID | 意味 |
|---|---|
| Decode | IPA → 単語（読み）。テキスト入力（目的 `2a` / `2d`） |
| Encode | 単語 → IPA（書き）。IPA キーボードでタップ組み立て（目的 `2b`） |
| Study | 音先行の提示ループ（目的 `2c`） |
| Leitner | 正答で間隔を伸ばし誤答で短縮する SRS 方式 |
| 音素近傍 | IPA トークン列の編集距離が小さい語（MCQ distractor 用。採点の near とは別概念） |
| Frame ID | 画面概念 ID（1 概念 = 1 ID）。ID レジストリは `docs/_conventions.md` |

---

## 観測可能挙動

### セッションフロー（全ドリル共通・Q-20-δ）

```
1a トップ（目的 4 カード）
      ↓ 目的選択
3a 学習プロフィール（毎セッション必須・LS プリセット）
      ↓ 「はじめる」
2a / 2b / 2c / 2d ドリル
      ↓
   Reveal → 次へ / Summary
```

セッション内絞り込みは各ドリル内の**インライン静かなチップ**のみ。独立の絞り込み画面は設けない。

### 先読み・終了（セッション共通）

| 項目 | 仕様 |
|------|------|
| 先読み（問題） | 開始時に現問＋先読み5＝**6 問**をキューへ。ストック（現問を除く先読み数）が **&lt;5** になるたびに **5 問**追加 |
| 先読み（音声） | キュー追加と同時に GA+RP 両方 warm → 現アクセント body 優先 → 反対アクセントはアイドル時。Connected / 弱形も対象 |
| プリフェッチ定数 | `warmChunk=6`、`warmParallel=2`、`bodyParallel=3`、`SESSION_REFILL=5` |
| スピーカー | キャッシュ準備完了まで無効化（全目的共通） |
| 離脱確認 | Decode / Encode / Study / Reveal から Menu またはブランドタップ時に Yes/No。**Yes → トップ（`1a`）復帰**（再開なし）。Summary・プロフィールではモーダルなし |
| 終了 | プール全問消化で自動サマリー |
| 進捗表示 | 各カード内 `現在番号 / プール総数` + STEP 行右上の CEFR タグ（例:「語彙 A2」）。**プログレスメーター（`.task-header-meter`）と進捗カウンター（`.task-header-counter`）は非表示**（`display:none`、2026-07-28 UI 改修で撤廃） |

### 適応出題（プール全件・重複なし）

セッション開始時にフィルタ後プール全件の出題順を決定（`buildSessionQueue`）。

重み付け（hist キー数 ≥ 3）: Due 40% / Symbolic 40% / New 余り。最終にマーキング重みシャッフル。

コールドスタート（hist &lt; 3）: CEFR 選択に沿った音節数スキャフォールド。

### 出題フィルタ共通定数（`2a` / `2b` で使用）

- **音素フォーカス（主セレクタ）:** All / Trap sounds / Weak spots / Alphabet / Contractions / Irregular forms / Casual speech
- **綴りタイプ（従）:** All / Regular patterns / Irregular
- **規則グループ（Regular 時）:** Short / Long・silent e / Vowel teams / R-colored vowels
- **Trap sounds 詳細:** `TRAPSET = ['θ', 'ð', 'æ', 'ʒ', 'ɝ']`

---

## 画面構造（全画面共通シェル・トップバー）

| 要素 | 内容 |
|------|------|
| ブランド | `#brandBtn` + `#brandName` |
| 語彙 | `#vocabBtn`（常時表示。`3b` 語彙ブラウザ導線） |
| 学習状況 | `#progressBtn`（常時表示。`3d` 学習状況導線） |
| ガイド | `#guideBtn`（`reopenOnboarding()` で `#onboardingModal`＝オンボーディングを再表示） |
| 言語 | ヘッダー `#langSwitcher` タップ → `navigate("language")` → `#languagePage`（独立の言語設定ページ、`3f`）へ遷移。DOM 上の `#langMenu` ドロップダウンは常時 `toggleLangMenu(false)` で閉じられ実質使われない dead code（2026-07-28 時点）。EPIC #297/#299/#301 の 14 言語追加時に menu 側の 14 言語ボタンも整備済み（rollback / A/B 想定の予備 DOM として維持、`toggleLangMenu(true)` 呼び出し箇所は現状 0） |
| Menu | `#backTopBtn`（プレイ中。離脱確認対象では Yes で `1a` 復帰） |
| アクセントバッジ | ヘッダーに GA/RP **固定**表示（学習中切替なし）。ドリル中は `.drill-accent-badge`（`position:absolute; top:14px; left:14px`、`--signal-soft` 背景）でカード内左上に表示 |
| 離脱確認 | `#exitConfirmModal`（Decode / Encode / Study / Reveal） |
| 進捗表示 | 各カード内 `#*No` + CEFR タグ |

### Footer（`#siteFooter`）

shell 最下部。`#footerFeedback` / `#footerTerms` / `#footerPrivacy` の 3 リンクのみ。**X リンクは削除済み**（2026-07-28）。`3h`「このアプリについて」・`IPA って何?`・言語設定への導線は Hero（`1a`）/ ヘッダーへ移設済みでフッターにはない（2026-07-28）。`body.in-play` では非表示。

### Modals

`#settingsModal` / `#guideModal` は DOM から撤去済み（2026-07-28）。設定はヘッダー `#langSwitcher`、ガイドは `#onboardingModal` 再表示に統合。

| モーダル | Backdrop | Escape | Outside click | 表示形式 |
|----------|----------|--------|----------------|----------|
| `#exitConfirmModal` | `#exitConfirmScrim` | No 相当 | scrim → No 相当 | full overlay |
| `#aboutModal`（`3h` このアプリについて） | `#aboutModalScrim` | 閉じる | scrim → close | full overlay |
| `#onboardingModal`（オンボーディング／ガイド。`data-frame="3g"`） | `#onboardingScrim` | — | scrim → `hideOnboarding(true)` | full overlay。`#onboardingSkip` でも同様に閉じる |
| `#ipaInfoPage`（IPAとは） | scrim（`rgba(20,18,15,.42)`） | 閉じる | scrim クリック → `backToTop()` | **浮遊カード**（上寄せ `padding-top:56px`、背面 TOP を沈めた三層構造） |
| `#languagePage`（言語設定） | 同上 | 閉じる | scrim クリック → `backToTop()` | **浮遊カード**（同上） |

> `3g`（オンボーディング）は `_conventions.md` の feature ID レジストリ未登録（旧来 DOM 上のみの補助モーダル）。ID 追加はこの Issue の非対象範囲。

info-page モーダル（IPAとは / 言語設定）は `.info-page` クラスで共通化。`position:fixed; inset:0` の scrim 上に `max-width:520px` の角丸カード（`.info-page-inner`）を浮かせる。閉じるボタンは ❌（`position:absolute; top:12px; right:12px`）。背面の TOP コンテンツは残したまま（blur/opacity で沈める）。

### PC 2ペインレイアウト（`min-width:900px`）

ドリル中（`body.in-play`）、問題カードと Reveal カードを横並び 2 ペインで表示:

- `grid-template-columns: 1fr 1fr`、`align-items: start`（各ペイン独立高さ）
- `.hidden` との CSS 詳細度衝突を避けるため、全 2ペイン セレクタに `:not(.hidden)` を付与
- ドリルごとに最適高さを個別指定（`body.drill-mode-{id}` クラスを JS で付与）:

| ドリル | 高さ | 備考 |
|--------|------|------|
| 2a Decode | 620px | |
| 2b Encode | 760px | IPA キーボードがあるため最大 |
| 2c Study | 600px | 最小（音→IPA→意味の 2段階のみ） |
| 2d Connected | 780px | carrier テキスト + 長い IPA |

### 「意味を確認する」ボタン（`.btn-reveal`）

全ドリルで統一デザイン: `background: var(--signal); color: #fff; border: none`（塗り teal）。2c Study の `.btn-reveal` も同一（2026-07-28 デザイン統一）。

### 視覚言語トークン

カラー / タイポ / スペーシング / 角丸 / シャドウ / コンポーネントをトークン化。具体値・CSS 命名の正本は本ファイルに書かない:

1. 実装用 snapshot: `docs/design/phase-1/visual-tokens.md`
2. CSS 命名・legacy 運用: `docs/CSS-CONVENTIONS.md`

---

## 読むデータ

localStorage キー・セッション状態 `S`・関連定数の一覧は `docs/data-contract.md` §4（localStorage / セッション状態）を参照（コピーしない）。

---

## i18n キー群

`setup` / `dir` / `lvl` / `grp` / `accent` / `guide` / `lang_opts` / `exit_confirm` / `note` / `start` / `loading` / `back_top` / `settings_*` / `listen` / `check` / `clear` / `next`。全 top-level キー一覧は `docs/data-contract.md` §5（i18n スキーマ）。

---

## 関連シンボル

Issue F の impact-ledger 生成後にリンク（`t()` / `activeIpa()` / `setExclusivePage` / `navigate` / `loadWordlist` 等の共有シンボルは `docs/impact-ledger.json` を参照予定）。

---

_旧 `docs/DESIGN.md` §0・§1.0・§2.4・視覚言語トークン節、旧 `docs/SPECIFICATION.md` §2.2（Trap sounds）・§2.3b・§4.0–4.0.2 を統合継承（Issue #173）。_
