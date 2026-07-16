---
id: pj-2026-07-07-4cb2
aliases:
- pj-2026-07-07-4cb2
title: TTS A/B Experiment 実装レポート
created: '2026-07-07'
---

# TTS A/B Experiment 実装レポート

- 日付: 2026-07-07
- 指示書: `docs/cursor-instructions-tts-ab-experiment.md`
- 対象: 連結音 TTS A/B 実験環境（本番挙動は非変更）

## 1) 変更概要

### `gas/Code.gs`
- `voice` / `speed` / `instr_variant` を optional query として受理
- `ALLOWED_VOICES` で voice を検証（未知値は `alloy`）
- speed は `0.5-2.0` のみ受理（不正値は未指定扱い）
- `TTS_INSTR_VARIANTS` を追加（`current`, `rapid_casual`, `min_instr`, `tempo_emphasis`）
- OpenAI payload を拡張（`response_format: "mp3"`、voice/speed/instructions を反映）
- 連結句キャッシュキーを実験パラメータで分離
  - production: `{slug}__ga_v4.mp3`（維持）
  - experiment: `{slug}__ga_exp_*.mp3`
- 返却 JSON に `meta` を追加
  - `source` / `voice` / `speed` / `instr_variant`

### `tests/tts-ab-listener.html`（新規）
- 6句 x 8 variants を表示
- 各 variant で audio 再生
- 3軸評価（連続性 / 話速自然さ / 脱落再現） + コメント
- localStorage 自動保存・再読込復元
- 「結果をコピー」ボタンで `tts-ab-listener-v1` JSON をクリップボードへ

### `tests/README.md`（新規）
- GitHub Pages URL、ローカル実行、実験パラメータ、キャッシュ方針を記載

### `gas/README.md`
- 新パラメータ usage 追記
- レスポンス例に `meta` 追記
- 連結句キャッシュを `v4` / `exp` へ更新

---

## 2) `git status`（抜粋）

```
 M gas/Code.gs
 M gas/README.md
?? docs/cursor-instructions-tts-ab-experiment.md
?? tests/README.md
?? tests/tts-ab-listener.html
```

（`gas/BatchWarm.gs` など既存の unrelated 変更は本件コミット対象外）

---

## 3) `gas/Code.gs` 主要差分

- 定数追加:
  - `ALLOWED_VOICES`
  - `TTS_INSTR_VARIANTS`
- 追加関数:
  - `resolveVoice_()`
  - `parseSpeed_()`
  - `normalizeInstrVariant_()`
  - `buildConnectedCacheKey_()`
  - `getAudioFromDriveByName_()` / `saveToDriveByName_()` / `trashAudioOnDriveByName_()`
- `fetchFromOpenAI_()`:
  - options オブジェクト化
  - payload に `voice`, `speed`(条件付き), `instructions`, `response_format`
- `doGet(e)`:
  - query 抽出 (`voice`, `speed`, `instr_variant`)
  - connected 時だけ実験 instruction / 実験 cache key を適用
  - 返却 JSON に `meta` を追加

---

## 4) Smoke test（指示 2-1 の 5 curl）

実施URL: `https://script.google.com/macros/s/AKfycbya7_gej4GlOoeaORxO8fYm6auwtG3qhtbGZtw2ZR8dlyTFtaW6D2JcHJVyyMcCB8Ga/exec`

実行結果（ローカル取得ファイル）:

```
baseline.mp3  51301 bytes
nova.mp3      51301 bytes
s115.mp3      51301 bytes
rapid.mp3     51301 bytes
combo.mp3     51301 bytes
```

追加確認:

```
file tests/.tmp/*.mp3 -> JSON data
shasum: 5ファイルすべて同一
```

解釈:
- 現行 Web App は JSON(base64) レスポンス形式（`tts-ab-listener.html` は fetch+blob で対応済み）
- 5パターン同一結果のため、**GAS 側の新コードは未デプロイ**（または旧デプロイに到達）と判断

---

## 5) 本番影響ゼロ確認（指示 2-2）

- コード上は production key (`{slug}__ga_v4.mp3`) を維持
- ただし **Drive 更新日時の直接確認はこの環境から不可**（Apps Script/Drive 管理画面に非アクセス）
- 再デプロイ後に Naoya 側で `lots_of_time__ga_v4.mp3` の更新日時が変わっていないことを確認してください

---

## 6) GAS 再デプロイ有無

- この作業では **リポジトリ改修と push のみ**を実施
- GAS Web App 再デプロイは未実施（ローカルから Apps Script デプロイ操作不可）
- URL 変更確認も未実施（再デプロイ後に確認が必要）

---

## 7) Naoya 向けアクセス URL

- GitHub Pages:
  - `https://nkhippo.github.io/IPASoundDrill/tests/tts-ab-listener.html`

---

## 8) 追加メモ

- 指示書は `docs/cursor-instructions-tts-ab-experiment.md` にコピー済み
- `tests/tts-ab-listener.html` は外部依存なしの単一 HTML
