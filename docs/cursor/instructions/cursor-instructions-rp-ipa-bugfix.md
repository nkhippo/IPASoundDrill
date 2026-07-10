# Cursor 指示書 — RP IPA バグ修正（`ga_to_rp.py` r 脱落バグ）

- 対象リポジトリ: `nkhippo/English-Pronunciation-Trainer`
- 優先度: **高**（Phase 2 M2 着手前に必須）
- 背景: Phase 2 pilot 実装レポートの Britfone カバー率未達（60.9%）を Opus で検証した結果、
  カバー率不足そのものより深刻な **`scripts/ga_to_rp.py` のロジックバグ**を発見
- 想定 branch: `fix/ga-to-rp-rhoticity-bug`

---

## 1. バグの内容

### 1-1. 症状

`scripts/ga_to_rp.py`（GA→RP のオフラインルール変換、Britfone/Claude API が使えない時の最終フォールバック）が、
**母音の前に来る /r/（onset・intervocalic r）を誤って脱落させていた**。

RP は non-rhotic だが、これは「**母音が後続しない /r/ のみ**」脱落するという規則。
旧実装は文脈を見ずに `ɑr → ɑː` 等の文字列置換や `r` トークンの無条件削除を行っていたため、
`barometer`（bə-**RO**M-i-tər、r の後に母音）のような単語で r が消えていた。

### 1-2. 実例

| 語 | GA | 旧実装（誤り） | 修正後 |
|---|---|---|---|
| `barometer` | `/bəˈrɑmətɚ/` | `/bəˈɒmətə/` ← r 消失 | `/bəˈrɒmətə/` |
| `arrogant` | `/ˈærəɡənt/` | `/ˈæəɡənt/` ← r 消失 | `/ˈærəɡənt/` |
| `aircrew` | `/ˈɛrˌkru/` | `/ˈeəˌkuː/` ← r 消失 | `/ˈeəˌkruː/` |
| `artistry` | `/ˈɑrtəstri/` | `/ˈɑːtəstiː/` ← r 消失 | `/ˈɑːtəstriː/` |

### 1-3. 影響範囲（Opus で全数調査済み）

| 対象 | 総数 | 影響あり |
|---|---:|---:|
| `wordlist_GA_a1a2_plus_phonics.json`（全 5,007 語） | 5,007 | **17 語** |
| `data/connected_speech.json` | 201 | 0 |
| `data/weak_forms.json` | 36 | 0 |

**影響はすべて Phase 2 pilot の 179 語の中のみ**（既存 4,828 語は Britfone/API 経由のため無傷）。
connected_speech / weak_forms への影響もゼロ（フォールバックが発火していない）。

### 1-4. `ga_rp_same` への波及（重要）

17 語のうち **12 語は「different」から「same」に判定が反転**する:

```
Shakespearean, admirable, admiringly, aggressively, anchorage,
antibacterial, arrogant, attractiveness, bankrupt, barren
（+ aircrew, antiaircraft, aristocracy は依然 different だが reason 変化）
```

つまり、この r 脱落バグは RP IPA 表記だけでなく、**UI の「同じ」表示判定にも実害があった**。

---

## 2. 修正内容

### 2-1. スクリプト差し替え

`scripts/ga_to_rp.py` を別途受領のファイルに差し替える。

**変更概要**: 母音+r の結合規則（`ɑr→ɑː` 等）と、単独 `r` トークンの脱落判定を、
**次のトークンが母音かどうかを見て分岐**するよう修正（トークン先読み方式）。
母音が後続する場合は r を保持、後続しない場合のみ non-rhotic 化。

### 2-2. データパッチ適用

17 語の `rp_ipa` を修正データ（別途受領: `rp_ipa_bugfix_patch.json`）で上書き。

