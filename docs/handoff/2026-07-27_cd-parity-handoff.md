---
updated: 2026-07-27
theme: CD↔実UI 完全一致プロジェクト(ClaudeCode 視覚diff)
resume_from: Phase 3 大物2件(app-2-ii ドリルヘッダー / app-5 語彙リスト)
---

# CD↔実UI 完全一致プロジェクト — 引き継ぎ(2026-07-27)

## 0. これは何か
CD(Claude Design、`docs/claude-design/{sp,pc}.dc.html`)と実UIを **文言以外で完全一致**させるプロジェクト。過去の Issue→Cursor/Codex 改修が「視覚的忠実性を検証できない」ため失敗 → 今回は **ClaudeCode 同一セッションで CD と実アプリをブラウザレンダリングして視覚 diff** し、直しては再確認するループで解決中。最終目標は web + iOS/Android を単一デザインで(下記アーキ)。

## 1. 作業環境(そのまま再開できる)
- **作業リポ(iCloud 外・I/O 安定)**: `/Users/naoya.k/Documents/GitHub/IPASoundDrill`
- **branch**: `design/cd-pixel-parity`(base=main)。**commit 2件、未 push**(`15f7984` Phase0-1-2+app-2-i / `5c4d14d` app-3+app-4)
- **視覚 diff ハーネス起動**:
  ```bash
  cd /Users/naoya.k/Documents/GitHub/IPASoundDrill
  node scripts/build-i18n-html.js
  python3 -m http.server 8799   # repo root で
  ```
  - 実アプリ: `http://localhost:8799/{lang}/index.html`(例 `/ja/`)
  - CD: `http://localhost:8799/docs/claude-design/{sp,pc}.dc.html#<frameID>`(例 `#3b`)
  - ブラウザは**実端末幅**でレンダリング(SP=390 / PC=1280)
  - **編集後は必ず `?v=N` でキャッシュバスト**(ローカル配信はキャッシュが効く)
  - オンボ抑止: `localStorage.setItem('onboarding_completed_v1','1')` or スキップ
  - CD フレームは desktop 幅で描画(SP モックは内部375px)。アンカー不発時は `getElementById(id).scrollIntoView()`
- **正本カタログ**: `docs/claude-design/PARITY-CATALOG.md`(全乖離・全決定・進捗ログ)。**最初に必ず読む**。
- **CD修正指示書**: `docs/claude-design/cd-updates/2026-07-27_cd-parity-fixes.md`

