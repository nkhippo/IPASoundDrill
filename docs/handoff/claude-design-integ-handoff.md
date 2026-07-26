# Handoff: Claude Design 整合セッション（別チャット）

このファイルは、EPIC #169（AI-first ドキュメント再編）完了後に**別チャットで実施する「Claude Design 整合」作業**への引き継ぎ。前セッションの決定と、そこで意図的に先送りした 2 つの宿題を、次セッションが chat 文脈ゼロで着手できるよう自己完結で記す。記法は現行規約（front-matter 禁止・パス参照は backtick 相対パス・markdown link `[x](y)` は使わない＝CI V7 が弾く）に従う。

## 0. このセッションの目的

1. リポの設計ドキュメント（`docs/product.md` → `docs/features/<id>.md` → `docs/impact-ledger.json`）と、**Claude Design の参照資産 `docs/claude-design/`**（デザインの正・後述）との整合を取る。
2. **宿題 A: 画面 ID `3e` / `3f` / `3g` の再検討**（本 handoff の最重要項目・§2）。
3. **宿題 B: phonemes の `t:1` フラグの active-doc ホーム確定**（§3）。

EPIC #169 で確立した設計トレース／ゾーン規約／governance はそのまま前提。壊さず、その枠内で上記を解消する。

## 1. 現行アーキテクチャ（前提・EPIC #169 で確立済み）

- Tier 0 router: `CLAUDE.md`（常時ロード・約100行）。記法規約と feature ID レジストリの正本は `docs/_conventions.md`、概念→ホームの索引は `docs/doc-map.md`。
- 設計トレース: `docs/product.md`（WHY）→ `docs/features/<id>.md`（WHAT・1 ID 1ファイル）＋ `docs/features/_common.md`（横断挙動）＋ `docs/features/README.md`（ID レジストリ表）→ `docs/impact-ledger.json`（WHERE・source シンボルの blast-radius、`scripts/gen_impact_ledger.py` で再生成可能）。
- 直交リファレンス軸: `docs/data-contract.md` / `docs/tts-design.md` / `docs/pipeline.md` / `docs/repo-map.md` / `docs/history.md`。
- **凍結 12 feature ID**（`docs/_conventions.md` が正本）: `1a`, `2a`, `2b`, `2c`, `2d`, `3a`, `3b`, `3c`, `3d`, `3h`, `reveal`, `summary`。
- ソース単一ファイル: `src/index.template.html`（約5400行）。

## 2. ⚠️ 宿題 A: 3e / 3f / 3g の再検討（最重要）

### 2.1 Naoya の確定判断（2026-07-26）
`3e` / `3f` / `3g` は、旧 `docs/DESIGN.md` §0.1 の「13 concept 案」には在ったが、Issue B で凍結した **12 ID レジストリには含まれていない**。Naoya はこれらを **「(b) 登録漏れの現行機能（＝生きている機能だがレジストリに載せ忘れ）、退役ではない」** と判断した。よって本セッションで **features/`<id>`.md への昇格＋`docs/_conventions.md` のレジストリ拡張（12→拡張）を検討・実施**する。

### 2.2 ⚠️ 未解決の緊張（必ず先に解消せよ）
現行 `docs/history.md`（Issue E/D で書かれた歴史記録）L160 付近は、これらを **退役／統合済み**として framing しており、Naoya の「登録漏れ現行機能」判断と**食い違っている**。具体的には history.md はこう書く:
- `3e`（「IPA って何？」）= 独立画面として実装されず **guide モーダルに相当**。
- `3f`（言語設定）= **廃止済み**、実体は**ヘッダーの言語スイッチャーへ統合済み**。
- `3g`（オンボーディング）= 挙動は `docs/product.md` §2 の横断ポリシーに記載。

**次セッションの最初の仕事は、この食い違いを Naoya に確認して確定させること。** 「history.md の退役 framing」と「Naoya の登録漏れ判断」のどちらが各 ID の実態かを、実ソース `src/index.template.html` の該当挙動を根拠に 1 件ずつ判定する（3 つを一括で扱わない。3e/3f/3g で実態が異なる可能性が高い）。判定後にのみ、生きている ID を features へ昇格・レジストリ拡張し、退役なら history.md の記述を正として残す。

### 2.3 現在の内容の所在（昇格時の情報源）
- 旧 13 concept の歴史記録: `docs/history.md` §4 以下（旧 DESIGN §0.1「Frame ID 再採番」を移設した箇所）。
- `3f` の挙動: `docs/features/_common.md` に言語スイッチャー挙動として畳まれている。
- `3g` オンボーディング: `docs/product.md` §2 横断ポリシー。
- `3e`: 独立ホーム無し（guide モーダル相当と記述されるのみ）。

