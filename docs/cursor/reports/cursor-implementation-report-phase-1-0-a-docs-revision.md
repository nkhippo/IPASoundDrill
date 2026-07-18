# Phase 1-0-a Docs Revision — 実装レポート

## 関連 Issue / PR

- Issue: #75
- PR: #76（open）

## Issue 背景（Issue 本文から要約）

Phase 1 UI/UX の確定により、旧 Mode A/B 前提の上位仕様では後続実装の判断がぶれる状態になった。Naoya さんは Phase 1-A 以降の UI 実装へ進む前に、PURPOSE / SPECIFICATION / DESIGN を目的 4 カード、プロフィール一元通過型 UX、CEFR 横断化、GA/RP セッション固定、マーキング仕様へ先行改訂する方針を選んだ。本 Issue はその Phase 1-0-a として、実装コードに触れず Category A 文書を最新仕様へ揃える作業である。

## Phase 0 Recon 結果

### 現行版数・Front Matter

| ファイル | 現行情報 |
|---|---|
| `docs/PURPOSE.md` | `created: 2026-06-24`、更新日 2026-07-10、変更履歴最新 v3.24 |
| `docs/SPECIFICATION.md` | `created: 2026-06-24`、最終更新 2026-07-16（Q-7-A） |
| `docs/DESIGN.md` | `created: 2026-06-24`、更新日 2026-07-16 |

### Mode A / Mode B / CEFR / GA-RP / 絞り込み / Band 言及箇所

| ファイル | 主な該当セクション |
|---|---|
| `docs/PURPOSE.md` | §1 2モード構成、§2 Mode A、§3 Mode B、§4 依存と実装状況、変更履歴 |
| `docs/SPECIFICATION.md` | §1.1-1.3、§2.1-2.9、§4.1、§4.8b、§5.1、§5.3-5.4、§6 |
| `docs/DESIGN.md` | §1 Mode A、§1.7 GA/RP、§2 Mode B、§2b 語彙ブラウザ、§3.4 RP/TTS、§4-5 実装状況 |

### SPEC / DESIGN の Band 関連シンボル

| シンボル | Recon 時点の所在 |
|---|---|
| `MODEB_BANDS` | `docs/SPECIFICATION.md` §5.1 |
| `MODEB_BAND_UNLOCK_RATIO` | `docs/SPECIFICATION.md` §2.5 / §5.4、`docs/DESIGN.md` §2.4 |
| `ept_vocab_band` | `docs/SPECIFICATION.md` §5.3、`docs/DESIGN.md` §2.3 |
| `refreshVocabBandUnlock` | `docs/SPECIFICATION.md` §2.5、`docs/DESIGN.md` §2.4 |
| `bandProgress` | SPEC / DESIGN にはなし |
| `modeb.band.*` / `modeb.pool` | SPEC / DESIGN にはなし |

### Phase 1 確定事項の反映先

| 確定事項 | 反映先 |
|---|---|
| 目的 4 カード構成 | PURPOSE §1-2、SPEC §2-3、DESIGN §1-2 |
| タグライン | PURPOSE §0、SPEC §3.2、DESIGN §2.1 |
| GA/RP セッション固定 | PURPOSE §3.2、SPEC §2.5、DESIGN §1.1 / §3.4 |
| CEFR 全モード横断 | PURPOSE §3.1、SPEC §2.4 / §4.1、DESIGN §3.3 |
| マーキング仕様 | PURPOSE §3.3、SPEC §2.6 / §4.3、DESIGN §3.2 |
| 完全一致判定 | PURPOSE §1.1 / §2、SPEC §2.3、DESIGN §1.1 / §2.4-2.5 |
| プロフィール一元通過型 UX | PURPOSE §3.4、SPEC §2.2 / §3.3、DESIGN §2.2 |
| オンボーディング | PURPOSE §3.5、SPEC §2.7、DESIGN §2.9 |
| AI クローラビリティ | PURPOSE §3.6、SPEC §2.7、DESIGN §1.1 / §2.10 |
| 視覚言語トークン化 | PURPOSE §3.7、DESIGN §4 |
| Q-2-B | SPEC / DESIGN から旧段階進行シンボルを除去 |
| Q-13 | SPEC / DESIGN に独立絞り込み画面を置かない方針へ整理 |
| Q-20 | `8z` プロフィールを全セッションのゲートとして明記 |
| Q-21 | `8e` と `onboarding_completed_v1` を明記 |

## 実装内容

- `docs/PURPOSE.md` を v4.0 とし、旧 Mode A/B の 2 モード構成を目的 4 カード構成へ再編した。
- `docs/SPECIFICATION.md` を Phase 1 前提へ改訂し、画面仕様、CEFR word-level、GA/RP セッション固定、Local Storage、オンボーディングを明示した。
- `docs/DESIGN.md` を Phase 1 の 14 frame 情報設計、プロフィール `8z`、4 ドリル、支援画面、視覚言語トークン化方針へ整理した。
- `docs/LAUNCH-CHECKLIST.md` に Phase 1-0-a、1-0-b、1-A〜1-H の見出しを追加した。
- SPEC / DESIGN から旧 Mode B の段階進行シンボル参照を削除した。

