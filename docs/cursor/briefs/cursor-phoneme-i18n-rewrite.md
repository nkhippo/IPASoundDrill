---
id: pj-2026-07-06-12d0
aliases:
- pj-2026-07-06-12d0
title: Cursor 作業指示書 — 音素ガイド i18n 全面書き直し（ja / ko / zh）
created: '2026-07-06'
---
# Cursor 作業指示書 — 音素ガイド i18n 全面書き直し（ja / ko / zh）

**作成日:** 2026-07-02
**担当:** Cursor
**依頼者:** Claude
**リポジトリ:** `nkhippo/IPASoundDrill`（`main` ブランチ）
**添付データ:** `ph_ja_new.json`, `ph_ko_new.json`, `ph_zh_new.json`

---

## 0. 背景と目的

### 背景

現行の音素ガイド `i18n/phonemes/{ja,ko,zh}.json` は、英語ソースを機械翻訳した結果、**IPA記号や例語が意味語として誤訳される**深刻な問題を抱えています。

具体例（`ɪ` 音素、日本語版の現状）:

```json
"ɪ": {
  "lab": "短い私（座る）",       ← "short i (sit)" の "i" を代名詞と誤訳、"sit" を動詞と誤訳
  "ex": "座る /sɪt/",             ← 例語 "sit" を「座る」と翻訳してしまい役に立たない
  "mouth": "ゆったり、短く、ちょっと緩めの「い」から「え」へ",
  "trap": "私のように緊張しないでください"  ← "Do not tense it like i" の /i/ を「私」と誤訳
}
```

これはスクリーンショット確認済みで実際に画面に表示されており、日本語話者には意味不明です。同じパターンが zh・ko でも広範に発生しています（両言語も同一の機械翻訳エンジンを通した形跡）。

一方 **fil.json は既に高品質**（例語を英語のまま保持、IPA記号を `/../` で明示）で、これが**目指すべき統一スタイル**です。

### 目的

`i18n/phonemes/{ja,ko,zh}.json` の3ファイルを、以下の統一ルールに沿った書き直し版に完全置換する。

### 統一ルール（全言語共通、fil.json のスタイル）

1. **例語（sit, bed, cat 等）は必ず英語のまま残す**（翻訳しない）
2. **IPA記号は `/../` で囲むか、原文中のラテン文字表記を維持**
3. `lab`: 「音の性質＋（英語例語）」の構造
4. `ex`: `"英語例語 /IPA/"` 形式（例: `"sit /sɪt/"`）
5. `mouth` / `trap`: その言語の学習者にとって自然な口語で、音声学的に正確に

### スコープ

- ✅ `i18n/phonemes/ja.json` を全面置換（47音素）
- ✅ `i18n/phonemes/ko.json` を全面置換（47音素）
- ✅ `i18n/phonemes/zh.json` を全面置換（47音素）
- ❌ `i18n/phonemes/en.json` は変更しない（構造は問題ないため）
- ❌ `i18n/phonemes/fil.json` は変更しない（既に統一スタイルに準拠済み）
- ❌ 表示ロジック（`index.html` の `renderInfo()` 等）は変更しない

---

## 1. 参照ドキュメント

| ファイル | 参照理由 |
|---|---|
| `i18n/phonemes/en.json` | 英語ソース（構造・意味の正本） |
| `i18n/phonemes/fil.json` | 目指すべき統一スタイルの参考実装 |
| `ph_ja_new.json`（添付） | 日本語版・書き直し済み |
| `ph_ko_new.json`（添付） | 韓国語版・書き直し済み |
| `ph_zh_new.json`（添付） | 中国語版・書き直し済み |

---

## 2. Task A: 3ファイル完全置換

### A-1. 手順

添付の3ファイルをそのまま `i18n/phonemes/` 配下にリネームして配置します:

```bash
cp ph_ja_new.json i18n/phonemes/ja.json
cp ph_ko_new.json i18n/phonemes/ko.json
cp ph_zh_new.json i18n/phonemes/zh.json
```

またはエディタで既存3ファイルの中身を添付内容で完全置換。

### A-2. 完全性検証

各ファイルについて以下が成り立つこと:

```bash
python3 -c "
import json
en = json.load(open('i18n/phonemes/en.json'))
for lang in ['ja','ko','zh']:
    d = json.load(open(f'i18n/phonemes/{lang}.json'))
    # (1) キー集合が英語ソースと完全一致
    assert set(d.keys()) == set(en.keys()), f'{lang}: key set differs'
    # (2) 各エントリのフィールド構造が英語ソースと完全一致
    for k in en:
        assert set(d[k].keys()) == set(en[k].keys()), f'{lang}/{k}: field set differs'
        # (3) trap フラグ (t) と allophone フラグの値が英語ソースと一致
        assert d[k]['t'] == en[k]['t'], f'{lang}/{k}: t flag differs'
        if 'allophone' in en[k]:
            assert d[k].get('allophone') == en[k]['allophone'], f'{lang}/{k}: allophone flag differs'
    print(f'{lang}: OK (47 entries, structure matches en.json)')
"
```

**期待出力:**
```
ja: OK (47 entries, structure matches en.json)
ko: OK (47 entries, structure matches en.json)
zh: OK (47 entries, structure matches en.json)
```

### A-3. 差分規模（参考情報）

|言語|変更フィールド数|不変フィールド数|
|---|---|---|
|ja|170|18（大半は `trap: "—"` の変更なし箇所）|
|ko|170|18|
|zh|169|19|

つまり **各言語で 90% 以上のフィールドが書き換えられます**。データ差分としては大規模ですが、構造は完全に維持されているため機能への影響はありません。

