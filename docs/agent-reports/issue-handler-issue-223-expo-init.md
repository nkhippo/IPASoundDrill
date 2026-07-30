# [EPIC-06] Expo プロジェクト初期化 (#223) — 実装レポート

## 関連 Issue / PR

- Issue: #223（親 EPIC #209、先行 Issue #213 merged / #EPIC-05 (#222) merged）
- Agent: issue-handler（ClaudeCode 同一セッション、Naoya 明示委譲）
- 作業ブランチ: `feature/expo-init-223`（base: `develop`）

## halt 経緯（解消済み）

Phase 0（Expo SDK 版数 + 依存互換 Recon）完了時点で一度 halt した
（https://github.com/nkhippo/IPASoundDrill/issues/223#issuecomment-5126147054）。
Naoya 承認により下記 4 項目で解消済み
（https://github.com/nkhippo/IPASoundDrill/issues/223#issuecomment-5126233826）:

1. Expo SDK **57** を採用
2. `react-native-mmkv` **v3.3.3**（シンプル版）を採用
3. ルート `package.json` の `engines.node` を `>=22` に更新
4. Expo Go 非対応を承知の上、`expo prebuild` + `expo run:ios/android` で開発

## 実装内容（Phase 1〜6）

### Phase 1: `apps/mobile/` 骨格

- `apps/mobile/package.json`（name: `@ipasounddrill/mobile`）。依存関係は Recon 時点の版数から
  `npx expo-doctor` / `npx expo install --fix` / `npx expo install expo-linking` で
  SDK 57 の `bundledNativeModules` に合わせて最終確定した（後述「実装中の版数修正」）。
- `apps/mobile/app.config.ts`（`ExpoConfig` 型、name/slug/scheme/bundleIdentifier
  `app.ipasounddrill.mobile` / Android package 同名 / icon・adaptive icon・favicon）。
- `apps/mobile/tsconfig.json`（`expo/tsconfig.base` extends、`@ipasounddrill/core` の
  path マッピング追加）。
- `apps/mobile/babel.config.js`（`babel-preset-expo`）。
- `apps/mobile/metro.config.js`（pnpm workspace 対応、詳細は後述）。
- ルート `package.json` の `engines.node` を `>=22` に更新（Naoya 承認 3.）。

### Phase 2: Expo Router 骨格

- `apps/mobile/app/_layout.tsx`: `GestureHandlerRootView` + `Stack`（root navigator）。
- `apps/mobile/app/index.tsx`: 暫定的に `DebugScreen` を表示（4-step の実画面は #EPIC-07）。

### Phase 3: `packages/core` consume

- `apps/mobile/src/loaders/bundleLoader.ts`: `createBundleLoader`（#213 で確定済みの
  core API、変更不要）を使い、`assets/data/*.json` + `assets/i18n/*.json`（6 言語）を
  静的 `import` で読み込む。
- `apps/mobile/src/loaders/bundleTTS.ts`: `createHybridTTS`（#222 で確定済みの core API）
  を使い、bundle 同梱 mp3（現状空、後述）→ 端末キャッシュ → GAS フォールバックの優先順位で
  mp3 URL/URI を解決する。GAS URL は既存 Web (`apps/web/src/index.template.html`) と同一の
  `GAS_TTS_URL` 定数を再利用（新規 URL の推測生成なし）。
- `apps/mobile/src/screens/DebugScreen.tsx`: wordlist 先頭 1 語を表示し、`expo-audio` の
  `useAudioPlayer` + `player.replace({ uri })` で TTS 再生。accent 切替ボタンも実装し、
  Phase 4 の settings store 動作確認を兼ねる。
- **`packages/core/src/loaders.ts` は変更なし**（Issue ホワイトリストで「破壊的変更なし」の場合は
  変更不要とされていた通り、#213 の既存 `DataLoader`/`BundleLoaderSource` で Mobile consume が
  問題なく成立したため）。

### Phase 4: MMKV + Zustand

- `apps/mobile/src/store/settings.ts`: `MMKV` インスタンス + `zustand/middleware` の
  `persist`/`createJSONStorage` で accent・language・volume を永続化。
- `apps/mobile/src/store/progress.ts`: `DrillAttempt` 型 + `attempts` 配列の骨格のみ
  （実データ書き込みロジックは #EPIC-07、Issue 本文の非対象範囲通り）。

### Phase 5: assets 同梱パイプライン

- `apps/mobile/scripts/copy-core-assets.js`: `apps/web/scripts/copy-core-assets.js` を
  参考に、`packages/core/{data,i18n,fonts}` → `apps/mobile/assets/{data,i18n,fonts}` へ
  ビルド時コピー（`package.json` の `start`/`prebuild`/`ios`/`android` スクリプトから起動）。
