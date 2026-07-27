# CD ↔ 実UI ピクセル一致 マスターカタログ

> 目的: Claude Design(CD)と実UIを **文言以外で完全一致**させるための、全画面 視覚 diff 台帳。
> 過去の Issue→Cursor/Codex フローに欠けていた「視覚的忠実性の検証」を、ClaudeCode 同一セッションの
> レンダリング比較で埋める。本ファイルが以降の全修正作業の起点(source of work)。

- 作成: 2026-07-27 / branch: `design/cd-pixel-parity` / base: `main`
- 作業リポ: `/Users/naoya.k/Documents/GitHub/IPASoundDrill`(iCloud 外・I/O 安定)
- アーキ北極星(合意済): ①単一トークン ②ポータブルTSコア ③**Expo + React Native Web 単一UI**
  - 本カタログの各行に「RN移植注意」列を持ち、将来の RNW 化で引き継ぐべき論点を残す

## 確定事項サマリ(Naoya 判断済 / 2系統で追跡)

### A. CD 側を修正する ✅ **適用・検証・repo同期済(2026-07-27)**
指示書: `cd-updates/2026-07-27_cd-parity-fixes.md` / 適用: Naoya(Claude Design)+ #3c のみ Claude Code 直接パッチ
- **CD-1** ✅ 1a「目的から選ぶ」削除(SP/PC 3言語、機械検証 0件)【Q1】
- **CD-2** ✅ デバイス枠装飾 `9:41`/`●●●●` 削除(SP 全13フレーム、検証 0件。#3c は直接パッチ)【R2】
- **CD-3** ✅ SRS マーキング 縦→横3ボックス・手動(3g、inline-flex 確認)【SRS】
- **CD-4** 🔁 **取消(Q10 再決定)**: モーダル card は他カードと同じ `var(--panel)` #FDFBF7 に統一。理由: 「app=#FFF」は私の**測定ミス**(実態は #FDFBF7)。repo CD は 4スライドカードを #FFFFFF→`var(--panel)` に戻し済(直接パッチ)。app 側の #fff override も撤去。**Naoya さんは Claude Design ソースでも CD-4 を破棄してください**(モーダル=panel色)。両側 #FDFBF7 で一致確認済
- **CD-5** ✅ 1a フッター導線 IPA って何→#3e / 言語設定→#3f(3言語)【Q8】
- **CD-6** ✅ #3f 言語設定ページ存在 + 導線【Q9】
- 除外保全 ✅ 語彙リスト 3b/3b-pc・トークン 未変更

> **CD 変更の運用原則**: 実質的な意匠/構造変更は **Claude Design 経由(指示書)** で round-trip 維持。Claude Code が直接パッチするのは #3c のような **純粋な非UI削除**に限定し、Claude Design の削除パターンと byte 一致させる。語彙リスト(app-5)実装時に CD 側調整が要る場合も **Claude Design で対応**。

### B. 実装(app)側を CD に合わせる
- **app-1**: 二重トークン一本化(`--legacy-*`→Mood B、body 背景 `--paper`)【R1】
- **app-2**: ヘッダー崩れ修正(浮いた丸「TOPへ」削除、`←TOPへ`はパネル内テキストのみ、SP で `pc-support` を付けない)
- **app-3** ✅済: 1a 第1 purpose カードに CD 準拠の強調スタイルを適用【Q2】
- **app-4** ✅済: PC 左上「・・・」(modal-chrome/onboarding-chrome)削除(CD-2 の誤踏襲)
- **app-5**: 3b 語彙リスト CD準拠フルリワーク(フレーズタブ削除【Q6】/ 3×3 ドット削除【Q7】/ 意味表示追加 / 最大3の IPA 部分一致フィルタ / IPA キーボード横スクロール / 戻る丸アイコン)。SP/PC 両方
  - ✅ **SP 完了・検証**(2026-07-27): タブ/CEFRピル/3×3ドット削除、丸chevron戻る、フィルタ箱(「IPAで絞り込み(最大3)」+GA/RPトグル+選択チップ(×)+破線「記号を追加」)、IPA キーボード横1行スクロール、A–Z 横スクロール、件数行(「絞り込み結果 · æ+k を含む GA 発音 · 89件」/無絞り込み時「全 N件」)、カード=語+CEFRバッジ(色 CD一致)+品詞(faint)+意味+GA=RP印+GA/RP行(grid ラベル/IPA/行内スピーカー)+一致ハイライト。仮想リスト高さ再計測・A–Z ジャンプ・console 0 err 確認。i18n 6言語追加(`vocab.filter.ipa/ipa_max/add`・`vocab.count.filtered/all`)validate 緑。GA/RP トグル=グローバル ACCENT に連動。
  - ⏳ **PC(3b-pc)**: カードは SP と同一リワークが**レスポンシブで反映済**(単一カラム 820px、CD カード意匠一致)。ただし CD 3b-pc 固有要素は**要 Naoya 判断**(下記 §PC-conflicts)。2カラムグリッドは仮想リスト構造の再設計が必要なため保留。
- **app-6**: 3e「IPA って何？」への SP フッター導線を追加【Q8】
- **app-7**: 3f 言語設定の SP 専用ページ + 導線を新設【Q9】
- (モーダル色: app の #FFF が正 → app 変更なし。CD-4 で CD を白へ)【Q10】

### SRS の実態(仕様確定)
- ユーザーが**手動**で「覚えた」をタップして印を付ける(自動採点で増減しない)
- 3つで卒業、チェックの少ない語から優先出題
- 居場所 = **各ドリル答え合わせ(2a–2d)+ 学習状況(3d)**。語彙リストには出さない
- 印の並びは**横**(CD SP 3g は縦表現なので CD-3 で修正)

## 検証ハーネス

```
scripts/build-i18n-html.js で 6言語 HTML 生成 → python3 -m http.server 8799(repo root)
実アプリ: http://localhost:8799/{lang}/index.html   ← 実端末幅でレンダリング(SP=390 / PC=1440)
CD:       http://localhost:8799/docs/claude-design/{sp,pc}.dc.html#<frameID>
```
- SP 実機と一致確認済み(390×844 で IMG_1558 等と一致)
- CD は「デバイスフレーム入り設計ドキュメント」形式。SP モック(内部375px)を見るには **desktop 幅で描画**する
- オンボーディングは LS `onboarding_completed_v1` で抑止(スキップでも可)

## 全画面インベントリ(CD frame ID 基準)

### SP(`sp.dc.html`)
| frameID | 画面 | 状態 |
|---|---|---|
| 1a-ja / 1a-en / 1a-ko | トップページ | 着手(下記) |
| 2a | Decode ドリル + 答え合わせ(正解/不正解) | 未 |
| 2b | Encode(発音から書く)ドリル | 未 |
| 2c | Mode B(音から単語)ドリル + 答え・意味 | 未 |
| 2d | Connected Speech(連結)ドリル | 未 |
| 3a | 学習プロフィール | 未 |
| 3b | 語彙リスト | 未(★実UIと大きく乖離との報告) |
| 3c | 語彙 IPA 詳細 | 未 |
| 3d | 学習状況 | 未 |
| 3e | (SP 導線なしと報告) | 未(★導線欠落) |
| 3f | (SP 導線なしと報告) | 未(★導線欠落) |
| 3g | オンボーディング 4スライド | 未 |

### PC(`pc.dc.html`)
| frameID | 画面 | 状態 |
|---|---|---|
| 1a-pc / 1a-pc-en / 1a-pc-ko | トップページ(4×1 grid + sidebar) | 未 |
| 2a-pc 〜 2d-pc | ドリル 1024px 2ペイン | 未 |
| 3a-pc | プロフィール | 未 |
| 3b-pc | 語彙リスト | 未 |
| 3c-pc | 語彙詳細 | 未 |
| 3d-pc | 学習状況(CEFR別) | 未 |
| 3e-pc | 結果(左パレット/右ライブ) | 未 |
| 3f-pc | トップ(表示言語のみ) | 未 |
| 3g-pc | オンボーディング 4カード | 未 |

## 構造的根本原因(全画面に波及)

### R1. 二重トークン(最重要・機構を特定済)
`src/index.template.html` の `:root` に**2組のトークンが併存**し、多くが**別の値**:

| トークン | legacy | Mood B(CD正) | 差 |
|---|---|---|---|
| paper(背景) | #F4F3EE | #F3EDE6 | ◯ 差あり |
| panel | #FFFFFF | #FDFBF7 | ◯ |
| ink(本文色) | #191C20 | #2A2420 | ◯ |
| muted | #6C717A | #7C7269 | ◯(寒⇔暖) |
| hair | #E2E0D8 | #E7DCCF | ◯ |
| faint | #9AA0A8 | #AC9F94 | ◯ |
| signal | #0C7C7E | #0C7C7E | 同 |

**機構**: グローバル `body{background:var(--legacy-paper)}`(line 87)が既定。
`body.top-home` / `body.vocab-page,symbol-picker-page,progress-page`(line 255,614)だけ `--paper` に上書き。
→ **プロフィール(3a)・ドリル(in-play)は上書きが無く legacy 背景(#F4F3EE)のまま**。実測で確認:
`3a: body.bg=rgb(244,243,238)=#F4F3EE(legacy)` vs `top: #F3EDE6(Mood B)`。
legacy 使用画面は paper/ink/muted 等がずれ、全体に寒色・くすんで見える。

**Phase 1 修正方針**: `--legacy-*` を Mood B 値へ寄せる(エイリアス化 or 置換)+ グローバル body 背景を `--paper` に。
`--legacy-*` 参照は約 200 箇所(`--legacy-signal`×41 等)。一括寄せ後、各画面を視覚 diff で回帰確認。
将来 RNW でも `tokens.ts` として同値を共有 → 乖離が構造的に起きなくなる。

### R2. CD 側のデバイスフレーム装飾が「実装すべき UI」と混同されている
CD の SP/PC モックは `9:41` ステータスバー・右上 `●●●`(カメラ/notch 風の点)を**フレーム装飾**として持つ。
これは実 UI 要素ではない。**PC 画面左上に出る「無駄な・・・」はこの装飾を実装が誤踏襲したもの**。
→ 対応: CD 側は装飾と明記(UPDATE-GUIDE に注記) / 実装側は該当要素を削除。

## Phase 1 進捗ログ(トークン一本化)= legacy→Mood B 参照付け替え(単一箇所)
- **[済・検証]** Batch 1: `body` 背景 `--legacy-paper`→`--paper`(src:87)+ `--legacy-paper/panel/ink`→Mood B(:root 定義)。profile body=rgb(243,237,230)=#F3EDE6 確認。回帰なし
- **[済・検証]** Batch 2: `--legacy-muted/faint/hair/signal-soft`→Mood B。全て Mood B 値に解決確認。プロフィールのくすみ解消
- **[済・検証]** Batch 3a: `--legacy-ui/mono`→`--font-ui/mono`。legacy 画面本文が **Noto Sans JP** に(CD・top と一致)。SP プロフィール 折返し崩れなし
- **[済・検証]** Batch 3b: `--legacy-ipa`→`--font-ipa`(Charis 優先、CD一致)【Naoya 確定】。表示 IPA 全文脈が Charis SIL に統一(ドリル `.ipa`=Charis 目視確認、`.dict-ipa`/`.ipa-inline`=Charis 実測)。Doulos は fallback 継続で ɒ coverage 維持。※`.accent-card-ipa` は `display:none`(未使用)で "Arial" 計測は視覚無影響
- **[残・軽微]** 直書き `#fff`(langpick/topbtn 等の小コントロール=非 top-home で #fff、top-home は #FDFBF7 / 2d-en の1カード)→ Phase 3 で用途別に確定(視覚影響小)
- **保持**: `--legacy-signal`(同値)、`--legacy-stress/ok/bad/*-soft`(Mood B 非対応の意味色)

### ✅ Phase 1 完了(2026-07-27)
`--legacy-*` を Mood B へ**単一箇所で参照付け替え**(約200箇所へ安全波及)。色(paper/panel/ink/muted/faint/hair/signal-soft)+ フォント(ui/mono/ipa)を統一。各段階で実測+目視検証・回帰なし。**「画面ごとに背景色が違う/くすむ/フォントが違う」= 解消**。残 `#fff` 小コントロールは Phase 3 で。
- 注意: 編集後の検証は `?v=N` でキャッシュバスト

## 画面別 diff(記録フォーマット)
各行: `画面 | 要素 | CD 期待 | 実測 | 分類(app修正/CD不備/要判断) | RN移植注意`

### 1a トップページ(SP)— 着手
| 要素 | CD 期待 | 実測(app) | 分類 | 備考 |
|---|---|---|---|---|
| purpose セクション見出し「目的から選ぶ」 | (CD にある) | 見出し無し | **CD修正【Q1確定】** | 追加しない。**CD から削除**(実装が正) |
| 第1 purpose カード強調 | signal-soft 緑地の強調スタイル(全言語共通) | 全カード白 | **✅ app-3 済** | `#purposeGrid .purpose-card:first-child` に signal-soft+teal border 適用。card1 bg=#E1EFEE/border=#0C7C7E 実測、他カード #FDFBF7。CD 1a 一致・目視確認 |
| デバイスフレーム ●●● / 9:41 | (フレーム装飾) | 実UIには無し(正) | **CD修正【R2確定】** | **CD から削除**。PC では誤踏襲→app も削除 |
| 背景/ヘッダー/明朝見出し | Mood B | 概ね一致 | ok | |

### ヘッダー(SP・全学習画面共通)★ヘッダー崩れ 【app-2 進行中】
| 要素 | CD 期待 | 実測(app) | 分類 | 状態 |
|---|---|---|---|---|
| プロフィール(setup)ヘッダー | brand+JA+≣+?(top と同じ)、戻るは content 内 | 浮いた丸「TOPへ」が折返して崩れ | app修正 | **✅ 2a-i 済**: `body:not(.in-play) #backTopBtn{display:none}` で浮き TOPへ を非表示。ヘッダー1行化、`←TOPへ`(パネル内)で戻る。検証済 |
| ドリル(in-play)ヘッダー | CD 2a: card 上部1行に **戻る(chevron)+ title「音から単語を書く」+ progress meter + counter「1/2382」**を集約。浮き TOPへ無し | 情報が散在: topbar(brand+lang+≣+?+**浮きTOPへ**)+ breadcrumb「IPA読み書き>一単語(GA)」+ card内(A1バッジ+counter+progressバー)。task-header は force-show すると**戻るchevronのみ表示・title/meter は空(この flow で未populate)** | app修正(**要リストラクチャ**) | ⏳ **2a-ii = 単純トグルでない**。必要: ①card 上部に CD式ヘッダー行(戻る+title+meter+counter)を構成 ②breadcrumb + card counter/progress を集約 ③title/meter を4モード(2a/2b/2c/2d)で populate ④浮きTOPへ撤去(戻る用意が前提)。core UX のため各モード CD 突合しながら慎重に。**方針確定後に着手推奨** |
| body クラス pc-support | — | SP でも付与(line 5065)。ただし現状 SP で実害は未確認(●●● は PC のみ) | 要確認 | 2a-ii/app-4 と併せて精査 |

### 3a 学習プロフィール(SP)
| 要素 | CD 期待 | 実測(app) | 分類 | 備考 |
|---|---|---|---|---|
| 背景 | Mood B `--paper` #F3EDE6 | `#F4F3EE`(legacy) | app修正 | R1。body 背景上書き無し |
| パネル/見出し/GA·RP/CEFRカード | Mood B | パネル #FDFBF7 は一致、CEFR カード概ね一致 | 要確認 | 微差は Phase 3 で実測突合 |
| 丸「TOPへ」ボタン | 無し | 表示(崩れ) | app修正 | 上記ヘッダー参照 |

### 3b 語彙リスト(SP)★全然違う 【決定: CD準拠(2026-07-27 Naoya)】
CD 3b 全文(sp.dc.html 276-311)確認済。**CD 準拠**に寄せる。CD の確定仕様と実装差分:

| 要素 | CD 期待(正) | 実測(app) | 対応 |
|---|---|---|---|
| 戻る | 丸アイコンボタン(chevron のみ) | 「戻る」テキスト pill | app→CD 化 |
| フィルタ | 「IPAで絞り込み **(最大3)**」+ GA/RP トグル + 選択チップ(× 付)+「記号を追加」破線チップ | 「IPA」+「全消去」+ 全グリッド常時展開 | app→CD 化(最大3部分一致モデル) |
| IPA キーボード | **横1行スクロール**(æ ʌ ɑ … r) | 多段フルグリッド | app→CD 化(横スクロール) |
| A–Z 索引 | 横1行スクロール(CDにも**有る**) | A B C… 行(有る) | 形状を CD へ寄せ |
| 結果件数行 | 「絞り込み結果 · æ+ʒ を含む GA 発音 · 42件」 | (要確認) | 追加 |
| 単語カード | 語+CEFRバッジ(色)+品詞+**意味(上着・ジャケット)**+任意「GA=RP」+ GA行/RP行(grid: ラベル/IPA/スピーカー) | 語+CEFRバッジ+品詞+GA/RP(**意味なし**)+**3×3チェックドット**+スピーカー | 意味を追加 / **3×3ドット削除【Q7確定】** |
| 単語/フレーズ タブ | **無し** | 有り | **タブ+フレーズ機能ごと削除【Q6確定】** |
| CEFR 絞り込みピル | **無し**(per-card バッジのみ) | A1/A2/B1/B2/全て ピル | 削除 |

> 【Q6 確定 2026-07-27】語彙リストは単語のみ。フレーズは文脈込みでないと伝わらないため語彙リストに載せない(フレーズ導線の代替不要)。
> 【Q7 確定 2026-07-27】語彙リストは「発音を素早く引く辞書」であり学習記録の場ではない → 3×3 マーキングドット削除。**CD は正(CD 修正不要)**。
> SRS マーキング(覚えた/□/3つで卒業)の本来の居場所 = **各ドリル答え合わせ(2a–2d)+ 学習状況(3d)**。該当画面カタログ時に存在確認する。

---

### 2a–2d ドリル + 答え合わせ(SP)★答え合わせUIが色々違う
CD SP 2a-2d(220-247行)確認済。**答え合わせ = SRS マーキングの居場所**(Q7 の裏付け):
- CD 出題: 「音を聞く」+ 入力/選択 +「確認する」
- CD **答え合わせ(正解)**: 「正解」+ GA/RP IPA + **「覚えた」「覚えたらタップ」**(=マーキング)
- CD **答え合わせ(不正解)**: 「不正解」+「あなたの解答」+「正解」+ GA/RP +「もう一度」

app 走行で 2a 答え合わせ(正解)撮影済:
| 要素 | CD 期待 | 実測(app) | 分類 |
|---|---|---|---|
| SRS マーキング | 「覚えた/覚えたらタップ」 | **「覚えた 0/3・覚えたらタップ」+ 横3チェックボックス**(手動タップ) | **一致(実態が正)**。CD SP 3g は縦→**CD-3で修正** |
| 正解/不正解ラベル | 「正解」「不正解」を明示 | 明示バナー弱い(語が accent 色になる程度)+「答えを確認」 | 要判断(掃き出し後にバッチ) |
| 発音ポイント | (CD 2a に明示なし) | 「第2音節を強く・要注意音: s ɪ i」+ チップ | 要判断(CD 側追記 or 現状維持) |
| 意味表示 | (要確認) | 語の下に「16」 | ok寄り |
| ヘッダー | task-header(戻る+title+progress) | brand+JA+≣+?+**TOPへ** を1行に詰め込み(窮屈) | app修正(ヘッダー統一) |
| 背景 | Mood B | in-play は legacy 背景の疑い(R1) | app修正 |
| 不正解状態 | 不正解/あなたの解答/正解/もう一度 | ★app 未撮影(構造は CD で既知) | 軽微follow |

> 確定: SRS マーキング実態 = **横3ボックス・手動**。CD(SP 3g 縦)を実態に合わせる(CD-3)。

### 3d 学習状況(SP)
| 要素 | CD 期待 | 実測(app) | 分類 |
|---|---|---|---|
| ヘッダー | 戻る + 学習状況 | 戻る pill + 学習状況(概ね一致) | ok寄り |
| CEFR ピル | (CD 3d = CEFRレベル別) | A1/A2/B1/B2/すべて | ok寄り |
| 全体進捗 + ドリル別(2A-2D)+ 4スタット(未着手/1・2スロット/卒業) | CD 3d 準拠 | 表示あり | Phase 3 で寸法/色実測 |
| 背景 | Mood B | `--paper`(progress-page 指定済=正) | ok |

### 3e/3f/3g 導線(SP)★導線欠落
| 画面 | CD SP の導線 | 実測(app SP) | 判定 |
|---|---|---|---|
| 3e IPA って何？ | **CD SP にも導線なし**(画面は存在) | ヘッダーリンクが PC 専用で SP 非表示=**到達不可** | ★要判断 Q8(app+CD 両方に SP 導線を新設) |
| 3f 言語設定 | JA▾ ドロップダウン(CD 3f フルpage は PC 系) | JA▾ ドロップダウンで表示言語切替可 | 要確認 Q9(SP はドロップダウンで充足か) |
| 3g オンボ | ? ガイドボタン | ? ボタンで再表示可=到達可 | ok(導線あり) |

### 3g オンボ モーダル色(SP)★モーダル色が違う
| 要素 | CD | 実測(app) | 分類 |
|---|---|---|---|
| モーダル card 背景 | (Mood B 系。要 CD 実測) | **#FFFFFF 純白**(--panel #FDFBF7 でなく白直書き) | ★要判断 Q10(app→Mood B panel か CD→白か) |
| SRS ☑️ 表現(スライド3) | **縦** | 実態は横(答え合わせ) | CD-3 で CD を横に統一 |

### PC 全画面 — R2「・・・」確認済 + 概況
| 項目 | CD 期待 | 実測(app PC) | 分類 |
|---|---|---|---|
| 支援画面 左上「●●●」 | (CD モックのウィンドウ枠装飾=非UI) | **語彙/オンボ等の左上に ●●● が実表示**(`modal-chrome` 枠踏襲) | **✅ app-4 済**: PC の `body.pc-support/vocab/progress/symbol .modal-chrome` と `.onboarding-chrome` を display:none 化。PC 語彙で ●●● 消失・レイアウト無害 確認 |
| 1a-pc | 目的カード 4×1 grid + 右 sidebar + ヘッダーテキストリンク | 要 Phase3 実測(過去 #147 で対応済のはず) | 実測差分は Phase 3 |
| 2a-pc〜2d-pc | 2ペイン | 要 Phase3 実測 | Phase 3 |
| 3b-pc 語彙 | SP と同じ CD準拠版へ | SP と同じ高機能版(タブ/CEFR/3×3/全KB) | app-5 と同一リワーク |
| ヘッダー | 全 PC 画面で共通(学習状況/IPA って何?/≣/JA) | 1a は表示。学習中の共通化は Phase3 実測 | Phase 3 |

## 未着手(Phase 3 実装時に実測差分を追記)
- SP: 2a 不正解(構造は CD 既知)、2b/2c/2d(2a 共通構造)、2c 単語選択スキップ、3c IPA記号ピッカー到達導線
- PC: 1a-pc grid/sidebar 寸法、2ペイン寸法、3a-pc/3d-pc レイアウト、ヘッダー全画面共通化の実測

> Phase 0 の目的(系統原因の特定 + 全 ★ 項目の分類 + CD修正/app修正 の確定)は達成。残差は「色/寸法の実測」= Phase 3 実装と同時に潰すのが効率的。

## §PC-conflicts: app-5 PC(3b-pc)で CD と確定事項/完了作業が衝突(要 Naoya 判断)

CD `#3b-pc`(pc.dc.html 236-)を実装しようとすると、**確定済の決定・完了済 app と 3 点衝突**する。SP は矛盾なく完了。PC カード意匠は SP と同一で反映済だが、以下は勝手に進めず halt:

1. **SRS「覚えた 2/3」ボックス**: CD `#3b-pc` の各カードに**横3ボックスの SRS マーキングが残っている**。しかし **Q7 で「語彙リストは辞書であり学習記録の場でない → SRS は 2a–2d 答え合わせ + 3d のみ」と確定**。SP CD `#3b` は正しく SRS 無し。→ **PC CD が Q7 と不整合**。実装は Q7 準拠(SRS 無し)。**CD `#3b-pc` から SRS ボックス削除を Claude Design で(round-trip)**推奨。
2. **左上 ●●● ウィンドウchrome**: CD `#3b-pc` はデスクトップ枠として ●●● を持つが、**app-4 で PC の `modal-chrome` ●●● を「R2 誤踏襲」として display:none 済**。→ CD-PC(●●●=意匠)と app-4(●●●=削除)が不整合。要判断: (a) PC は ●●● を意匠として復活させる or (b) app-4 通り削除で CD-PC からも ●●● を削除。
3. **フィルタ UI**: CD `#3b-pc` はインラインキーボードでなく「全消去」+「記号ピッカーを開く」(→3c フルページ)ボタン。SP はインライン横スクロールキーボード。→ PC だけボタン式にするか、SP と同じインラインで統一するか。
4. (レイアウト)**2カラムカードグリッド**(CD `#3b-pc` は grid 1fr 1fr / 860px)+ **A–Z 折返し** + カードラベル「GA · 米/RP · 英」+ **強勢下線**。2カラムは現行**仮想リスト(単一縦スタック前提)の再設計**が必要=非自明。判断後に着手。

> 推奨: SP を正としてまず確定。PC は ①②③ の判断を受けてから 2カラム含め実装(CD 側調整は Claude Design 経由)。

## 要判断バッチ(追加分)
8. **3e「IPA って何？」の SP 導線をどこに置くか**(footer / ?ガイド内 / ヘッダー追加 等)。CD SP にも未定義 → CD にも追加要
9. 3f 言語設定は SP では JA▾ ドロップダウンで充足でよいか(CD 3f フルページは PC 用と解釈)
10. オンボ等モーダル背景色 = app を Mood B(#FDFBF7)に寄せるか、CD を純白(#FFF)に直すか(あなたの「CD 側を治すかも」該当)

## 要判断バッチ(Phase 2 で Naoya さんへまとめて質問予定)
1. 1a「目的から選ぶ」ラベル → **【確定】CD から削除**
2. 1a 第1カード強調 → **【確定】仕様・CD準拠(app に適用)**
3. 3b 設計思想 → **【確定】CD準拠(コンパクト版)**
4. 3b 意味表示 → **【確定】表示(CD準拠)**
5. R2 フレーム装飾 → **【確定】CD から削除**
6. 3b: フレーズタブ → **【確定】削除(語彙は単語のみ、フレーズは載せない)**
7. 3b: 3×3 マーキングドット → **【確定】削除(CD が正)。SRS は 2a–2d 答え合わせ + 3d に属する**
