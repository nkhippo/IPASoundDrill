---
id: pj-2026-06-26-2ae0
aliases:
- pj-2026-06-26-2ae0
title: Cursor 実装レポート — 弱形（Weak Forms）タブ
created: '2026-06-26'
---

# Cursor 実装レポート — 弱形（Weak Forms）タブ

> 作成日: 2026-06-26  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-weak-forms-tab.md`（Claude 設計）

Claude 側への作業報告用サマリー。

---

## 1. 背景

機能語（to, can, of …）の**弱形**は文中でのみ起きるため、連結句タブと同様の**キャリア文＋IPA 埋め込み**で学ぶ第3タブを追加した。音声は綴りではなく弱形 IPA を OpenAI に渡し、強形 /kæn/ ではなく /kən/ を確実に鳴らす。

---

## 2. 実施内容

### 2-1. データ（`data/weak_forms.json`）

| 項目 | 内容 |
|------|------|
| 語数 | 36（L1=10 / L2=14 / L3=12） |
| フィールド | `ipa` / `ipa_strong` / `rp_ipa` / `rp_ipa_strong` / `carriers`（各4） / `cs_rule` |
| 識別 | `src: "weak_form"` → `isWeakItem(c)` |

### 2-2. GAS（`gas/Code.gs`）

| 項目 | 内容 |
|------|------|
| 新エンドポイント | `GET ?weak=/kən/&ww=can&accent=ga\|rp` |
| OpenAI 入力 | 弱形 IPA 文字列（綴りではない） |
| instruction | `TTS_WEAK_INSTRUCTIONS_GA` / `TTS_WEAK_INSTRUCTIONS_RP` |
| Drive キャッシュ | `{slug}__{accent}_weak_v2.mp3`（`ww` でスラグ化） |

**要 Naoya 手番:** GAS を再デプロイしないと弱形音声は取得できない（出題・採点は動作）。

### 2-3. クライアント（`index.html`）

| 項目 | 内容 |
|------|------|
| タブ | Mode A に「Weak Forms」追加（Words / Connected Speech の隣） |
| 読み込み | `loadWeak()` → `WEAK` / `weakReady` |
| フィルタ | Level ピルのみ（Type ピル非表示） |
| 出題 | `pickCarrier` + `renderConnectedPrompt` を連結句と共用 |
| 採点 | 機能語 `w` の `spellCheck`（不変） |
| reveal | 強形 ↔ 弱形 IPA 対比 + ルール文 |
| TTS | `speak(c.w, {weak: activeIpa(c), ww: c.w})` |
| キャッシュ | `memCacheKey` / `lsKey` に `weak:` プレフィックス |
| プリフェッチ | 弱形タブはスキップ（押下時取得） |

### 2-4. i18n（en / ja / zh / ko）

| キー | 用途 |
|------|------|
| `tab.weak` | タブラベル |
| `lead_weak_html` | リード文 |
| `weak.strong_label` / `weak.weak_label` | reveal 対比 |
| `pool.count_weak` | プール件数 |

`python3 tools/validate_i18n.py` → **ERROR 0**

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| `weak_forms.json` 36語配置・読み込み | ✅ |
| 弱形タブ + Level フィルタ | ✅ |
| キャリア文＋IPA 埋め込み出題 | ✅ |
| `?weak=` GAS 実装（ソース） | ✅ |
| reveal 強形↔弱形 + ルール | ✅ |
| 採点は機能語 `w` | ✅ |
| 音声は該当ワードのみ（キャリア文は読まない） | ✅ |
| 単語 / Encode / Mode B / 連結句 不変 | ✅ |
| i18n 4言語 ERROR 0 | ✅ |
| GAS 再デプロイ（本番音声） | ⬜ Naoya 手番 |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/weak_forms.json` | 新規（36語） |
| `index.html` | 弱形タブ・TTS 拡張 |
| `gas/Code.gs` | `?weak=` エンドポイント |
| `gas/README.md` | API ドキュメント追記 |
| `i18n/{en,ja,zh,ko}.json` | 弱形関連キー |
| `docs/cursor-weak-forms-tab.md` | 設計指示書 |
| `docs/DESIGN.md` | §1.9 追記 |

---

## 5. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main` |
| GitHub Pages | `git push origin main` で即反映 |
| GAS | **再デプロイ必須**（`?weak=` 有効化） |

---

## 6. 動作確認手順

1. GitHub Pages で Mode A → **Weak Forms** タブを選択
2. Level フィルタで件数が変わることを確認
3. Start → キャリア文内に弱形 IPA が埋め込まれていること
4. 機能語（例 `can`）を入力して採点
5. reveal で **Strong /kæn/ ↔ Weak /kən/** が表示されること
6. ▶ 押下で弱形音声（GAS 再デプロイ後）

---

## 7. 申し送り（Claude 向け）

- 弱形36語は高頻度機能語を厳選・難易度区分済み
- 音声の核心は **綴りではなく IPA を OpenAI に渡す** `?weak=` 方式。連結句の精度向上にも応用可
- 将来案: 弱形プリフェッチ、強形/弱形対比ドリル（同語2文提示）