---

## 3. Task B: 表示確認（実装済みロジックの動作確認）

`index.html` の変更は不要です。既存の `renderInfo()` 関数がそのまま動作します。以下を目視で確認してください。

### B-1. 日本語 UI での確認

1. 言語を「日本語」に設定
2. Words モードで `sit` または `it`, `is` などが出題されたら Reveal を開く
3. IPA中の `ɪ` 記号をタップ → 音素情報ボックスに以下が表示されること:
   - ラベル: **「短い「イ」の音（sit）」**（**「短い私（座る）」ではない**）
   - 例語: **「sit /sɪt/」**（**「座る /sɪt/」ではない**）
   - 口の形: 「力を抜いた短い「イ」…」
   - 注意: 「/i/（see の長いイー）のように口を張らないこと…」

### B-2. 中国語 UI での確認

言語を「中文」に設定し、同様に `ɪ` の情報ボックスを開く:
- ラベル: **「短「伊」（sit）」**（**「短我（坐）」ではない**）
- 例語: **「sit /sɪt/」**

### B-3. 韓国語 UI での確認

言語を「한국어」に設定:
- ラベル: **「짧은 「이」 소리 (sit)」**
- 例語: **「sit /sɪt/」**

### B-4. タガログ語 UI （回帰確認）

言語を「Filipino」に設定。既存の高品質翻訳が変わっていないこと（本 Phase では fil.json 未変更）:
- ラベル: **「maikling i (sit)」**
- 例語: **「sit /sɪt/」**

---

## 4. Task C: 既存検証スクリプトの再実行

```bash
python3 tools/validate_i18n.py
```

`ja` / `ko` / `zh` に関する ERROR が出ないことを確認してください。fil.json の既知の WARN（同値2キー）は継続してよい。

---

## 5. DoD（Definition of Done）チェックリスト

### データ置換

- [ ] `i18n/phonemes/ja.json` が添付ファイルで完全置換されている
- [ ] `i18n/phonemes/ko.json` が添付ファイルで完全置換されている
- [ ] `i18n/phonemes/zh.json` が添付ファイルで完全置換されている
- [ ] 各ファイル 47 エントリ、フィールド構造が en.json と一致
- [ ] `en.json` / `fil.json` は無変更

### 構造検証

- [ ] Task A-2 の Python 検証スクリプトが `OK` 3件を出力
- [ ] 全音素の `t` フラグと `allophone` フラグが en.json と一致

### 表示確認

- [ ] 日本語 UI で `ɪ` の情報ボックスが「短い「イ」の音（sit）」と表示される
- [ ] 中国語 UI で `ɪ` の情報ボックスが「短「伊」（sit）」と表示される
- [ ] 韓国語 UI で `ɪ` の情報ボックスが「짧은 「이」 소리 (sit)」と表示される
- [ ] タガログ語 UI が変わらず「maikling i (sit)」と表示される（回帰確認）
- [ ] スクリーンショットで報告されていた `ɪ`（および代表として `aɪ`, `ʌ`, `ɝ`, `l`, `w`, `s`, `z`）で誤訳が解消されている

### 検証・ドキュメント

- [ ] `validate_i18n.py` に新規 ERROR が出ない
- [ ] `docs/DESIGN.md` または `docs/SPECIFICATION.md` の変更履歴に「音素ガイド ja/ko/zh 全面書き直し」を追記

---

## 6. 触ってはいけない箇所（Do Not Touch）

| 箇所 | 理由 |
|---|---|
| `i18n/phonemes/en.json` | 英語ソースは構造上正しい。変更すると他言語との整合性が崩れる |
| `i18n/phonemes/fil.json` | 既に統一スタイルに準拠済み。変更不要 |
| `index.html` の `renderInfo()` 関数（L1905付近） | 表示ロジックはデータ側の修正だけで機能する |
| `PH_EXAMPLES` オブジェクト（`index.html` L1156付近） | 例語チップ用の英語データ。今回のスコープ外 |
| `docs/pending-review/phonemes-allophone-i18n.md` | Phase 1 のレビュー依頼ドキュメント。今回の全面書き直しでカバー済みなので `docs/archive/` に移動してよい（削除は不要） |

---

## 7. 実装レポート提出物

完了時、`report-phoneme-i18n-rewrite.md` として Naoya 経由で Claude に提出してください。以下を含めること:

1. Task A の完了確認（Python 検証スクリプトの出力）
2. Task B の表示確認結果（3言語 + fil 回帰、スクリーンショット歓迎）
3. `validate_i18n.py` の実行結果
4. もし fil.json の zh/ko 部分（allophone 説明文）に関して従来のレビュー要請（`docs/pending-review/phonemes-allophone-i18n.md`）がある場合、この Phase の全面書き直しでカバー済みとなるためレビュー要請は解消してよい旨のコメント

---

## 8. 補足: 品質保証について

- 日本語版は Naoya（母語話者）の判断で自然な表現に調整可
- 中国語・韓国語版は「機械翻訳の意味不明さを解消し、音声学的に正確」なレベルは保証されているが、より詩的・教育的な自然さの向上余地は残る。将来的にネイティブスピーカーによるレビューを行う場合、統一スタイル（例語は英語のまま等）は維持してください
- タガログ語版（fil.json）は今回の対象外。既に統一スタイル準拠

---

## 開発ワークフロー確認

```
Cursor（3ファイル置換 + 検証 + 表示確認）
  ↓ 実装レポート MD
Naoya（実機で日本語 UI での表示確認 → git push）
  ↓ 完了報告
Claude（次のテーマ、または zh/ko のネイティブレビューが必要なら別途相談）
```
