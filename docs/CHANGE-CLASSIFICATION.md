# CHANGE-CLASSIFICATION — 改修分類の正本

> **Last updated**: 2026-07-12（Issue #33 導入）
> **Purpose**: Issue 起票時に Complexity Level × Change Pattern を判定し、参照ドキュメント・堅固化・Recon・レビュー・デグレ点検の運用ルールを機械的に決定する。明文化されない事項を Cursor の推論に委ねないための上位軸。

---

## 1. 目的とスコープ

### 1.1 位置づけ

本ドキュメントは、既存ガードレール群を横断的に結合する **改修分類の正本** である。

| 既存資産 | 本ドキュメントとの関係 |
|---|---|
| `docs/DEV-GUARDRAILS.md` | 堅固化パターン A/B（将来 C）の適用条件を Level / Pattern から決定 |
| `docs/CURSOR-INSTRUCTION-GUIDE.md` | § 1 抽象度マトリックスは本 § 2 に統合（歴史節として保持） |
| `docs/DOC-SYNC-PLAYBOOK.md` | Pattern が docs 同期を含む場合の 3 分岐に接続 |
| `docs/DOCUMENT-MAP.md` | Category A–E の更新義務・参照タイミングに接続 |
| `.cursor/rules/dev-flow.mdc` | Step 3b（Complexity Retrospective）と PR Description 必須フィールドに接続 |
| `CLAUDE.md` | Issue 起票時の分類ブロック必須に接続 |

### 1.2 スコープ

- **対象**: 今後起票する全 Issue（Track A / Track B、全ラベル）
- **非対象**: 既存 Open/Closed Issue への遡及追記、GitHub Projects Custom Fields の GUI 設定（Naoya 手動）

### 1.3 設計原則

1. **明文化優先**: ルールに無いことは Cursor が推論で埋めてはならない（未定義 → 中断）
2. **質的判定**: 行数・ファイル数の定量境界に依存せず、性質で Level を決める
3. **複数 Pattern**: 1 Issue に複数 Pattern を付与してよい（主副の区別なし）
4. **Level 基本 + Pattern 重ね掛け**: 基本ルールは Level、追加義務は Pattern。重複時は最厳格側を採用

---

## 2. 軸 1 — Complexity Level（L1 / L2 / L3）

判定は Claude が Issue 起票時に行い、**判定根拠を 1–2 行で必ず書く**。境界が曖昧なときは **上位を選ぶ**（L1↔L2 → L2、L2↔L3 → L3）。

### 2.1 L1（軽微）

次の **3 条件をすべて満たす** ときのみ L1:

1. **単一関心**: 変更の目的が 1 つに限定され、別系統の契約（Runtime / i18n schema / URL / ビルド）に触れない
2. **構造非破壊**: ファイル移動・ディレクトリ新設・ビルド導入・Category A の開発フロー改変を含まない
3. **既存検証で足りる**: 追加の堅固化プロトコルや Pre-Issue Recon なしで、既存の軽量チェック（目視 / 既存 validate）で完了を確認できる

代表例: 文言 1 箇所修正、既存キーへの値差し替えのみ、単一 docs の誤記修正（Category A 以外）。

### 2.2 L2（通常）

L1 の 3 条件を満たさないが、L3 の該当条件にも当たらないもの。典型:

- 複数ファイルの整合が必要（i18n 6 言語、docs 連動更新など）
- Category A の **内容更新**（フロー自体の再設計ではない）を伴う
- 運用手順（OPERATIONS）や設定の追加で、既存アーキテクチャは維持
- DOC-SYNC や実装レポート整備など、AI 協業品質に関わるが構造転換ではない

代表例: i18n `meta` 追加（Issue #25）、OPERATIONS への rollback 手順追記、単一機能の UI 改善。

### 2.3 L3（大規模）

次の **4 条件のうち 1 つ以上** に該当すれば L3:

1. **AI 協業フローの再設計**: Category A に新規正本を追加する、または `CLAUDE.md` / `dev-flow.mdc` の実装 Step・必須ゲートを変更する
2. **ビルド / ホスティングの初導入・転換**: `package.json` / Vercel Build / 生成 HTML など、配信パイプラインの性質が変わる
3. **構造移動**: ランタイムエントリや公開 URL 構造の変更（例: 単一 `index.html` → `/en/` 等サブディレクトリ）、大規模なファイル移動・分割
4. **複合システム変更**: フロント・データ契約・インフラ・docs をまたぎ、Phase 分割または堅固化パターン C（導入後）が必要な規模

