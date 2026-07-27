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
  - ⏳ **app-6**: 3e「IPA って何？」への SP フッター導線 / ⏳ **app-7**: 3f 言語設定の SP 専用ページ
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
