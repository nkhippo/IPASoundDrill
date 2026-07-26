# change-classification.md — Level × Pattern 判定の正本

Issue 起票時に **Complexity Level（L1–L3）× Change Pattern（C1–C7）** を判定し、参照ドキュメント・レビュー深度・デグレ点検の運用を機械的に決める唯一のホーム（`docs/guardrails.md` の md5/レビュー段階化、`docs/workflow.md` の Issue 起票フローはこの分類結果を前提に動く）。

## 1. 設計原則

1. **明文化優先**: ルールに無いことは実装エージェントが推論で埋めない（未定義 → halt）
2. **質的判定**: 行数・ファイル数の定量境界に依存せず、性質で Level を決める
3. **複数 Pattern**: 1 Issue に複数 Pattern を付与してよい（主副の区別なし）
4. **Level 基本 + Pattern 重ね掛け**: 基本ルールは Level（§4）、追加義務は Pattern（§3）。重複時は最厳格側を採用

## 2. Complexity Level（L1 / L2 / L3）

判定は Issue 起票者（Claude）が行い、**判定根拠を 1–2 行で必ず書く**。境界が曖昧なときは**上位を選ぶ**（L1↔L2 → L2、L2↔L3 → L3）。

| Level | 判定条件 | 代表例 |
|---|---|---|
| **L1**（軽微） | 次の 3 条件を**すべて満たす**: ①単一関心（Runtime/i18n schema/URL/ビルド等の別系統契約に触れない）②構造非破壊（ファイル移動・ディレクトリ新設・ビルド導入・運用フロー改変を含まない）③既存の軽量チェック（目視 / 既存 validate）で完了確認できる | 文言 1 箇所修正、既存キーへの値差し替えのみ、単一 docs の誤記修正 |
| **L2**（通常） | L1 の 3 条件を満たさず、L3 の該当条件にも当たらない。複数ファイルの整合が必要、運用ドキュメントの内容更新（フロー再設計ではない）、既存アーキテクチャ維持のままの機能追加等 | i18n `meta` 追加、OPERATIONS への rollback 手順追記、単一機能の UI 改善 |
| **L3**（大規模） | 次の 4 条件の**いずれか 1 つ以上**: ①AI 協業フローの再設計（`CLAUDE.md` / `workflow.md` / `guardrails.md` の実装ゲートを変更）②ビルド/ホスティングの初導入・転換 ③構造移動（公開 URL 構造変更、大規模ファイル移動・分割）④複合システム変更（フロント・データ契約・インフラ・docs をまたぐ大規模改修） | ガバナンス統合（本ファイル自身の作成 Issue）、SEO サブディレクトリ化、React 化 |

境界曖昧 → 上位 Level。判定根拠の省略禁止。実装中に実態が乖離したら Complexity Retrospective（`docs/guardrails.md`）で昇格/降格を提案し、勝手に続行しない。

## 3. Change Pattern（C1–C7）

複数選択可（主副なし）。Issue 本文の分類ブロックに該当コードをすべて列挙する。

| Code | 名称 | 定義 | 代表例 |
|---|---|---|---|
| **C1** | Docs / behavior-invariant | プロダクト実行時の挙動を変えず、ドキュメント・ルール・レポート・文言正本のみを更新 | LAUNCH-CHECKLIST 刷新、governance 統合、実装レポート追加、誤記修正 |
| **C2** | Infra / deploy / tooling | ホスティング・CI・Secrets・Analytics・ビルド設定・運用手順など実行基盤 | Vercel Analytics 有効化、`vercel.json`、OPERATIONS rollback、GAS 再デプロイ |
| **C3** | Structure / URL / artifact layout | パス配置・公開 URL・生成物ディレクトリなど「どこに何があるか」を変える | `/en/` 等サブディレクトリ、テンプレート化移動、生成物の gitignore |
| **C4** | Stack / framework | 言語・FW・モジュール境界など技術スタックの転換 | React + Vite 化、TypeScript 導入、BE 化、状態管理ライブラリ導入 |
| **C5** | Runtime data / schema contract | wordlist / connected / weak / guide / i18n schema / ランタイム契約 8 パスの契約変更 | wordlist フィールド追加、i18n 新トップレベルキー、GAS TTS 契約変更 |
| **C6** | Product behavior / UX | ユーザー可視の機能・画面フロー・採点・モード挙動の変更 | 新練習モード、Reveal UI 変更、TTS prefetch 挙動、設定モーダル追加 |
| **C7** | Structural refactoring（AI readability） | 動作不変を前提に、ファイル分割・フォルダ再編・命名整理で AI/人間の可読性を上げる | docs 再編（本ファイル自身）、scripts のモジュール分割、重複 MD 統合 |

複数選択の例: React 化（Track B）= **L3 × [C4, C3]**、本ファイル作成 Issue = **L3 × C7**。

## 4. ルール適用方式・Level 別基本ルール表

1. Level の基本ルール（下表）を適用する
2. 付与された各 Pattern の追加ルール（§5）を重ねる
3. 同じ項目で衝突したら最厳格を採る（例: Recon「任意」と「必須」→ 必須、レビュー「PASS で足りる」と「Naoya ack 必須」→ Naoya ack 必須）

