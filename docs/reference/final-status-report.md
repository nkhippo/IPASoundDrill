---
id: pj-2026-07-02-acfc
aliases:
- pj-2026-07-02-acfc
title: IPA Sound Drill — narrow IPA / respelling プロジェクト最終ステータス
created: '2026-07-02'
---

# IPA Sound Drill — narrow IPA / respelling プロジェクト最終ステータス

**作成日:** 2026-07-02

---

## 完了確認

Cursor 実装レポートの内容を確認しました。DoD 全項目クリア、`encodeCheck()` 無変更、非破壊フィールド確認済み。

**narrow IPA + respelling 対応: 3,059/3,059 語で完了。**

- `ipa_actual_ga`: 192語（phonemic と narrow が異なる語のみ）
- `respell_ga` / `respell_rp`: 3,059語（全語）

---

## この場で実施した品質サンプル検証（Phase 2b サマリで予告していた未実施項目）

3,059語からランダム150語（約5%）を抽出し目視確認。加えて全3,059語に対する自動構造チェック（空音節・異常文字・強勢欠落等）を実施。

**発見事項: 1件（軽微・修正済み）**

`important` → `im-POR-tnt` のように、「音節主音（n/l）に追加のコーダ子音が付く」語で、母音字を含まない3子音の並び（`tnt`, `dnt`, `tns` 等）が17語で発生していました。`bottle`→`BAH-dl` のような2文字パターン（word-final・pilotで確認済み）とは別の、視認性がやや低いケースです。

**対応:** スクリプトを修正し、この場合のみ母音字を补い読みやすくしました（`im-POR-tnt` → `im-POR-tuhnt`、`couldn't`: `KUU-dnt` → `KUU-duhnt` 等）。修正後、pilotとの差分は既知の1件（`ridden`、意図的な改善）のみで、新規の構造異常はゼロです。

**添付:**
- `generate_respelling.py`（修正版）
- `phase2b_respell_draft_v2.json`（修正後の全3,059語）

### Cursor へのマージ要否

差分は **respell_ga のみ17語**（RP は元々この構造にならないため無変更）。既に本番へマージ済みの `respell_ga` を17語ぶん上書きするだけの軽微な追加パッチで対応可能です。必要であれば次のチャットで指示書を作成します（お急ぎでなければ、次の定期メンテナンス時にまとめて反映でも問題ない軽微な変更です）。

---

## 残作業（Opus 不要）

| # | 項目 | 担当 | 優先度 |
|---|---|---|---|
| 1 | 上記17語の `respell_ga` 差し替え | Cursor（軽微パッチ） | 低（cosmetic） |
| 2 | 実機での最終手動確認（`docs/testing/phase2a-manual-test-checklist.md` に基づくサンプルテスト） | Naoya | 中 — コードは全て「期待動作」ベースの確認に留まっており、実際のブラウザ・GitHub Pages上での目視確認がまだ行われていません |
| 3 | `docs/pending-review/phonemes-allophone-i18n.md`（zh/ko/fil の allophone 説明文翻訳）のレビュー完了確認 | Naoya | 中 — Phase 1 で作成依頼したまま、完了報告がありません |
| 4 | git push 済みか / GitHub Pages に反映済みかの確認 | Naoya | 高 — 実装レポートはローカル実装完了までで、デプロイ確認は別項目 |
| 5 | （任意）connected_speech.json（201句）・weak_forms.json（36語）への narrow/respelling 拡張 | 未着手 | 低 — HANDOFF文書で当初から明示的にスコープ外とした領域。今回のテーマの直接の続きではなく、新規テーマとして持ち出す場合は別途相談 |

---

## Opus について — 今回のプロジェクトを通して一貫して不要でした

Flap-t IPA 生成（Phase 2a）も Respelling 生成（Phase 2b）も、最終的にはすべて **ルールベースのスクリプト + Sonnet による論理検証** で完結しました。当初 Opus が必要になりそうだった「規則が効かない例外語」は、アルゴリズムの改善（英語音韻論の標準的な syllabification 規則、valid onset cluster 表、stress mark の解釈修正等）によってほぼゼロ件まで収束しています。

VntV（`winter`/`under`等）の判定も、Opus ではなく **実際のTTS音声を聞く** という最も正確な方法で解決できました。

### 今後 Opus が必要になりうる場面（現時点では該当なし）

- 項目5（連結句・弱形への拡張）に着手する場合、複数語にまたがる liaison・assimilation 現象は単語内の音韻規則より複雑になるため、例外処理の一部で Opus の判断が有効になる可能性があります。ただしこれも実際に着手してみないと判断できません。
- 3,059語の respelling 全数を "英語話者として自然に読めるか" という主観的観点で総ざらいする場合（今回の150語サンプルでは大きな問題なし）。

現時点で Opus をアサインすべき具体的なタスクはありません。
