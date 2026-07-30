# `tools/mobile/` — Mobile ビルド運用資産（Issue #225）

`apps/mobile/`（Expo/React Native アプリ、EPIC #209）の EAS Build 運用手順と補助スクリプトを
まとめるディレクトリ。**本 Issue (#225) は config 整備のみで実ビルドは非対象**。Developer
Account 加入後、Naoya が本 README の手順で実ビルドを行う。

## 前提

- `apps/mobile/eas.json`: development / preview / production の 3 profile を定義済み。
- `apps/mobile/app.config.ts`: bundle identifier (`app.ipasounddrill.mobile`)、version
  (`1.0.0`)、`runtimeVersion`（policy: `appVersion`）を設定済み。
- アイコン/スプラッシュは **PNG が必須**（`apps/mobile/assets/icons/icon.png` 1024x1024・
  `adaptive-icon.png` 1024x1024・`apps/mobile/assets/splash/splash.png` 2048x2048）の仮アセット
  （v1.1 で Naoya が本番アイコンに差し替え予定）。Expo SDK 57 の `@expo/image-utils` は SVG を
  受け付けず、SVG を直接参照すると `expo prebuild` が失敗する。元デザイン参考用の同名
  `*.svg`（`apps/mobile/assets/icons/*.svg` / `apps/mobile/assets/splash/*.svg`）は削除せず
  残しているが、`app.config.ts` からは PNG のみを参照すること。差替時は SVG → PNG に変換
  （例: `sharp` や `@resvg/resvg-cli`）してから `app.config.ts` の参照を更新する。

## 1. Expo アカウント作成 + EAS CLI ログイン

実ビルドには Expo（EAS）アカウントが必要（無料プランでビルド可、課金は不要）。

1. https://expo.dev/signup で無料アカウントを作成（GitHub / Google / Email いずれか）
2. ローカルに EAS CLI をインストール（グローバル or npx 実行のいずれでも可）
   ```bash
   npm install -g eas-cli
   # または都度 npx eas-cli を使う（インストール不要）
   ```
3. ログイン
   ```bash
   eas login
   ```
4. プロジェクトと Expo アカウントを紐付け（初回のみ、`apps/mobile/` 直下で実行）
   ```bash
   cd apps/mobile
   eas init
   ```
   - 実行すると `app.config.ts` の `extra.eas.projectId` を埋めるよう案内される
     （このリポジトリでは本 Issue の時点では未設定。`eas init` 実行後に発行された
     `projectId` を `app.config.ts` の `extra.eas.projectId` に追記すること）。

## 2. Developer Account 加入（実ビルド前に必要）

実機配布・ストア申請を行うには、Apple / Google の Developer Account が別途必要
（EAS ビルド自体は Developer Account なしでも実行できるが、TestFlight / Play Console への
提出や実機署名済みビルドの配布にはアカウントが要る）。

| プラットフォーム | 費用 | 加入先 | 備考 |
|---|---|---|---|
| iOS (Apple Developer Program) | $99/年 | https://developer.apple.com/programs/ | Team ID / App Store Connect アクセスに必要。年次更新 |
| Android (Google Play Console) | $25（一回のみ） | https://play.google.com/console/signup | 一度加入すれば追加費用なし |

加入後、`eas credentials` で証明書・プロビジョニングプロファイル（iOS）/ アップロード鍵
（Android）を EAS 管理に任せる（`eas build` 初回実行時に自動生成も可能）。

## 3. EAS Build コマンド

`apps/mobile/eas.json` の 3 profile を用途別に使い分ける。

```bash
cd apps/mobile

# 開発ビルド（development client、実機/シミュレータでの動作確認用）
eas build --profile development --platform ios
eas build --profile development --platform android

# 内部配布ビルド（TestFlight 内部テスター / 社内配布用 apk）
eas build --profile preview --platform all

# 本番ビルド（ストア提出用、app-bundle / autoIncrement 有効）
eas build --profile production --platform all
```

ストア提出（Developer Account 加入 + `eas submit` 用の資格情報設定後）:

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## 4. トラブルシューティング

| 症状 | 対処 |
|---|---|
| `eas build` が `extra.eas.projectId is not defined` で失敗 | `eas init` を実行し、発行された `projectId` を `apps/mobile/app.config.ts` の `extra.eas.projectId` に追記 |
| iOS ビルドが証明書エラーで失敗 | `eas credentials` で Apple Developer アカウントとの連携状態を確認。Apple Developer Program 未加入の場合は development/preview profile でも配布可能な範囲が限定される |
| Android ビルドで keystore 関連エラー | 初回は `eas credentials` で EAS 管理の keystore を新規生成（既存 keystore がある場合は手動アップロード） |
| ビルドサイズが大きい | `node tools/mobile/verify-bundle-size.js` で `apps/mobile/assets/audio` の合計サイズを確認。人気単語トップ N の同梱数を `tools/tts/gen_tts_batch.py --top-n` で調整（詳細は `tools/tts/README.md`） |
| アイコン/スプラッシュが反映されない | 本 Issue (#225) のアイコン/スプラッシュは PNG（`apps/mobile/assets/icons/icon.png` / `adaptive-icon.png`, `apps/mobile/assets/splash/splash.png`）。`expo prebuild` 実行時に見た目が意図通りか初回ビルド時に必ず確認すること。SVG（`*.svg`）を `app.config.ts` から直接参照すると `@expo/image-utils` が SVG を受け付けず prebuild が失敗するので、参照は必ず PNG のままにする |

## 関連ドキュメント

- ビルド運用フロー全体（Naoya 向け手順）: `docs/OPERATIONS.md` §「Mobile ビルド」
- 人気単語音声の hybrid delivery / TTS バッチ生成: `tools/tts/README.md`
- Mobile アプリの実装範囲・アーキテクチャ: `docs/features/`（該当 feature doc）、EPIC #209
