# bug-knowledge — バグ根本原因ナレッジ

このファイルは PR マージ済み Bug Issue の**根本原因**と**再発防止策**を集積するナレッジベースです。

- 記入者: Cursor（Bug Issue 完了時、PR に含めるか直後の docs PR で追記）
- 参照者: Claude / Cursor（Track B 開始後の月次 Opus レビューで分析対象）
- フォーマット: 下記「記録フォーマット」に従うこと

---

## 発生層分類（monorepo 化、EPIC #209 以降）

バグ Issue には根本原因カテゴリとは別軸で「発生層」を記録する（複数該当可）。monorepo 4 ゾーン（`apps/web/`, `apps/mobile/`, `packages/core/`, `tools/`）のうち、バグが**発生した層**を特定することで、web-only / mobile-only / shared の傾向を追跡できるようにする。

| 発生層 | 定義 | 対応ゾーン |
|---|---|---|
| `web` | Web（ブラウザ）のみで発生 | `apps/web/` |
| `mobile-ios` | Mobile iOS のみで発生 | `apps/mobile/`（iOS ビルド） |
| `mobile-android` | Mobile Android のみで発生 | `apps/mobile/`（Android ビルド） |
| `core` | 共有ロジック・データ起因（web/mobile 両方に波及しうる） | `packages/core/` |
| `shared` | 発生自体は単一 platform だが原因が `core` 契約にあり、他 platform にも波及する | `packages/core/` + 消費側 |

Mobile 未実装の期間（EPIC-06/EPIC-07 完了前）は `mobile-ios` / `mobile-android` は該当なし。

## 根本原因カテゴリ定義

Bug Issue の「根本原因記録」テーブルで選択するカテゴリ:

| カテゴリ | 定義 | 典型例 |
|---|---|---|
| **仕様書の粒度不足** | 仕様書に書かれていない・曖昧な仕様が実装ばらつきを生んだ | 「音の距離」の閾値が仕様書に数値で書かれていない |
| **データ整合性エラー** | JSON データの内部矛盾、フィールドの欠落・重複 | `rp_ipa` が空、`neighbors` に自分自身が含まれる |
| **TTS/GAS 起因** | Google Apps Script 側のデプロイ・キャッシュ・パラメータ問題 | Batch Warm が新規語彙をカバーしていない |
| **i18n 漏れ** | 6言語のうち一部で key が欠落、または翻訳誤り | `guide.json` の `zh-Hans` が英語のまま |
| **ランタイム契約の破壊** | `apps/web/src/index.template.html`（Web）/ `apps/mobile/src/`（Mobile、実装後）が期待するパス・スキーマから逸脱 | 移動されたファイルパスの参照残存 |
| **テスト不足** | 手動テストで見落とされたエッジケース | 特定 CEFR + アクセント切替の組み合わせでクラッシュ |
| **その他** | 上記に当てはまらないもの | ブラウザ固有の挙動、依存ライブラリのバグ |

---

## 記録フォーマット（Cursor 用）

新しい記録は**このファイル末尾**（`<!-- 新しい記録は末尾に追加する -->` の後）に追記する。

```markdown
### YYYY-MM-DD — <bug の簡潔な要約>

- **Issue**: #NNN
- **PR**: #MMM
- **症状**: （どんな状況で何が起きたか、1-2行）
- **発生層**: （`web` / `mobile-ios` / `mobile-android` / `core` / `shared`、複数可）
- **発生プラットフォームの詳細**: （iOS SDK バージョン / Web ブラウザ / Node バージョン等、該当するもの）
- **直接原因**: （コードレベルで何が問題だったか）
- **根本原因**: （なぜその直接原因が生まれたか、構造的理由）
- **根本原因カテゴリ**: （上記カテゴリから1つ選択）
- **修正箇所**: （`core` 側修正 / app 側修正〔`apps/web` or `apps/mobile`〕のいずれか、または両方）
- **再発防止策**: （実施した対応。CLAUDE.md 更新、テスト追加、監視追加など。なければ「なし」）
- **影響範囲**: （どのモード / どのユーザー層に影響したか）

---
```

---

## 月次レビュー観点（発生層追加、EPIC #209 以降）

`docs/workflow.md` §12 Bug 対応ループの月次レビュー時、根本原因カテゴリの偏りに加えて以下を確認する:

- **プラットフォーム偏り**: 「発生層」が特定 platform（例: `mobile-ios` のみ）に偏っていないか。偏りがあれば当該 platform のテスト・レビュー体制強化を検討
- **core 起因の波及**: `core` / `shared` 発生層のバグが `apps/web` と `apps/mobile` の両方に実際に波及したか（`docs/impact-ledger.json` の `caller_areas` と突き合わせ）

## 集積された記録

<!-- 新しい記録は末尾に追加する -->

（ローンチ後に蓄積される予定。Track A 期間中は基本的に空。）
