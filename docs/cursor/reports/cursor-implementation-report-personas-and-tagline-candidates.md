# PURPOSE ペルソナ・ジャーニー + タグライン候補 — 実装レポート

## 関連 Issue / PR

- Issue: #63
- PR: #67

## Issue 背景（Issue 本文から要約）

Phase 0 UI/UX 抜本見直しの kickoff 後、Claude Design（Phase 1）向け入力資料の「誰に」を補強する必要があった。Vault にあるペルソナ P-1〜P-5 と Learning Journey を `docs/PURPOSE.md` に公開要約として追記し、CLAUDE.md に散在していたタグライン仮案を `docs/design/tagline-candidates.md` に独立化。コード変更なし、既存 PURPOSE 本文は変更せず末尾追記のみ。

## 実装内容

- `docs/PURPOSE.md` に **Personas & Learning Journey** セクションを `## 変更履歴` の直前に追加（P-1〜P-5、5 段階ジャーニー、Vault 参照注記）
- `docs/design/` 新規作成、`tagline-candidates.md` を Issue 指定全文で配置（英日候補・感情マトリクス・6 言語メモ・Phase 1 テスト戦略）
- `docs/REPOSITORY-STRUCTURE.md` — `docs/design/` を正本表・ディレクトリツリーに反映
- `docs/DOCUMENT-MAP.md` §2 Category C/D に `docs/design/` 行を追加

## 変更ファイル

```
- docs/PURPOSE.md (M)
- docs/design/tagline-candidates.md (A)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/cursor/reports/cursor-implementation-report-personas-and-tagline-candidates.md (A)
```

## デグレ防止検証

- Runtime / i18n / wordlist / `src/index.template.html`: 未変更
- `docs/PURPOSE.md` 既存セクション（§0–5、Phase 履歴）: diff 上追加ブロックのみ
- `tagline-candidates.md` サイズ: ~7 KB（Issue 目標内）
- 実装中の自己判断による追加変更: 0 件（`docs/README.md` / `CLAUDE.md` は Issue 非対象のため未触）

## 動作確認

- Markdown 構造: PURPOSE 新セクション・tagline テーブルは GitHub 互換形式
- REPOSITORY-STRUCTURE / DOCUMENT-MAP の `docs/design/` 記述が相互整合
- データ整合性: 対象外（docs-only）

## 残課題・申し送り

- CLAUDE.md からタグライン仮案を削除してスリム化 → **別 Issue**（本 Issue 非対象）
- Vault 詳細版（user-personas.md 等）の IPA repo 複製は Phase 1 状況次第

## 今後の派生 Issue 候補

- `chore: CLAUDE.md タグライン仮案を tagline-candidates.md へ一本化（削除）`
- Phase 1 Claude Design ブリーフから `docs/design/` を §9 References に明示リンク

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L1
- 実装後の妥当性判定: **妥当**
- 判定根拠: 新規 MD 1 + PURPOSE 追記 + Category A 索引 2 ファイル。アプリコード不変。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1（A 新規 + B 意図的編集）
- 実装中に追加 Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし
- [x] Category A: REPOSITORY-STRUCTURE / DOCUMENT-MAP のみ意図的更新
- [x] PURPOSE 既存意味変更なし（追記のみ）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 不明点
- Issue 本文は `## History` 前追記と記載。正本は `## 変更履歴` のためそこに挿入（意図一致）