代表例: 本 Issue（#33）、SEO サブディレクトリ + プリレンダリング（F2）、React 化。

### 2.4 判定原則（再掲）

- 境界曖昧 → 上位 Level
- 判定根拠の省略禁止
- 実装中に実態が乖離したら Step 3b（Complexity Retrospective）で昇格 / 降格を提案し、勝手に続行しない

---

## 3. 軸 2 — Change Pattern（C1–C7）

**複数選択可**（主副なし）。Issue 本文の分類ブロックに該当コードをすべて列挙する。

| Code | 名称 | 定義 | 代表例（3–5） |
|---|---|---|---|
| **C1** | Docs / behavior-invariant | プロダクト実行時の挙動を変えず、ドキュメント・ルール・レポート・文言正本のみを更新する | LAUNCH-CHECKLIST 刷新、DOCUMENT-MAP 更新、本 Issue、実装レポート追加、誤記修正 |
| **C2** | Infra / deploy / tooling | ホスティング・CI・Secrets・Analytics・ビルド設定・運用手順など実行基盤を触る | Vercel Analytics 有効化手順、`vercel.json`、OPERATIONS rollback、GAS 再デプロイ手順、GitHub Secrets |
| **C3** | Structure / URL / artifact layout | パス配置・公開 URL・生成物ディレクトリなど「どこに何があるか」を変える | `/en/` 等サブディレクトリ、`index.html` のテンプレート化移動、`src/` 新設、生成物の gitignore |
| **C4** | Stack / framework | 言語・FW・モジュール境界など技術スタックの転換 | React + Vite 化、TypeScript 導入、BE Railway 化、状態管理ライブラリ導入 |
| **C5** | Runtime data / schema contract | wordlist / connected / weak / guide / i18n schema / Runtime data contract 8 パスの契約変更 | wordlist フィールド追加、i18n 新トップレベルキー、phonemes schema 変更、GAS TTS 契約変更 |
| **C6** | Product behavior / UX | ユーザー可见の機能・画面フロー・採点・モード挙動の変更 | 新練習モード、Reveal UI 変更、TTS prefetch 挙動、設定モーダル追加 |
| **C7** | Structural refactoring (AI readability) | 動作不変を前提に、ファイル分割・フォルダ再編・命名整理で AI / 人間の可読性を上げる | `index.html` の論理分割準備、docs 再編、scripts のモジュール分割、重複 MD 統合 |

### 3.1 複数選択の例

- F2（予定）: **L3 × [C3, C2]**（URL/生成物 + Vercel Build）
- React 化（Track B）: **L3 × [C4, C3]**
- Sentry 導入（Track B）: **L2 × C2**
- 本 Issue: **L3 × C1**

---

## 4. ルール適用方式

1. **Level の基本ルール**（§ 6）を適用する
2. 付与された各 **Pattern の追加ルール**（§ 5）を重ねる
3. 同じ項目で衝突したら **最厳格** を採る（例: Recon「任意」と「必須」→ 必須、堅固化 A と B → B、レビュー「任意」と「Claude Rv 必須」→ 必須）

Track ラベル（`launch-blocker` / `track-b`）は本軸の外で管理する（本ドキュメントでは扱わない）。

---

## 5. Pattern 別追加ルール表

| Pattern | 参照追加 | 検証追加 | その他追加 |
|---|---|---|---|
| **C1** | DOCUMENT-MAP、DEV-GUARDRAILS、（docs 同期時）DOC-SYNC-PLAYBOOK | md5 でホワイトリスト外不変、相互リンク健全性 | 実装レポートに「Issue 背景」「後続への影響」必須 |
| **C2** | OPERATIONS、REPOSITORY-STRUCTURE（Runtime infra） | デプロイ / 設定の手動確認項目を完了定義に明記 | rollback・Secrets・Dashboard 手順の有無を Issue に書く |
| **C3** | REPOSITORY-STRUCTURE（Directory tree / Runtime contract）、`.gitignore` | 旧パス参照の grep、生成物の存在確認、URL 200 確認 | パス移動は Issue で明示。暗黙移動禁止 |
| **C4** | DESIGN / SPECIFICATION、Track B スコープメモ | ビルド成功、主要画面の回帰、依存 lockfile の意図的更新 | Track B ラベル必須。Phase 分割を前提に検討 |
| **C5** | REPOSITORY-STRUCTURE（Runtime data contract / i18n schema）、SPECIFICATION | `validate_i18n` / wordlist 集計 / 契約パスの不変 or 意図的更新の証明 | 契約変更は完了定義に「前後値」を書く |
| **C6** | PURPOSE / DESIGN / SPECIFICATION、該当 JS map | ブラウザ手動確認、（該当時）多言語 UI、TTS | 非対象範囲で触らないモードを明示 |
| **C7** | REPOSITORY-STRUCTURE、DOCUMENT-MAP、DOC-SYNC-PLAYBOOK | 動作不変の証明（既存テスト観点の再実施）、参照リンク更新漏れゼロ | Category E 候補として月次レビューに載せる |

