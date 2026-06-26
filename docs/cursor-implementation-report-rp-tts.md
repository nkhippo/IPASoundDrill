# Cursor 実装レポート — RP TTS 対応

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`99bfc6f`）  
> 設計レポート: `docs/rp-tts-design-and-priority.md`（Claude 検討済み）  
> 前提: STEP5 GA/RP 切替、`activeIpa()` 対応済み

Claude 側への作業報告用サマリー。

---

## 1. 背景と判断

RP 選択時は IPA 表示・キーボードは STEP5 で対応済みだが、TTS は GA 固定だった。同一綴りで GA/RP 音声を共存させるには**キャッシュキーに accent を含める**必要がある（設計レポート §2-1）。

**優先度:** 中〜低（GA 単独運用に支障なし）だが、RP 学習者に GA 音声を聞かせるのは理念的に不整合 → **実装着手**。

---

## 2. 実施内容

### 2-1. GAS（`gas/Code.gs`）

| 項目 | 内容 |
|------|------|
| 引数 | `&accent=ga\|rp`（既定 `ga`） |
| instructions | GA / RP 分岐（RP は Received Pronunciation 冒頭文） |
| voice | `alloy` 据え置き |
| Drive キー | `{slug}__{accent}_v2.mp3` |
| 後方互換 | 旧 `{slug}_v2.mp3` を GA として読み取り |
| 連結句 | GA 固定（`TTS_CONNECTED_INSTRUCTIONS`） |

### 2-2. クライアント（`index.html`）

| 項目 | 内容 |
|------|------|
| fetch | 単語 `&accent=${ACCENT}`、連結句 `&accent=ga` |
| localStorage | `ipa_tts_v2:{accent}:{slug}` |
| 後方互換 | 旧 `ipa_tts_v2:{slug}` を GA として読み取り・移行 |
| メモリキャッシュ | accent 込みキー |
| 連結タブ | 常に GA 音声（設計どおり） |

### 2-3. ドキュメント

| ファイル | 内容 |
|----------|------|
| `docs/rp-tts-design-and-priority.md` | 設計・優先度正本 |
| `docs/DESIGN.md` | §3.4 RP TTS 追記 |
| `gas/README.md` | API・キャッシュ仕様更新 |

---

## 3. GAS 本番デプロイ

**再デプロイ済み**（2026-06-26）。`index.html` の `GAS_TTS_URL` を新デプロイ URL に更新。

```
https://script.google.com/macros/s/AKfycbxe6u7CiIbXzNmNRCHYjkJLnieAkVHuIOvbE_R3af4Y9plwEQ9cluWeX0FG9NmaAp0m/exec
```

RP アクセントで単語再生 → GA とは別 MP3 が生成されることを確認推奨。

---

## 4. 範囲外

| 項目 | 扱い |
|------|------|
| 連結句 RP TTS | 別タスク（RP 連結確定が必要） |
| voice 変更 | 据え置き（alloy + instructions） |

---

## 5. DoD

| 項目 | 結果 |
|------|------|
| GAS `accent` パラメータ | ✅ |
| instructions GA/RP 分岐 | ✅ |
| Drive / LS キャッシュキー accent 込み | ✅ |
| 後方互換（旧 GA キャッシュ） | ✅ |
| index.html fetch + LS + mem キャッシュ | ✅ |
| 連結句 GA 固定 | ✅ |
| 設計文書リポジトリ格納 | ✅ |

---

## 6. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `gas/Code.gs` | RP TTS 対応 |
| `gas/README.md` | API 更新 |
| `index.html` | accent 付き TTS キャッシュ |
| `docs/rp-tts-design-and-priority.md` | 新規 |
| `docs/DESIGN.md` | §3.4 追記 |

---

## 7. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main` |
| GitHub Pages | push 後即反映 |
| GAS | 再デプロイ済み（上記 URL） |

---

## 8. Claude への申し送り

- RP TTS 実装完了（クライアント + GAS ソース + 本番デプロイ）
- 残: 連結句 RP TTS、多言語学習ガイド