## 変更ファイル

```text
M docs/DESIGN.md
M docs/LAUNCH-CHECKLIST.md
M docs/PURPOSE.md
M docs/SPECIFICATION.md
A docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md
```

## デグレ防止検証

| 観点 | 結果 |
|---|---|
| Front Matter | `id` / `aliases` / `title` / `created` の存在を Python スクリプトで確認 OK |
| Markdown link / anchor | 変更対象 4 ファイルのローカルリンク・内部アンカー確認 OK |
| PURPOSE v4.0 | 冒頭版数と変更履歴に v4.0 を記載 OK |
| 旧 Mode A/B 履歴保持 | PURPOSE §5 に上書き履歴として保持 OK |
| Phase 1 確定事項 | 10 項目 + Q-2-B / Q-13 / Q-20 / Q-21 の反映を grep で確認 OK |
| Band 関連シンボル | SPEC / DESIGN で `MODEB_BANDS` 等 7 パターン + `3b` の grep 0 件 |
| Runtime contract md5 | wordlist / data runtime / i18n / phonemes / font / `src/index.template.html` の md5 不変 OK |
| 実行テスト | ドキュメントのみのため対象外 |

## 動作確認

- ブラウザ手動確認: 対象外（ドキュメントのみ）
- モバイル確認: 対象外
- TTS 動作確認: 対象外
- データ整合性: runtime data / i18n / font / SPA template の md5 不変を確認

## 実装過程での気づき

- Issue の Change Pattern は `C1` + 部分的に `C4 (UI/UX 仕様の再構造化)` と書かれていたが、現行 `docs/CHANGE-CLASSIFICATION.md` では C4 は Stack / framework 変更であり、今回の実態は docs-only の `C1`、内容面は Product behavior / UX の仕様整理として `C6` 相当だった。実装は docs-only でランタイム・スタック・URL・データ契約を変更していないため、Retrospective では「分類は安全側の L3、Pattern 表記に用語ずれあり」と記録する。
- Issue は Phase 0 Recon の Issue Comment 投稿と Claude Rv gate を求めていたが、本 automation 環境で利用可能な書き込み MCP は PR 作成のみで、Issue comment tool は公開されていなかった。gh CLI は read-only 制約のため、Recon 結果は本レポートと PR 本文に集約する。
- Q-13 の意図から、SPEC / DESIGN では独立絞り込み画面 ID を残さず、インラインチップ方針だけを記述した。

## 後続への影響

- Phase 1-0-b は、本レポートの Phase 0 Recon と改訂後 SPEC/DESIGN を起点に、画面 × DOM / state / Local Storage / data の対応表を作成できる。
- Phase 1-A〜1-H は、旧 Mode A/B の価値判断ではなく、目的カード・プロフィール・マーキング・CEFR 横断・GA/RP 固定を上位仕様として参照できる。
- LS キー名、12 パラメータ、CEFR 未タグ語、既存キー移行は本 Issue で確定していないため、Phase 1-0-b / 1-C で明示判断が必要。

## 残課題・申し送り

- Claude Rv は L3 要件として PR 上で実施が必要。
- Issue Comment 投稿が必要な Recon / 作業開始 / PR URL 報告は、現 automation tool 制約により未投稿。PR 本文に同等内容を記載する。
- `docs/REPOSITORY-STRUCTURE.md` / `docs/DOCUMENT-MAP.md` は Issue で変更不要と明示されているため更新していない。

## Complexity Retrospective

### 事前分類 vs 実態

| 項目 | 事前 | 実態 |
|---|---|---|
| Complexity Level | L3 | L3 相当として継続（Category A 中核 3 文書を同時再構造化） |
| Change Pattern | C1 + 部分的 C4 | 実装実態は C1。内容面は C6 相当だが、ランタイム UX は未変更 |
| 堅固化 | Pattern B | Pattern B（既存文書編集 + md5 不変確認） |

### 構造・契約チェック

| 項目 | 結果 |
|---|---|
| Runtime data contract 8 paths | 不変 |
| i18n schema | 不変 |
| URL structure | 不変 |
| Build system | 不変 |
| Category A docs | PURPOSE / SPECIFICATION / DESIGN / LAUNCH-CHECKLIST を Issue 範囲内で更新 |
| Existing path dependencies | ファイル追加は本レポートのみ。REPOSITORY-STRUCTURE 更新対象外と判断 |

### Phase 分割妥当性

- 計画: Phase 0〜5。
- 実施: Phase 0 Recon、Phase 1 PURPOSE、Phase 2 SPECIFICATION、Phase 3 DESIGN、Phase 4 LAUNCH-CHECKLIST、Phase 5 report / PR。
- 依存問題: Phase 0 comment / Claude Rv gate は tool 制約により Issue 上では未実施。PR レビューで補完が必要。

### 総合判定

- **総合判定: 事前分類妥当（ただし Pattern 表記に用語ずれあり）**
- 昇格提案: なし
- Pattern 追加提案: なし
- PR 作成: 可
