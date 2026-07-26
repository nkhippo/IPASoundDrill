# validator を no-front-matter 規約に整合 (#184) — 実装レポート

## 関連 Issue / PR

- Issue: #184
- PR: (作成中)
- Agent: claude-code

## Issue 背景（Issue 本文から要約）

Issue A で全 Markdown から Vault 由来 front-matter を除去したが、CI validator
`scripts/validate/validate-markdown-refs.py` が front-matter の `id` 必須（V1）を検査し続け、
full-scan で 277/298 ファイルが V1 FAIL という恒常 FAIL 状態だった。加えて V4/V5
（`docs/handoff/` 内 `source_chat_log_id` の Vault スキーマ検査）も FAIL。EPIC 全 PR がこの
pre-existing FAIL を抱えたままマージされていた。目的は validator を現行 no-front-matter 規約に
整合させ、CI が本来の参照整合エラーだけを検出する状態に戻すこと。

改修分類: L2, C1（バリデータロジック修正）、開発ゾーン中心 + docs/claude-design/ 参照修正。

## 実装内容

- `scripts/lib/verify_core.py` V1 修正: front-matter なし → 正常スキップ。front-matter あり
  かつ `id` キーなし（GitHub テンプレート・Claude エージェント設定等の機能的 FM）→ 正常スキップ。
  front-matter あり かつ `id` あり かつ regex 不一致 → FAIL（実際の authoring error）。
- `scripts/lib/verify_core.py` に `_LEGACY_PREFIXES` 定数を追加し、V1/V4/V5 から除外:
  `docs/handoff/`, `docs/design/`, `docs/logs/`, `docs/vault-history/`。これらは
  Vault 由来の歴史ファイル（非 hex サフィックスの ID、`source_chat_log_id` 等）を含む。
- `scripts/lib/verify_core.py` V4 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
- `scripts/lib/verify_core.py` V5 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
- `docs/claude-design/README.md`: V7 FAIL だった markdown リンク記法（UPDATE-GUIDE.md
  および DIVERGENCE.md への相対リンク）を規約準拠の backtick 相対パス形式
  （`docs/claude-design/UPDATE-GUIDE.md` 等）に書き換え。
- `data/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を `docs/repo-map.md` に更新。
- `data/batches/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を
  `docs/pipeline.md` に更新（pipeline section が移動先）。

## 変更ファイル

```
- scripts/lib/verify_core.py (M)
- docs/claude-design/README.md (M)
- data/README.md (M)
- data/batches/README.md (M)
```

## デグレ防止検証

- V7 の検査能力は維持: ダミー doc（`./nonexistent-file.md` リンク）を一時作成し、
  PR mode と full-scan mode 双方で V7 が検出することを確認（回帰テスト済み）。
- V7 ロジック自体は無変更（`check_v7` 関数は一切手を入れていない）。
- V2/V3 は変更なし（24 ファイル、PASS）。V6/V8 は変更なし（PASS）。
- 実装中の自己判断による追加変更: `_LEGACY_PREFIXES` を `docs/handoff/` のみから
  4 ディレクトリに拡張（V1 で残った 3 件の legacy ID FAIL を解消するため）。
- 実装中に発覚した懸念: なし

## 動作確認

- `python3 scripts/validate/validate-markdown-refs.py --full-scan` → 全 8 チェック PASS、
  exit code 0（V1 FAIL 277 件 → 0 件、V4/V5 FAIL → 0 件、V7 FAIL 2 件 → 0 件）
- `grep -rn 'REPOSITORY-STRUCTURE' data/` → 0 件
- V7 回帰テスト（PR mode）: FAIL V7 検出を確認
- V7 回帰テスト（full-scan）: FAIL V7 検出を確認

## V4/V5 廃止ではなく除外を選んだ根拠

V4/V5 は「`*_id` / `*_ids` フィールドの値が ID regex に合致し、かつ index に存在する」という
Vault ドキュメント間の参照整合を保証するチェック。将来 `docs/` 配下に新しい Vault スタイルの
クロスリファレンスが生まれた場合に有用なため、廃止ではなく「歴史的ファイル除外」を採用した。

## 後続への影響

- CI が緑になり、以後の PR で V1/V4/V5/V7 の慢性 FAIL に起因するノイズがなくなる。
- 新規 MD ファイルで誤って `id: invalid-format` と書いた場合は V1 が即座に検出する。
- なし（他機能への波及なし）

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 開発ゾーン中心のバリデータ修正 + 少数 docs 参照修正。ランタイム契約非該当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（バグ修正相当）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