---

## 6. Level 別基本ルール表

| Level | 参照ドキュメント（最低限） | 堅固化パターン | Recon 要否 | レビュー体制 | デグレ点検 |
|---|---|---|---|---|---|
| **L1** | Issue 本文、必要なら SPEC の該当節 | A（新規のみ）または B の軽量（単一ファイル編集） | 不要 | Naoya 目視（通常） | ホワイトリスト外 md5 不変 |
| **L2** | 上記 + DEV-GUARDRAILS、REPOSITORY-STRUCTURE、DOCUMENT-MAP（docs 時） | B（既存編集）を標準適用 | 推奨（曖昧・100 行超見積もり時） | Naoya 目視 + 実装レポート必須 | md5 + 完了定義の動作確認 |
| **L3** | 上記 + CHANGE-CLASSIFICATION（本ファイル）、CURSOR-INSTRUCTION-GUIDE、（該当時）OPERATIONS | B 必須。パターン C 導入後は C 適用対象を優先 | 原則必須（構造・ビルド・大規模 JS）。例外は判定根拠に明記 | **Claude Rv 必須**（マージ前）+ Naoya 承認 | md5 + 契約 / URL / ビルド観点 + Step 3b Retrospective |

---

## 7. Issue 本文の必須メタデータブロック

Claude が Issue を起票するとき、本文冒頭（署名の直後）に次を **必ず** 含める。欠落・`TBD`・`未定義` がある Issue は Cursor が実装を開始してはならない。

```markdown
## 改修分類

- **Complexity Level**: L2
- **Change Pattern**: C1, C5
- **判定根拠**: （1–2 行。なぜその Level / Pattern か）
- **Pre-Issue Recon**: 不要 / 実施済み（Issue #XX）/ 実施予定
- **Level 昇格・降格履歴**: なし / （あれば経緯）
- **適用堅固化パターン**: A / B / C（導入後）
```

### 7.1 コピー用（空欄）

```markdown
## 改修分類

- **Complexity Level**: 
- **Change Pattern**: 
- **判定根拠**: 
- **Pre-Issue Recon**: 
- **Level 昇格・降格履歴**: なし
- **適用堅固化パターン**: 
```

---

## 8. Complexity Retrospective（必須・実装完了時点検）

### 8.1 位置づけ（Cursor フロー）

`.cursor/rules/dev-flow.mdc` の実装フローにおいて:

- **Step 3a**: 実装
- **Step 3b**: Complexity Retrospective（**PR 作成の前提条件**）
- **Step 4**: PR 作成

Step 3b 未実施の PR は作成禁止。PR Description の Retrospective チェックが空ならマージ拒否対象。

### 8.2 実施者・タイミング

- **実施者**: Cursor（実装エージェント）
- **タイミング**: 実装完了後、PR 作成直前
- **記載先**: `docs/cursor/reports/cursor-implementation-report-*.md` の Complexity Retrospective セクション（`DEV-GUARDRAILS.md` § 7 テンプレート）

### 8.3 総合判定の 3 分岐

| 判定 | 意味 | 次アクション |
|---|---|---|
| 事前分類妥当 | Level / Pattern が実態と一致 | PR 作成可 |
| 昇格提案 | 実態がより重い（例: L2→L3） | PR 作成せず Issue Comment で中断。Naoya 承認後に再開 |
| Pattern 追加提案 | 既存 C1–C7 で表現できない性質 | 同上。§ 10 の追加フローへ |

降格提案（過大見積もり）も Retrospective に書いてよいが、**続行は可**（安全性側への振れは許容）。ただし Naoya / Claude が次回起票の精度改善に使う。

### 8.4 中断フロー（昇格・Pattern 追加）

1. Issue Comment に Retrospective 要約と提案を投稿
2. 実装ブランチは push してよいが **PR は作らない**（または draft + マージ禁止の明示）
3. Naoya が分類・範囲を承認 / Issue 本文を更新
4. 必要なら追加実装のうえ Step 3b を再実施 → PR

