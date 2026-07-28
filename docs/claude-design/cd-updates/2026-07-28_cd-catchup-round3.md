---
created: 2026-07-28
title: CD catch-up round-3（app → CD 同期指示）
type: cd-update
status: authored
supersedes: []
scope: 1a top / 3a profile / 2a-2d drill (SP+PC) / 3b vocab / 3d progress / 3e ipa modal / 3f language modal / 3h about / terms & privacy / design-system
predecessor: 2026-07-28_phase3-app-first.md
---

# CD 更新指示（Round-3, app → CD の追随）

## 0. この document の位置づけ（authoritative）

**app 側（`src/index.template.html`）が正。** Claude Design は SP/PC/Design-System の Dc を app に一致させる方向で更新する。逆方向（CD → app）の反映は今回は不要。

- 対象: `IPA - SP.dc.html`（432 lines）/ `IPA - PC.dc.html`（331 lines）/ `IPA - Design System.dc.html`（220 lines）
- 前提: `2026-07-28_phase3-app-first.md`（round-1 / round-2）の差分は**まだ CD 側に未反映**である前提で書いてある。まず本ドキュメントの round-3 差分（下記）を反映しつつ、旧ドキュメントの差分も並行して反映してほしい。旧ドキュメントの内容は再掲しない — 末尾のチェックリストで両方を横並びにする。

**Naoya は現行 app UI に満足しているため、「app のこの見た目を CD に写す」が今回の唯一の方向。** CD 側で意匠上の再提案をしたい場合は、まず app に合わせた 1 パスを作ってから別レイヤで提案してほしい。

---

## 1. 共通トークン / インフラ変更

Design System (`IPA - Design System.dc.html`) 側は tokens 変更なし。以下は SP / PC の記法として反映してほしい。

### 1.1 モーダル配置: 中央 → 上寄せ

すべてのモーダル系オーバレイ（IPA info / language modal / 汎用 `.modal` / 学習プロフィール想定案 3a-x）で、垂直方向を **`align-items:center` → `align-items:flex-start`** に変更し、**上から 56px** の位置に落とすことで、背面 TOP の上部空白帯を圧迫し「背景で見えるべき情報（見出し等）」がスクリム越しに視認できるようにする。

app 側の該当 CSS（正）:

```css
.info-page{
  background:rgba(20,18,15,.42);
  padding:56px 16px 24px;
  align-items:flex-start;         /* 旧 center */
  justify-content:center;
}
.modal{
  position:fixed; inset:0; z-index:100;
  padding:56px 8px 24px;           /* padding-top を 56px に */
}
.modal:not(.hidden){
  display:flex;
  align-items:flex-start;          /* 旧 center */
  justify-content:center;
}
```

CD 側の指示:
- `#3e`（IPA って何？）モーダルフレーム: 現在 `min-height:640px` の外側に `display:flex; align-items:center` で中央配置している。**上寄せ + `padding-top:56px` を適用**したビジュアルに更新する。フレーム外周の丸みは維持。
- `#3f`（言語設定）モーダルフレーム: 同上。
- `#3a-x`（学習プロフィール · 案 B）を最終案として採用する場合も同じレイアウト規約に沿わせる。

### 1.2 フッターピル並び順

前ドキュメント指示のまま: 左から **利用規約 → プライバシー → フィードバック**（X は撤去済）。CD 3 バリアント（ja/en/ko）と PC 版すべての 1a フレーム内フッターを再確認。

---

## 2. 1a Top（SP + PC）

### 2.1 サブコピー: `word-break:keep-all`

app 側で「聞き取|れる」「発音記|号」等の熟語途中改行を防ぐため、以下を適用:

```css
.top-subcopy{
  font-size:13.5px; line-height:1.9; color:var(--muted);
  margin:18px 0 0; text-wrap:pretty;
  word-break:keep-all;              /* new */
  overflow-wrap:break-word;
}
@media (min-width:1024px){
  body.top-home:not(.in-play) .top-subcopy{
    font-size:17px; max-width:820px;  /* 旧 620px */
  }
}
```

CD 指示:
- SP `#1a-ja` / `#1a-en` / `#1a-ko`: サブコピー行の折り返し位置は「文節/熟語境界」で切れるように再流し込み。特に日本語版のサブコピー「発音記号（IPA）で、英語の音をていねいに練り直す。読める音は、やがて聞き取れる音になります。」は、CD 現状の折り返しで「聞き取」で切れていたら「聞き取れる」全体を 1 語として次行に流す。
- PC `#1a-pc` / `#1a-pc-en` / `#1a-pc-ko`: サブコピーの `max-width` を 620 → **820px** に拡張。行あたりの語数が増える分、hero と purpose grid の縦バランスも見直してほしい。

