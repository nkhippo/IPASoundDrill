# Cursor 実装レポート — TTS プリフェッチ（GAS warm + クライアント先読み）

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`cfa14da`）  
> 指示書: `cursor-tts-prefetch-warmup.md`（Claude 設計）  
> 前提: RP TTS 対応済み（`accent=ga|rp`）

Claude 側への作業報告用サマリー。

---

## 1. 背景

Start 後・再生ボタン押下の都度 `speak()` が GAS へ 1 件 fetch しており、初回再生に待ちが発生していた。

**方針（B+A 組合せ）:**
- GAS `warm` で Drive にストック生成（本体 base64 は返さない）
- クライアントは運用アクセントのみ本体取得 → localStorage / mem キャッシュ
- 反対アクセントは warm のみ先行、本体はアイドル時 or アクセント切替時

---

## 2. 実施内容

### 2-1. GAS（`gas/Code.gs`）

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET ?warm=1&words=luck,colour&accent=ga\|rp` |
| 上限 | `WARM_MAX = 6`（1 リクエストあたり） |
| 処理 | Drive 確認 → 無ければ OpenAI 生成 → `saveToDrive_` |
| レスポンス | JSON サマリのみ（`cached` / `generated` / `failed`） |
| 連結句 | 対象外（単語のみ） |

### 2-2. クライアント（`index.html`）

| 項目 | 内容 |
|------|------|
| 起動 | `startSession()` で `S.queue` 確定後に `prefetchSessionAudio()`（非ブロック） |
| warm | GA/RP 各 accent を 6 語 chunk × 並列 2 本で GAS warm |
| 本体 | 運用アクセントを `bodyParallel=3` で取得 → LS/mem |
| 遅延 | 反対アクセントは `requestIdleCallback` で背景取得 |
| スピーカー | `audioReady` Map で pending/ready/failed。ready（または failed）で活性 |
| 中断 | `prefetchToken` で Start 連打時に旧ジョブ無効化 |
| accent 切替 | `setAccent()` → `prefetchAccentBodies()` で新アクセント本体取得 |
| フォールバック | `speak()` は従来どおり未取得でもその場 fetch |

### 2-3. accent 明示ヘルパ

`lsKeyAccent` / `memKeyAccent` / `fetchAudioFromGasAccent` / `hasCachedAudioFor` を追加。`memKeyAccent` は既存 `memCacheKey(text,false)` と同形（`accent:word`）。

### 2-4. ドキュメント

- `gas/README.md` — warm API 追記

---

## 3. 運用上の注意 ★

**GAS 再デプロイが必要。** `warm` エンドポイントはリポジトリ更新だけでは本番に反映されない。

手順:
1. GAS エディタで `gas/Code.gs` を反映
2. 新バージョンでウェブアプリ再デプロイ（URL は既存のまま可）
3. セッション開始 → Network で `warm=1` リクエストを確認

再デプロイ前: warm は失敗するが、`speak()` の従来 fetch で動作は継続。

---

## 4. DoD

| 項目 | 結果 |
|------|------|
| GAS `?warm=1`（本体非返却・WARM_MAX=6） | ✅ ソース |
| Start 時 warm（GA/RP） | ✅ |
| 運用アクセント本体先読み → スピーカー活性 | ✅ |
| 反対アクセント遅延（idle + accent 切替） | ✅ |
| prefetchToken 中断 | ✅ |
| 連結句タブ warm 対象外 | ✅ |
| speak() フォールバック | ✅ |
| GAS 本番デプロイ | ⚠️ Naoya 手動要 |

---

## 5. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `gas/Code.gs` | warm エンドポイント追加 |
| `gas/README.md` | API 追記 |
| `index.html` | プリフェッチ・スピーカー制御 |

---

## 6. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`cfa14da`） |
| GitHub Pages | push 後即反映（クライアント） |
| GAS | **再デプロイ要**（warm 有効化） |

---

## 7. Claude への申し送り

- 初回セッションは warm + 本体取得で十数秒かかるが、2 回目以降は Drive `cached` ヒットで高速化
- warm は JSON のみ返すため初期通信量を抑制。本体は運用アクセントのみ先に取得
- 連結句 warm、スピナー UI は将来拡張余地
