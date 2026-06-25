# neighbors 生成レポート (STEP4-b)

- 総語数: **3004**
- K (近傍上限): 8 / MAX_DIST: 2
- 近傍0語: **425** (14%)  ← Mode B実行時はランダム補填
- 近傍3語未満: 734 (24%)
- 近傍K語フル: 2037 (67%)
- 平均近傍数: 5.9
- ミニマルペア(sub)を1つ以上持つ語: **1822** (60%)

## サンプル: 主要なミニマルペアが取れているか

- **three** /θri/ → free/sub1, threw/sub1, through/sub1, throw/sub1, tree/sub1, B/mix2
- **those** /ðoʊz/ → chose/sub1, nose/sub1, rose/sub1, these/sub1, doze/sub1, pose/sub1
- **ship** /ʃɪp/ → sheep/sub1, shop/sub1, chip/sub1, dip/sub1, hip/sub1, lip/sub1
- **right** /raɪt/ → fight/sub1, kite/sub1, light/sub1, night/sub1, rat/sub1, rice/sub1
- **sink** /sɪŋk/ → pink/sub1, silk/sub1, singer/sub1, think/sub1, sick/del1, sing/del1
- **bad** /bæd/ → back/sub1, bag/sub1, bat/sub1, bath/sub1, bed/sub1, bird/sub1
- **vote** /voʊt/ → boat/sub1, coat/sub1, note/sub1, wrote/sub1, goat/sub1, vet/sub1
- **seat** /sit/ → feet/sub1, meat/sub1, meet/sub1, sat/sub1, seen/sub1, set/sub1
- **pull** /pʊl/ → pal/sub1, pile/sub1, pill/sub1, wool/sub1, bull/sub1, full/sub1

## 近傍数の分布
  - 0近傍: 425語
  - 1近傍: 201語
  - 2近傍: 108語
  - 3近傍: 63語
  - 4近傍: 58語
  - 5近傍: 45語
  - 6近傍: 38語
  - 7近傍: 29語
  - 8近傍: 2037語