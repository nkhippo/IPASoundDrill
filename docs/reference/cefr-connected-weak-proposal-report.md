---
id: pj-2026-07-09-749f
aliases:
- pj-2026-07-09-749f
title: CEFR付与提案 — 連結音・弱形（201句 + 36語）
created: '2026-07-09'
---
# CEFR付与提案 — 連結音・弱形（201句 + 36語）

> 作成日: 2026-07-09
> 依頼: `consultation-cefr-connected-weak.md`
> 対応: Claude (Sonnet)

---

## 1. 手法の概要

### 1-1. 「語彙CEFR」の算出（機械的・信頼性高）

各句・各語を構成語に分解し（短縮形は `don't`→`do`+`not` 等に展開）、現在の `wordlist_GA_a1a2_plus_phonics.json`（オリジナル3,059語 + Phase 1 M1-M3 で追加した980語 = 計4,037語のCEFRラベル）と照合。**構成語の中で最も高いCEFRレベル**を「語彙CEFR」としました。

- 8語が現行の語彙データに未収録（`devil`, `foremost`, `sec`, `none` 等）だったため、一般的な頻度感覚で暫定 CEFR を付与（後述の注記付き）
- 不規則活用（`ladies`→`lady`, `gentlemen`→`gentleman`, `sooner`→`soon` 等）は基本形にフォールバック

### 1-2. 「練習CEFR」の算出（語彙CEFR + 音韻現象による補正）

ご依頼の「既存 level と CEFR を機械対応させない」という指示を踏まえ、**アプリの `level`（1/2/3）は判定式に一切使用せず、算出後の相関確認にのみ使用**しました。代わりに、以下の独立した言語学的根拠で補正:

| 補正要因 | 説明 | 補正量 |
|---|---|---|
| 連結現象のタイプ | linking（早口化による自然な連結、知覚負荷は軽い）/ assimilation（音が別の音に変化、負荷中）/ elision（音が消失、聞き手が補う必要があり負荷高） | assimilation・elision で +1段階 |
| 句の長さ | 5語以上の長い句は複数の現象が重なりやすい | +1段階（累積可） |
| 弱形の強形/弱形の音韻差 | `he`/`him`/`her`/`his`/`there`/`are`/`were`/`do`/`does`/`am` は強形との音韻的乖離が大きい | 基本+1に加えてさらに+1 |

**この補正式は app の `level` と無関係に、句自体の言語学的性質のみから算出しています。**

### 1-3. 弱形の練習CEFR

弱形は構成語彙（機能語）が例外なく A1 のため、「連結文中で弱形を聞き取る練習」自体を A1 に据え置くのは実態に合わないと判断し、基本 +1（A2）から開始。音韻差の大きい語はさらに +1（B1）としました。

---

## 2. 算出結果の分布

### 連結句（201句）

| practice_cefr | 件数 |
|---|---:|
| A1 | 63 |
| A2 | 106 |
| B1 | 19 |
| B2 | 13 |

### 弱形（36語）

| practice_cefr | 件数 |
|---|---:|
| A2 | 26 |
| B1 | 10 |

### app_level との相関（参考、判定には不使用）

| app_level | practice_cefr 分布 |
|---|---|
| 1 (Beginner) | A1:29 / A2:25 / B1:5 / B2:2 |
| 2 (Intermediate) | A1:20 / A2:41 / B1:3 / B2:3 |
| 3 (Advanced) | A1:14 / A2:40 / B1:11 / B2:8 |

緩やかな正の相関はありますが、完全な一致ではありません（意図通り。level は音韻的難度の教材設計判断、CEFRは語彙・言語学的難度の指標という別軸のため）。

---

## 3. 要確認: app_level と practice_cefr の段階差が大きい24件

以下は「アプリの教材難度」と「今回算出した練習CEFR」が2段階以上乖離しているケースです。**いずれも算出ロジック上は一貫していますが、最終判断は人の目での確認を推奨します。**

### 3-1. app_level=1（初級教材）だが語彙的にはB1/B2相当（9件）

構成語自体がやや高度なため、教材としては「音韻現象は単純」でも語彙的には中級以上、という組み合わせです。

