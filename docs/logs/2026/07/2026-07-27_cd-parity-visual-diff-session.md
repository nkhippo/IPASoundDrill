# 2026-07-27 CD↔実UI 完全一致 セッションログ(ClaudeCode 視覚diff 起ち上げ)

Naoya が SP実機21枚 + PC実機13枚 + Claude Design(SP/PC/DesignSystem)を添付し、「CD と実UIを文言以外で完全一致させたい」と依頼。過去の Issue→Cursor/Codex 改修が視覚検証不能で失敗したため、今回は ClaudeCode 同一セッションで視覚 diff ループを回す方針に。

## 決めたこと
- **アーキ北極星**: Expo + React Native Web 単一UI(web も RN で書く→乖離が構造的に不能)。React DOM 単独は終着点でない。順序=トークン統一+ピクセル一致で静的のまま公開 → Track B でコア抽出 → RNW。Figma でなく Claude Design 継続(HTML で直接 diff/実測できるため今回目標に最適)。モバイルは RN+Expo。
- **作業環境**: iCloud 外 clone(`~/Documents/GitHub/IPASoundDrill`)、branch `design/cd-pixel-parity`。build+`http.server 8799` で CD↔実UI をブラウザ視覚 diff。編集後 `?v=N` でキャッシュバスト。

## 系統原因(過去改修が「雑」だった構造要因)
- 検証が grep/テキストエージェント中心で**視覚を見られなかった**(DIVERGENCE.md は「空」に到達したのに実機は乖離)。
- **R1 二重トークン**: `:root` に `--legacy-*`(寒色 #F4F3EE 系)と Mood B(暖色 #F3EDE6 系)が併存。body 既定が legacy-paper で、profile/drill が上書き無しで legacy のまま → 画面ごとに背景色/くすみが違う。
- **R2 フレーム装飾誤踏襲**: CD モックの `9:41`/`●●●` は非UI 装飾。app が PC 支援画面で `.modal-chrome` として踏襲 → 左上「・・・」。

## 実施(全て視覚+実測で検証、回帰なし)
- **Phase 0**: 全画面 視覚 diff → `PARITY-CATALOG.md`。乖離を CD修正/app修正 の2系統に分類。乖離には (a)スタイルずれ と (b)設計思想の分岐(語彙リスト等)があると判明。
- **Phase 2 CD修正 CD-1〜6**(Naoya が Claude Design 適用、機械検証):目的から選ぶ削除/9:41・●●●●削除(#3c は ClaudeCode 直接パッチ)/SRS マーキング縦→横/CD-4 は Q10 再決定で取消しモーダル=var(--panel)/1a フッター導線(IPAって何→#3e・言語設定→#3f)/3f ページ。
- **Phase 1 トークン一本化**: `--legacy-*`→Mood B を単一箇所で参照付け替え。色+フォント統一。IPA は Charis 優先で CD 一致(Doulos は fallback)。背景/くすみ/フォント差 解消を実測確認。
- **Phase 3**: app-2-i(浮き TOPへ を非in-playで隠しプロフィールヘッダー崩れ解消)/ app-3(第1カード強調)/ app-4(PC ●●● 削除)。

## 重要な自己訂正
- Q10 モーダル色: 当初「app=#FFF」と報告したが**内部要素の誤測**で、実態は #FDFBF7。訂正し「両方 #FDFBF7(全カード共通)」で確定(Naoya 再決定)。→ 慎重な実測検証の価値を実証。

## 確定した設計判断
Q1-Q10 + SRS(手動・横3ボックス・居場所=答え合わせ+3d、語彙リストには出さない)。語彙リスト=CD準拠コンパクト版(フレーズ削除/3×3ドット削除/意味追加)。詳細は handoff §5/§6。

## commit(未 push)
- `15f7984` Phase 0-1-2 + app-2-i
- `5c4d14d` app-3 + app-4

## 積み残し
- 大物: app-2-ii(ドリルヘッダー再構成・task-header はデッドコード)/ app-5(語彙リスト フルリワーク・仕様確定済)
- 導線: app-6(3e フッター)/ app-7(3f SP設定ページ)
- Phase 4/5: Sonnet 1次Rv → Opus 横断2次Rv
- **Open PR #164 が CD-parity と衝突**(handoff §7、要 Naoya 判断)
- 次セッションは新規で(context 肥大回避)。handoff `2026-07-27_cd-parity-handoff.md` + `PARITY-CATALOG.md` + memory `cd-parity-project` から再開。
