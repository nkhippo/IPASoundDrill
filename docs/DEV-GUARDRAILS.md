---
id: pj-2026-07-12-fae7
aliases:
- pj-2026-07-12-fae7
title: DEV-GUARDRAILS — 開発デグレ防止ガードレール
created: '2026-07-12'
---

# DEV-GUARDRAILS — 開発デグレ防止ガードレール

> **Last updated**: 2026-07-12
> **Purpose**: Cursor 実装時のデグレゼロ保証と、Cursor 自己判断による予期せぬ変更を防ぐガイダンス。すべての Cursor 指示書がこのファイルへの参照を含める。

---

## 1. 大原則

- **迷ったら中断**: Cursor は自己判断で追加変更しない。判断に迷った時点で Issue Comment に質問を書き、実装を中断する
- **中断は失敗ではなく、正しい判断**
- **明示的な指示のみを実行**: Issue 本文に明示的に書かれていない変更は「ついで作業」として禁止
- **ホワイトリスト方式**: 変更してよいファイルを Issue 本文で明示、それ以外は完全不変

## 2. 堅固化パターン A: 新規追加のみ

**適用**: Issue が「新規ファイル追加のみ」で、既存ファイルの編集を含まない場合

**フェーズ**:

- **Phase 0**: 事前スナップショット
  ```bash
  mkdir -p /tmp/issue-<N>
  find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > /tmp/issue-<N>/before-all.md5
  ```
- **Phase 1**: ファイル配置
- **Phase 2**: 差分検証（既存ファイル完全不変を md5 で保証）
  ```bash
  find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > /tmp/issue-<N>/after-all.md5
  diff /tmp/issue-<N>/before-all.md5 /tmp/issue-<N>/after-all.md5
  # → 追加行のみ、既存ファイルの変更 0 件
  ```
- **Phase 3**: コミット + 実装レポート
- **Phase 4**: 最終自己検証チェックリスト
- **Phase 5**: PR 作成

## 3. 堅固化パターン B: 既存編集を伴う

**適用**: Issue が「既存ファイル編集」を含む場合

**フェーズ**:

- **Phase 0**: 事前スナップショット（パターン A と同様）
- **Phase 1**: 変更対象の grep + ホワイトリスト照合 + Naoya 事前承認
  ```bash
  # ホワイトリスト外に影響がないことを事前確認
  grep -rn "<置換対象>" . | grep -v "./.git/" | grep -v "<ホワイトリスト>"
  ```
- **Phase 2**: Rule 1（機械置換）と Rule 2/3/4（意図的編集）の分離
- **Phase 3**: Rule 1 実行（sed 相当の機械的置換）
- **Phase 4**: 差分検証（ブラックリスト md5 不変 + 置換の正確性）
- **Phase 5**: Rule 2/3/4 実行（意図的編集）
- **Phase 6**: Naoya diff 目視承認
- **Phase 7**: コミット + 実装レポート + PR

**重要**:
- Rule 1（機械）と Rule 2/3/4（意図的）は**別コミット**にする
- コミットメッセージに Rule 番号を明記（例: `docs: replace GitHub Pages with Vercel (Rule 1)`）

## 3-alt. 堅固化パターン C: 大規模改修（ファイル移動 + ビルドシステム導入）

**適用条件**（次の 3 条件のうち **2 つ以上** を満たす Issue）:

1. 既存ファイルを別ディレクトリに物理的に移動する（例: `index.html` → `src/index.template.html`）
2. ビルドシステムを新規導入する（単一入力 → 複数出力、例: 6 言語版 HTML の自動生成）
3. Complexity Level が L3 かつ Change Pattern に C3（Structure / URL / artifact layout）を含む

パターン A/B との使い分け:

- パターン A: 新規追加のみ、既存ファイル完全不変
- パターン B: 既存ファイル編集、単一入力 → 単一出力
- パターン C: 上記 3 条件のうち 2 つ以上、単一入力 → 複数出力 + 物理移動

**Phase 構成**（Phase 0-6 の 7 段階。各 Phase 別コミット、各 Phase 完了時に Issue Comment に自己検証結果を投稿）:

### Phase 0: 事前スナップショット + 独立保護

