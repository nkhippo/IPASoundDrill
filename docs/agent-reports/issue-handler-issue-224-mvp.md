# [EPIC-07] 4-step MVP 実装 (Mobile) (#224) — 実装レポート

## 関連 Issue / PR

- Issue: #224（親 EPIC #209、先行 Issue #223 merged（Expo 骨格）/ #222 merged（TTS batch + loader））
- Agent: issue-handler（ClaudeCode 同一セッション、Naoya 明示委譲）
- 作業ブランチ: `feature/mvp-224`（base: `develop`）

## halt 経緯（解消済み）

Phase 6（フォント）/ Phase 7（i18n）/ Phase 5（オフライン判定）の実装に必要な依存追加
（`expo-font` / `expo-localization` / `expo-network` / devDependency `wawoff2`）が
Issue 本文のホワイトリスト（`apps/mobile/app/**`, `apps/mobile/src/**`,
`apps/mobile/assets/fonts/`, `apps/mobile/scripts/copy-core-assets.js`）に含まれない
`apps/mobile/package.json` / `apps/mobile/app.config.ts` / ルート `pnpm-lock.yaml` への
変更を要したため一度 halt した
（https://github.com/nkhippo/IPASoundDrill/issues/224#issuecomment-5126613295）。

Naoya 承認により下記でホワイトリスト拡張・技術方針を確定
（https://github.com/nkhippo/IPASoundDrill/issues/224#issuecomment-5126894052）:

1. ホワイトリストに `apps/mobile/package.json` / `apps/mobile/app.config.ts` /
   ルート `pnpm-lock.yaml` を追加
2. `expo-font` / `expo-localization` / `expo-network`（runtime）、`wawoff2`（devDependency）
   の追加を承認
3. WOFF2→TTF ビルド時変換方式（`packages/core/fonts/DoulosSIL-Regular.woff2` は
   read-only のまま、`apps/mobile/scripts/copy-core-assets.js` が build 時に変換）を承認
4. Level・Pattern 変更なし（L3 のまま）

## 実装内容（Phase 1〜7）

### Phase 1: 画面骨格

- `apps/mobile/app/(step)/_layout.tsx`: Expo Router group `(step)` の `Stack`（header 非表示）。
- `apps/mobile/app/(step)/1a.tsx`: トップページ（目的 4 カード + Hero/Footer 導線）。
- `apps/mobile/app/(step)/2a.tsx`〜`2d.tsx`: Decode / Encode / Study / Connected Speech・Weak Forms。
- `apps/mobile/app/(step)/3a.tsx`〜`3d.tsx`: 学習プロフィール / 語彙ブラウザ / IPA 記号ピッカー / 学習状況。
- `apps/mobile/app/(step)/3h.tsx`: このアプリについて。
- `apps/mobile/app/(step)/reveal.tsx`: 解答画面。
- `apps/mobile/app/index.tsx`: `(step)/1a` へ即 `Redirect`（旧 DebugScreen は `app/debug.tsx`
  に internal-only ルートとして退避、`packages/core` consume 動作確認用に維持）。
- `apps/mobile/src/session/types.ts` / `buildQueue.ts`: セッションアイテム型 +
  Fisher-Yates シャッフルによるキュー組み立て（母集団: `2a`/`2b`/`2c` は wordlist、
  `2c` はさらに `letter`/`contraction` 除外、`2d` は connected_speech + weak_forms）。
- `apps/mobile/src/store/session.ts`: 実行時セッション状態（MMKV 非永続、SPA セッション相当）。

### Phase 2: 共通 UI コンポーネント

- `apps/mobile/src/components/WordCard.tsx`: 単語/IPA 表示（DoulosSIL フォント使用）。
- `apps/mobile/src/components/SwipeableCard.tsx`: `react-native-gesture-handler` による
  左右スワイプ（前/次単語）。
- `apps/mobile/src/components/AnswerButton.tsx`: tap で判定関数を実行 + haptic 発火。
- `apps/mobile/src/components/PlaybackButton.tsx`: TTS 再生（Phase 5 参照）。

### Phase 3: haptics 統合

- `apps/mobile/src/hooks/useHaptic.ts`: `expo-haptics` の Success/Warning/Selection wrapper。
  正解 = `NotificationFeedbackType.Success`、不正解 = `Warning`、スワイプ完了 = `selectionAsync()`。
  Simulator では発火しない場合があるため、失敗は握りつぶす（実機確認は Naoya 依頼）。

### Phase 4: 判定ロジック統合

各ドリル画面から `packages/core/src/scoring/{decode,encode,step3,connectedSpeech,weakForms,reveal}`
を**直接 import**して判定する（inline JS 再実装なし）。Web (`apps/web/src/index.template.html`)
が呼ぶ `Core.decode.checkSpelling` / `Core.encode.checkEncode` / `Core.connectedSpeech.*` /
`Core.weakForms.*` と完全に同一の関数・同一のシグネチャで呼び出している
（下記「判定同等性 spot check」参照）。