- `apps/mobile/assets/audio/{ga,rp}/` は空 dir（`.gitkeep`）+ `apps/mobile/assets/audio/README.md`
  で状態を明記。実 mp3 生成・バンドル配線は #EPIC-05 の出力を待つ別タスク（本 Issue 対象外）。
- `apps/mobile/.gitignore`: `assets/data/`・`assets/i18n/`・`assets/fonts/`（build 生成物）、
  `assets/audio/**/*.mp3`（README/`.gitkeep` は追跡、mp3 本体のみ除外）、`node_modules/`、
  `ios/`・`android/`（prebuild 生成物）、`.expo/`・`dist/`・`web-build/` を追加。

### Phase 6: デグレ確認

実施結果は「動作確認」節を参照。

## 実装中に発生した技術的判断（halt せず対応、根拠つき）

Issue 本文の halt トリガー（「Metro bundler の想定外エラー」「pnpm workspace + Metro の非互換」）
に該当しうる事象が実装中に 3 件発生したが、いずれも `apps/mobile/**` 内で完結する原因・解決策で
あることを検証の上、ホワイトリスト内で解消した（root 設定変更は不要と判断）。

1. **依存版数の実際の不整合**: Recon 時点（halt 時）で挙げた版数の一部が実際には
   Expo SDK 57 の `bundledNativeModules` と不一致だった（`npx expo-doctor` で検出）:
   - `expo-status-bar`: `3.0.9` → `~57.0.1`
   - `react-native-gesture-handler`: `3.1.0` → `~2.32.0`（Recon 時点の「v3 は New Arch 前提」という
     判断は誤りで、SDK 57 が実際に検証している組み合わせは 2.32 系だった）
   - `react-native-safe-area-context`: `5.8.0` → `~5.7.0`
   - `typescript`: `^5.6.3` → `~6.0.3`、`@types/react`: `19.2.3` → `~19.2.4`
   - `expo-linking`（`expo-router` の必須 peer dependency、未宣言だった）を追加
   - `npx expo install --fix` + `npx expo install expo-linking` で解消。`npx expo-doctor` は
     **20/20 checks PASS** まで確認した。
2. **Metro resolver のカスタム設定が `whatwg-fetch` 解決を壊す**: 当初 pnpm 対応として
   `resolver.nodeModulesPaths` + `disableHierarchicalLookup: true` を設定したところ、
   `@expo/metro-runtime` 自身の依存（`whatwg-fetch`）解決に失敗した。原因はこのカスタム設定が
   Metro の通常の階層的 node_modules 探索（pnpm の `.pnpm` 配下の各パッケージ固有
   `node_modules` を辿る動作）を無効化したため。**対応**: この 2 行を削除し、`watchFolders`
   のみで pnpm workspace 対応を行う構成に変更（symlink 解決自体は `watchFolders` だけで
   十分機能することを `expo export --platform ios/android` で確認済み）。
3. **`packages/core/src/index.ts` の `.js` 拡張子 import が Metro で解決できない**:
   `packages/core` は `moduleResolution: "Bundler"` 前提で `import ... from "./types.js"`
   （実体は `.ts`）という表記を使っている（`apps/web` は esbuild で事前バンドルするため
   問題にならない）。Metro は素の Node.js 解決アルゴリズムのため `.js` を `.ts`/`.tsx` に
   読み替えない。**対応**: `apps/mobile/metro.config.js` に `resolver.resolveRequest` の
   フォールバック（`.js` 解決失敗時に `.ts`→`.tsx` を試す）を追加。`packages/core` 側の
   import 記法・型・API は一切変更していない（Issue ホワイトリスト「`packages/core/src/loaders.ts`
   に変更なし」の方針を維持）。

いずれも `apps/mobile/**`（ホワイトリスト内）のみの変更で解消し、root `.npmrc` 等の
ワークスペース全体設定変更は不要だった。

## 動作確認

- `pnpm install`: 成功（`react-native-worklets@0.11.3` に対する `expo-modules-core` の
  peer dependency 警告が出るが、`react-native-reanimated`〈`expo-router` の内部依存、本 Issue
  では未使用〉由来の既知の上流不整合であり install 自体は成功する。`npx expo-doctor` の
  20/20 checks PASS には影響していない）。
- `npx expo-doctor`: **20/20 checks PASS**。
- `pnpm --filter @ipasounddrill/mobile exec tsc --noEmit`: **PASS**（`@ipasounddrill/core` の
  型・DebugScreen・store すべて型エラーなし）。