```bash
mkdir -p /tmp/issue-<N>
# 全ファイル md5
find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > /tmp/issue-<N>/before-all.md5
# 移動対象ファイルの独立コピー
cp <移動元パス> /tmp/issue-<N>/before-<移動元ファイル名>
# Runtime data contract 8 パスの md5 独立記録
for path in \
  wordlist_GA_a1a2_plus_phonics.json \
  data/connected_speech.json \
  data/weak_forms.json \
  data/guide.json \
  i18n/en.json i18n/ja.json i18n/ko.json i18n/zh-Hans.json i18n/zh-Hant.json i18n/fil.json \
  i18n/phonemes/en.json i18n/phonemes/ja.json i18n/phonemes/ko.json i18n/phonemes/zh-Hans.json i18n/phonemes/zh-Hant.json i18n/phonemes/fil.json \
  fonts/DoulosSIL-Regular.woff2; do
  md5sum "$path" >> /tmp/issue-<N>/before-runtime-contract.md5
done
```

### Phase 1: 純粋な `git mv` 相当の移動を単独コミット

```bash
git mv <移動元パス> <移動先パス>
# 移動先の md5 = 移動元の md5 を検証（Phase 0 の独立コピーと比較）
md5sum <移動先パス> > /tmp/issue-<N>/after-phase1.md5
md5sum /tmp/issue-<N>/before-<移動元ファイル名>
# 完全一致でない場合、実装を中断して Issue Comment で報告
git commit -m "refactor: move <移動元> to <移動先> (Phase 1, pure move)"
```

コミットメッセージに `Phase 1, pure move` を明記。内容変更 0 行が git log で確認できる状態にする。

### Phase 2: 移動先での最小差分編集を別コミット

移動先ファイルにテンプレート化のためのプレースホルダ挿入等、最小限の差分を加える。この Phase では「移動」と「編集」を分離することが目的。

```bash
git diff HEAD~1 HEAD -- <移動先パス>
# 差分が想定範囲内であることを確認
git commit -m "refactor: template placeholders in <移動先> (Phase 2, minimal edit)"
```

### Phase 3: ビルドスクリプト・設定追加を別コミット

ビルドスクリプト（例: `scripts/build-i18n-html.js`）、設定ファイル（例: `vercel.json`、`package.json`）、`.gitignore` 更新を追加。

```bash
git add scripts/build-i18n-html.js vercel.json package.json .gitignore
git commit -m "chore: add build infrastructure (Phase 3, build setup)"
# ビルドが成功することを確認
npm run build
```

### Phase 4: 生成物検証（入力テンプレートと生成物の body/script 領域の md5 一致）

```bash
# 各生成物と入力テンプレートの body/script 部の抽出と md5 比較
for lang in en ja ko zh-Hans zh-Hant fil; do
  # body 部の抽出（<body> から </html> まで）
  sed -n '/<body>/,/<\/html>/p' <生成物ディレクトリ>/${lang}/index.html > /tmp/issue-<N>/body-${lang}.txt
  md5sum /tmp/issue-<N>/body-${lang}.txt >> /tmp/issue-<N>/generated-body.md5
done
# 全言語の body md5 が完全一致することを検証
awk '{print $1}' /tmp/issue-<N>/generated-body.md5 | sort -u | wc -l
# 出力が 1 であること（全 6 言語で同一 body）
```

body / script 部が全言語で完全一致することが、パターン C の中核的な検証項目。

### Phase 5: 統合テスト（各生成物の View Source を機械抽出して head 要素の期待値と照合）

```bash
# head 内の主要 meta タグを grep で抽出、期待値と照合
for lang in en ja ko zh-Hans zh-Hant fil; do
  echo "=== ${lang} ==="
  grep -c '<title>' <生成物ディレクトリ>/${lang}/index.html
  grep -c 'meta name="description"' <生成物ディレクトリ>/${lang}/index.html
  grep -c 'link rel="alternate" hreflang=' <生成物ディレクトリ>/${lang}/index.html
  grep -c 'meta property="og:' <生成物ディレクトリ>/${lang}/index.html
  grep -c 'link rel="canonical"' <生成物ディレクトリ>/${lang}/index.html
  grep -c 'application/ld+json' <生成物ディレクトリ>/${lang}/index.html
done
# 各 grep の出力が期待値と一致することを確認
```

期待値との不一致が 1 件でもある場合、実装を中断して Issue Comment で報告。

### Phase 6: Naoya diff 目視承認 + Claude Rv（L3 適用時は必須）+ PR 作成

- Naoya が diff 全体を目視、ホワイトリスト範囲内であることを確認
- L3 適用時は Naoya が Claude Rv を Chat で依頼、Claude が MCP で PR diff を取得して以下を検証:
  - Phase 0-5 の各 Issue Comment 報告が Issue に投稿されているか
  - § 10 セルフチェックリスト 6 カテゴリのすべての項目が実装レポートに記録されているか
  - Complexity Retrospective が総合判定「事前分類妥当」となっているか
