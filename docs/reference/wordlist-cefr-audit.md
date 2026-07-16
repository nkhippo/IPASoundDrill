---
id: pj-2026-07-07-1ead
aliases:
- pj-2026-07-07-1ead
title: Wordlist CEFR ラベル監査レポート — Phase 0-a 是正記録
created: '2026-07-07'
---

# Wordlist CEFR ラベル監査レポート — Phase 0-a 是正記録

> 作成日: 2026-07-07
> 対象: `wordlist_GA_a1a2_plus_phonics.json`
> 実施フェーズ: CEFR 拡張 Phase 0-a（データ是正）

## 1. 是正前の状況（実測）

### CEFR × src 分布

| CEFR | both | casual | cefr | contraction | irreg_plural | irreg_verb | letter | phoneme_fill | phonics | 計 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 520 | 0 | 504 | 48 | 14 | 75 | 26 | 0 | 0 | 1,187 |
| A2 | 318 | 15 | 847 | 0 | 0 | 0 | 0 | 15 | 0 | 1,195 |
| B1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | **322** | 347 |
| B2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **330** | 330 |

### 発見された問題

- B1 の 93%（322 / 347）が `src: phonics` = 実際は基本フォニックス練習語
- B2 の 100%（330 / 330）が `src: phonics` = 真の CEFR B2 語彙は 0 語
- 真の中級語彙は B1 の 25 語（`phoneme_fill`）のみ

## 2. 是正内容

`HANDOFF-cefr-level-expansion.md` §4 推奨の案 B に基づき、以下の 652 語について `cefr` を `null` に変更:

- B1 かつ `src: phonics` の 322 語
- B2 かつ `src: phonics` の 330 語

他のフィールド（`src`, `group`, `pattern`, `ipa`, `gloss`, ...）は一切変更していません。

## 3. 是正後の分布

| CEFR | 語数 | 内訳 |
|---|---:|---|
| A1 | 1,187 | 変更なし |
| A2 | 1,195 | 変更なし |
| B1 | 25 | `phoneme_fill` のみ（真の中級語彙候補） |
| B2 | 0 | Phase 2 で新規拡充予定 |
| `null` | 652 | 全て `src: phonics`（フォニックス軸で利用） |

## 4. Mode A / Mode B への影響（Phase 0-b で検証）

- Mode A: 現状 `cefr` を参照していないため、この時点で表示動作に変化なし
- Mode B: `MODEB_BANDS = ["A1","A2","B1","B2"]` により CEFR フィールドを参照
  - B1 プール: 347 → 25 語に縮小
  - B2 プール: 330 → 0 語に縮小（バンド事実上消失）
  - Phase 0-b で `filteredPool()` 拡張と同時に、Mode B の空バンド扱い（B2 選択不可・「準備中」表示等）を検討

## 5. A1/A2 の十分性検証

Phase 0-b リリース時点で「A1 のみ / A1+A2」の選択肢を提供することが妥当かの検証:

### 語数
2,382 語（A1: 1,187 + A2: 1,195）

### 41 IPA 音素カバレッジ
すべての音素が含まれる。最少出現音素の内訳:

| 音素 | 語数 |
|---|---:|
| ʒ | 12 |
| ɔɪ | 28 |
| ð | 49 |
| θ | 53 |
| ʊ | 55 |
| aʊ | 58 |
| j | 80 |
| ɝ | 82 |
| tʃ | 89 |
| dʒ | 92 |

### 品詞分布（上位 10）
名詞 1,182 / 形容詞 303 / 動詞 226 / 副詞 118 / 名詞·動詞 97 / 動詞（不規則） 75 / 短縮形 48 / 代名詞 35 / 形容詞·名詞 31 / 形容詞·副詞 30

### 結論
A1+A2 のみで音素カバー・語数・品詞多様性ともに Mode A の練習素材として十分。B1/B2 消失の影響は Mode B のみに限定される。

## 6. 実行ログ

```
Changed: 652 entries (expected 652) — OK

=== CEFR distribution ===
cefr         before    after
A1             1187     1187
A2             1195     1195
B1              347       25
B2              330        0
None              0      652

Backup written to: wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
Updated file: wordlist_GA_a1a2_plus_phonics.json
```

## 7. サンプル確認（是正後）

```
grant -> {'ipa': '/ɡrænt/', 'cefr': None, 'src': 'phonics', 'pattern': 'a → /æ/', 'group': 'short'}
bomb -> {'ipa': '/bɑm/', 'cefr': None, 'src': 'phonics', 'pattern': 'o → /ɑ/', 'group': 'short'}
tent -> {'ipa': '/tɛnt/', 'cefr': None, 'src': 'phonics', 'pattern': 'e → /ɛ/', 'group': 'short'}
spice -> {'ipa': '/spaɪs/', 'cefr': None, 'src': 'phonics', 'pattern': 'i → /aɪ/', 'group': 'long'}
shame -> {'ipa': '/ʃeɪm/', 'cefr': None, 'src': 'phonics', 'pattern': 'a_e → /eɪ/ (マジックe)', 'group': 'long'}
```

---

## 訂正（2026-07-07）

### 訂正の経緯

上記の監査（セクション1〜6）は、`src: phonics` の 652 語について「B1/B2 は暫定的な誤ラベルであり、真の CEFR 語彙ではない」という仮説に基づいていました。この仮説は HANDOFF 資料の推測であり、一次データで検証されていませんでした。

### 検証結果

CEFR-J Wordlist v1.5（`openlanguageprofiles/olp-en-cefrj`）を直接取得し、652 語全てを照合した結果:

- 652 語のうち CEFR-J に実在する語: **652 / 652（100%）**
- app 内のラベルと CEFR-J の実レベルが一致: **652 / 652（100%）**
- 参考: app 全体 3,059 語の CEFR ラベル正確性: 2,856 / 2,879（99.2%）が CEFR-J と一致

652 語は正当な CEFR-J B1/B2 語彙であり、上記の「是正」は誤りでした。

### 対応

`wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元しました。詳細は `docs/cursor-instructions-cefr-phase0a-revert.md` を参照してください。

### 訂正後の正しい分布

| CEFR | 語数 | 内訳 |
|---|---:|---|
| A1 | 1,187 | 変更なし |
| A2 | 1,195 | 変更なし |
| B1 | 347 | 322語（CEFR-J 由来の正当な B1 語彙）+ 25語（phoneme_fill） |
| B2 | 330 | 全て CEFR-J 由来の正当な B2 語彙 |

### 今後の CEFR 拡充（Phase 1/2）への含意

CEFR-J Wordlist 全体（単一語のみ、app 既存語と重複除外後）との比較:

| レベル | CEFR-J 総語数（単一語） | app 既存カバー数 | 新規拡充が必要な語数 |
|---|---:|---:|---:|
| B1 | 2,332 | 347 | **1,769** |
| B2 | 2,727 | 330 | **2,186**（B1と重複72語除く） |

652 語分の完成済みデータ資産（IPA・5言語 gloss・英語定義・respelling）がそのまま活用できるため、Phase 1/2 は「ゼロから作る」のではなく「既存分 + 新規拡充分」で CEFR-J 完全版を目指す設計になります。