- `npx expo export --platform ios` / `--platform android`（`apps/mobile` 内）: **両方 Bundled 成功**
  （iOS: 1594 modules / Android: 1682 modules。`@ipasounddrill/core` の loader・tts・型が
  Metro 経由で正しく resolve されることを確認）。Simulator 実機起動ではなく `expo export` での
  bundle 成功確認だが、Metro のモジュール解決・pnpm workspace 対応・`packages/core` consume の
  正しさを検証する目的は満たしている。
- `pnpm --filter @ipasounddrill/core test`: **49 tests PASS**（影響なし）。
- `pnpm --filter @ipasounddrill/web build`: **成功**（影響なし、build 生成物は `git clean` 済み）。
- **iOS Simulator + Android Emulator でのデバッグ画面実機確認・スクショ 3 枚は未実施**。
  issue-handler 環境には Xcode/Android Studio が無く、`expo prebuild` + `expo run:ios`/`run:android`
  はネイティブビルドツールチェイン依存のため実行不能（halt 対応時に確定済みの既知の制約）。
  **Naoya に以下を依頼**:
  1. `pnpm install`
  2. `pnpm --filter @ipasounddrill/mobile exec expo prebuild`
  3. `pnpm --filter @ipasounddrill/mobile ios`（or `android`）
  4. デバッグ画面（wordlist 1 語 + IPA 表示 + Play ボタン + accent 切替）が表示され、
     Play ボタンで音声が再生されることを確認
  5. アプリを再起動し、accent 切替の設定が MMKV 経由で復元されることを確認（Phase 4 完了定義）
  6. iOS/Android のスクショを PR にコメント添付

## 変更ファイル

```
- package.json (M, engines.node >=18 → >=22)
- pnpm-lock.yaml (M)
- apps/mobile/package.json (A)
- apps/mobile/app.config.ts (A)
- apps/mobile/tsconfig.json (A)
- apps/mobile/babel.config.js (A)
- apps/mobile/metro.config.js (A)
- apps/mobile/.gitignore (A)
- apps/mobile/app/_layout.tsx (A)
- apps/mobile/app/index.tsx (A)
- apps/mobile/src/loaders/bundleLoader.ts (A)
- apps/mobile/src/loaders/bundleTTS.ts (A)
- apps/mobile/src/screens/DebugScreen.tsx (A)
- apps/mobile/src/store/settings.ts (A)
- apps/mobile/src/store/progress.ts (A)
- apps/mobile/scripts/copy-core-assets.js (A)
- apps/mobile/assets/audio/README.md (A)
- apps/mobile/assets/audio/ga/.gitkeep (A)
- apps/mobile/assets/audio/rp/.gitkeep (A)
- apps/mobile/assets/icons/icon.png (A, placeholder)
- apps/mobile/assets/icons/adaptive-icon.png (A, placeholder)
- apps/mobile/assets/icons/splash-icon.png (A, placeholder)
- apps/mobile/assets/icons/favicon.png (A, placeholder)
- docs/agent-reports/issue-handler-issue-223-expo-init.md (A, 本ファイル)
```

`packages/core/**` は無変更（#213/#222 で確定済みの API のみを consume）。

## 残課題・申し送り

- **アイコン/スプラッシュはプレースホルダー**（単色 PNG）。最終ブランドアセットのデザインは
  本 Issue のスコープ外（骨格作成のみ）。
- **`apps/mobile/assets/audio/` の実 mp3 バンドル配線**: #EPIC-05（#222）の
  `tools/tts/gen_tts_batch.py` 出力を Naoya が個人環境で生成した後、
  `bundleTTS.ts` の `AUDIO_MODULES` マニフェストに `require()` エントリを追加する配線作業が
  残っている（本 Issue では意図的に空のまま）。
- **iOS Simulator / Android Emulator 実機確認・スクショ**: 上記「動作確認」節の通り Naoya 依頼。
- **`react-native-worklets` peer dependency 警告**: `expo-router` の内部依存
  （`react-native-reanimated` 経由、Drawer layout 用、本アプリでは未使用）に起因する upstream の
  既知の不整合。`expo-doctor` の PASS 判定には影響しないため本 Issue では未対応。将来
  `react-native-reanimated`/Drawer navigation を採用する際に再検証が必要。

## Complexity Retrospective

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当（新規スタック導入 + Mobile 両プラットフォーム影響 + ビルド/ホスティング
  初導入という当初の判定根拠通り）。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C4（stack: Expo 導入）, C3（structure: apps/mobile 新規）
- 実装中に追加が必要になった Pattern: なし（`packages/core` への変更は発生しなかったため
  C5/C7 相当の追加なし）。
