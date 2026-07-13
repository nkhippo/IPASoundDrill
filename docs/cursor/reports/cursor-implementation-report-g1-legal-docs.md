# G1 Legal Documents — 実装レポート

## 関連 Issue / PR

- Issue: #56
- PR: #57（open）

## Issue 背景（Issue 本文から要約）

Track A ローンチ準備の Phase 6「法務」として、Product Hunt / Show HN / Reddit 等の英語圏公開時に提示できる Terms of Service と Privacy Policy を整備した。Vercel Web Analytics、Tally feedback form、LocalStorage を使う現行構成を Privacy Policy に明示し、Track A では All Rights Reserved のシンプルな権利表記を採用する方針を反映した。G2 の footer 法務リンク追加に進めるため、ルート直下で直接配信できる HTML ファイルとして追加した。

## 実装内容

- `terms.html` をルート直下に追加し、Terms of Service の 12 セクションを英語で作成
- `privacy.html` をルート直下に追加し、Privacy Policy の 13 セクションを英語で作成
- Vercel / Tally.so / Google Apps Script の第三者サービス利用を両ページに記載
- Privacy Policy に Vercel Web Analytics の Cookie 不使用、24-hour hash、`?va-disable=1` opt-out、LocalStorage key を記載
- `docs/LAUNCH-CHECKLIST.md` Phase 6 の G1 タスクを Issue #56 完了として更新
- Phase 6 の関連 Issue G1 を Issue #56 の URL に差し替え

## 変更ファイル

```text
- terms.html (A)
- privacy.html (A)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-g1-legal-docs.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショットとして 354 ファイルの md5 を `/tmp/issue-56/before-all.md5` に記録
- Phase 1: `terms.html` / `privacy.html` を新規追加し、単独コミット済み
- Phase 2: `docs/LAUNCH-CHECKLIST.md` の G1 該当箇所のみ更新し、単独コミット済み
- Phase 3: `/tmp/issue-56/after-phase2.md5` と比較し、変更が `terms.html` / `privacy.html` / `docs/LAUNCH-CHECKLIST.md` のみであることを確認
- Phase 4: 本レポートに Complexity Retrospective を記載
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認

- HTML 構造検証: `html` / `head` / `body` / `title` / viewport / canonical が存在することを Python `HTMLParser` で確認
- セクション数: `terms.html` の `<h2>` が 12、`privacy.html` の `<h2>` が 13 であることを確認
- 連絡先 URL: Tally URL は各ファイル 2 件以上、X URL は各ファイル 1 件以上であることを確認
- Privacy 必須記載: `Vercel Web Analytics`、`No cookies are used.`、`24-hour hash`、`?va-disable=1`、`app_lang`、`va-disable`、`ept_checks_v1`、`GDPR`、`CCPA` を確認
- ローカル HTTP: Python の一時 HTTP server で `/terms.html` / `/privacy.html` が 200 を返すことを確認
- 既存機能への影響: `src/index.template.html`、runtime data contract 8 パス、`i18n/`、`data/`、`scripts/`、`tools/`、`gas/` は未変更
- データ整合性: runtime data / i18n / wordlist 変更なしのため対象外

## 実装過程での気づき

- `docs/LAUNCH-CHECKLIST.md` の Phase 6 には旧案として「英・日」や `docs/legal/` 配置が残っていたが、Issue #56 が正本として英語版 root HTML のみを対象化していたため、G1 の 2 行と関連 Issue URL のみを最小変更した。
- この実行環境で利用可能な自動化 MCP は PR 作成と memory のみで、Issue Comment 投稿ツールは提供されていなかった。そのため Phase 報告はローカル記録と PR 本文に集約する。
- PR 作成前の Vercel Preview URL は未発行のため、Preview / Production での 200 確認は Naoya さんの PR レビュー時確認項目として残る。

## 後続への影響

- G2 で footer に `/terms.html` / `/privacy.html` へのリンクを追加できる。
- Track B の多言語法務ドキュメント対応時に、本英語版を基準文書として利用できる。
- 将来の OSS 化やライセンス変更判断時は、Terms の All Rights Reserved 記述を見直す必要がある。

## 残課題・申し送り

- Vercel Preview / Production での `/terms.html` / `/privacy.html` 200 確認は PR 作成後に実施。
- Naoya さんによる法務文面の目視レビューが必要。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規 HTML 2 ファイル追加と Category A の `docs/LAUNCH-CHECKLIST.md` 一部更新のみで、ランタイム契約・URL構造の再設計・ビルドシステム変更・UX実装変更は発生しなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C5, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への破壊的影響なし（新規静的 HTML の追加のみ）
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響は `docs/LAUNCH-CHECKLIST.md` の Issue 明示範囲内のみ
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 6（Phase 0-5）
- 実際の Phase 数: 6（Phase 0 snapshot、Phase 1 legal HTML、Phase 2 checklist、Phase 3 validation、Phase 4 retrospective、Phase 5 report/PR）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