### 2.2 TOP 内変更以外は既存 CD で OK

Header 4 アイコン（進捗 / language / vocab / guide）、hero H1（「音を、美しく。」/ "Retune your English. From sound up." ）、4 つのドリル選択ボタン、「思想を読む」/「IPA って何?」リンクは変更なし。

---

## 3. 3a Learning Profile（SP + PC）

Round-2 で「GA/RP を横 1 行 2 カラム + モーダル化」の指示を出したが、Naoya 判断のポイントが決着した:

- **戻る動線**: 案 B（右上 X）を採用。左上 chevron 案（`#3a`）は削除、`#3a-x` を正カンバスに昇格。
- `#3a-pc` にも同じ変更を反映（現在 PC 側は `#3a-pc` プレースホルダのみで詳細スケッチが薄い）。

その他:
- GA/RP カードのラベルは `GA / アメリカ英語` / `RP / イギリス英語` のみ。IPA サンプル（`ˈdʒækət · ɝ ɚ` 等）は非表示のまま。
- 選択時: `border:1px solid var(--signal); background:var(--signal-soft); color:var(--signal)`。左上チェック小四角は無し。

---

## 4. 2a–2d Drill（SP + PC）

Round-3 で 3 系統の変更が入った。CD の 2a-en / 2c-en / 2d-en / 2a / 2b / 2c / 2d と PC 側の 2a-pc / 2a-pc-answered / 2b-pc / 2b-pc-answered / 2c-pc / 2c-pc-revealed / 2d-pc / 2d-pc-answered すべてに適用。

### 4.1 GA/RP バッジ: subtle → 中間強度

Round-2 指示では `transparent bg / muted color / hair border / 11px mono` の subtle outline にしたが、実機で「存在感が薄すぎる」ため中間強度に。**CD 現状はまさに subtle outline なのでここが更新点。**

正の CSS:

```css
.drill-accent-badge{
  position:absolute; top:14px; left:14px; z-index:2;
  display:inline-flex; align-items:center;
  background:var(--signal-soft);          /* 旧 transparent */
  color:var(--signal);                    /* 旧 var(--muted) */
  border:1px solid var(--hair);
  border-radius:999px;
  padding:3px 12px;
  font-family:var(--font-mono);
  font-size:11.5px;
  font-weight:800;
  letter-spacing:.08em;
}
@media (min-width:1024px){
  .drill-accent-badge{ top:16px; left:16px; font-size:12px; padding:4px 13px }
}
```

視覚: teal 淡地 + teal 濃字 + 極薄ボーダー + mono 太字。前世代の「teal 実塗り + 白ドット」ほど強くない。ドット `::before` は無し。

CD のすべてのドリルカード左上「GA」チップをこの見た目に置換してほしい。CD 現状の該当セレクタは outline `border:1px solid var(--hair); background:transparent; padding:3px 9px; font-size:11px; color:var(--muted); font-family:monospace`。この muted 版は撤去して上記に統一。

### 4.2 2 ペイン時の縦アンカー（PC 主に効く）

問題ペイン（左）と回答結果ペイン（右）で、答え合わせ前後で 「答え合わせ」/「次へ」ボタンの縦位置が上下にジャンプする問題があった。app では PC の 2 ペイン時にのみ以下を適用:

```css
@media (min-width:1024px){
  body.in-play.drill-two-pane #cardDecode,
  body.in-play.drill-two-pane #cardEncode,
  body.in-play.drill-two-pane #cardModeBStudy,
  body.in-play.drill-two-pane #cardModeBStudyAnswer,
  body.in-play.drill-two-pane #reveal{
    display:flex; flex-direction:column; min-height:600px;
  }
  body.in-play.drill-two-pane .answer,
  body.in-play.drill-two-pane #reveal .reveal-next{ margin-top:auto }
}
```

CD 指示:
- PC 側 `#2a-pc` / `#2a-pc-answered`（左右 2 カード）と `#2c-pc-revealed` / `#2d-pc-answered` で、両ペインの縦寸を揃え、「Check」「Next →」ボタンをカード**下端に固定**する。CD 現状は各カードが自然高で組まれておりボタンが真ん中付近に浮いている。**両ペインとも min-height 600px、ボタンは下端**にレイアウト。
- 2b encode（キーボード IME 表示のためスマホでは下部固定）に関しては、この縦アンカー最適化は行わない（app もこの妥協を採用）。PC の 2b-pc / 2b-pc-answered には反映してほしい。
- SP（375px）側の 2a/2b/2c/2d は 1 ペイン表示なので `.drill-two-pane` セレクタが効かない → SP 側は縦アンカー変更なしで OK。

### 4.3 2d 連結ドリル: パディングは既反映で OK