---

## 9. Level 昇格・降格運用

### 9.1 Retrospective で昇格提案が出た場合

1. Cursor は作業を止め、Issue Comment で「事前 Lx → 提案 Ly」と根拠を書く
2. Naoya が承認するまで追加コミット（範囲拡大）をしない
3. 承認後、Issue の改修分類ブロックを更新し、§ 6 の Ly ルール（例: Claude Rv、Recon）を満たすよう Issue 本文を補強
4. **やり直し判断**: すでに行った作業が上位 Level の必須検証を満たさない場合、不足分のみ追加実装。全面破棄は Naoya 判断

### 9.2 降格提案

- 記録は必須、実装の巻き戻しは不要
- 次回類似 Issue の判定精度改善に使う（§ 13）

### 9.3 起票時の誤判定修正

Naoya が Chat / GitHub で分類を指摘した場合、Claude が Issue 本文の分類ブロックを更新してから `ready-for-cursor` を維持 / 再付与する。

---

## 10. 新パターン追加フロー

### 10.1 トリガー

同種の「既存 C1–C7 に収まらない」案件が **2 回以上** 出現したとき、Claude が Pattern 追加 Issue を提案する。

### 10.2 5 項目定義テンプレート

新 Pattern `C8` 以降を追加する Issue 本文に必ず含める:

1. **定義**: 何がこの Pattern で、何が対象外か
2. **代表例**: 3–5 個
3. **参照ドキュメント**: 追加で必読になる MD
4. **堅固化パターン適用条件**: A/B/C のどれをいつ強めるか
5. **デグレ点検基準**: 完了時に必ず見る観点

### 10.3 追加 Issue の分類

Pattern 追加自体は **L2 × [C1, C7]** として扱う（docs 正本の拡張 + 分類体系の構造整備）。

---

## 11. 定期リファクタリング（C7）運用

### 11.1 目的

動作を変えずに、AI / 人間が推論しやすいリポジトリ形状を維持する。

### 11.2 Claude 側の監視トリガー

| 頻度 | 内容 |
|---|---|
| 月次 | `index.html` 肥大、docs 重複、scripts の単一巨大ファイル、DOCUMENT-MAP と実態の乖離 |
| 四半期 | ディレクトリ境界の見直し、Track B 移行に備えた分割候補 |

### 11.3 候補提示フォーマット

```markdown
## C7 候補
- 対象: （パス）
- 現状の読みにくさ: （1–3 行）
- 提案分割 / 移動:
- 動作不変の証明方法:
- 推奨 Complexity: L2 or L3
```

### 11.4 Category E への組込み

`DOCUMENT-MAP.md` の Category E（定期レビュー）に、C7 候補レビューを含める。C7 Issue を起票したら LAUNCH-CHECKLIST / Track B メモに必要なら追記する。

---

## 12. 拡張性の 3 メカニズム

### 12.1 Level 追加

原則 **不要**。L1–L3 の 3 段階を固定する。新たな段階が必要に見えても、まず Pattern 追加と § 6 のセル調整で吸収する。

### 12.2 Pattern 追加

数ヶ月〜1 年に 1 回を想定。§ 10 の明示フローでのみ追加し、§ 5 表に行を足す。

### 12.3 各 Pattern の運用ルール調整

月次レビュー（§ 13）で § 5 / § 6 のセルを見直し、別 Issue（通常 L2 × C1）で更新する。

---

## 13. 月次レビュー観点

`CURSOR-INSTRUCTION-GUIDE.md` § 5（抽象度・Recon 運用の振り返り）と **重複させず**、本ドキュメント固有の指標を見る。

| 観点 | 見るもの | アクション例 |
|---|---|---|
| 分類判定精度 | 起票時 Level と Retrospective 結果の一致率 | 境界事例を § 2 に追記 |
| 誤判定率 | 昇格提案の発生率、Naoya による分類差し戻し | 代表例の更新 |
| 昇格・降格発生率 | Step 3b での提案件数 | 起票チェックリスト改善 |
| Retrospective 品質 | 「テンプレのまま」レポートの有無 | DEV-GUARDRAILS § 7 の例示を増やす |
| Pattern 網羅性 | 「どれにも当てはまらない」コメントの有無 | § 10 トリガー |

---

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-12 | 初版導入（Issue #33） |

_Last synced with process: 2026-07-12_
