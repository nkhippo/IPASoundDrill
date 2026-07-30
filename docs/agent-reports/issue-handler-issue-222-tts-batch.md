# [EPIC-05] TTS 事前バッチ生成 + hybrid delivery (#222) — 実装レポート（Phase 3 halt 時点）

## 関連 Issue / PR

- Issue: #222（親 EPIC #209、先行 Issue #212 / #214 merged）
- PR: 本レポート時点では未作成（Phase 3 halt のため、下記「halt 状況」参照）
- Agent: issue-handler（ClaudeCode 同一セッション、Naoya 明示委譲）
- 作業ブランチ: `feature/tts-batch-222`（base: `develop`）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L2 / Change Pattern C4（TTS batch tooling 新規追加）, C5（runtime data: mp3 asset 追加）
- hybrid delivery（人気単語 1,000 語を Mobile app assets に同梱、それ以外はオンデマンド fetch + 端末キャッシュ）の tooling 整備。Web の TTS 挙動（GAS 直叩き）は変更しない。
- Issue 本文で Phase 3（LFS 判断）は「Naoya 判断待ち → 本 Issue Phase 3 で halt 予定」と明記されている。

## 実装内容（Phase 1・2・4 完了）

### Phase 1: `tools/tts/gen_tts_batch.py`

- `packages/core/data/wordlist.json`（5,397 語）から人気単語を選定するロジックを実装。
- **選定アルゴリズム**: Issue 本文の union 定義（① CEFR A1 全語、② Web 学習履歴データ〈GAS Analytics 不可の場合は CEFR A1 で埋める、と本文に明記〉、③ UI Step 1a/2a-d/3a-d のデフォルト表示単語）に対応するため、CEFR バンド優先順位 A1→A2→B1→B2 でフラット化し先頭 N 件を採用する方式で実装した。根拠:
  - `apps/web/src/index.template.html` の `progressDefaultCefrLevels()` を確認したところ、UI のデフォルト CEFR プールは `["A1", "A2"]` であり、③ は CEFR 優先順位に自然に内包される。
  - `wordlist.json` の CEFR 分布は A1=1,187 / A2=1,195 / B1=2,116 / B2=899 であり、既定の `--top-n 1000` では A1 単体で充足するため、② の「GAS Analytics 不可時は CEFR A1 で埋める」という本文の明示フォールバックとも整合する。
  - GAS Analytics（学習履歴データ）は本セッションから参照できないため、上記フォールバックに従った。
- 冪等性: 既存 mp3 はスキップ（`--force` で全再生成）。`--top-n` / `--out-dir` / `--wordlist` / `--gas-url` / `--sleep` オプション対応。
- `--dry-run`: HTTP リクエストなしで生成予定 path 一覧を出力。
- **filename 衝突バグの発見・修正**: 素朴な小文字化 slug だと `wordlist.json` の 'A'（文字名）と 'a'（冠詞）等、大文字/小文字違いの別エントリが同一 slug に衝突し、片方の mp3 を無言で上書きする問題を実装中に発見。連番サフィックス（`_2`, `_3`, ...）で一意化する処理を追加して対応（コード内コメントに記録）。

### Phase 2: `packages/core/src/tts.ts`

- Issue 本文で指定された `TTSSource` interface + `createBundleTTS` / `createFetchTTS` / `createHybridTTS` を実装。`loaders.ts`（Issue #213）の `DataLoader` 設計方針（Web=fetch, Mobile=bundle, 両対応=hybrid）を踏襲。
- `createHybridTTS` は bundle → 端末キャッシュ（`TTSCache` interface で抽象化、Mobile 側の FileSystem/AsyncStorage 実装は #EPIC-06/07 で注入する想定）→ GAS fetch の優先順位で解決する。
- `packages/core/src/tts.test.ts`: Vitest 8 tests（bundle hit/miss、fetch URL 組み立て・trailing slash 正規化、hybrid の bundle 優先・fallback+cache 書き込み・cache hit・ga/rp 独立性）。
- `packages/core/src/index.ts` に `export * from "./tts.js"` を追加。

### Phase 4: `tools/tts/README.md`

- 人気単語一括生成コマンド・出力先・冪等性・選定ロジック参照・LFS 判断待ちである旨・Phase 5 CI 統合が optional かつ未実装である旨を追記。

## 変更ファイル（本レポート時点、Phase 3 halt 前）

```
- tools/tts/gen_tts_batch.py (A)
- tools/tts/README.md (M)
- packages/core/src/tts.ts (A)
- packages/core/src/tts.test.ts (A)
- packages/core/src/index.ts (M)
- docs/agent-reports/issue-handler-issue-222-tts-batch.md (A, 本ファイル)
```

