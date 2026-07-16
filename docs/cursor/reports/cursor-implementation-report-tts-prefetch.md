---
id: pj-2026-06-26-64a0
aliases:
- pj-2026-06-26-64a0
title: Cursor 実装レポート — TTS プリフェッチ（GAS warm + クライアント先読み）
created: '2026-06-26'
---

# Cursor 実装レポート — TTS プリフェッチ（GAS warm + クライアント先読み）

> 作成日: 2026-06-27（再確認・ドキュメント整備）  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tts-prefetch-warmup.md`  
> 前提: GA/RP TTS・弱形 `?weak=` 対応 GAS 再デプロイ済み

Claude 側への作業報告用サマリー。

---

## 1. 背景

Start 後・再生ボタン押下の都度 `speak()` が GAS へ 1 件 fetch しており、初回再生に待ちが発生していた。

**方針（B+A 組合せ）:**
- GAS `warm` で Drive にストック生成（本体 base64 は返さない）
- クライアントは運用アクセントのみ本体取得 → localStorage / mem キャッシュ
- 反対アクセントは warm のみ先行、本体はアイドル時 or アクセント切替時

---

## 2. 実装状況

本機能は **`cfa14da`** で `main` に実装済み。今回は指示書に沿った **仕様照合・本番 warm 動作確認・ドキュメント整備** を実施（クライアント/GAS ロジックの追加改修は不要）。

### 2-1. GAS（`gas/Code.gs`）

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET ?warm=1&words=luck,colour&accent=ga\|rp` |
| 上限 | `WARM_MAX = 6`（1 リクエストあたり） |
| 処理 | Drive 確認 → 無ければ OpenAI 生成 → `saveToDrive_` |
| レスポンス | JSON サマリのみ（`cached` / `generated` / `failed`） |
| 連結句・弱形 | warm 対象外（単語 `w` のみ） |

**本番 warm 検証（2026-06-27）:**

```bash
curl -sSL "$GAS_TTS_URL?warm=1&words=cat&accent=ga"
# → {"ok":true,"accent":"ga","results":[{"word":"cat","status":"cached"}]}
```

### 2-2. クライアント（`index.html`）

| 項目 | 内容 |
|------|------|
| 起動 | `startSession()` で `S.queue` 確定後に `prefetchSessionAudio()`（非ブロック） |
| warm | GA/RP 各 accent を 6 語 chunk × 並列 2 本。warm 完了後に本体取得（二重生成抑制） |
| 本体 | 運用アクセントを `bodyParallel=3` で取得 → LS/mem |
| 遅延 | 反対アクセントは `requestIdleCallback`（timeout 30s）で背景取得 |
| スピーカー | `audioReady` Map。pending=非活性、ready/failed=活性（failed は `speak()` フォールバック用） |
| 中断 | `prefetchToken` で Start 連打時に旧ジョブ無効化 |
| accent 切替 | `setAccent()` → `prefetchAccentBodies()` |
| 対象外タブ | Connected Speech / Weak Forms（押下時 `?phrase=` / `?weak=` 取得） |
| フォールバック | `speak()` は未取得でもその場 fetch |

### 2-3. accent 明示ヘルパ

`lsKeyAccent` / `memKeyAccent` / `fetchAudioFromGasAccent` / `hasCachedAudioFor` / `loadAudioFromLSAccent` / `saveAudioToLSAccent`。

`memKeyAccent(word, accent)` は既存 `memCacheKey(text, false)` と同形（`accent:word`）。

### 2-4. 定数

```javascript
const PREFETCH = { warmChunk: 6, warmParallel: 2, bodyParallel: 3 };
```

---

## 3. GAS 本番 URL

`index.html` の `GAS_TTS_URL`（weak 対応含む最新デプロイ）:

```
https://script.google.com/macros/s/AKfycbyQgqctjbVgZiXoPtUzqnoXNFDvCYKZsN0PLAwMiMsOUVI4EjaRKWmpNogoxbXDw_7G/exec
```

---

## 4. DoD（指示書 §4）

| 項目 | 結果 |
|------|------|
| GAS `?warm=1`（本体非返却・WARM_MAX=6） | ✅ ソース + 本番 curl 確認 |
| Start 時 warm（GA/RP） | ✅ |
| 運用アクセント本体先読み → スピーカー活性 | ✅ |
| 反対アクセント遅延（idle + accent 切替） | ✅ |
| prefetchToken 中断 | ✅ |
| 連結句タブ warm 対象外 | ✅ |
| 弱形タブ warm 対象外 | ✅（拡張） |
| speak() フォールバック | ✅ |
| Drive 永続ストック | ✅（warm が `saveToDrive_` を呼ぶ） |

---

## 5. 更新ファイル（今回）

| ファイル | 操作 |
|----------|------|
| `docs/cursor-tts-prefetch-warmup.md` | 指示書をリポジトリに配置 |
| `docs/cursor-implementation-report-tts-prefetch.md` | 本レポート更新（本番 URL・検証結果） |

**実装本体（変更なし・既存）:**

| ファイル | 内容 |
|----------|------|
| `gas/Code.gs` | `warmOne_` / `handleWarm_` |
| `gas/README.md` | warm API 記載 |
| `index.html` | プリフェッチ・スピーカー制御 |

---

## 6. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/IPASoundDrill/ |
| 実機確認 | Start → DevTools Network で `warm=1` リクエスト。運用アクセントの ▶ が先読み完了後に活性化 |

---

## 7. Claude への申し送り

- 初回セッションは warm + 本体取得で十数秒かかるが、2 回目以降は Drive `cached` ヒットで高速化
- warm は JSON のみ返すため初期通信量を抑制。本体は運用アクセントのみ先に取得
- 連結句・弱形の warm、スピナー UI は将来拡張余地（`docs/cursor-weak-forms-tab.md` §6 参照）

---

## 8. コミット

- **SHA:** `1d00c78`
- **メッセージ:** Document TTS prefetch warmup spec and refresh implementation report.