- Claude Rv 合格後（L3）、または Naoya 目視承認後（非 L3 でパターン C のみ適用時）、Naoya が承認コメント → 自動マージ

## 4. md5 スナップショット方式

```bash
# 事前
find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > /tmp/issue-<N>/before-all.md5

# 事後
find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > /tmp/issue-<N>/after-all.md5

# 差分
diff /tmp/issue-<N>/before-all.md5 /tmp/issue-<N>/after-all.md5
```

期待される diff:
- 追加: ホワイトリスト内の新規ファイル
- 変更: ホワイトリスト内の既存ファイル
- 削除: 明示的に指示されたファイル
- **上記以外の差分がある場合、実装を中断して Issue Comment で報告**

## 5. Cursor 自己判断禁止事項（全リスト）

以下は Cursor が Issue 本文の明示的指示なしに行ってはならない:

- lint 修正
- typo 修正（元の文言を保持）
- Markdown 整形（表の列幅調整、リスト記号統一等）
- import 順序変更
- コメント追加・削除
- コードスタイル変更（インデント、改行、クォート）
- ファイル名変更
- ディレクトリ移動
- 未使用変数・関数の削除
- 型注釈追加
- テスト追加
- ドキュメントリンク先の変更
- 依存ライブラリのバージョン変更

これらのいずれかが必要と判断された場合、Cursor は実装を中断し、Issue Comment で「〇〇の変更が必要と判断したが、Issue 本文に明示的指示なし」と報告する。

## 6. `docs/REPOSITORY-STRUCTURE.md` の更新義務

以下の変更を伴う Issue では、`docs/REPOSITORY-STRUCTURE.md` の該当セクションを同時に更新する（ホワイトリストに追加）:

- 新規ファイル追加（ディレクトリツリー、Runtime data contract の該当セクション）
- ファイル削除・リネーム
- ディレクトリ構造変更
- Runtime infrastructure 変更（Vercel、Namecheap、Railway MCP、GitHub Automation 等）
- i18n の新規キー追加（i18n schema セクション）
- index.html の新規主要関数追加（JS map セクション）

Cursor は Issue 本文で明示的に指示されない場合でも、上記変更を検知したら Issue Comment で「REPOSITORY-STRUCTURE.md の更新が必要と判断」と報告し、実装を中断する（Naoya + Claude が Issue 本文を追記して再開）。

## 7. Cursor 実装レポートテンプレート

`docs/cursor/reports/cursor-implementation-report-<topic>.md` に以下のテンプレートで作成:

```markdown
# <Topic> — 実装レポート

## 関連 Issue / PR

- Issue: #<番号>
- PR: #<番号>（マージ済み / draft / open）

## Issue 背景（Issue 本文から要約）

Issue 本文の「背景・目的」5 サブセクション（トリガー、文脈、選択肢、成果、後続影響）を 200-400 字で要約。Issue 本文の言い回しをコピーせず、実装後の視点で再構成する。

## 実装内容

- 実施した変更の要約（3-8 項目）

## 変更ファイル

```
- <ファイル1> (A/M/D)
- <ファイル2> (A/M/D)
```
（A=追加、M=編集、D=削除）

## デグレ防止検証

- Phase 0: 事前スナップショット、全ファイル N 個の md5 ハッシュ記録
- Phase X: <各 Phase の実施内容と結果>
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: <あれば記載、なければ「なし」>

## 動作確認

- <確認項目 1>: OK
- <確認項目 2>: OK
- 既存機能への影響: なし
- データ整合性: <対象外 or 確認内容>

## 実装過程での気づき

- 想定と異なった点
- Naoya さんとの追加やりとりで判明したこと
- 過去の実装との差分・関連性

## 後続への影響

- 次にできるようになったこと
- 今後の Issue で参照される可能性がある成果物

## 残課題・申し送り

- <あれば記載、なければ「なし」>

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: [L1 / L2 / L3]
- 実装後の妥当性判定: [妥当 / 昇格提案 / 降格提案]
- 判定根拠: [具体的に何がどう複雑だったか / 想定より単純だったか]

### 事前 Change Pattern vs 実際
- 事前 Pattern: [C1-C7 のリスト]
- 実装中に追加が必要になった Pattern: [なし / 列挙]

### 構造・契約への影響点検
- [ ] Runtime data contract 8 パスへの影響なし
- [ ] i18n schema への影響なし
- [ ] URL 構造への影響なし
- [ ] ビルドシステムへの影響なし
- [ ] AI 参照ドキュメント Category A への影響なし
- [ ] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: N
- 実際の Phase 数: M
- 相互依存の発生有無: [なし / あり: 詳細]

### 総合判定
- [ ] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
[中断時のみ記入、なしの場合「なし」と明記]
```