- `apps/mobile/src/store/progress.ts`: `marks`（`{drillId}:{itemKey}` → 0–3、
  `computeDrillProgress` が期待する形式、`docs/data-contract.md` §4 `ept_marks_v1` 相当）を追加。
  **MVP 簡略化**（要 follow-up 明記）: Web の正確な増減アルゴリズムは `packages/core` に
  抽出されておらず（`computeDrillProgress` は marks を消費するのみで生成しない）、UI 操作起点の
  手動マーキングも Web 独自仕様のため、本 Issue の非対象範囲「新学習機能（… SRS 等）」に配慮し
  素朴な自動マーキング（正解 → +1 を 3 で clamp、不正解 → 0 リセット）を実装した。
- `apps/mobile/app/(step)/3d.tsx`: `progressPoolForDrill` / `computeDrillProgress`
  （`packages/core/src/scoring/step3.ts`、Web と完全同一の純粋関数）を直接呼び、
  ドリル別卒業率カードを表示。

### Phase 5: TTS 統合

- `apps/mobile/src/components/PlaybackButton.tsx`: `createHybridTTS`（#EPIC-05）を
  `bundleTTS.ts` の `createMobileBundleTTS()` 経由で使用。bundle 同梱 mp3 があれば
  即再生、無ければ GAS TTS プロキシへ fetch（Wi-Fi 前提）。
- `apps/mobile/src/loaders/bundleTTS.ts`: `hasBundledAudio(word, accent)` を追加。
- オフライン + bundle 無しの場合: `expo-network` の `getNetworkStateAsync().isInternetReachable`
  で判定し、「オフラインでは再生できません」相当のトーストを 6 言語で表示
  （`packages/core/i18n/*.json` にオフライン専用キーが無いため、Mobile 固有文言として
  `PlaybackButton.tsx` 内に直接定義。core は read-only のため新規キー追加はしない）。

### Phase 6: フォント同梱

- `apps/mobile/src/fonts/loadFonts.ts`: `expo-font` の `useFonts` で
  `apps/mobile/assets/fonts/DoulosSIL-Regular.ttf` を読み込む。
- `apps/mobile/scripts/copy-core-assets.js`: `packages/core/fonts/DoulosSIL-Regular.woff2`
  （WOFF2、Web と共有・read-only）を `wawoff2` の `decompress()` で build 時に
  TTF へ変換して `apps/mobile/assets/fonts/DoulosSIL-Regular.ttf` に出力
  （RN の native text renderer は WOFF2 非対応、TTF/OTF が必要なため）。
  変換後 TTF の sfnt マジックバイト `00 01 00 00` を確認済み（正常な TrueType、
  「動作確認」節参照）。
- `apps/mobile/app/_layout.tsx`: フォント読込完了まで `SplashScreen` を維持
  （`useLoadFonts()` の `[loaded, error]` を見て `hideAsync()`）。

### Phase 7: i18n

- `apps/mobile/src/i18n/index.ts`: `expo-localization` の `Localization.getLocales()` で
  端末言語を検出し、サポート 6 言語（en/ja/ko/fil/zh-Hans/zh-Hant、繁体字/簡体字は
  region-based heuristic 込み）のいずれかに解決（フォールバック: `en`）。
  `loadI18nBundle()` は bundle 同梱 JSON（`createMobileBundleLoader().loadI18n(lang)`）を
  読み込み、失敗時は `en` にフォールバック。
- `apps/mobile/src/data/CoreDataProvider.tsx`: ランタイム契約 4 JSON
  （wordlist / connected_speech / weak_forms / guide）+ 現在言語の i18n JSON を
  一度だけ読み込み、React Context で全画面へ配布。初回起動時のみ端末言語を検出して
  `useSettingsStore` の `language` に反映（以後はユーザー選択を尊重、
  `hasDetectedDeviceLanguage` ワンショットフラグで制御）。

### 依存追加（Naoya 承認済み、halt 対応節参照）

- `apps/mobile/package.json`: `expo-font` `~57.0.1`、`expo-localization` `~57.0.1`、
  `expo-network` `~57.0.1`（runtime）、`wawoff2` `^2.0.1`（devDependency）。
- `apps/mobile/app.config.ts`: `plugins` に `expo-font` / `expo-localization` を追加。
- ルート `pnpm-lock.yaml`: 上記依存追加に伴う自然な副産物として更新。

## MVP 簡略化（本 Issue の非対象範囲を踏まえた判断、follow-up 候補）

いずれも判定ロジック自体（`packages/core/src/scoring/*`）には影響しない UI/データ範囲の
簡略化であり、Issue 本文「1. 決定事項」「判定は packages/core/scoring 経由（Web と完全同等）」を
損なわない。

