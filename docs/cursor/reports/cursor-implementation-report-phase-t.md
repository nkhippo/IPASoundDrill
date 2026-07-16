---
id: pj-2026-07-10-0b3f
aliases:
- pj-2026-07-10-0b3f
title: Cursor 実装レポート — Phase T (TTS 1問目遅延解消)
created: '2026-07-10'
---
# Cursor 実装レポート — Phase T (TTS 1問目遅延解消)

- 実施日: 2026-07-10
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md`
- ブランチ: `feat/phase-t-tts-latency` → `main` にマージ済み
- GitHub Pages: https://nkhippo.github.io/IPASoundDrill/

## 1. 実施内容

### T1: 1問目 body-first + warm de-gate + RP skip
- `prefetchItemsAudio`: `items[0]` の body fetch を warm 完了前に fire-and-forget
- 現在アクセントの `gasWarm` を fire-and-forget（body パイプラインをブロックしない）
- 反対アクセント（通常 RP）の warm を `requestIdleCallback`（timeout 8s）へ延期
- `scheduleIdle` ヘルパを追加

### T2: Drive 直リンク URL API
**GAS (`gas/Code.gs`):**
- `GET ?urls=1&words=...&accent=...` → Drive 公開 URL を返却（最大 6 語）
- `saveToDrive_` で `ANYONE_WITH_LINK` 共有を設定し File を返却
- `getAudioFileFromDrive_` / `getPublicUrl_` / `resolveUrlOne_` / `handleUrls_`
- `migratePublicSharing()` — 既存ファイル一括公開（**Naoya が GAS エディタで 1 回手動実行**）

**Client (`index.html`):**
- `fetchUrlsFromGas` + `fetchAudioFromDriveUrl`
- `fetchBodyToCache` は URL 経路優先、失敗時は従来の base64（`?word=`）へフォールバック
- 残語の body 取得を 6 語チャンクのバッチ URL + 並列 Drive fetch に変更
- `memAudioCache` は既存どおり Blob URL を保持（指示書サンプルの `{mime,b64}` 形式にはしない）

### T3: セットアップ画面 preread
- `updatePool()` 末尾で `schedulePoolPreread()` を呼び出し
- setup 表示中・セッション未開始時のみ、3s idle 後に先頭 6 語（plain words）を URL 経路でキャッシュ
- フィルタ変更 / Start 時の `prefetchToken++` でキャンセル（LS/mem の結果は残る）

### T4: ドキュメント
- `docs/PURPOSE.md` v3.22 changelog
- `gas/README.md` に `?urls=1` とパブリック共有の説明
- 本レポート + 指示書コピー

## 2. レイテンシ計測結果

ブラウザ実測はローカル環境・Drive 公開状態に依存するため、本レポートでは**設計上の期待値**を記載。GAS 再デプロイ + `migratePublicSharing` 実行後に DevTools で確認すること。

| シナリオ | Phase 前 | 目標 | 実装後の期待 |
|---|---|---|---|
| Cold start (Drive 未生成) | ~20s | < 8s | ~5–8s（OpenAI 生成が律速。T1 で RP warm 待ちを除去） |
| Warm start (Drive cached, LS 空) | ~15–20s | < 1s | **~500ms**（T2: `?urls=1` + Drive 直 fetch。要 GAS 再デプロイ） |
| Preread hit | ~20s | < 500ms | **~200ms**（T3: LS/mem ヒット） |
| Hot start (LS ヒット) | ~200ms | 200ms | 変化なし |

**コード上確認済みの挙動:**
- Start 時に反対アクセント `gasWarm` を待たない（T1）
- `?urls=1` 経路が `fetchBodyToCache` / バッチ worker / preread から呼ばれる（T2/T3）
- base64 フォールバック経路は残存（`fetchAudioFromGasAccent`）

## 3. commit 一覧

```
9b91177 perf(tts): pre-read top-N pool words on setup screen idle
a3c145f perf(tts): add Drive public-URL endpoint (?urls=1) for direct client fetch
b56a6c0 perf(tts): fast-path first-word body fetch, de-gate warm, skip RP warm on start
```

（T4 docs commit はこの後）

## 4. 変更ファイル

| ファイル | 内容 |
|----------|------|
| `index.html` | T1–T3 クライアント変更 |
| `gas/Code.gs` | `?urls=1`、setSharing、migratePublicSharing |
| `gas/README.md` | API / キャッシュ説明 |
| `docs/PURPOSE.md` | v3.22 |
| `docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md` | 指示書コピー |
| `docs/cursor/reports/cursor-implementation-report-phase-t.md` | 本レポート |

## 5. デプロイ後の手動作業（必須）

1. **GAS エディタに `Code.gs` を反映**し、**新しいバージョンとしてウェブアプリを再デプロイ**
2. エディタで **`migratePublicSharing` を 1 回実行**（既存 Drive 音声をパブリック化）
3. `index.html` の `GAS_TTS_URL` は既存のまま（URL 変更なし）
4. DevTools Network で確認:
   - Start 直後に `?urls=1&accent=ga` と `drive.google.com/uc?...` が出る
   - Start 直後に `warm=1&accent=rp` が**出ない**（idle まで）
   - CORS エラー時は `getPublicUrl_` を `drive.usercontent.google.com` 形式へ切替

## 6. テスト項目チェックリスト

| # | 項目 | 結果 |
|---|------|------|
| 1 | Start → 1問目 wall time (cold) | 要実測（目標 < 8s） |
| 2 | Start → 1問目 (warm, Drive cached) | 要実測（目標 < 1s、要 GAS 再デプロイ） |
| 3 | Preread 完走後 Start | 要実測（目標 < 500ms） |
| 4 | Start 時に `warm=1&accent=rp` が発生しない | ✓ コード上（idle まで） |
| 5 | `?urls=1` が Drive URL を返す | ✓ コード実装済み（要デプロイ） |
| 6 | Drive 直リンク CORS | 要実測（失敗時 base64 フォールバック） |
| 7 | setup フィルタ変更 → preread キャンセル | ✓ `prefetchToken++` |
| 8 | Session 中 `speak()` フォールバック | ✓ 未変更 |
| 9 | Connected/Weak タブ | ✓ 対象外・従来経路維持 |
| 10 | Mode B 自動再生 250ms | ✓ 未変更 |

## 7. 未対応事項（スコープ外）

- RP 用 BatchWarm（GAS スケジューラ）
- Connected / Weak タブの URL 化
- IndexedDB 移行 / Service Worker / base64 経路の削除