Issue 本文のファイルホワイトリストのうち、以下は Phase 3 halt / Phase 5 optional のため本レポート時点では未着手:

- `apps/mobile/.gitignore`（新規、Phase 3 判断次第）
- `.github/workflows/mobile-prebuild-tts.yml`（新規、Phase 5 optional）

## 動作確認

- `python3 tools/tts/gen_tts_batch.py --top-n 10 --dry-run` → `selected 10 words ... 20 mp3 planned (GA+RP)`、20 件の path を出力（テスト観点の期待値と一致）。
- `python3 tools/tts/gen_tts_batch.py --top-n 10`（`GAS_TTS_URL` 未設定環境）→ `ERROR: GAS_TTS_URL is not set` で exit code 2（実生成には環境変数が必要、Issue 指示どおり明示エラーで停止）。
- `pnpm --filter @ipasounddrill/core run typecheck` → PASS。
- `pnpm --filter @ipasounddrill/core test` → **49 tests PASS**（既存 41 + `tts.test.ts` 新規 8）。
- 実生成 10 mp3（テスト観点「実生成 10 mp3 で `apps/mobile/assets/audio/{ga,rp}/{word}.mp3` が作られる」）: **未実施**。本セッションの環境には `GAS_TTS_URL` が設定されておらず、実際の HTTP 経由 mp3 生成テストができない（dry-run 経路のみ検証済み）。Naoya の `GAS_TTS_URL` を用いた実生成確認を依頼する。
- データ整合性: `packages/core/data/wordlist.json` md5 = `54937707f733d1f906c99ba119444d5a`（読み取りのみ、変更なし）。ランタイム契約 8 パスへの内容変更なし。

## halt 状況（Phase 3: LFS 判断）

Issue #222 本文の指示（「Naoya 判断待ち → 本 Issue Phase 3 で halt 予定」）に従い、Phase 3
（`apps/mobile/assets/audio/` の git 管理方針 = LFS 利用要否）で **halt** する。

- **現在の状態**: Phase 1（`gen_tts_batch.py`）・Phase 2（`packages/core/src/tts.ts` + テスト）・
  Phase 4（README 追記）を実装・検証済み（上記「動作確認」参照）。Phase 3・Phase 5 は未着手。
- **中断理由**: Issue 本文が Phase 3 を Naoya 判断待ちと明記しているため。加えて、本セッションで
  リポジトリを確認したところ `apps/mobile/` ディレクトリ自体がまだ存在しない（#EPIC-06 Expo 初期化が
  未実施）ことを確認した。そのため `apps/mobile/.gitignore` を新規作成する場合、ディレクトリ構成の
  前提（Expo プロジェクト構造）が定まっていない状態での作成になる。
- **次に必要なこと**:
  1. git LFS 利用要否の判断（Issue 本文記載の判定基準: LFS 非利用+CI/EAS prebuild 生成 vs LFS 管理）。
  2. 上記 1 に伴い、`apps/mobile/.gitignore` を今 Issue で作成するか、`apps/mobile/` 自体が
     #EPIC-06 で作成されてから追従する別 Issue にするかの判断。
  3. Phase 5（CI 統合）の要否（Issue 本文で optional と明記、Naoya 判断待ち）。
  4. 実生成 10 mp3 のテスト観点検証に使う `GAS_TTS_URL`（Naoya 提供、または Naoya 実施依頼）。

halt 中は本 Issue へのコメント投稿後、追加の推測実装を行わず待機する。

## Complexity Retrospective（Phase 3 halt 時点、暫定）

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定（Phase 1/2/4 の範囲では）: 妥当
- 判定根拠: 新規 tooling 追加のみで既存ランタイム契約（GAS TTS URL・4 JSON）は不変。ただし
  Phase 3 の LFS 判断・`apps/mobile/` 未作成という状況次第では、後続 Issue 分割が必要になる
  可能性がある（Naoya 判断待ち）。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C4（stack: TTS batch tooling）, C5（runtime data: mp3 asset 追加）
- 実装中に追加が必要になった Pattern: なし（Phase 1/2/4 の範囲では）

## 残課題・申し送り

- Phase 3 の LFS 判断（Naoya 待ち、本 halt の主因）。
- 実生成 10 mp3 のテスト観点未検証（`GAS_TTS_URL` 未提供のため）。
- Phase 5（CI 統合）実施可否（Naoya 判断待ち、halt 復帰時に確認）。
- `apps/mobile/` ディレクトリが未作成（#EPIC-06 未実施）である点を、Phase 3 判断時の前提として共有。