Round-2 で入れた `.readout .ipa.connected-prompt` の `padding-top:28px; padding-left/right:8px`（GA バッジと重ならないためのクリアランス）は継続。CD 未反映なら旧 doc 通り反映。

### 4.4 その他は前回指示のまま

- 進捗バー / N/M カウンター 撤廃（`.task-header-meter`, `.task-header-counter` 非表示）
- ヘッダー: 戻る + タイトル（「音の発音を確かめる」等）のみ

---

## 5. 3b Vocabulary List（SP + PC）

Round-3 で 2 点追加。旧ドキュメントの変更（GA/RP 右上固定 / 全消去撤去 / A–Z ラベル / toggle-off / 順序不問 AND / SP カード padding 復元）はそのまま生きている。

### 5.1 IPA chip 行の高さ揺れ防止

app CSS:

```css
.vocab-ipa-chips{
  display:inline-flex; align-items:center; gap:6px;
  flex-wrap:wrap; margin:0;
  min-height:28px;              /* new: 記号 0 個時も高さを維持 */
}
/* :empty{display:none} は撤去 */
```

CD 指示: `#3b` フィルタパネルの「IPAで絞り込み」下、chip が並ぶ行を、chip 0 個の状態でも常に `min-height:28px` の帯として描く（現状 CD ではチップ 2 個入っており高さが決まって見えるが、記号 0 個時のバリアントも追加してほしい）。

### 5.2 A–Z 行の独立カード化

app では A–Z アンカースクロール行を **panel カード内に隔離**した。IPA フィルタと視覚的な階層を分けるため。

```css
.vocab-az-row{
  background:var(--panel);
  border:1px solid var(--hair);
  border-radius:12px;
  padding:10px 12px;
  /* 内側で A-Z ラベル + hint + 26 文字を横並び */
}
```

CD 指示:
- SP `#3b`（line 308 近辺）と PC `#3b-pc`: A–Z ラベル + 26 文字を、周囲と同じ panel 地・hair 枠のカードにする。
- ラベル部は既存指示通り「A–Z（12.5px bold）」+ 「頭文字で移動（11.5px muted）」の 2 行/横並記。
- 1 行の高さは押さえ気味に（`padding:10px 12px`）。

### 5.3 GA/RP toggle の右上絶対配置は既反映で OK

前回指示のまま `.vocab-accent-toggle` を `.vocab-ipa-filter` の右上に絶対配置。記号選択有無で位置移動しない。

---

## 6. 3d Learning Status（進捗ページ）

### 6.1 「全体の進捗」カード全撤去

app 側で `.progress-body` から「全体の進捗（overall meter + 概観）」ブロックを完全削除。理由: 選択 CEFR による絞り込みで変動するだけで、意味のある指標にならない。

CD 現状（`#3d`）ではセクションのトップに「flex:1 の bar（`opacity:0.9 / 0.7 / 0.5 / 0.85 / ...` の 7 本）」が描かれている（line 360 の彩色バー群）。**このバー群は撤去**。

正の DOM 構成:

```html
<div class="progress-body">
  <!-- 全体の進捗カードは無し -->
  <section aria-labelledby="progressDrillsTitle">
    <h2 class="progress-section-title">Drills</h2>
    <div class="drill-progress-stack">
      <!-- A1 / A2 / B1 / B2 の各カード（CD 現状の下側 2 枚と同じ意匠） -->
    </div>
  </section>
</div>
```

CD 指示:
- SP `#3d`: バー群のブロック（line 360 前後）を削除。以降のセクションタイトル「Drills」と CEFR タブ、A1/A2 カードのみを残す。
- PC `#3d-pc`: プレースホルダしか無いが、上記の構成で仕上げてほしい（全体進捗カードは作らない）。

### 6.2 CEFR タブ / ドリル別カードは既存で OK

タブ帯 `A1 / A2 / B1 / All`、ドリル別 4 行（音の発音を確かめる / 発音から書いてみる / 音から単語を覚える / 連結する音に慣れる）×卒業カウンタ の構成は変更なし。

---

## 7. 3e IPA info modal（IPA って何？）

Round-3 差分:
- **上寄せ**（§1.1 参照）: `padding-top:56px` の上寄せに変更。
- 装飾横棒 `.ipa-info-rule` 撤去（前回指示のまま生きている、CD 未反映なら反映）
- 右上 X で閉じる（前回指示のまま）
- 背景の TOP はスクリム越しに透ける（前回指示のまま）

CD 現状の `#3e` ではモーダル外枠が `align-items:center; justify-content:center; min-height:640px` になっている。これを **`align-items:flex-start; padding-top:56px`** の外枠に置換。中身のカード仕様（`max-width:520px; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.28)`）は変更なし。

---

## 8. 3f Language modal（言語設定）

