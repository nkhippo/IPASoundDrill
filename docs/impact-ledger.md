# impact-ledger.md — ソースシンボル影響台帳・プロトコルの単一ホーム

`docs/impact-ledger.json`（生成データ本体）のスキーマ定義・scope 閾値・再生成/更新手順・**impact-analysis halt ルールの正本**。
Issue F（#174, EPIC #169）で確立。旧 `docs/repo-map.md`「src/index.template.html JS map」節はここに置換された。

---

## 1. 何のためのファイルか

「共通シンボル（`t()` / `activeIpa()` / `setExclusivePage` / `LANG_CODE_MAP` / `SUPPORTED_LANGS` 等）を修正する場合、周辺機能への影響を機械的に確認できる」を実現する台帳。
`apps/web/src/index.template.html`（~5,400L、~290 関数 + ~15 モジュールスコープ const リテラル）の**静的解析**（正規表現 + 行範囲ベースの簡易スコープ判定であり、AST/コンパイラ相当の
呼び出しグラフではない）。編集エージェントは共通シンボルを触る前に必ずこの台帳を引く（§4 halt ルール）。

**捕捉対象シンボル**（Issue #312 で拡張）:
- callable: `function name(...)`（任意インデント）、`const name = (...) => ...` / `const name = async (...) => ...`（col 0）
- data: `const NAME = { ... }` / `const NAME = [ ... ]`（col 0、モジュールスコープの const オブジェクト / 配列リテラル）
  — PR #305/#306 の landing。`LANG_CODE_MAP` を編集して 8 言語 UI が壊れた際、台帳に露出していなかったため halt 発火せずマージされた反省を反映。

生成器: `tools/impact-ledger/gen_impact_ledger.py`。データ本体: `docs/impact-ledger.json`（symbol 昇順の JSON 配列）。

**現在のスコープは Web（`apps/web/src/index.template.html`）のみ**。`apps/mobile/`（EPIC #209 以降）のシンボルは本台帳の対象外で、`caller_areas` / `scope` の計算にも含まれない。Mobile 側のシンボル影響管理は将来 Issue で個別対応する。

---

## 2. スキーマ

各エントリのフィールド:

| フィールド | 型 | 意味 |
|---|---|---|
| `symbol` | string | 関数名またはデータリテラル名（`function name(` / `const name = (...) => ` で定義されたトップレベル or ネスト関数、あるいは `const NAME = {...}` / `const NAME = [...]` の col 0 モジュールスコープリテラル） |
| `kind` | `"callable"` \| `"data"` | シンボル種別。`callable`（関数・アロー関数）は呼び出し `name(` を参照とみなす。`data`（オブジェクト / 配列リテラル）は裸の識別子参照（`NAME[k]` / `NAME.k` / `Object.keys(NAME)` 等）を参照とみなす |
| `line` | number | `apps/web/src/index.template.html` 内の定義行番号（1-indexed。ソース変更のたびに生成器再実行で追従） |
| `feature_ids` | string[] | このシンボルを**参照している**コードが属する feature area のうち、`docs/_conventions.md` の凍結 12 ID レジストリに登録されているものだけを抽出したもの（`caller_areas` の部分集合。`infra` 等未登録概念は含まれない） |
| `scope` | `"library"` \| `"shared"` \| `"primary"` | 参照元エリア数によるスコープ分類（§3） |
| `caller_areas` | string[] | このシンボルを参照しているコードが属するエリア一覧（`infra` を含む 13 エリア語彙。§3） |
| `depends_on` | string[] | この**関数**の本体内で呼び出している**他の台帳登録 callable**（ベストエフォートの前方依存。コールバック参照渡し等は捕捉できない場合がある。`kind=data` は本体を持たないため常に空配列） |

例 1（callable、`scope=shared`、`caller_areas` 2 エリアの典型例）:

```json
{
  "symbol": "vocabSkeletonHtml",
  "kind": "callable",
  "line": 1789,
  "feature_ids": ["3b", "3c"],
  "scope": "shared",
  "caller_areas": ["vocab", "picker"],
  "depends_on": []
}
```

例 2（data、Issue #312 で追加された `LANG_CODE_MAP`）:

```json
{
  "symbol": "LANG_CODE_MAP",
  "kind": "data",
  "line": 3067,
  "feature_ids": [],
  "scope": "primary",
  "caller_areas": ["infra"],
  "depends_on": []
}
```

> `caller_areas=["infra"]` は「言語切替は横断インフラ」の意。実質的には全 feature に波及するため、
> **`kind=data` の infra エントリを編集する際は台帳の `caller_areas` だけを見ず、i18n 完全性
> （14 言語全キー揃い）を必ず検証する**（i18n を触ったら `python3 tools/validate/validate_i18n.py`
> — `docs/data-contract.md` §5）。

---

## 3. scope 3 値の定義・閾値・エリア語彙

**エリア語彙**（13、`caller_areas` が取りうる値。カッコ内は対応 feature ID。`infra` のみ feature ID を持たない横断的インフラ区分）:

| エリア | feature ID | 内容 |
|---|---|---|
| `decode` | `2a` | 音の発音を確かめる |
| `encode` | `2b` | 発音から書いてみる |
| `study` | `2c` | 音から単語を覚える（Mode B） |
| `connected` | `2d` | 連結する音に慣れる |
| `profile` | `3a` | 学習プロフィール / セットアップ |
| `vocab` | `3b` | 語彙ブラウザ |
| `picker` | `3c` | IPA 記号ピッカー |
| `progress` | `3d` | 学習状況 |
| `about` | `3h` | このアプリについて / サイトガイド |
| `reveal` | `reveal` | 解答画面 |
| `summary` | `summary` | サマリー |
| `top` | `1a` | トップページ |
| `infra` | *(なし)* | 横断インフラ（init / i18n / TTS / accent / セッションフロー / オンボーディング等、`docs/_conventions.md` 未登録の概念も含む） |

**scope 閾値**（`caller_areas` の要素数 = 呼び出し元エリア数で機械的に決まる）:

| scope | 条件 | 例 |
|---|---|---|
| `library` | 5 エリア以上から呼ばれる（自動計算） | `t`（i18n 文字列取得）、`show`（表示トグル）、`$`（DOM 取得） |
| `shared` | 2〜4 エリアから呼ばれる（自動計算） | `vocabSkeletonHtml`（vocab + picker の 2 エリア） |
| `primary` | 0〜1 エリア（自動計算） | `vocabDisplayGloss`（vocab のみ → `feature_ids: ["3b"]`） |

> **既知の固定例外**: `activeIpa` は Issue F 本文が `scope="shared"` + `caller_areas` 5 件（`["decode","encode","study","connected","reveal"]`）を
> スキーマの正式な worked example として明示しており、この 5 件は上記「5 エリア以上 = library」の閾値と字面上ズレる
> （accent/TTS 系の共有ヘルパー経由で decode/study/connected に間接的に波及するため、直接呼び出しグラフだけでは 4 エリアしか検出できず、
> かつ Issue の worked example 自体が閾値ルールより緩い「shared」ラベルを指定している）。この 1 件は `tools/impact-ledger/gen_impact_ledger.py` の
> `SEED_OVERRIDES` で Issue 本文の値をそのまま固定しており、閾値ルールを変更するものではない。他の 292 シンボルは全てコールグラフ計算のみで導出。

---

## 4. impact-analysis halt ルール（正本）

`docs/guardrails.md` §7 から参照される正本手順。共通シンボル（`scope=shared` または `scope=library`）を編集する Issue・実装エージェントは:

1. **編集前に ledger を引く**: `docs/impact-ledger.json` で対象シンボルのエントリを検索する（`grep -A6 '"symbol": "<name>"' docs/impact-ledger.json` 等）。
2. **宣言 scope と実 caller_areas を照合する**: エントリの `scope` が `shared` または `library` の場合、Issue 本文が宣言した対象 feature_ids/scope に、
   台帳の `caller_areas`（→ `feature_ids`）が収まっているかを確認する。
3. **収まらなければ halt する**: 実 `caller_areas` が Issue 宣言スコープを超える（＝ Issue が想定していない feature に影響しうる）場合、
   `CLAUDE.md` halt トリガー (c) に該当する。推測で進めず中断する（同一セッション ClaudeCode はその場で Naoya に質問、非同期
   Codex/Cursor は Issue コメントで中断報告）。