| Level | 参照ドキュメント（最低限） | Pre-Issue Recon | レビュー体制 | デグレ点検 |
|---|---|---|---|---|
| **L1** | Issue 本文 | 不要 | CI 緑 + セルフチェック（auto-merge 可） | ホワイトリスト外不変（目視） |
| **L2** | 上記 + `docs/guardrails.md` | 推奨（曖昧・100 行超見積もり時） | `pr-reviewer` PASS（auto-merge 可） | md5 不要、完了定義の動作確認 |
| **L3** | 上記 + 本ファイル、`docs/data-contract.md`（該当時） | 原則必須（構造・ビルド・大規模変更） | フル Rv（`docs/guardrails.md` の 12 観点）+ **Naoya ack 必須**（auto-merge しない） | md5 スナップショット + 契約/URL/ビルド観点 + Complexity Retrospective |

Track ラベル（`launch-blocker` / `track-b`）は本軸の外で管理する。

## 5. Pattern 別追加ルール表

| Pattern | 参照追加 | 検証追加 | その他追加 |
|---|---|---|---|
| **C1** | `docs/guardrails.md` | md5 でホワイトリスト外不変、相互リンク健全性 | 実装レポートに「Issue 背景」「後続への影響」必須 |
| **C2** | `docs/OPERATIONS.md`、`docs/repo-map.md`（作成後） | デプロイ/設定の手動確認項目を完了定義に明記 | rollback・Secrets 手順の有無を Issue に書く |
| **C3** | `docs/repo-map.md`（作成後）、`.gitignore` | 旧パス参照の grep、生成物の存在確認、URL 200 確認 | パス移動は Issue で明示。暗黙移動禁止 |
| **C4** | `docs/product.md` / `docs/features/<id>.md`、Track B メモ | ビルド成功、主要画面の回帰、依存 lockfile の意図的更新 | Track B ラベル必須。Phase 分割前提 |
| **C5** | `docs/data-contract.md`（作成後） | `validate_i18n` / wordlist 集計 / 契約パスの不変 or 意図的更新の証明 | 契約変更は完了定義に「前後値」を書く |
| **C6** | 該当 `docs/features/<id>.md` | ブラウザ手動確認、（該当時）多言語 UI・TTS、スクショ対象画面リスト明示（`docs/workflow.md`） | 非対象範囲で触らないモードを明示 |
| **C7** | `docs/doc-map.md` | 動作不変の証明、参照リンク更新漏れゼロ（grep 検証） | 月次レビュー候補として記録 |

## 6. Issue 本文の必須メタデータブロック

Issue 起票時、本文冒頭に次を**必ず**含める。欠落・`TBD`・`未定義` がある Issue は実装エージェントが着手してはならない。

```markdown
## 改修分類

- **Complexity Level**: L2
- **Change Pattern**: C1, C5
- **判定根拠**: （1–2 行。なぜその Level / Pattern か）
- **Pre-Issue Recon**: 不要 / 実施済み（Issue #XX）/ 実施予定
- **Level 昇格・降格履歴**: なし / （あれば経緯）
```

UI 改修 Issue では CD（Claude Design）修正判定（A. CD 修正必須 / B. CD 意図的乖離 / C. CD 修正不要、`docs/guardrails.md` § CD 判定）も同ブロックに追記する。

## 7. Level 昇格・降格運用

Retrospective の実施手順・テンプレートは `docs/guardrails.md`（Complexity Retrospective）が正本。ここでは結果の扱いのみ定義する。

| 判定 | 意味 | 次アクション |
|---|---|---|
| 事前分類妥当 | Level / Pattern が実態と一致 | PR 作成可 |
| 昇格提案 | 実態がより重い（例: L2→L3） | PR 作成せず halt（Issue Comment で中断）。Naoya 承認後に再開 |
| Pattern 追加提案 | 既存 C1–C7 で表現できない性質 | 同上。§8 の追加フローへ |

降格提案（過大見積もり）は記録してよいが続行は可。次回起票の精度改善に使う。承認後は Issue の改修分類ブロックを更新し、§4 の上位 Level ルール（Recon・レビュー）を満たすよう補強する。

## 8. 新パターン追加フロー

同種の「既存 C1–C7 に収まらない」案件が**2 回以上**出現したとき、Claude が Pattern 追加 Issue を提案する（**L2 × [C1, C7]** として扱う）。新 Pattern の定義には以下 5 項目を含める: ①定義（対象/対象外）②代表例 3–5 個 ③参照追加ドキュメント ④デグレ点検基準 ⑤堅固化強度の目安。

## 9. 拡張性

- **Level 追加**: 原則不要。L1–L3 の 3 段階を固定し、新たな段階が必要に見えても Pattern 追加（§8）と §4/§5 のセル調整で吸収する
- **Pattern 追加**: 数ヶ月〜1 年に 1 回想定。§8 のフローでのみ追加
- **運用ルール調整**: 月次レビュー（§10）で §4/§5 のセルを見直し、別 Issue（通常 L2 × C1）で更新

## 10. 月次レビュー観点

| 観点 | 見るもの | アクション例 |
|---|---|---|
| 分類判定精度 | 起票時 Level と Retrospective 結果の一致率 | 境界事例を §2 に追記 |
| 誤判定率 | 昇格提案の発生率、Naoya による分類差し戻し | 代表例の更新 |
| Pattern 網羅性 | 「どれにも当てはまらない」の発生 | §8 トリガー |
| C7 候補 | `index.html` 肥大、docs 重複、レジストリと実態の乖離 | C7 Issue 起票（`docs/doc-map.md` 経由） |

---

_旧 `docs/CHANGE-CLASSIFICATION.md`（Issue #33 導入）を整理継承。Category A–F 体系は `docs/doc-map.md` レジストリ + `CLAUDE.md` タスク種別対応表に統合されたため本ファイルでは扱わない。_
