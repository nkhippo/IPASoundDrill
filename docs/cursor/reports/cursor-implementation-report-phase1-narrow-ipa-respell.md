---
id: pj-2026-07-02-b22d
aliases:
- pj-2026-07-02-b22d
title: Cursor 実装レポート — Phase 1 Narrow IPA + Respelling
created: '2026-07-02'
---

# Cursor 実装レポート — Phase 1 Narrow IPA + Respelling

> 作成日: 2026-07-02  
> 対象ブランチ: `main`  
> 指示書: `/Users/naoya.k/Downloads/files 29/cursor-phase1-narrow-ipa-respell.md`

Claude 共有用の実装サマリーです。

---

## 1. 実施内容

### 1-1. データ（pilot 30語）

- `pilot-30words.json` をリポジトリ直下に追加
- `scripts/merge_pilot_narrow_respell.py` を新規作成
- マージ実行で `wordlist_GA_a1a2_plus_phonics.json` に 30語分の下記フィールドを追加
  - `ipa_actual_ga`
  - `ipa_actual_rp`
  - `respell_ga`
  - `respell_rp`

実行結果:

```bash
merged 30 / 30 entries
party /ˈpɑrɾi/ PAR-dee
button /ˈbʌʔn̩/ BUH-tn
stop None STAHP
```

確認結果:
- pilot 30語に respelling が全件追加
- pilot 以外に新フィールドが増えた件数: 0

### 1-2. `index.html`（表示ロジック）

- 関数追加
  - `activeNarrowIpa(c)`（表示専用）
  - `hasNarrowDifference(c)`
  - `activeRespell(c)`
- 関数据え置き
  - `activeIpa(c)` / `altIpa(c)` は既存仕様のまま（phonemic）
- tokenizer 対応
  - `MULTI_GA` / `MULTI_RP` に `n̩` `l̩` `m̩` を追加
- `PH_EXAMPLES` 追加
  - `ɾ` `ʔ` `n̩` `l̩`
- 表示変更
  - Decode 表示 IPA: `activeNarrowIpa(c)`
  - Mode B Study IPA: `activeNarrowIpa(c)`
  - Reveal:
    - 主表示 `#rIpa` = narrow
    - `#rRespell` = respelling
    - `#rDictIpa` = dictionary（narrow と異なる場合のみ）
    - `#rAltIpa` = 既存の別アクセント phonemic
  - 語彙ブラウザ Words タブに `vocab-respell` 行を追加

### 1-3. i18n

- `i18n/{en,ja,zh,ko,fil}.json`
  - `reveal.respell_label`
  - `reveal.dict_label`
- `i18n/phonemes/{en,ja,zh,ko,fil}.json`
  - `ɾ` `ʔ` `n̩` `l̩` を追加
  - 全て `t: 0` + `allophone: true`

### 1-4. ドキュメント

- `docs/SPECIFICATION.md`
  - reveal の narrow/respelling/dictionary 行を追記
  - 単語スキーマに `ipa_actual_*` / `respell_*` を追記
  - 変更履歴に Phase 1 を追加
- `docs/DESIGN.md`
  - narrow/respelling の設計意図と語彙ブラウザ表示を追記
- `docs/pending-review/phonemes-allophone-i18n.md`
  - fil（+ zh/ko）翻訳レビュー用メモを追加

---

## 2. 検証結果

### 自動検証

- `python3 tools/validate_i18n.py`  
  - ERROR なし
  - UI keys(en): 158
  - phoneme symbols(en): 47
- `python3 tools/gen_audit_docs.py` 実行済み

### 重点チェック

- `encodeCheck()` 本体差分なし（関数ロジック未変更）
- allophone 4記号が phoneme i18n に存在し、`t:0` / `allophone:true` を確認
- pilot 30語のみに新フィールド追加されていることを確認

---

## 3. DoD 対応状況

- [x] pilot 30語マージ（30/30）
- [x] narrow IPA / respelling 用フィールド追加
- [x] tokenizer `n̩` `l̩` `m̩` 対応
- [x] PH_EXAMPLES 4記号追加
- [x] reveal 4段表示（narrow / respelling / dictionary / alt accent）
- [x] 語彙ブラウザ Words に respelling 行追加
- [x] 5言語 i18n キー追加（`reveal.*`）
- [x] 5言語 phoneme allophone 追加（`t:0`, `allophone:true`）
- [x] 仕様ドキュメント更新

---

## 4. 既知事項

- 実機の手動シナリオ（T-1〜T-7）はこの環境では未実施。  
  ローカルで GA/RP 切替・Decode/Reveal・Encode 非影響の最終確認を推奨。