## 8. 中断時の Issue Comment テンプレート

Cursor が実装を中断する場合、Issue の Comments に以下を投稿:

```markdown
🛠️ **Cursor より（中断報告）**

## 中断理由

<以下のカテゴリから選択>
- 不明点あり
- Issue 本文と既存ファイルに矛盾
- ホワイトリスト外への影響を検知
- 過去の作業指示に該当履歴なし（DOC-SYNC-PLAYBOOK 3 分岐マトリックスの中断条件）
- REPOSITORY-STRUCTURE.md の更新が必要（Issue 本文に指示なし）
- その他

## 詳細

<具体的な状況の説明>

## Naoya さんへの質問

- <質問 1>
- <質問 2>

---
_Cursor による自動投稿_
```

## 9. Naoya 目視承認のポイント

Phase 6（既存編集を伴う場合）で Naoya さんが確認する項目:

- diff の全体が Issue 本文の指示範囲内に収まっている
- ホワイトリスト外のファイルに変更なし
- Rule 1 コミットが機械置換のみで意図的編集を含まない
- Rule 2 コミットが機械置換を含まない
- 実装レポートが Issue 背景を反映している
- 「実装過程での気づき」「後続への影響」セクションが具体的に書かれている（テンプレートのままではない）

## 10. 大規模改修用セルフチェックリスト

パターン C 適用時、Cursor は各 Phase 完了時に Issue Comment に以下のセルフチェックリストを貼り、各項目の結果を記入する。全項目 OK でない場合、次 Phase に進まず中断報告する。

```markdown
🛠️ **Cursor より（Phase X セルフチェックリスト）**

## Runtime data contract 保護

- [ ] `wordlist_GA_a1a2_plus_phonics.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `data/connected_speech.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `data/weak_forms.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `data/guide.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `i18n/phonemes/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `fonts/DoulosSIL-Regular.woff2` の md5: [Phase 0 と一致 / 一致せず]
- [ ] `GAS_TTS_URL` 変数値: [変更なし / 変更あり]

## JS map 主要関数の網羅性

- [ ] REPOSITORY-STRUCTURE.md § JS map の主要関数が全て grep で存在確認: [全存在 / 欠落あり: 詳細]
- [ ] 関数の引数シグネチャが変更されていない: [変更なし / 変更あり: 詳細]

## 生成物の言語間一致（パターン C のみ）

- [ ] 6 言語版 HTML の body 部の md5 完全一致: [一致 / 一致せず: 詳細]
- [ ] 6 言語版 HTML の script 部の md5 完全一致: [一致 / 一致せず: 詳細]

## head 要素の数と種類（パターン C のみ）

- [ ] `<title>` タグ: 各言語 1 個: [OK / 期待値不一致: 詳細]
- [ ] `meta name="description"`: 各言語 1 個: [OK / 期待値不一致]
- [ ] `link rel="alternate" hreflang=`: 各言語 7 個（6 言語 + x-default）: [OK / 期待値不一致]
- [ ] `meta property="og:*"`: 各言語で仕様通り: [OK / 期待値不一致]
- [ ] `meta name="twitter:*"`: 各言語で仕様通り: [OK / 期待値不一致]
- [ ] `link rel="canonical"`: 各言語 1 個、自己参照: [OK / 期待値不一致]
- [ ] JSON-LD（`application/ld+json`）: 各言語 1 個、WebApplication schema: [OK / 期待値不一致]

## 「ついで作業」ゼロ検証

- [ ] DEV-GUARDRAILS § 5 の 13 項目に該当する変更 0 件: [ゼロ / 検知: 詳細]
- [ ] ホワイトリスト外のファイルへの変更 0 件（md5 diff で検証）: [ゼロ / 検知: 詳細]

## Category A ドキュメント整合

- [ ] Issue 本文で列挙された Category A 更新対象ファイルすべてが実際に更新: [OK / 欠落: 詳細]
- [ ] Issue 本文で「更新不要」と宣言されたファイルが実際に不変（md5 一致）: [OK / 検知: 詳細]

## 総合判定（Phase X）

- [ ] 全項目 OK → 次 Phase に進む
- [ ] 1 項目以上に問題 → 実装を中断、詳細を上記に記入、Naoya さん判断を待つ

---
_Cursor による自動投稿_
```