### 2.4 完了時に守るべき整合
昇格する場合、`docs/_conventions.md`（レジストリ）・`docs/features/README.md`（ID 表）・`docs/features/<id>.md`（新規）・`docs/doc-map.md`（索引）・必要なら `docs/impact-ledger.json`（該当シンボルの feature_ids 追記）を**同時に**整合させる。ID 追加は複数ファイル横断のため、consistency-auditor を最後に一度かけてドリフトゼロを確認。

## 3. 宿題 B: phonemes `t:1` フラグの active-doc ホーム

旧 `docs/SPECIFICATION.md` §6 にあった **phonemes の `t:1` フラグ**（音素データのフラグ）は、EPIC #169 の再編で **active-doc に移設ホームが無いまま**になっている（`docs/data-contract.md` は `i18n/phonemes/{lang}.json`（47記号）を高レベルに参照するのみで、`t:1` フラグの意味・使途を記していない＝確認済みギャップ）。本セッションで `t:1` の意味を実データ／ソースから確定し、`docs/data-contract.md`（phoneme スキーマの単一ホーム）に記載する。単独 Issue を切らず、この整合セッションに畳む（Naoya 合意済み）。

## 4. Claude Design 参照資産（整合対象の「デザインの正」）

`docs/claude-design/` サブツリー:
- `docs/claude-design/pc.dc.html` / `docs/claude-design/sp.dc.html` — PC/SP のデザインモックアップ（Claude Design 出力）。
- `docs/claude-design/design-system.dc.html` — デザインシステム。
- `docs/claude-design/DIVERGENCE.md` — 実装とデザインの乖離記録。
- `docs/claude-design/UPDATE-GUIDE.md` — 更新手順。
- `docs/claude-design/README.md` / `docs/claude-design/update-log.md`。

整合は「デザイン（`.dc.html`）↔ `docs/features/<id>.md`（WHAT）↔ 実装 `src/index.template.html`」の 3 者で取り、乖離は `DIVERGENCE.md` に記録する既存フローに従う。

## 5. 制約・ゾーン・governance

- ゾーン規約: 運用ゾーン（`.claude/**`, `CLAUDE.md`, `docs/**`, `.cursor/**`, `.github/**`）と開発ゾーン（`src/**`, `i18n/**`, `data/**`, `scripts/**`, `tools/**`, `gas/**`）を 1 PR で混在させない。3e/3f/3g 昇格は運用ゾーン（docs）中心。挙動確認で `src/` を読むのは可、変更するなら別 PR。
- 起票ルール・改修分類（Level×Pattern）・レビュー基準は `docs/workflow.md` / `docs/change-classification.md` / `docs/guardrails.md` が正本。ID 追加は複数 doc 横断のため L2 相当。
- CI validator は #184（PR #188）で **no-front-matter 規約に追従済み**（V1 は front-matter が在る場合のみ id 検査、V4/V5 は `docs/handoff/` 等 legacy prefix を除外、V7 の bare markdown-link 検査は現役）。**この handoff 自身も `docs/handoff/` 配下なので V4/V5 除外対象**だが、V7 は効くので本文に `[x](y)` を書かないこと。
- Track A（静的 HTML + JSON + GAS TTS）維持。React 化・BE 移管は Track B（ローンチ後）。

## 6. 着手時に読むべきファイル（順）

1. この handoff（`docs/handoff/claude-design-integ-handoff.md`）
2. `docs/_conventions.md`（レジストリ正本・記法規約）、`docs/features/README.md`（現行 12 ID 表）
3. `docs/history.md` §4 付近（3e/3f/3g の退役 framing — §2.2 の緊張の一方）
4. `docs/product.md` §2、`docs/features/_common.md`（3g / 3f の現行記述）
5. `docs/claude-design/pc.dc.html` / `sp.dc.html` / `DIVERGENCE.md`（デザインの正）
6. `docs/data-contract.md`（phoneme スキーマのホーム — 宿題 B の記載先）
7. 実挙動の根拠として `src/index.template.html`（3e/3f/3g 該当箇所・phoneme `t` フラグの使用箇所）

## 7. 完了定義（このセッション）

- 3e/3f/3g の各々について「生きている機能／退役」を実ソース根拠で Naoya と確定し、history.md の framing と矛盾のない状態にする。
- 生きている ID は `docs/features/<id>.md` 新規＋`docs/_conventions.md` レジストリ＋`docs/features/README.md`＋`docs/doc-map.md`（＋必要なら impact-ledger）を同時整合。
- phoneme `t:1` フラグの意味を `docs/data-contract.md` に記載（ホーム確定）。
- 最後に consistency-auditor を 1 回かけ、design↔features↔ledger↔registry のドリフトゼロを確認。
- CI（validate-markdown-refs）緑・新規 V7 FAIL ゼロ。

---
_前セッション（EPIC #169 実行）からの引き継ぎ。作成 2026-07-26。_
