---
created: 2026-07-28
title: Phase-3 app-first の差分（CD 反映用サマリ）
type: cd-update
status: authored
supersedes: []
scope: 1a top / 3a profile / 2a-2d drill / 3b vocab / 3e ipa modal / 3f language modal / 3h about (footer) / terms & privacy
---

# CD 更新指示（Phase-3, app 先行分の同期依頼）

対象: Claude Design が管理する SP/PC の Dc(design canvas) 版一式。
本ドキュメントは 2026-07-28 の iPhone16 実機フィードバック（PR #197 + round-2）で **app 側を「見た目の正」として先行変更した差分**を Claude Design に反映してもらうための指示書。CD 側も app と一致させたら **round-trip 完了**。

なお、下記のうち **CD 側に既に一致している/一致不要と判断済み**の項目は「※CD 差分無し」で明示。

---

## 1. 共通（すべてのフレーム）

- **フッターピル並び順**: 左から `利用規約 → プライバシーポリシー → フィードバック`（Feedback は最右）。X リンクは撤去。
- **フッター i18n**: 6 言語対応（`vocab.filter.clear` の変更は無し、`footer.terms/privacy/feedback` は既存）。

## 2. 1a Top / 1a-pc Top

- 変更なし（今回 phase-3 の変更は無し。既存 CD-19/20/21/22 の反映済み状態を維持）。

## 3. 3a Learning Profile（学習プロフィール）

- **GA/RP アクセントセレクタは横 1 行の 2 カラム**（`grid-template-columns:1fr 1fr`）。
  - 表示: 各カード `GA · アメリカ英語` / `RP · イギリス英語` のみ（IPA サンプル `ˈdʒækət · ɝ ɚ` は非表示）
  - 選択状態は `signal-soft` 背景 + `signal` 枠 + `code` 色 teal
  - チェックマーク（左端の小四角）は非表示
- **モーダル感付与**: 完全なモーダル化は SP 上の情報量から今回見送り。代わりに:
  - #setup の card 枠を残し、`paper` 地に浮かせる（app 現状のまま）
  - 「戻る」を左上 chevron のままにするか、右上 X に変更するかは Naoya 判断待ち → **CD にラフを 2 案並記してほしい**（chevron 案 / X 案）

## 4. 2a-2d Drill（問題画面）

- **進捗バー + N/M カウンターは撤廃**（`.task-header-meter`, `.task-header-counter` 非表示）。ヘッダーは戻る + タイトル（「音の発音を確かめる」等）のみ。
- **アクセントバッジ（左上の GA/RP）**:
  - teal 実塗り+白ドット → **subtle outline**（`transparent` bg / `muted` 文字 / `hair` 枠 / 11px mono）
  - ドット `::before` は削除
- **2d 連結ドリル**: `/preʃɝ/ hand against it.` 表示で `.readout .ipa.connected-prompt` に `padding-top:28px; padding-left/right:8px` を付与し、GA バッジと重ならないようにした → CD の 2d(-pc) にも同じクリアランスを反映してほしい。

## 5. 3b Vocabulary（語彙リスト）

大きく 5 点。CD 3b / 3b-pc の filter 部を差し替え。

- **GA/RP 切替の右上固定**: `.vocab-accent-toggle` を `.vocab-ipa-filter` の右上に絶対配置（記号選択で位置移動しない）。
- **「全消去」ボタン撤去**: 縦幅圧迫の割にメリット薄い（個別チップの × で削除できるため）。
- **A–Z ラベル強化**: 「A–Z + hint(頭文字で移動)」を併記。行は 1 行維持（圧迫回避）。
- **記号 toggle**: 同記号を再タップで **解除**（旧: 上限 3 個で無視）。**上限 3 個は据置**。
- **複合検索は AND**: 選択記号すべてを含む語（順序不問）。旧は `join('')` の substring で `e→ɪ` 順選択時に `/eɪ/` が hit しない致命的バグがあった。CD 3b にも「順序不問 AND」であることを注記。
- **SP 単語カード**: 左寄り解消のため `.vocab-row` padding を `12px 14px` に復元。

## 6. 3e IPA って何？ / 3f 言語設定（モーダル）

- **モーダル化**: 全画面 overlay → **中央カード + スクリム背景 + 下地の TOP を透かして見せる**。
  - `.info-page` 背景 `rgba(20,18,15,.42)`
  - `.info-page-inner` `max-width:520px`, `border-radius:20px`, `box-shadow:0 20px 60px rgba(0,0,0,.28)`
  - スクリム外側クリックで閉じる、Esc でも閉じる
- **閉じるボタン**: 左上 chevron → **右上 X** に統一（両モーダル同じ）
- **装飾横棒（`.ipa-info-rule`）** は撤去
- **背景の TOP は非表示化しない**（app 側で `showInfoOverlay` から VOCAB_VIEW_IDS の hide を撤去済）

## 7. 3h About / 「思想を読む」モーダル

- 変更なし。

## 8. terms.html / privacy.html（footer 遷移先の静的 HTML）

- **6 言語対応済**（en/ja/ko/zh-Hans/zh-Hant/fil）。`localStorage['app_lang']` → `navigator.language` → en フォールバック。
- **ヘッダーブランドを top と統一**: `IPA Sound Drill` → i18n（日本語なら `IPAサウンドドリル`）。`mark` フォントサイズを 19px → 24px に上げて top と一致。
- **戻るリンクも i18n**（`IPAサウンドドリルへ戻る` 等）。
- CD 対象外だが、ページ全体のトーンとして top と同じブランド表記に揃えたことを念のため共有。

## 9. 画面横幅の統一（Naoya 指摘: 「まちまち」）

現状の主な max-width（参考）:

| 画面 | 幅 | 用途 |
|---|---|---|
| 1a-pc top | 1200px | hero + purpose grid |
| in-play drill | 1024px | 2 ペイン統合カード |
| 3a-pc profile | 720px | フォーム縦積み |
| vocab overlay | 620px（>=1024 は 1040px 2 カラム） | リスト |
| info modal (3e/3f) | 520px | 情報量少 |
| terms/privacy | 760px | 長文 |

**方針提案（CD 側で決めてほしい）**:
- モーダル系は 520px で揃える（現状一致）
- カード系（profile/vocab-single）は 720px で揃えるか、コンテンツ量で 620–720 に分ける
- 全画面 overlay（vocab/progress）は 620/1040 のブレークポイント切替を継続
- ページ padding: SP は 16px、PC は 24–48px で揃える

app 側で機械的に「全部同じ幅」にすると崩れる（drill は 2 ペインで 1024 が必要、legal は行長 760 が読みやすい等）ため、**CD で意匠優先の最終幅を確定 → app が追従**する形が良い。

---

## Round-trip の順序（Naoya 用）

1. Claude Design で本ドキュメントの 3〜8 を反映（1 は方針、9 は判断）
2. Export → `docs/claude-design/{sp,pc}.dc.html` へ同期
3. app 側は現状で CD と一致しているはずなので diff 確認のみ
4. 差分があれば app 側を CD 一致に調整

## この document で supersede される旧指示

- 特になし（新規追記）。ただし `2026-07-28_cd-roundtrip-app-first.md` の Phase 補足として位置づけ、round-1 の内容もそちらに残す。
