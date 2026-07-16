---
id: pj-2026-06-28-cdb3
aliases:
- pj-2026-06-28-cdb3
title: Cursor 指示書 — 学習ガイド `welcome` 章のナラティブ強化（全6言語）
created: '2026-06-28'
---

# Cursor 指示書 — 学習ガイド `welcome` 章のナラティブ強化（全6言語）

> 作成日: 2026-06-28
> 種別: コンテンツ更新（学習ガイド本文）
> 対象: `data/guide.json`
> 入力: `guide.json`（Claude 生成・6言語版・本書添付）

---

## 0. 改修意図

学習ガイドの **「はじめに」（welcome）章** のストーリー性を強化する。
現状は1段落で「このアプリは何か」のみを述べているが、新規ユーザーが「なぜ今これに取り組むべきか」を理解しないままアプリを離れる懸念がある。

科学的見解（perceptual filtering / fossilization / IPA literacy の複利効果）を骨子に、
**4段落のナラティブ**として書き直す。

---

## 1. 変更スコープ

### 変更する章
- `guide.json[<lang>].welcome.body` のみ（**全6言語**: en / ja / ko / zh-Hant / zh-Hans / fil）

### 触らないもの
- `welcome.title`（既存タイトルを維持）
- 他7章（`philosophy` / `solves` / `modes` / `decode_encode` / `connected` / `accents` / `how_to_use`）
- セクション順序・キー順序

→ **`data/guide.json` を Claude 生成版で丸ごと置き換えるのが最も安全**（他章は元のまま含まれている）。

---

## 2. 段落構成（4段落・全6言語共通）

| # | 内容 | 根拠 |
|---|------|------|
| **P1** | アプリのアイデンティティ（既存維持） | 既存のリード文を保持し、変更による違和感を避ける |
| **P2** | 発音を後回しにする学習の隠れたコスト | 知覚-産出ループ / 母語フィルター / **fossilization**（化石化）の科学 |
| **P3** | IPA を読み書きできることの複利効果 | 1記号=1音の決定性 / 強勢・母音・ミニマルペアの誤りが消える |
| **P4** | なぜこのアプリが現実的な選択肢か | 講師 vs 都度検索 vs アプリの3者比較。アプリは中間解として位置づけ |

### 言語別の文量（参考）

| 言語 | 4段落合計 | 元（1段落） |
|---|---|---|
| en | 約 2,700 chars | 約 580 chars |
| ja | 約 1,280 chars | 約 210 chars |
| ko | 約 1,480 chars | 約 230 chars |
| zh-Hans | 約 890 chars | 約 150 chars |
| zh-Hant | 約 900 chars | 約 150 chars |
| fil | 約 3,300 chars | 約 500 chars |

文量はおおむね4倍前後だが、各言語で自然な比率を維持。

---

## 3. 配置

```bash
# Claude 生成版を data/guide.json に上書き
cp guide.json data/guide.json
```

または、PR 時に既存ファイルを直接置き換え。

### キャッシュ・配信について

`data/guide.json` は静的アセットとして配信されるため、変更後は通常の GitHub Pages デプロイで反映される。
追加のスクリプト実行は不要。

---

## 4. 既存コードへの影響

**アプリコード（`index.html`）は変更不要。**
`renderGuide()` は `guide.json[mappedLang].<section>.body[]` を逐次描画する設計のため、
段落数が1から4に増えても自動的に全段落がレンダリングされる。

---

## 5. 検証 / DoD

### 機械検証
- [ ] `data/guide.json` が有効な JSON である
- [ ] トップレベルが `["en","ja","ko","zh-Hant","zh-Hans","fil"]`（順序は元のまま）
- [ ] 各言語に8セクション（`welcome` 含む）が存在
- [ ] 各言語の `welcome.body` が **4段落の配列**
- [ ] 他7章の内容が完全に元のままであること（diff で `welcome` 以外に差分が出ない）

```bash
python3 -c "
import json
g = json.load(open('data/guide.json'))
assert list(g.keys()) == ['en','ja','ko','zh-Hant','zh-Hans','fil']
for lang in g:
    assert len(g[lang]) == 8, f'{lang} sections: {len(g[lang])}'
    assert len(g[lang]['welcome']['body']) == 4, f'{lang} welcome body len mismatch'
print('OK')
"
```

### 実機検証
- [ ] 設定 → 各言語に切替 → Guide を開く
- [ ] 「はじめに」（welcome）が4段落で表示される
- [ ] 段落間に適切な間隔がある（既存の `renderGuide()` のスタイル）
- [ ] 他章（核心思想・解決すること・二つのモード等）は従来どおり
- [ ] 個人名等の PII が UI に出ていないこと

---

## 6. ナラティブ設計の要点（レビュー時の参照）

各言語の P2〜P4 は次の核を共有しています（翻訳ではなくローカライズ）。

**P2 — 後回しにする学習の隠れたコスト**
- 多くの学習者は発音を後回しにする（語彙は手応えがあり、文法は測れる）
- 脳は外国語音を母語のフィルターで聞き、未訓練の音素を最も近い母語音に「曲げて」保存する
- 黙読・リスニング・発話のたびに、誤った表象が強化される
- 研究者はこれを **fossilization（化石化）** と呼ぶ
- 後回しにするほど、後で身体から覚え直さねばならない語彙が増える

**P3 — IPA リテラシーの複利**
- IPA は1記号=1音という決定的な地図
- 約40記号が体に染み込めば、新出語が自己解読可能になる
- 例: 書面の `colonel` を見て音が浮かぶ / 会議で `epitome` を聞いて綴れる
- 地図なしでは、強勢誤り・母音誤読・ミニマルペアの聞き分け不能が何年も続く

**P4 — なぜこのアプリが現実解か**
- **講師に訂正してもらう**: 最も効果的だが、時間とコストが続かない
- **1単語ずつWebで検索して再生**: 手間・孤独・習慣化しない
- **このアプリ**: 中間解として、整った辞書音声 + IPA記号タップで口位解説 + 客観採点を備える
- レッスンの構造的圧力 × 自習の自由スケジュール × 摩擦の除去

---

## 7. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/guide.json` | Claude 生成6言語版で上書き |
| `docs/PURPOSE.md` / `DESIGN.md` | 「学習ガイド welcome 章を4段落化」を反映（任意） |

---

## 8. 申し送り

- 同等のナラティブ強化を他章（特に `philosophy`・`solves`）にも展開可能。今回は **welcome のみ**に絞ったが、ユーザーの反応次第で次フェーズで拡張できる
- `--strict` 検証で en と同値になる行は存在しない（welcome 全段落が翻訳語で再構築されているため、`validate_i18n.py` 的な懸念は対象外＝guide.json は UI 検査の対象外ファイル）
- 既存7章（philosophy / solves / modes / decode_encode / connected / accents / how_to_use）は完全に元のまま保持されている