## 2. アーキ北極星(合意済)
① 単一デザイントークン ② ポータブル TS コア ③ **Expo + React Native Web 単一UI**(web も RN で書く=乖離が構造的に起きない)。React DOM 単独は終着点でない。順序: 今はトークン統一+ピクセル一致で静的のまま公開 → Track B でコア抽出 → RNW 統一。**今の作業(トークン+CSS 値+CD スペック)は全て RN に再利用される**。
- **CD 変更の運用**: 実質的な意匠/構造変更は **Naoya が Claude Design で実施**(指示書を渡す、round-trip 維持)。ClaudeCode 直接パッチは **純粋な非UI削除のみ**(実績: #3c 装飾削除、CD-4 取消)。語彙リスト実装で CD 調整が要る場合も Claude Design 経由。

## 3. 進捗
- **Phase 0 カタログ**: ✅ 完了(系統原因 R1 二重トークン / R2 フレーム装飾、全★分類)
- **Phase 2 CD修正 CD-1〜6**: ✅ 適用・機械検証・repo同期(Naoya が Claude Design 適用 + #3c/CD-4 は ClaudeCode 直接)
- **Phase 1 トークン一本化**: ✅ 完了。`--legacy-*`→Mood B を **:root で単一箇所参照付け替え**(paper/panel/ink/muted/faint/hair/signal-soft + font ui/mono/ipa)。背景バラつき/くすみ/フォント差 解消。ok/bad/stress は Mood B 非対応で保持。
- **Phase 3 app 実装**:
  - ✅ **app-2-i**: 非 in-play で浮き `#backTopBtn` 非表示 → プロフィールヘッダー崩れ解消
  - ✅ **app-3**: 1a 第1 purpose カード強調(`#purposeGrid .purpose-card:first-child` に signal-soft+teal)
  - ✅ **app-4**: PC 支援画面 左上 ●●● 削除(`.modal-chrome`/`.onboarding-chrome` を PC でも display:none)
  - ✅ **app-2-ii 完了**(大物): ドリルヘッダー集約(CD #2a-2d)。commit `37de505`。task-header を SP でも表示し、topbar/breadcrumb/card内 counter・progress・CEFRバッジを撤去。4モード検証済。PC の card 内重複も解消。詳細 §4
  - ✅ **app-5 SP 完了**(大物): 語彙リスト CD準拠フルリワーク(SP #3b 検証済)。commit `8899194`。PC(3b-pc)はカードのみレスポンシブ反映、固有要素は要判断 → PARITY-CATALOG §PC-conflicts。詳細 §5
  - ⏳ **app-5 PC 残**: 2カラムグリッド + SRS/●●●/フィルタUI の衝突判断(§PC-conflicts)
  - ✅ **app-6 完了**: 3e「IPA って何？」フルページ overlay 新設 + フッター「IPAって何?」導線(signal強調)。commit `867e42f`
  - ✅ **app-7 完了**: 3f 言語設定フルページ overlay 新設(6言語ラジオ)+ フッター「言語設定」導線。言語切替(reload/hash保持)動作確認。commit `867e42f`
  - ✅ **CD-9/10/11 + #3c を repo CD へ同期**(commit `4b63cc2`, Naoya v7 出力): 装飾線削除/ヘッダー globe 丸型/ドリル語彙ボタン削除/#3c 枠装飾削除。※ SP line 308(#3c 背景)は export の `#FFFFFF` を不採用し repo の `var(--paper)` 維持=**CD-13** で Claude Design 側是正待ち。
  - ✅ **STEP ラベル一本化**(commit `f488b37`): 集約ヘッダー title と step ラベルの重複を解消(step ラベル常時非表示)。CD 側は **CD-12** で round-trip 予定。
  - ✅ **CD v7/v8 同期**: CD-9〜13 を repo CD へ反映済(v8 で SP/PC 完全一致、Design System 一致)。
  - ✅ **CD v9 同期**(CD-14/15/16): repo CD == v9(SP/PC 完全一致)。PC 支援画面 ●●● 削除も反映。
  - ✅ **PC 3件修正**(commit 済): ①ドリル幅=`renderCard` で `drill-two-pane` を必ず解除(次問が半幅/不安定になる不具合)②トップ浮き=`#purposeStub.panel` の残存 box-shadow を除去しフラット化 ③「このアプリについて/思想」を下部ロング→**モーダル化**(「思想を読む」で開く/×・スクリムで閉)。ヘッダー「IPA って何?」は 3e(#/ipa)へ正接続。※いずれも app 側(CD 影響小)。
  - ✅ **PC 精緻化 5件**(Naoya リクエスト第3弾): ①2ペイン境界=prompt paper/answer panel で明示(ID セレクタ勝ち負けを是正、CD一致)②言語入口をヘッダー globe→3f に一本化(フッター「言語設定」撤去)③初期描画をフラット化(第1カード塗り強調 撤去=Q2 supersede)④ドリルカード min-height:600px で高さ固定(出題↔答え合わせのガタつき解消)⑤PC 語彙リスト列幅 820→620px。CD 側は **CD-17(1a フラット)/CD-18(フッター言語設定削除)** で round-trip。PC 語彙は単一カラム確定=CD 3b-pc(2カラム)と意図的差異。
  - ✅ **追加改善 A/B/C/D**(Naoya リクエスト第2弾): A=戻る丸chevron/左寄せ明朝を 3a/3c/3d へ横展開、B=出題(2a)の入力/ボタン位置固定(RP 行スペース常時確保)、C=①アクセント「GA·米」→「GA」②オンボ位置表示をドット一本化、D=`ga_rp_same` の設計意図を data-contract.md に明記(実質同じ音=IPA完全一致ではない)。CD 側は **CD-14/15/16**(`cd-updates/2026-07-27_cd-parity-ux-improve-2.md`)で round-trip 予定。
  - ✅ **UX 改善 5件**(Naoya リクエスト, commit `adf2510`): ①オンボ4スライド高さ統一(「つぎへ」位置固定 Y=608)②装飾アンダーバー(`.top-swash`)撤去+余白詰め ③ヘッダー3ボタン丸型統一+言語=globe アイコン(既定 en)④2b「クリア」をビルド欄右隣へ ⑤ドリルヘッダーの語彙(≣)リンク撤去(GA/RP は保持)。#2/#3/#5 は CD 意匠と差分→**CD-9/10/11**(`cd-updates/2026-07-27_cd-parity-ux-improve.md`)で round-trip 予定。横展開(他画面のボタン位置固定)は今後検討。
  - ✅ **1a トップ 0ベース再設計**(Naoya リクエスト, 案A採用): 左サブコピー(思想)と右サイドバー「このアプリについて」の**二重表現を解消**。右サイドバーを撤去し、思想は「サブコピー1文＋『思想を読む →』リンク(→3h モーダル)」に集約。空いた横幅へ**学習状況カードを右上へ移動**、**目的4カードを全幅グリッド化**(位置は hero 直下のまま=左寄せ移動しない)。PC は `grid-template-areas:"hero aside"/"purpose purpose"`、SP は 目的→振り返り の縦積み順を維持。CD-17/18 を内包。CD 側は **CD-19**(`cd-updates/2026-07-27_cd-parity-1a-redesign.md`)で round-trip。
  - ✅ **重複導線の集約**(Naoya リクエスト): ヘッダーの「学習状況/IPAって何?」テキストリンク(PCトップ限定表示)を撤去。学習状況=カード / IPAって何?=フッターピル / 思想=hero リンク に各1本化。ヘッダーが全ブレークポイント・全言語で同一(brand+globe+語彙≣+ガイド?)に。到達性喪失なし(他画面で `.header-nav` は元々非表示)。CD 側は **CD-20**(同 1a-redesign 指示書に追記)で round-trip。
  - ✅ **IPA導線を hero に集約(案A)**: 「IPAって何?」をフッターピル→ hero に移設し「思想を読む →」の隣に併置(`.top-hero-links`)。フッターピルは撤去(=Feedback/Terms/Privacy/X のみ)。3e ページは温存。→ IPA=hero / 思想=hero / 学習状況=カード で全て1箇所。CD 側は **CD-21**(同指示書)で round-trip。
  - 🔧 **ドリル(2a/2b)CD 再正本化(CD-first)**: Naoya 指摘「2b が CD と実UIで別物・完全一致させたい」。調査で **CD 側にも不足**(二重母音キー無し=/spaɪ/ 組立不能 / 削除操作未定義 / 未回答状態フレーム無し)が判明 → app→CD 単純コピー不可。governance に沿い **CD を先に正本化**する修正指示書 `cd-updates/2026-07-27_cd-parity-drill-reconcile.md` 作成。骨格=統合カード(ヘッダー内包+2ペイン paper|panel)を app が採用、(A)CD 追加=二重母音/削除ボタン/未回答単カラム~560px、(B)判断待ち=答えペイン「GA/RP発音カード vs 発音ポイント」。**この過程で今セッションの drill 実験(単問半幅・2ペイン統合)は一旦 revert**(CD 確定後に一致実装)。語彙3b・2c/2d は後続で同型展開。
  - ✅ **v10 CD 反映検証**: CD-17/18/19/20/21 + A-1(二重母音)/A-2(単一⌫) すべて指示どおり反映を確認(マークアップ精査)。軽微: 1a-pc キャプションが旧「右=About」のまま(中身は学習状況カード)=次回修正。
  - 📋 **決定(2026-07-27, 追加ラウンド分)**: ①進捗=**ヘッダーアイコンに格下げ**(CD-22。aside 大カード撤去・hero 単カラム化) ②答えペイン=**GA/RPカード＋発音ポイント両立**(B-1)かつ**白地の雑多な羅列→CDの枠付きサブカード型にクリーン化**(B-2) ③語彙=**レスポンシブ2カラム(PC)/1カラム(モバイル)・検索追加なし・行タップ現状**(app 側で CD 2カラムに一致)。
  - ✅ **UX 全般 ux-review 一巡**: 答えペイン/1a/語彙/進捗/オンボ + 2c(neighbors <3=18%質劣化・非バグ)/2d(carriers・ipa_strong 正常, ga_rp_same=bool でバグ無し=誤検知解消)。監査 `cd-updates/2026-07-27_ux-data-audit.md`。実装ブロッカー無し。
  - ✅ **再利用資産**: `.claude/skills/ux-brief`・`ux-review`(移植可) + `knowledge/`(手法+記載例)。
  - ⏭️ **次 CD ラウンド指示=清書済**: `cd-updates/2026-07-27_cd-round-next.md`(CD-22進捗アイコン/A-3未回答フレーム/B-1・B-2 答えペイン=respell主役/CD-14見出し/3dストリーク撤去/1a-pcキャプション)。Naoya が Claude Design 反映 → エクスポート → repo CD 一括同期 → app 一致実装。
  - ⏭️ **app 先行可(CD非依存)**: POS i18n・GA=RP畳み・streak撤去・要注意音厳選・respell表示・語彙2カラム。
  - ✅ **app 一致実装 完了(全4 Phase, develop 反映)**: Phase1=ドリル統合カード(ヘッダー内包/未回答単カラム600px/回答後2ペイン paper|panel・背景同化解消) / Phase2=答えペイン CD 完全一致(正解バッジ・読み方respell主役・GA/RP発音カード枠(GA=RP畳み)・発音ポイント枠・次へteal、renderPronCard 新設、reveal.correct/incorrect/pron_label 6言語追加、respell_label 重複キー一掃) / Phase3=2c(mode B study の空右ペイン破綻を単カラム化で修正)/2d クリーン / Phase4=語彙 PC2カラム(rebuildVirtSlots に cols、row2 ペア化、vocabRowHeight を GA=RP に補正)。2a/2b/2c/2d/語彙/モバイル で検証、コンソールエラーなし、i18n 緑。develop: `0a9d3d2`。
  - 📌 **「全言語でUI差異」検証結果**: 1a の CSS/構造は**言語非依存**(`:lang()`/lang別body class なし、build は文言と `<html lang>` のみ差替)。en/ja/ko/zh-Hans/zh-Hant/fil すべて同一構造を確認。ユーザが見た「英語だけ縦積み」は **1024px ブレークポイント未満**の応答的レイアウト(狭い窓)であり言語差ではない。※ 抜本見直し(IPA導線の露出度・トップ IA)は Naoya と方向確認中。
  - ✅ **app 一致実装 追加(develop `efe844d` まで)**: 1a TOP を CD-22(進捗→ヘッダーアイコン/hero単カラム)に一致。ドリル**共通UI化**(2a/2b/2d を左右2ペインに統一: 未回答=左出題(半画面)+右プレースホルダ`setRevealPending`/回答後=左入力非活性`body.drill-answered`)。共通修正: 「おしい」→「不正解」・進捗バー`max-width:420`撤去・ページ地 canvas 色(#E7E1D7)でカード分離+影・語彙CD一致(カード統一/全消去+記号ピッカー/検索GA-RP両対応)・i18n(reveal.incorrect/pending/pron_label/correct, vocab.filter.clear/picker, 数詞, respell_label重複一掃)。

### ✅ 2026-07-28 フィードバック 対応完了(develop `5608b46`)
1. 2c(mode B study)を共通の左右2ペインに統一(左=音+IPA/右=意味確認前プレースホルダ→確認後に答え)。
2. ヘッダーアイコン間隔を均等化(34px・gap8)。
3. フッター Terms/Privacy/Feedback を各言語化(日=利用規約/プライバシーポリシー/フィードバック, 6言語)。
4. 答えペイン整理: 読み方(respell)/辞書表記/曖昧なメインIPAを撤去→IPAは発音カードのGA/RP行に一本化(GA/RP明示)。
5. 語彙: 記号ピッカーボタン廃止→IPAキーボード常時表示+ラベル(GA/RP両検索)、A–Zとの境界に区切り線。
- 併せて: ドリル共通UI(2a/2b/2d左右2ペイン+未回答プレースホルダ+回答後入力非活性)、不正解表記、進捗バー、ページ地canvas色、1a=CD-22、語彙2カラム/カード統一 も develop 反映済。

### 🔜 次セッション TODO
**まず**: `git-develop` エイリアスで全画面(1a/2a/2b/2c/2d/語彙/モバイル)を実機確認。
**残(軽微・未対応)**:
- footer 遷移先ページ `terms.html` / `privacy.html` に Mood B デザイン適用(別HTMLファイル)。
- 語彙キーボードで記号別の GA/RP バリエーション可視化(現状はラベルで「GA/RP両検索」を示すのみ)。
- 2c の quiz/dict 派生(MODEB_QUIZ有効時)も左右2ペインに揃えるか要確認。
- mode B 答えの語(mbSWord)色が ink、2a/2b(rWord)は accent → 統一するか判断。
**CD round-trip(app先行分の反映指示書作成)**: ドリル共通UI(常時2ペイン+プレースホルダ+非活性)・語彙(キーボード常時+カード統一)・答えペイン整理 は app 先行。CD(docs/claude-design)へ反映する指示書を作成 → Naoya が Claude Design 反映。
**本番反映**: develop→main の PR(Naoya ack 必須)。develop は main より大幅先行。

### (旧)次セッション TODO(2026-07-28・対応済に移行)
develop 最新 `efe844d`。`git-develop` エイリアスで確認。
1. **2c(mode B)を左右2ペイン化**(承認済・別フロー): `renderModeBStudy`/`applyModeBStudyTwoPane` を 2a/2b と同じ骨格へ。左=音+IPA(cardModeBStudy)、右=意味確認前はプレースホルダ→確認後に答え(cardModeBStudyAnswer を drill-pane-answer 化 or #reveal 統合)。quiz/dict 派生も要考慮。
2. **ヘッダーアイコン幅を均等に**: globe(lang-switcher)が ≣/📈 より広く見える。`.topbtn`/`.lang-switcher.topbtn` を同一サイズ・同一 gap に。
3. **フッター文言 i18n**: 「Terms/Privacy」を各言語化(日本語=利用規約/プライバシーポリシー)。data-i18n は JS 個別適用のため footer 用の適用を追加。遷移先 `terms.html`/`privacy.html` にもデザイン適用。
4. **答えペイン整理**: 「読み方(respell)」はスピーカー上に移動 or **トルツメ**(IPA学習主眼＋スピーカーありで読みの必要性低い=Naoya)。「辞書表記」と メインIPA が GA/RP どちらか不明 → GA/RP を明示する工夫(ラベル付与等)。
5. **語彙リスト UI 改善**: 「記号ピッカーを開く」がモーダルでなく表示切替だけなら、**最初から記号表示**しボタン/枠を廃止する案。IPA記号は **GA/RP でバリエーション差**があるので可視化。**A–Z(アルファベット)と IPA記号キーの境界**を明確化。

- **Phase 4/5**: 未(Sonnet 1次Rv → Opus 横断2次Rv)

## 4. app-2-ii ドリルヘッダー(大物・要注意)✅ 完了(2026-07-27, commit `37de505`)
**実装結果**: `.task-header`(back+title+meter+vocab+accent+counter)を **SP でも表示**(`updateTaskHeader` の `isPcLayout()` ゲート撤去 + `body.in-play .task-header{display:flex}` を一般規則化)。in-play で **topbar / play-line(breadcrumb)/ .card-top(CEFR+counter)/ .drill-progress(重複メーター+0%)/ 浮き #backTopBtn を display:none**。4モード(2a/2b/2c/2d)で title/counter/meter populate・戻る(exit-confirm→goToTop)・reveal 状態・PC 重複解消・console 0 err を確認。
> 補足: CD SP はヘッダーを card 内 top 行に持つが、app は wired 済の task-header を card 上のバーとして表示(要素・行レイアウトは一致)。厳密に card 内へ入れる場合は別途構造変更。

**(旧・着手前メモ)単純トグルではない。** 現状の散在(topbar の浮き `#backTopBtn` / breadcrumb「IPA読み書き>…」/ card 内 A1バッジ+counter+progressバー)を、CD 2a の **card 上部1行に「戻る(chevron)+ title + progress meter + counter」集約**へ作り替える。
- `.task-header`(id=`taskHeader`, HTML 909-)は **JS 完全配線済**(taskHeaderTitle/MeterFill/Back/Accent を populate: 5086付近、Back click 4761)だが **container を表示するルールが無く `hidden` も外れない=デッドコード**。force-show すると戻る chevron のみ表示・title/meter は空(この flow で未populate)。
- 実装方針: ① `body.in-play .task-header{display:flex}` 等で container 表示 + JS で in-play 時に `hidden` 解除 ② title/meter を 4モード(2a/2b/2c/2d)で populate 確認 ③ breadcrumb と card counter/progress を集約(重複排除) ④ 戻る動作確認後に浮き `#backTopBtn` を in-play でも撤去。
- **各モードを CD `#2a`〜`#2d` と1枚ずつ視覚 diff しながら**。topbar の ≣/? との重複に注意(task-header の vocab/accent は現状 display:none)。

## 5. app-5 語彙リスト フルリワーク(大物)【CD準拠・全仕様確定済】
CD `#3b`(SP)/`#3b-pc`(PC)のコンパクト設計に app を合わせる。**確定仕様**(PARITY-CATALOG §3b):
- 戻る=丸アイコン(chevron) / フィルタ=「IPAで絞り込み(最大3)」+GA/RPトグル+選択チップ(×)+「記号を追加」破線チップ / IPA キーボード=**横1行スクロール**(現状の多段フルグリッドから) / A–Z=横スクロール / 結果件数行「…42件」追加
- 単語カード=語+CEFRバッジ(色)+品詞+**意味(例 上着・ジャケット)追加**+GA/RP行(grid ラベル/IPA/スピーカー)
- **削除**: 単語/フレーズ タブ(語彙は単語のみ=フレーズは文脈込みでないと伝わらないため載せない)/ **3×3 チェックドット**(語彙は発音辞書であり学習記録の場でない)/ CEFR 絞り込みピル
- SP/PC 両方。実装で CD 側微調整が要れば **Claude Design 経由**(round-trip)。

## 6. 確定した設計判断(Q1-Q10 + SRS)
- 語彙リスト(3b)= CD準拠コンパクト版(§5)
- **SRS マーキング = ユーザー手動**(自動でない)。横3ボックス。居場所=各ドリル答え合わせ(2a-2d)+学習状況(3d)。語彙リストには出さない。
- モーダル背景 = **#FDFBF7(他カード共通)**(Q10、app・CD 揃え済。当初「app=#FFF」は測定ミス→訂正済)
- 1a「目的から選ぶ」ラベル=CD削除済 / 第1カード強調=app-3済 / 3e=SPフッター導線(app-6) / 3f=SP専用設定ページ(app-7) / IPAフォント=Charis優先(CD一致)

## 7. ✅ 解決: PR #164 は CLOSED(2026-07-27)
**PR #164「feat: PC UI 品質補完 Phase 2」は CLOSED(未 merge)確認済。** CD-parity(特に app-5 PC リワーク)が PC UI を包括的に作り替えるため上位互換=不要と判断し close で決着。以下は経緯記録:

**(旧)PR #164「feat: PC UI 品質補完 Phase 2」(branch `codex/issue-163-pc-quality-phase2`)が CD-parity と衝突していた。**
- #164 変更ファイル: `src/index.template.html`(+96/-17 の **PC UI**)、`docs/claude-design/pc.dc.html`(+5/-5)、`docs/LAUNCH-CHECKLIST.md`、agent-report。
- **衝突点**: (a) `pc.dc.html` は CD-parity で **新 CD に全置換済**(CD-1〜6)→ #164 の pc.dc.html 差分と競合。 (b) `index.template.html` の PC UI は app-1〜4 と同一ファイル・同一領域を編集 → CD-parity が #164 を**上書き/上位互換**する可能性大。
- **推奨(品質優先)**: #164 のレビュー/マージ判断は **CD-parity の存在を前提に**行う。CD-parity は PC UI を CD 準拠で包括的に作り替えるため、#164 は多くが**上位互換で不要**の見込み。選択肢: ①#164 を close(CD-parity に吸収)/ ②#164 を先に merge → CD-parity を rebase して衝突解消(最終状態は CD-parity 準拠に)。**フレッシュな Chat で #164 だけを見ると本重複を見落とす**ので、必ず本 handoff §7 を読んでからレビューすること(= Rv 品質はこの注記で担保)。
- CD-parity branch は未 push。#164 と並べて判断したい場合は `git push -u origin design/cd-pixel-parity`(WIP、PR化はしない)で可視化可(push で `needs-review` 自動付与に注意)。

## 8. 次セッションの起点
1. `docs/claude-design/PARITY-CATALOG.md` を読む(全体像)
2. ハーネス起動(§1)
3. **app-5 語彙リスト**(仕様確定済で着手しやすい)or **app-2-ii ドリル**(要注意)から。各画面 CD と視覚 diff → 実装 → `?v=N` 検証 → commit
4. app-6/app-7 → Phase 4(Sonnet 1次Rv)→ Phase 5(Opus 横断2次Rv)
5. 適宜 #164 の扱いを Naoya に確認(§7)
