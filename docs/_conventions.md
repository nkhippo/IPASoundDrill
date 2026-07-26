# _conventions.md — 全ドキュメント記法規約（単一ホーム）

このリポの Markdown は **AI エージェント専用の消費物**（人間は読まず、必要時に Claude が要約生成）。
以下の規約は全ドキュメントに適用される。個別ドキュメントで再定義しない（ここが唯一のホーム）。

## グローバル規約

1. **front-matter 禁止・`[[wikilink]]` 禁止**。リンクはプレーンな相対パス（`docs/features/2a.md#採点` 形式）のみ。
2. **機械優先**: 散文より表・key-value を使う。**one fact, one home**（1 事実は 1 ファイルにのみ書く。他所からはリンクし、コピーしない）。
3. **evergreen と dated を分離**: 仕様ドキュメント内に「Phase X 完了」等の日付ログを置かない → `docs/history.md` へ（history.md は Issue D で作成予定。それまでは各ファイル末尾の変更履歴に暫定記載）。
4. **全仕様を安定 feature ID に紐づける**（下記レジストリ）。
5. **1 ドキュメントのソフト行数上限**（目安: 仕様系 ~250L、ガバナンス系 ~200L、router ~150L）。超過は分割の C7 トリガー（月次レビューで強制）。
6. **言語**: 散文は日本語、ID・シンボル・パスは ASCII。見出しは安定アンカーとして機能させ `file.md#見出し` で参照する。

## feature ID レジストリ（正本・DESIGN §0.1 由来 / 全 Issue で不変）

全機能仕様はこの ID に紐づける。ID の追加・変更・廃止はこの表を更新することでのみ行う。

| ID | 名称 | 旧称 | 主 DOM |
|---|---|---|---|
| `1a` | トップページ | top | (top) |
| `2a` | 音の発音を確かめる | Mode A Decode | `#cardDecode` |
| `2b` | 発音から書いてみる | Mode A Encode | `#cardEncode` |
| `2c` | 音から単語を覚える | Mode B Study | `#cardModeBStudy` |
| `2d` | 連結する音に慣れる | Connected Speech | (decode 内) |
| `3a` | 学習プロフィール | setup | `#setup` |
| `3b` | 語彙ブラウザ | vocab browser | `#vocabPage` |
| `3c` | IPA 記号ピッカー | symbol picker | `#symbolPickerPage` |
| `3d` | 学習状況 | progress | `#learningStatusPage` |
| `3h` | このアプリについて | about | `#aboutBlock` |
| `reveal` | 解答 | reveal | `#reveal` |
| `summary` | サマリー | summary | `#summary` |

> 各 ID の詳細仕様は `docs/features/<id>.md`（Issue E で作成）に置く。レジストリ索引は `docs/features/README.md`。
