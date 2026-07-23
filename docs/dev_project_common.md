---
id: pj-2026-07-23-26ac
aliases:
- pj-2026-07-23-26ac
title: 'dev_project_common — Repo 配置の運用ルール（Issue #145）'
created: '2026-07-23'
---

# 開発運用共通ルール（Repo 配置）

Cursor / Codex が Issue・PR・Rv で参照する **Repo 側の運用ルール**。  
Vault 正典 `00_meta/operations/dev_project_common.md` の横断ルールを補完し、Issue #145 で追加した検証機構を明文化する。

プロジェクト固有の正本は引き続き `AGENTS.md` / `CLAUDE.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`。

---

## 1. Claude PR Rv 手順（raw fetch + 標的 grep）

### 原則

- PR Rv では **diff 取得に依存しない**。必要ファイルを **raw fetch** し、Issue 本文の **受け入れアサーション** を **標的 grep / コマンド** で検証する。
- **diff 取得失敗を Rv 省略の理由にしない**。失敗時は raw fetch に切り替え、それでも不可なら Issue/PR Comment で Naoya に報告して保留する（「見なかったことにする」は禁止）。
- **単一ファイルが約 235KB を超える PR**（例: 大型 `src/index.template.html`）では、diff の目視完走を前提にせず、**raw ファイルに対する grep / アサーション結果**で合否を判定する。
- 実装レポートの自己申告に ✅ を付けるだけの確認は **Rv とみなさない**。観点ごとに再検証の痕跡（実行したコマンド・出力要約）を Rv レポートに残す。

### 観点 13「CD 意匠再現度」との関係

- 構造・機能は本セクションの grep / アサーションで検証する。
- 視覚的忠実性は § 4（PR スクショ）および Naoya 実機と併用する。text-only の自己申告だけでは PASS にしない。

---

## 2. Issue 起票 — 宣言形の徹底

### 宣言形（必須）

Issue 本文の実装指示は **宣言形**で書く。

- ✅ 「この画面は状態 S で終わること」
- ✅ 「`#progressCard` はトップからタップ可能であること」
- ❌ 「X を追加せよ」（命令形）— **禁止**

宣言形は自己修正的である:

| 現状 | エージェントの解釈 |
|---|---|
| 要素が 0 | 追加して状態 S にする |
| 要素が 1（意匠不一致） | restyle / 配線修正して状態 S にする |
| 要素が 2 以上（重複） | 統合して状態 S にする |

### 削除系改修の「言及の掃討」3 種（必須）

機能・UI・キーを削除する Issue では、完了定義または受け入れアサーションに次の **3 種の掃討**を明示する:

1. **コード参照** — DOM id / 関数名 / イベント配線 / CSS セレクタ
2. **i18n キー** — 削除対象 key の 6 言語同期削除と `validate_i18n.py`
3. **機能を説明している散文** — About / README / LP / ガイド文面など、削除済み機能への言及

---

## 3. Issue 起票 — 受け入れアサーション欄

### 配置

「完了定義」セクションの **直下**に **「受け入れアサーション」** 欄を置く。

### 要件

- 各アサーションは **機械的に検証可能**であること（grep / コマンド出力 / 件数・数値比較 / md5）。
- 「見た目が良い」「自然」など主観のみの項目はアサーションにしない（スクショ対象リストや実機チェックに回す）。

### 実行義務

| 役割 | 義務 |
|---|---|
| Cursor / Codex | 実装後にアサーションを実行し、**結果を実装レポートに記載**する |
| Claude（Rv） | アサーションを **再実行**し、Cursor 報告と照合する。不一致は FAIL |

### 記載例

```markdown
## 受け入れアサーション

1. `rg -n 'id="progressCard"' src/index.template.html` が 1 件以上
2. `rg -n 'purposeGrid.*progressCard|progressCard.*addEventListener' src/index.template.html` でクリック配線が確認できる
3. `rg -n 'computeSrsQueue|guideModal' src/index.template.html` が 0 件
4. `python3 tools/validate_i18n.py` が hard error 0
```

---

## 4. PR 提出 — UI 改修のスクショ必須

### 適用条件

Change Pattern に **C6（Product behavior / UX）** を含む UI 改修 Issue。

### Cursor / Codex の義務

1. Issue 本文の **スクショ対象画面リスト**（必須記載）の全画面について、ローカルビルドまたは Preview 上のスクショを **PR Comment に添付**する。
2. 技術制約で添付できない場合は、その旨を PR Comment に明記し、**Naoya 実機検証を Claude Rv の前提**とする（黙って省略しない）。

### Claude Rv の義務

- スクショ添付（または上記の明示的代替）が無い UI 改修 PR は、構造検証が PASS でも **FAIL**。
- 観点 13「CD 意匠再現度」は、スクショ / 実機結果と受け入れアサーションの両方を見て判定する。

### Naoya 実機との順序

- Naoya 実機検証は Claude Rv の **後工程専用にしない**。
- **Claude Rv と並行**して実施する（Claude が PASS を出す前に Naoya が実機で見てよい）。

---

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-23 | Issue #145: Repo 初配置。Rv raw+grep、宣言形、受け入れアサーション、UI PR スクショ必須を追加 |