1. **適応出題なし**（`buildQueue.ts`）: Web の適応出題（localStorage 履歴 + マーキング重みに
   基づく軽量 SRS）は非対象範囲「新学習機能（… SRS 等）」に該当するため実装せず、
   プール全件・重複なしを Fisher-Yates シャッフルで実現。
2. **`3a` 詳しい設定省略**: Web の focus/reg/grp、csLevel/csType の折りたたみフィルタは
   Accent + CEFR のみに簡略化（採点ロジックに影響しない設定項目のため）。
3. **`3b` 語彙ブラウザ簡略化**: Web の仮想化リスト・A–Z ジャンプ・IPA 複合検索は
   `FlatList` によるシンプル一覧（CEFR バッジ + GA/RP IPA + gloss）に簡略化。
4. **`3c` IPA ピッカー簡略化**: Web の音声学的分類パレット（`symbolChartGroups`、
   `packages/core` 契約外の UI 専用データ）ではなく、wordlist から実際に出現する
   IPA 記号を抽出した簡易一覧 + 部分一致フィルタで代替。
5. **`3h` プレーンテキスト表示**: Web は `*_html` キーを HTML として適用するが、
   RN には `dangerouslySetInnerHTML` が無いため、本文の意味内容は変えずプレーンテキストとして表示。
6. **`marks` 自動マーキング**（Phase 4 節参照）: Web の正確なマーキングアルゴリズムが
   `packages/core` に抽出されていないため、素朴な自動マーキング（+1 clamp 3 / 0 リセット）で代替。

## 判定同等性 spot check（実行時に確認、コミットしていません）

`packages/core/src/index.ts` を `tsx` で直接評価し、Web が呼ぶのと同一のエクスポート関数を
同一シグネチャで呼び出した結果を確認した:

- **2a Decode** (`decode.checkSpelling(userInput, targetWord)`): wordlist 先頭 5 単語で
  完全一致 → `"ok"`、誤答 → `"bad"` を確認（5/5 PASS）。
- **2b Encode** (`encode.checkEncode(targetIpa, userTokens, accent)`): 同 5 単語で
  `tokenize()` 出力そのまま → `"ok"`、トークン反転 → 多くが `"bad"`（IPA が対称的な
  1–2 単語を除き期待通り）（5/5 PASS）。
- Web 側の呼び出し（`apps/web/src/index.template.html` L5253 `Core.decode.checkSpelling`、
  L5330 `Core.encode.checkEncode`）と `grep` で突合し、Mobile 側（`app/(step)/2a.tsx` /
  `2b.tsx`）が同一関数・同一引数順で呼んでいることをソース比較で確認済み。
- 合計 10/10 spot check PASS。

## Phase 8: デグレ確認

- **`pnpm --filter @ipasounddrill/mobile typecheck`**（`tsc --noEmit`）: **PASS**（エラーなし）。
- **`pnpm --filter @ipasounddrill/core test`**: **49/49 PASS**（無変更、影響なし）。
- **`pnpm --filter @ipasounddrill/web build`**: **成功**（無変更、影響なし。生成物は確認後 `git clean` 済み）。
- **`npx expo export --platform ios`**（`apps/mobile` 内）: **Bundled 成功**（1642 modules、
  `assets/fonts/DoulosSIL-Regular.ttf` 888KB を含む 24 assets）。
- **`npx expo export --platform android`**: **Bundled 成功**（1719 modules、28 assets）。
- **TTF 変換検証**: `apps/mobile/assets/fonts/DoulosSIL-Regular.ttf` の先頭バイトが
  `00 01 00 00`（sfnt TrueType マジックバイト）であることを確認。
- **判定結果の Web 同等性**: 上記「判定同等性 spot check」節の通り 10/10 PASS。
- **`git diff packages/core/` / `git diff apps/web/`**: いずれもゼロ diff（無変更を確認）。
- **iOS Simulator + Android Emulator での実機起動・スワイプ 60fps 確認・haptic 実機発火・
  機内モードでのオフライントースト確認・6 言語切替の目視確認・スクショ 6 枚**:
  issue-handler 環境には Xcode/Android Studio が無く、`expo prebuild` +
  `expo run:ios`/`run:android` はネイティブビルドツールチェイン依存のため実行不能
  （#223 と同様の既知の制約）。**Naoya に以下を依頼**（下記「Naoya 依頼事項」参照）。

## Naoya 依頼事項

1. `pnpm install`
2. `pnpm --filter @ipasounddrill/mobile exec expo prebuild`
3. `pnpm --filter @ipasounddrill/mobile ios`（および `android`）で Simulator/Emulator 起動
4. Step 1a → 2a-2d（いずれか 1 つ選択）→ 3a-3d のいずれか → 3h → reveal の一連の遷移を
   完走できることを確認
