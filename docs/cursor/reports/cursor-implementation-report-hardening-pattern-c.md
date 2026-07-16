---
id: pj-2026-07-12-4f38
aliases:
- pj-2026-07-12-4f38
title: Hardening pattern C — 実装レポート
created: '2026-07-12'
---
# Hardening pattern C — 実装レポート

## 関連 Issue / PR

- Issue: #35
- PR: #36

## Issue 背景（Issue 本文から要約）

Issue #33 で CHANGE-CLASSIFICATION が正本化した後、F2（SEO サブディレクトリ + プリレンダリング）を安全に進める前提として、ファイル移動とビルドシステム初導入向けの堅固化パターン C が必要になった。既存パターン A/B では「物理移動」「単一入力→複数出力」を扱えないため、DEV-GUARDRAILS に Phase 0–6 と大規模改修用セルフチェックリストを追加する。あわせて Issue #33 本文で起きた Phase 番号誤植の再発防止として、CLAUDE.md に連番記述ルールを追記する。

## 実装内容

- `docs/DEV-GUARDRAILS.md` に § 3-alt（堅固化パターン C: 適用条件・A/B 使い分け・Phase 0–6）を追加
- 同ファイルに § 10（大規模改修用セルフチェックリスト 6 カテゴリ、Issue Comment 用テンプレート）を追加
- `docs/CURSOR-INSTRUCTION-GUIDE.md` § 1「極低」行と脚注にパターン C / § 3-alt 参照を追記
- `docs/LAUNCH-CHECKLIST.md` Phase 1 完了マークと Phase 5「先行 1」に Issue #35 URL を記録
- `CLAUDE.md`「Issue 起票時のルール」に Phase 番号明確化ルールを追記

## 変更ファイル

```
- docs/DEV-GUARDRAILS.md (M)
- docs/CURSOR-INSTRUCTION-GUIDE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- CLAUDE.md (M)
- docs/cursor/reports/cursor-implementation-report-hardening-pattern-c.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット、全ファイル 347 個の md5 ハッシュ記録（`/tmp/issue-35/before-all.md5`）
- Phase 2–4: ホワイトリスト 4 ファイルのみ編集（コミット分離どおり）
- Phase 5: `before-all.md5` vs `after-phase4.md5` — 差分は上記 4 ファイルのハッシュ差のみ
- ブラックリスト不変（`git diff main` で 0 行）: `index.html`、`wordlist_GA_a1a2_plus_phonics.json`、`docs/CHANGE-CLASSIFICATION.md`、`.cursor/rules/dev-flow.mdc`
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

### grep 確認結果（Issue 指定）

```
docs/DEV-GUARDRAILS.md:60:## 3-alt. 堅固化パターン C: ...
docs/DEV-GUARDRAILS.md:75:- パターン C: ...
docs/DEV-GUARDRAILS.md:79:**Phase 構成**（Phase 0-6 の 7 段階。...
docs/DEV-GUARDRAILS.md:169:## 10. 大規模改修用セルフチェックリスト
docs/CURSOR-INSTRUCTION-GUIDE.md:15: ...堅固化パターン C 適用**
docs/CURSOR-INSTRUCTION-GUIDE.md:17: ...パターン C 適用、`docs/DEV-GUARDRAILS.md` § 3-alt）。
CLAUDE.md:635:**Phase 番号の記述**: ...
docs/LAUNCH-CHECKLIST.md:32: ...§ 3-alt パターン C + § 10 ...
docs/LAUNCH-CHECKLIST.md:146: ...hardening pattern C...
```

## 動作確認

- Markdown 内部リンク（`docs/DEV-GUARDRAILS.md` § 3-alt）: 参照先は本 Issue で追加した節と一致
- § 3-alt Phase 0–6 の bash ブロック: 構文上コピペ可能な形で記載
- § 10 セルフチェックリスト: Cursor が Issue Comment に貼れる markdown テンプレート形式
- 既存機能への影響: なし（docs のみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue 本文の § 3-alt / § 10 はほぼコピペ可能な完全仕様だったため、既存 § 1–9 を触らず挿入だけで完了できた
- CURSOR-INSTRUCTION-GUIDE 脚注は Issue #33 時点で「パターン C 適用」まで入っていたが、§ 3-alt パス参照とマトリックス「極低」行の追記が本 Issue の差分
- Phase 6 の Claude Rv は Issue 仕様どおり「L3 適用時は必須」と明記し、非 L3 でパターン C のみの場合は Naoya 目視承認後マージと整理した（Issue 本文の「L3 のため必須」と整合）

## 後続への影響

- F2 および先行 Issue 2（OPERATIONS への Vercel Build rollback）がパターン C / OPERATIONS 追記を参照できる
- L3 × C3 を含む今後の Issue で Phase 0–6 + § 10 を機械的に適用可能
- Track B（React 化等）でもパターン C を再利用可能

## 残課題・申し送り

- LAUNCH-CHECKLIST の `PR #YY` は本 PR 番号確定後に置換（同一 PR 内）
- OPERATIONS.md への rollback 手順は先行 Issue 2 の範囲（本 Issue 対象外）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: Category A 既存ファイルへの § 追加（並列オプション追加）であり、フロー自体の再設計やランタイム変更は含まない。影響はホワイトリスト 4 ファイルに閉じ、相互依存も発生しなかった。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（既存 DEV-GUARDRAILS / CURSOR-GUIDE / LAUNCH-CHECKLIST / CLAUDE.md への追記のみ。DOCUMENT-MAP / CHANGE-CLASSIFICATION / dev-flow は不変）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 8（Phase 0–7）
- 実際の Phase 数: 8（スナップショット → grep → DEV-GUARDRAILS → CURSOR-GUIDE → LAUNCH/CLAUDE → md5 → Retrospective → レポート/PR）
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