```bash
python3 -c "
import json
wordlist = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
patch = json.load(open('rp_ipa_bugfix_patch.json'))
patch_map = {p['w']: p['rp_ipa'] for p in patch}
n = 0
for w in wordlist:
    if w['w'] in patch_map:
        w['rp_ipa'] = patch_map[w['w']]
        n += 1
assert n == 17, f'expected 17 patches applied, got {n}'
json.dump(wordlist, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=2)
print(f'patched {n} words')
"
```

### 2-3. `ga_rp_same` 再計算（パッチ適用後、必須）

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

17 語中 12 語が same に反転することを確認（§1-4 参照）。

### 2-4. コミット

```bash
git add scripts/ga_to_rp.py \
        wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/ga_rp_same_report.json
git commit -m "fix(rp-ipa): preserve onset/intervocalic /r/ in GA→RP rule fallback"
```

---

## 3. 追加で対応してほしい 2 件（軽微・独立）

### 3-1. `gas/BatchWords.gs` の再更新

現在 `gas/BatchWords.gs` は **4,828 語のまま**（neighbors v2 タスク時点のスナップショット）。
Phase 2 pilot マージで総語数が **5,007** になったため再実行が必要:

```bash
python3 scripts/export_batch_words.py
```

コミットメッセージ: `chore: refresh BatchWords.gs for 5,007-word wordlist`

### 3-2. 不要な legacy ファイルの削除（データ事故防止）

Phase 2 pilot 実装時、`data/derived/connected_speech_with_rp.json`（古い 15 句版）が
`connected_speech.json`（現行 201 句）を誤って上書きしかけた実績があります（git revert で回避済み）。

再発防止のため、以下の legacy ファイルを削除するか、`data/archive/` へ移動することを推奨:

```bash
git rm data/derived/connected_speech.legacy15.json
git rm data/derived/connected_speech_with_rp.json
git commit -m "chore: remove stale legacy connected_speech snapshots (data-loss risk)"
```

**理由**: これらは 15 句時代の古いスナップショットで、現行パイプラインのどこからも正規に参照されていない。
`data/derived/` 配下に存在すること自体が「merge スクリプトが誤って読みに行く」リスクを生んでいる。

---

## 4. 検証チェックリスト

| # | 確認項目 | 期待値 |
|---|---|---|
| 1 | `scripts/ga_to_rp.py` 差し替え | 完了 |
| 2 | 17 語の `rp_ipa` パッチ適用 | 17/17 |
| 3 | `barometer` の `rp_ipa` | `/bəˈrɒmətə/`（r あり） |
| 4 | `arrogant` の `rp_ipa` | `/ˈærəɡənt/`（r あり） |
| 5 | `gen_ga_rp_same.py` 再実行後、`barren` が same 判定 | `true` |
| 6 | `gas/BatchWords.gs` の語数コメント | `5007 words` |
| 7 | legacy ファイル削除 | 2 ファイル削除済み |
| 8 | 既存 4,828 語（pilot 以外）の `rp_ipa` に変更なし | 0 変更 |

---

## 5. Phase 2 M2 着手前の方針転換（重要・実装不要・情報共有のみ）

**Britfone カバー率 60.9%（目標 82% 未達）について**: 原因は Cursor 環境に
`ANTHROPIC_API_KEY` が無く `gen_rp_ipa.py`（Claude API 補完）が動かなかったこと。

今回のバグ調査で分かった通り、**ルールベースフォールバックは母音+r の文脈判定のような
言語学的に繊細な処理に弱く、今後 100% 依存するのはリスクが高い**。

**Phase 2 M2 以降の方針変更**: Claude 側が `data/batches/phase2_mN_*.json` を生成する際、
`ipa` / `pos` / `def` / `gloss` に加えて **`rp_ipa` も Claude が直接生成して同梱**します。
Cursor 側で `gen_rp_ipa.py`（Claude API 呼び出し）を実行する必要がなくなり、
API キー有無に依存しない安定した品質を確保できます。

Cursor 側の変更は不要です（M2 以降の指示書で新スキーマとして反映します）。