5. スワイプで単語切替が 60fps 相当で滑らかに動作することを確認
6. 正解/不正解時に haptic が発火することを実機で確認（Simulator は限定的なため実機推奨）
7. 機内モードにして、bundle 内単語（現状 `AUDIO_MODULES` は空のため全単語）で
   「オフラインでは再生できません」トーストが表示されることを確認
8. 設定画面（`3a`）で言語切替 UI が無い場合は端末の言語設定を変更してアプリを再起動し、
   6 言語（en/ja/ko/fil/zh-Hans/zh-Hant）でテキストが切り替わることを確認
9. アプリを再起動し、`3a` の Accent/CEFR 選択・`progress` の `marks` が MMKV 経由で
   復元されることを確認
10. iOS/Android × 主要 3 画面（推奨: `1a` トップ、`2a` または `2b` ドリル画面、`3d` 学習状況）
    のスクショ計 6 枚を本 PR にコメント添付

## 変更ファイル

```
- apps/mobile/app.config.ts (M, expo-font/expo-localization plugin 追加)
- apps/mobile/app/_layout.tsx (M, フォント読込 + CoreDataProvider 配線)
- apps/mobile/app/index.tsx (M, (step)/1a への Redirect)
- apps/mobile/app/debug.tsx (A, 旧 DebugScreen を internal-only ルートへ退避)
- apps/mobile/app/(step)/_layout.tsx (A)
- apps/mobile/app/(step)/1a.tsx (A)
- apps/mobile/app/(step)/2a.tsx (A)
- apps/mobile/app/(step)/2b.tsx (A)
- apps/mobile/app/(step)/2c.tsx (A)
- apps/mobile/app/(step)/2d.tsx (A)
- apps/mobile/app/(step)/3a.tsx (A)
- apps/mobile/app/(step)/3b.tsx (A)
- apps/mobile/app/(step)/3c.tsx (A)
- apps/mobile/app/(step)/3d.tsx (A)
- apps/mobile/app/(step)/3h.tsx (A)
- apps/mobile/app/(step)/reveal.tsx (A)
- apps/mobile/src/components/AnswerButton.tsx (A)
- apps/mobile/src/components/PlaybackButton.tsx (A)
- apps/mobile/src/components/SwipeableCard.tsx (A)
- apps/mobile/src/components/WordCard.tsx (A)
- apps/mobile/src/data/CoreDataProvider.tsx (A)
- apps/mobile/src/fonts/loadFonts.ts (A)
- apps/mobile/src/hooks/useHaptic.ts (A)
- apps/mobile/src/i18n/index.ts (A)
- apps/mobile/src/session/types.ts (A)
- apps/mobile/src/session/buildQueue.ts (A)
- apps/mobile/src/store/session.ts (A)
- apps/mobile/src/store/progress.ts (M, marks 実データ読み書き追加)
- apps/mobile/src/store/settings.ts (M, cefrLevels/hasDetectedDeviceLanguage 追加)
- apps/mobile/src/loaders/bundleTTS.ts (M, hasBundledAudio 追加)
- apps/mobile/scripts/copy-core-assets.js (M, WOFF2→TTF 変換)
- apps/mobile/package.json (M, expo-font/expo-localization/expo-network/wawoff2 追加)
- pnpm-lock.yaml (M)
- docs/agent-reports/issue-handler-issue-224-mvp.md (A, 本ファイル)
```

`packages/core/**` / `apps/web/**` はいずれも無変更（`git diff` ゼロ diff で確認済み）。

## 残課題・申し送り

- **iOS Simulator / Android Emulator 実機確認・スクショ 6 枚**: 上記「Naoya 依頼事項」参照。
- **MVP 簡略化 6 項目**（上記節）: follow-up Issue 候補（適応出題 = 別 SRS Issue、
  `3a`/`3b`/`3c` の Web パリティ強化、`3h` リッチテキスト表示、marks 正確なアルゴリズム抽出）。
- **`AUDIO_MODULES` が空**（#223 由来の既知制約）: bundle 同梱 mp3 の実配線は
  Naoya が個人環境で `tools/tts/gen_tts_batch.py` 出力を生成した後の別作業。

## Complexity Retrospective

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当（Mobile 両プラットフォーム影響 + ランタイム契約 4 JSON 消費 +
  フォント/i18n という当初の判定根拠通り）。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6（Product behavior / UX、Mobile 特化）, C4（stack: RN 画面実装）
- 実装中に追加が必要になった Pattern: なし。`packages/core` への変更は発生せず、
  ホワイトリスト拡張（package.json/app.config.ts/pnpm-lock.yaml）は Naoya 承認により
  cohesive scope 修正として扱われた（Level 昇格なし、Naoya コメント通り）。
