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
