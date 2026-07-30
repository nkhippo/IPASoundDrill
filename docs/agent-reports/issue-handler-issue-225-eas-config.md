# EAS Build 設定 + 仮アイコン整備 (#225) — 実装レポート

## 関連 Issue / PR

- Issue: #225（親 EPIC #209、先行 Issue #223（Expo 骨格）/ #224（4-step MVP）merged）
- Agent: issue-handler（非同期、Naoya 明示委譲）
- 作業ブランチ: `feature/eas-config-225`（base: `develop`）
- PR: #229

## 追記（pr-reviewer FAIL 対応、2026-07-30）

[pr-reviewer FAIL](https://github.com/nkhippo/IPASoundDrill/pull/229#issuecomment-5127243347) にて、
`apps/mobile/app.config.ts` が SVG icon/adaptiveIcon/splash を参照しているが、Expo SDK 57 の
`@expo/image-utils` は SVG を受け付けず `expo prebuild` が失敗する defect を実測で検知。
[修正指示](https://github.com/nkhippo/IPASoundDrill/issues/225#issuecomment-5127250795) に従い以下を実施:

1. **PNG 生成**: `sharp`（devDependency として追加、`apps/mobile/package.json` /
   `pnpm-lock.yaml` 更新）で既存 SVG から PNG をラスタライズ。
   - `apps/mobile/assets/icons/icon.png`（1024x1024）
   - `apps/mobile/assets/icons/adaptive-icon.png`（1024x1024）
   - `apps/mobile/assets/splash/splash.png`（2048x2048）
2. **`apps/mobile/app.config.ts` 更新**: `icon` / `android.adaptiveIcon.foregroundImage` /
   `expo-splash-screen` プラグインの `image` 参照を上記 PNG に切替。コメントも
   「SVG が prebuild で失敗するため PNG が必須」である旨に更新。
3. **SVG は削除せず維持**: `apps/mobile/assets/icons/*.svg` / `apps/mobile/assets/splash/*.svg`
   は v1.1 本番デザイン差替時の参考として残置（修正指示に従い削除しない）。
4. **`docs/OPERATIONS.md` §11 / `tools/mobile/README.md` 修正**: 「SVG が自動的に
   ラスタライズされる」という誤った前提の記述を削除し、「PNG が必須。差替時は
   SVG → PNG 変換してから `app.config.ts` の参照を更新する」旨を明記。
5. **実測検証**: `npx expo prebuild --no-install --platform android` および
   `npx expo prebuild --no-install --platform ios` が両方成功することを確認
   （生成物 `android/`・`ios/` は本 PR の対象外のため検証後に削除）。
   `android/app/src/main/res/mipmap-*/ic_launcher*.webp` と
   `ios/.../AppIcon.appiconset/App-Icon-1024x1024@1x.png` が実際に生成されることを確認し、
   PNG 参照が正しく機能していることを実証。
6. `pnpm --filter @ipasounddrill/mobile run typecheck` / `node tools/mobile/verify-bundle-size.js`
   継続 PASS を再確認。

## Issue 背景（Issue 本文から要約）

当初 L3（実ビルド含む）で起票されたが、iOS/Android Developer Account・Expo アカウント未加入のため
[scope 変更（Naoya 承認 2026-07-30）](https://github.com/nkhippo/IPASoundDrill/issues/225#issuecomment-5127173898)
により「設定だけ完了して将来に備える」に縮小。Level は L3 → L2 に降格（Change Pattern:
C2 infra config + C6 アイコン UX、実ビルド無し）。実施内容: `eas.json` 3 profile、
`app.config.ts` の bundle identifier/version/runtimeVersion、仮アイコン/スプラッシュ SVG、
`docs/OPERATIONS.md` の Mobile ビルド手順追記、`tools/mobile/README.md`、
`tools/mobile/verify-bundle-size.js`。

## 実装内容

1. **`apps/mobile/eas.json`** を新規作成。development（developmentClient、internal 配布）/
   preview（internal 配布、apk）/ production（app-bundle、autoIncrement）の 3 profile。
   `cli.appVersionSource: "local"` で `app.config.ts` の `version` を単一の正本にする。
2. **`apps/mobile/app.config.ts`** を更新:
   - `icon` / `android.adaptiveIcon.foregroundImage` / splash plugin `image` の参照先を
     新規 SVG（`assets/icons/icon.svg` / `assets/icons/adaptive-icon.svg` /
     `assets/splash/splash.svg`）に変更
   - `android.adaptiveIcon.backgroundColor` / splash `backgroundColor` を Issue 指定の
     primary（`#4A90E2`）/ 白背景（`#FFFFFF`）に更新
   - `runtimeVersion: { policy: "appVersion" }` を追加（EAS Update 運用の前提）
   - bundle identifier (`app.ipasounddrill.mobile`) / version (`1.0.0`) は #223 で既に
     設定済みだったため変更なし（Issue 本文の要求を満たす状態を確認）
3. **仮アイコン/スプラッシュ SVG** を新規作成し、置き換え対象だった旧 placeholder PNG
   （#223 由来）を削除:
   - `apps/mobile/assets/icons/icon.svg`: 1024x1024、primary #4A90E2 グラデーション背景 +
     白い音波バー + accent #F5A623 の IPA 文字 `[aɪ]`
   - `apps/mobile/assets/icons/adaptive-icon.svg`: Android adaptive icon 前景のみ
     （transparent 背景、safe zone 内に音波+IPA文字を配置。背景色は app.config.ts で指定）
   - `apps/mobile/assets/splash/splash.svg`: 白背景中央に icon.svg 相当を縮小配置
   - `favicon.png`（Web ターゲット用、Issue 対象外）はそのまま維持
4. **`docs/OPERATIONS.md`** に「11. Mobile ビルド（Naoya 用、Developer Account 加入後）」を
   新規追記。前提条件・実行順序の要点・注意事項を記載し、詳細手順は
   `tools/mobile/README.md` に委譲（重複させない）。
5. **`tools/mobile/README.md`** を新規作成: Expo アカウント作成 + `eas login`/`eas init`、
   Developer Account 加入手順（Apple $99/年、Google $25 一回）、`eas build`/`eas submit`
   コマンド例（3 profile）、トラブルシューティング表。
6. **`tools/mobile/verify-bundle-size.js`** を新規作成: `apps/mobile/assets/audio` の
   合計サイズを計測し `--limit-mb`（既定 100MB）超過時に non-zero exit するスクリプト。
   CI 非統合、手動実行専用（README にコマンド記載）。

## 変更ファイル

```
- apps/mobile/eas.json (A)
- apps/mobile/app.config.ts (M)
- apps/mobile/assets/icons/icon.svg (A)
- apps/mobile/assets/icons/adaptive-icon.svg (A)
- apps/mobile/assets/icons/icon.png (D)
- apps/mobile/assets/icons/adaptive-icon.png (D)
- apps/mobile/assets/icons/splash-icon.png (D)
- apps/mobile/assets/splash/splash.svg (A)
- docs/OPERATIONS.md (M)
- tools/mobile/README.md (A)
- tools/mobile/verify-bundle-size.js (A)
- docs/agent-reports/issue-handler-issue-225-eas-config.md (A)
```

## デグレ防止検証

- 変更範囲は Issue 本文のホワイトリスト（`apps/mobile/eas.json`,
  `apps/mobile/app.config.ts`, `apps/mobile/assets/icons/*`,
  `apps/mobile/assets/splash/*`, `docs/OPERATIONS.md`, `tools/mobile/README.md`,
  `tools/mobile/verify-bundle-size.js`）に完全一致。`packages/core`・`apps/web`・
  `docs/**`（OPERATIONS.md 除く）・`.claude/`・`.cursor/`・`CLAUDE.md`・`AGENTS.md` へは
  未変更。
- 旧 placeholder PNG（`icon.png`/`adaptive-icon.png`/`splash-icon.png`）を削除したのは
  ホワイトリスト対象の `apps/mobile/assets/icons/*` 配下であり、Issue が要求する
  「SVG のみ生成」構成に統一するための実装判断（自己判断による追加変更 1 件）。
  `favicon.png`（Web ターゲット、`app.config.ts` の `web.favicon` が参照）は Issue 対象外
  のため維持。
- リポジトリ全文検索で `icon.png`/`splash-icon.png`/`adaptive-icon.png` への残存参照が
  `docs/agent-reports/issue-handler-issue-223-expo-init.md`（過去の実装レポート、historical）
  のみであることを確認。現行コードからの参照は `app.config.ts` の `favicon.png` のみ。
- 実装中に発覚した懸念: Expo の `icon`/`adaptiveIcon.foregroundImage`/splash 画像は、
  一般的には `expo prebuild` 時にネイティブ側で PNG ラスタライズ済みアセットを要求する
  （SVG を直接ネイティブ資産として使えるかは Expo/plugin のバージョン依存）。本 Issue は
  「実ビルド無し・config のみ」が明示された非対象範囲のため今回は検証していないが、
  Naoya が初回 `eas build`/`expo prebuild` を実行する際に SVG が意図通り反映されるか
  必ず確認する必要がある旨を `docs/OPERATIONS.md` §11 と `tools/mobile/README.md` の
  トラブルシューティング表に明記した。

## 動作確認

- `pnpm --filter @ipasounddrill/mobile run typecheck`（`tsc --noEmit`）: 成功
  （`app.config.ts` の `runtimeVersion` 追加後も型エラーなし）
- `node tools/mobile/verify-bundle-size.js`: 実行成功（現状の `assets/audio` 3 ファイル、
  0.00 MB、既定 100MB 制限内で OK 終了、exit code 0）
- 実ビルド（`eas build`）・iOS Simulator / Android Emulator 実起動は Issue 本文で明示された
  非対象範囲のため未実施（#223/#224 で既に確認済み、EAS Build 自体は Developer Account 未加入
  のため実行不可）
- 既存機能への影響: なし（Web/packages/core 未変更、mobile 側は config・アイコン参照のみ）
- データ整合性: 対象外（wordlist / i18n / connected_speech / weak_forms 等のランタイム契約
  8 パスは未変更）

## 実装過程での気づき

- `apps/mobile/app.config.ts` の bundle identifier / version は #223 の時点で既に
  `app.ipasounddrill.mobile` / `1.0.0` として設定済みだったため、Issue が要求する内容は
  実質「参照済みの値を確認 + runtimeVersion 追加」のみで完了した。
- `apps/mobile/eas.json` および `tools/mobile/` はリポジトリに存在しなかったため、新規追加。

## 後続への影響

- Naoya が Expo アカウント作成 + `eas init` を実行すると `app.config.ts` に
  `extra.eas.projectId` の追記が必要になる（`tools/mobile/README.md` §1 に手順記載済み）。
- v1.1（EPIC #209 後続 Issue）で本番アイコン/スプラッシュへの差し替え、実ビルド・
  Developer Account 加入後のストア申請フローを扱う想定。

## 残課題・申し送り

- SVG アイコンが `expo prebuild` / `eas build` で意図通りラスタライズされるかは実ビルド未実施
  のため未検証（Issue #225 の非対象範囲）。Naoya の初回ビルド時に確認必須（ドキュメントに
  明記済み）。
- それ以外の残課題なし。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2（Issue コメントで L3 → L2 に降格済み）
- 実装後の妥当性判定: 妥当
- 判定根拠: 実ビルド・実機起動を伴わない config ファイル追加・更新と SVG アセット追加のみで、
  単一ゾーン（`apps/mobile`）+ `tools/mobile` + `docs/OPERATIONS.md` 追記に収まった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C2（infra config）+ C6（アイコン UX）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし（EAS Build は追加設定のみ、Web の Vercel ビルドは無関係）
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない（旧アイコン PNG への参照は
      `app.config.ts` のみで、同 PR 内で更新済み。過去レポートの記述は historical として残置）

### Phase 分割の妥当性

- 想定 Phase 数: 1（config + アイコン + ドキュメントを一括、相互依存が強いため分割不要と判断）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