| id | phrase | vocab_cefr | practice_cefr | 根拠語 |
|---|---|---|---|---|
| cs017 | next day | A2 | B1 | next(A2) + elision |
| cs020 | last night | A2 | B1 | last(A2) + elision |
| cs144 | send you | A2 | B1 | send(A2) + assimilation |
| cs148 | soft drink | A2 | B1 | soft(A2) + elision |
| cs150 | wild bird | A2 | B1 | wild(A2) + elision |
| cs151 | grand prize | B2 | B2 | grand/prize が現行データでB2 |
| cs182 | blind spot | B1 | B2 | blind(B1) + elision |
| cs037 | bless you | B1 | B2 | bless(B1) + assimilation |
| cs112 | blind man | B1 | B2 | blind(B1) + elision |
| cs039 | sort of | B1 | B2 | sort(B1) + elision |

**推奨**: これらは妥当だと考えます。教材の音韻的難度（level）と語彙難度（CEFR）が独立している好例です。

### 3-2. app_level=3（上級教材）だが語彙的には全てA1相当（13件・要注意）

こちらは**算出ロジックの限界**が出ているケースです。個々の単語は全てA1ですが、**慣用句としての定着度・語用論的な複雑さ**（直訳では意味が推測しにくい、決まり文句としての習得が必要）という第三の軸があり、今回の「語彙CEFR」にも「音韻現象タイプ」にも現れません。

| id | phrase | cs_type | 備考 |
|---|---|---|---|
| cs046 | what do you want | linking | 疑問文の定型句 |
| cs047 | how are you doing | linking | 挨拶の定型句 |
| cs048 | come and see | linking | 慣用的表現 |
| cs049 | pick up on it | linking | 句動詞、意味が非直訳的 |
| cs051 | get it over with | linking | 慣用句、意味推測が困難 |
| cs116 | give it a go | linking | 慣用句 |
| cs117 | take it easy | linking | 慣用句、決まり文句 |
| cs119 | up and down | linking | 定型副詞句 |
| cs120 | here and there | linking | 定型副詞句 |
| cs121 | over and over | linking | 定型副詞句 |
| cs165 | a friend of mine | linking | やや特殊な所有構文 |
| cs166 | in and out | linking | 定型副詞句 |
| cs167 | little by little | linking | 慣用句 |
| cs191 | see you around | linking | 別れの挨拶定型句 |

**推奨**: これら14件（表は13件、cs191含め14件）は、**app が既に上級(L3)と判断した理由（イディオム性・定型句としての難しさ）を尊重し、practice_cefr を A2 または B1 に手動で引き上げる**ことを推奨します。私の算出式はこの「イディオム性」という軸を持たないため、機械的な結果よりも既存の教材設計判断（level=3）の方が実態を反映している可能性が高いです。

---

## 4. 現行データに未収録だった8語の暫定CEFR

以下は wordlist に存在せず、一般的な頻度感覚で暫定付与しました。将来 Phase 1 の B1/B2 拡充で正式収録される際に再確認をお願いします。

| 語 | 暫定CEFR | 備考 |
|---|---|---|
| ladies | A1 | lady(A1)の不規則複数形 |
| gentlemen | B1 | gentleman(B1)の不規則複数形 |
| sooner | A1 | soon(A1)の比較級 |
| closing | A1 | close(A1)の動名詞 |
| sec | A2 | secondの口語略、頻出のためA2 |
| none | A1 | 基礎機能語 |
| devil | B1 | 未収録、慣用句頻出のため推定 |
| foremost | B2 | 未収録、文語的でやや高度 |

---

## 5. 出力ファイル

`cefr_proposals.json`（237件、ご依頼のスキーマに準拠）を添付します。各エントリに `vocab_cefr`（語彙CEFR、参考情報）も含めています。マージ時は `cefr` フィールドのみ使用し、`vocab_cefr` は不要であれば削除してください。

```json
{"id": "cs001", "w": "an apple", "cefr": "A1", "vocab_cefr": "A1", "note": "構成語最高CEFR=A1"}
```

---

## 6. 全体としての推奨

1. **セクション3-2の14件は手動で A2/B1 に引き上げることを推奨**（イディオム性を機械判定できないため）
2. それ以外の223件は算出結果をそのまま採用して問題ないと考えます
3. セクション4の8語は、該当語が Phase 1 M4以降で正式収録されたタイミングで再確認を推奨
4. 「語彙CEFR」と「練習CEFR」を分けて `vocab_cefr` フィールドとして残しておくと、将来的な再調整（例: イディオム性を考慮した新しい補正式）がしやすくなります