`#3f`: 3e と同じ扱い。上寄せへ移行。それ以外は既存 CD で OK（前回指示は反映済み前提）。

---

## 9. 3h About / 「思想を読む」モーダル

変更なし。CD 現状のまま。

---

## 10. terms.html / privacy.html

**CD 対象外**（Claude Design で扱わない静的 HTML）。app 側で 6 言語対応・ヘッダーブランド top と統一を実施済み。CD に反映は不要。念のため共有まで。

---

## 11. Design System トークン

Round-3 では新規トークン追加なし。ただし `IPA - Design System.dc.html` の「モーダル」項に以下 1 行を追記してほしい（もし記載欄があれば）:

> Modal overlay: 垂直配置は `align-items:flex-start`、上端から 56px。背面 TOP の上部見出しがスクリム越しに視認できるようにする。

---

## 12. CD 側で「差分なし」と確認した領域

以下は現行 CD で app に一致している / 追随不要の項目。触らない。

| 領域 | 状態 |
|---|---|
| 1a Header アイコン列（進捗/lang/vocab/guide） | 現状 OK |
| 1a Hero タグライン H1 | 現状 OK |
| 1a 4 ドリル選択ボタンの意匠 | 現状 OK |
| 3a 出題レベル A1/A2/B1/B2/All のグリッド | 現状 OK |
| 3a 「詳しい設定」/「この設定で始める」CTA | 現状 OK |
| 3b 語彙カード内 GA/RP 発音行の grid | 現状 OK |
| 3c IPA symbol picker（40:60 split） | 現状 OK（round-3 変更なし） |
| 3d CEFR タブ + ドリル別カード | ドリル別カードは OK。上位「全体の進捗」バーは撤去 |
| 3e カード内部（`though / through` の例示） | 現状 OK（外枠のみ変更） |
| 3h 思想モーダル | 現状 OK |
| Design System トークン一覧 | 追加なし |

---

## 13. チェックリスト（Claude Design 用）

Round-3（本ドキュメント）:

- [ ] SP/PC 全モーダル系（`.info-page` / `.modal` / 3a 案 B）を **上寄せ + padding-top:56px** に変更
- [ ] 1a SP/PC サブコピーを `word-break:keep-all` を反映した折り返しに再流し込み、PC は `max-width:820px` へ拡張
- [ ] 3a: 案 B（右上 X）を正カンバスに、案 A（左上 chevron）は削除
- [ ] 2a-2d 全カード（SP + PC）のドリル GA/RP バッジを **signal-soft bg + signal fg + hair border + mono bold** に置換（subtle outline 版は撤去）
- [ ] PC の 2a-pc / 2a-pc-answered / 2b-pc / 2b-pc-answered / 2c-pc-revealed / 2d-pc-answered を **2 ペイン min-height:600px + ボタン下端アンカー**にレイアウト
- [ ] 3b: IPA chip 行の chip 0 個バリアントを追加（`min-height:28px`）
- [ ] 3b: A–Z 行を独立カード化（panel bg + hair border + 12px radius）
- [ ] 3d: 「全体の進捗」バー（line 360 の彩色バー群）を撤去
- [ ] 3e / 3f モーダル外枠を上寄せへ変更（内部カードは据置）
- [ ] Design System にモーダル配置ルールを 1 行追記

Round-1 / Round-2（前ドキュメント `2026-07-28_phase3-app-first.md` の未反映分。詳細はそちらを参照）:

- [ ] フッターピル並び順（利用規約 → プライバシー → フィードバック、X 撤去）
- [ ] 3a: GA/RP 横 1 行 2 カラム、選択状態 signal-soft + signal border、チェック四角非表示
- [ ] 2a-2d: 進捗バー + N/M カウンター撤廃
- [ ] 2d: 連結ドリル `.readout .ipa.connected-prompt` に `padding-top:28px; padding-left/right:8px`
- [ ] 3b: GA/RP 切替の右上絶対配置、「全消去」ボタン撤去、A–Z + hint 併記、記号 toggle-off、順序不問 AND、SP カード padding `12px 14px`
- [ ] 3e / 3f: 中央カード + スクリム背景 + 装飾横棒撤去、右上 X 統一

---

## 14. Round-trip 順序

1. Claude Design で本ドキュメント §2–§11 を反映（§1 は方針、§12 は据置確認、§13 チェックリスト）。
2. `IPA - SP.dc.html` / `IPA - PC.dc.html` / `IPA - Design System.dc.html` を export。
3. `docs/claude-design/{sp,pc,design-system}.dc.html` に同期。
4. app 側は round-3 完了時点で本ドキュメントの指示と一致しているはず。diff 確認のみ。
5. もし CD の意匠改善提案があれば別レイヤ（別ドキュメント）で提出。app 側はそこで初めて追随判断する。