4. **収まる場合のみ横展開して修正する**: 台帳が示す `caller_areas` 全てで動作確認し、周辺機能への無影響を確認したうえで完了とする。

`scope=primary` のシンボルは単一エリアのみに影響するため、通常の Issue ホワイトリスト内で完結する（halt 対象外）。

**`kind=data` シンボルの追加ルール**（Issue #312、PR #305/#306 landing）:

- 言語別マップ・言語別配列（`LANG_CODE_MAP` / `SUPPORTED_LANGS` / `HOME_COPY` 等）を編集する場合、
  `caller_areas=["infra"]` であっても i18n 完全性（14 言語全キー揃い）を必ず検証する。
  `python3 tools/validate/validate_i18n.py` を実行し PASS を完了定義に含める。
- データ literal は本体を持たず fanout が直接コード解析で見えないため、
  「1 言語追加漏れ」のような品質欠陥は台帳の `caller_areas` からは検出できない。
  台帳の役割は「編集時にそのシンボルが台帳に載っている＝ i18n / data-contract の完全性チェック
  義務がある」ことを halt プロトコルで確実に想起させることにある。

---

## 5. 再生成手順

```bash
python3 tools/impact-ledger/gen_impact_ledger.py          # docs/impact-ledger.json を再生成（上書き）
python3 tools/impact-ledger/gen_impact_ledger.py --check  # 生成物が最新か検査するのみ（差分があれば exit 1）
```

生成器は `apps/web/src/index.template.html` のみを読み取り専用で解析する（ソース自体は変更しない）。**冪等**（同一ソース入力に対し常に
同一 JSON バイト列を出力する）。

---

## 6. 編集エージェントの更新義務

`apps/web/src/index.template.html` 内の関数を**追加・改名・移動**した実装エージェントは、当該 PR で `python3 tools/impact-ledger/gen_impact_ledger.py`
を再実行し、`docs/impact-ledger.json` の差分（該当行番号・`caller_areas`・`feature_ids` の更新）をコミットに含める。
生成器自体（分類ルール・シードマップ）を変更する必要がある場合（例: 新しい feature area の追加、明らかな誤分類の発見）は、
`tools/impact-ledger/gen_impact_ledger.py` 冒頭の `EXACT_AREA` / `PREFIX_RULES` / `SEED_OVERRIDES` を編集し、再生成後に diff を確認する。

**制約事項（既知の限界。誤分類を見つけた場合はここを疑う）**:
- callable の直接呼び出し（`name(...)`）のみを検出する。コールバック参照渡し（`addEventListener("click", handlerName)` のように括弧なしで渡す形）は
  呼び出しグラフに現れない。
- data リテラルは裸の識別子参照（`NAME` を bareword で使う）で検出する。文字列内・コメント内の
  `NAME` は検出できない（前後の識別子文字境界のみ判定するため）。
- 参照元の「エリア」は参照元関数の**名前**から分類する（`EXACT_AREA` 辞書 → `PREFIX_RULES` 前方一致 → `infra` フォールバック）。
  総称的な名前のヘルパー関数（例: 仮想リスト描画の共通関数）経由で呼ばれる場合、実際には特定のエリア専用でも `infra` に分類されうる。
- `docs/_conventions.md` の凍結 12 ID レジストリに未登録の概念（例: オンボーディング ≈ 未登録の "3g"）は意図的に `infra` へ寄せている
  （`feature_ids` に未登録 ID を出力しないため）。当該概念が正式に feature 化されたら（登録 Issue と同一 PR で）
  `EXACT_AREA` に専用エリアを追加し再生成する。
- data リテラルの `caller_areas` は「そのリテラルを参照している関数の分類」であり、リテラル自身の
  実質的なエリア（例: `LANG_CODE_MAP` は「全 feature の言語表示」に波及）とは一致しないことがある。
  §4 の「`kind=data` シンボルの追加ルール」参照。

---

## 7. 関連ドキュメント

- feature 単位の「関連シンボル」参照方法 → `docs/features/<id>.md`（`feature_ids` に該当 ID を含むシンボルを本ファイルの JSON から検索、とだけ記載。コピーしない）
- halt プロトコル全体 → `CLAUDE.md` #halt プロトコル、`docs/guardrails.md` §7
- feature ID レジストリ（正本） → `docs/_conventions.md`
