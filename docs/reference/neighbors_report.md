---
id: pj-2026-06-24-9d0d
aliases:
- pj-2026-06-24-9d0d
title: neighbors 生成レポート (STEP4-b, v2 — adaptive)
created: '2026-06-24'
---
# neighbors 生成レポート (STEP4-b, v2 — adaptive)

- 総語数: **5397**
- K (近傍上限): 8
- MAX_DIST: 2 (短 <7) / 3 (7≤ 長 <11) / 4 (超長 ≥11)
- 近傍0語: **284** (5%)  ← Mode B実行時はランダム補填
- 近傍3語未満: 982 (18%)
- 近傍K語フル: 3262 (60%)
- 平均近傍数: 6.0
- ミニマルペア(sub)を1つ以上持つ語: **2419** (44%)

## CEFR別カバー率

| CEFR | 総数 | 0近傍 | 0近傍% | フルK% | sub保有% |
|---|---:|---:|---:|---:|---:|
| A1 | 1187 | 19 | 2% | 83% | 71% |
| A2 | 1195 | 54 | 5% | 62% | 44% |
| B1 | 2116 | 152 | 7% | 48% | 31% |
| B2 | 899 | 59 | 7% | 59% | 44% |

## サンプル: 主要なミニマルペアが取れているか

- **three** /θri/ → free/sub1, threw/sub1, through/sub1, throw/sub1, tree/sub1, theory/ins1
- **those** /ðoʊz/ → chose/sub1, nose/sub1, rose/sub1, these/sub1, doze/sub1, pose/sub1
- **ship** /ʃɪp/ → sheep/sub1, shop/sub1, chip/sub1, dip/sub1, hip/sub1, lip/sub1
- **right** /raɪt/ → fight/sub1, kite/sub1, light/sub1, night/sub1, rat/sub1, rice/sub1
- **sink** /sɪŋk/ → link/sub1, pink/sub1, silk/sub1, singer/sub1, think/sub1, ink/del1
- **bad** /bæd/ → back/sub1, bag/sub1, bat/sub1, bath/sub1, bed/sub1, bird/sub1
- **vote** /voʊt/ → boat/sub1, coat/sub1, note/sub1, wrote/sub1, goat/sub1, vet/sub1
- **seat** /sit/ → feet/sub1, meat/sub1, meet/sub1, sat/sub1, seen/sub1, set/sub1
- **pull** /pʊl/ → pal/sub1, pile/sub1, pill/sub1, wool/sub1, bull/sub1, full/sub1

## サンプル: 長い複合語（v2 で新たに近傍を得たもの）

- **basketball** /ˈbæskətˌbɔl/ (9 tokens) → basket/mix33
- **submarine** /ˈsʌbməˌrin/ (8 tokens) → summarise/mix33, summarize/mix33
- **rainforest** /ˈreɪnˌfɔrəst/ (9 tokens) → forest/mix33
- **entertainment** /ˌɛntɚˈteɪnmənt/ (11 tokens) → attainment/mix44, entertainer/mix44, entertain/mix44
- **international** /ˌɪntɚˈnæʃənəl/ (11 tokens) → internationally/ins1, intentionally/mix33, interaction/mix44, intermission/mix44, national/mix44
- **organization** /ˌɔrɡənəˈzeɪʃən/ (11 tokens) → organisation/sub1, civilisation/mix44, organism/mix44
- **information** /ˌɪnfɚˈmeɪʃən/ (9 tokens) → intermission/mix2, confirmation/mix2, inspiration/mix33, interaction/mix33, invitation/mix33, animation/mix33
- **representative** /ˌrɛprəˈzɛntətɪv/ (13 tokens) → (0 neighbors — genuinely isolated in wordlist)
- **advertisement** /ædˈvɝtəzmənt/ (11 tokens) → advancement/mix44
- **literature** /ˈlɪtɚətʃɚ/ (7 tokens) → literary/mix33, signature/mix33, little/mix33

## 近傍数の分布
  - 0近傍: 284語
  - 1近傍: 346語
  - 2近傍: 352語
  - 3近傍: 300語
  - 4近傍: 273語
  - 5近傍: 235語
  - 6近傍: 188語
  - 7近傍: 157語
  - 8近傍: 3262語