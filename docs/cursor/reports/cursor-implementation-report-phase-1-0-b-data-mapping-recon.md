---
id: pj-2026-07-18-phase10b
aliases:
- cursor-implementation-report-phase-1-0-b-data-mapping-recon
title: Phase 1-0-b Screen/Data Mapping Recon — 実装レポート
created: '2026-07-18'
---

# Phase 1-0-b Screen/Data Mapping Recon — 実装レポート

## 関連 Issue / PR

- Issue: #78
- PR: #79（open）

## Issue 背景（Issue 本文から要約）

Phase 1-0-a で目的 4 カード、プロフィール一元通過、CEFR 横断、near 採点廃止などの上位仕様が確定した。後続の Phase 1-B〜1-E を安全に起票するには、現行 `src/index.template.html` の setup パラメータ、localStorage、wordlist / connected / weak data の CEFR・GA/RP カバレッジ、語彙ページ検索性能を実データで確認する必要があった。本 Issue はその Pre-Issue Recon として、後続実装が参照する Category A の画面×データマッピングを作成した。

## 実装内容

- `docs/design/phase-1/screen-data-mapping.md` を新規作成し、Issue 指定の §1〜§7（12 パラメータ、LS、CEFR、GA/RP、IPA search latency、frame mapping、DOCUMENT-MAP 提案）を記載
- `docs/DOCUMENT-MAP.md` の Category A に screen-data mapping を追加
- `docs/LAUNCH-CHECKLIST.md` の UI/UX Phase 1 表で 1-0-b を完了化し、Issue #78 を紐付け
- `docs/REPOSITORY-STRUCTURE.md` に `docs/design/phase-1/screen-data-mapping.md` を追加
- `docs/README.md` に `docs/design/` の役割を追加（DOCUMENT-MAP 上の Category A 索引更新）
- runtime data / `src/index.template.html` は調査のみで不変

## 変更ファイル

```
- docs/design/phase-1/screen-data-mapping.md (A)
- docs/DOCUMENT-MAP.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/README.md (M)
- docs/cursor/reports/cursor-implementation-report-phase-1-0-b-data-mapping-recon.md (A)
```

## デグレ防止検証

- Phase 0: `/tmp/issue-78/before-targets.md5` と `/tmp/issue-78/before-all.md5` を作成
- Classification: Issue body has L2 x C1/C5. Actual implementation is docs-only plus runtime data investigation; no runtime data contract mutation
- Runtime data contract protection: `wordlist_GA_a1a2_plus_phonics.json`, `data/connected_speech.json`, `data/weak_forms.json`, `data/guide.json`, `src/index.template.html` are unchanged from Phase 0 md5
- Whitelist changes: only docs files listed above
- 実装中の自己判断による追加変更: `docs/README.md` の索引更新を実施。`docs/DOCUMENT-MAP.md` Category A では docs 配下新規ファイル追加時の更新トリガーとして定義済み
- 実装中に発覚した懸念: GitHub Issue Comment 投稿用の writable MCP tool がこの automation には無いため、Phase Comment 相当の内容は PR body / 本レポートに集約

## 動作確認

- Markdown front matter: YAML key/value 形式で作成
- Markdown links / path references: repository-relative paths only
- 12 パラメータ列挙: `#setup` DOM、Settings modal、LS key grep、Mode B legacy keyを突合
- CEFR coverage: wordlist 5,397 / connected 201 / weak 36 を Python JSON 集計で確認
- GA/RP coverage: `ipa`, `rp_ipa`, `ga_rp_same` の coverage を Python JSON 集計で確認
- IPA latency: 5,397 words x up to 3 IPA symbols の filter-only prototypeを120回/クエリで測定
- `src/index.template.html` final md5: Phase 0 と一致
- Runtime JSON final md5: Phase 0 と一致

## 一次データ再現コマンド

```bash
md5sum src/index.template.html wordlist_GA_a1a2_plus_phonics.json data/connected_speech.json data/weak_forms.json data/guide.json docs/PURPOSE.md docs/SPECIFICATION.md docs/DESIGN.md docs/LAUNCH-CHECKLIST.md docs/DOCUMENT-MAP.md docs/REPOSITORY-STRUCTURE.md > /tmp/issue-78/before-targets.md5
git ls-files -z | xargs -0 md5sum | sort > /tmp/issue-78/before-all.md5
python3 - <<'PY'
import json, re, statistics, time
from collections import Counter
from pathlib import Path
root = Path('.')
word = json.loads((root / 'wordlist_GA_a1a2_plus_phonics.json').read_text())
conn = json.loads((root / 'data/connected_speech.json').read_text())
weak = json.loads((root / 'data/weak_forms.json').read_text())
print(len(word), Counter(w.get('cefr') for w in word))
print(len(conn), Counter(c.get('cefr') for c in conn))
print(len(weak), Counter(w.get('cefr') for w in weak))
print(sum(1 for w in word if w.get('ipa')), sum(1 for w in word if w.get('rp_ipa')))
print(Counter(w.get('ga_rp_same') for w in word))
PY
```

Key results:

| Metric | Result |
|---|---|
| Wordlist CEFR | A1=1,187 / A2=1,195 / B1=2,116 / B2=899 / missing=0 |
| Connected CEFR | A1=63 / A2=106 / B1=19 / B2=13 / missing=0 |
| Weak CEFR | A2=26 / B1=10 / missing=0 |
| Wordlist IPA | `ipa` 5,397 / `rp_ipa` 5,397 |
| Wordlist same/different | same=2,674 / different=2,723 |
| IPA filter prototype | p95 1.70-2.57ms on this VM |

## 実装過程での気づき

- Issue text contains both "14 frame" and "13 concept"; `docs/DESIGN.md` §0.1 and the Issue's own Phase 5 instruction agree on 13 concept, so the document explicitly follows 13 concept.
- The visible setup has 11 user-facing setting controls when Settings modal is included. The 12th Phase 1-relevant parameter is the hidden legacy `ept_vocab_band`, which remains a persisted cleanup target.
- CEFR missing count is zero across wordlist, connected speech, and weak forms, so Phase 1-D does not need a user-facing fallback for untagged production data.
- The repo cannot prove actual Google Drive MP3 inventory. The mapping separates repo-verifiable generation routes from Drive/warm operational status.
- IPA filter cost is much lower than the likely DOM rendering cost. Phase 1-E should optimize broad-result rendering before introducing a worker or generated index.

## 後続への影響

- Phase 1-B can use the frame mapping for top/purpose-card data sources.
- Phase 1-C can use the `prev_settings_v1` and `mark:*` migration recommendation as the Issue drafting base.
- Phase 1-D can proceed with CEFR-filter assumptions because all runtime data is tagged.
- Phase 1-E can implement IPA picker/search without precomputed index initially, while chunking broad result rendering.
- Track B can revisit RP connected phrase TTS and RP batch warm as separate issues.

## 残課題・申し送り

- Browser/iPhone Safari real-device latency was not available in this automation run. The filter-only prototype is comfortably under 100ms; Phase 1-E should still verify input-to-first-render in browser.
- Actual Drive audio inventory is out of repo scope. Naoya can verify via GAS `getBatchStatusGA()` and Drive inspection if needed.
- `ept_vocab_band` and Mode B band symbols remain implementation cleanup targets for Phase 1-A〜1-H, as already noted by Phase 1-0-a.

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当（C5 は data contract 変更ではなく data asset investigation として過大寄り）
- 判定根拠: 新規 Category A ドキュメントと複数 docs 索引更新を行ったが、runtime code/data/i18n/font/GAS は変更していない。調査観点は広いが、変更面は docs-only に収まった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1, C5
- 実装中に追加が必要になった Pattern: なし
- 補足: C5 の実態は runtime data/schema contract mutation ではなく、runtime data の読み取り調査。次回類似 Issue では C1 + Recon/data investigation の説明に留める方が分類精度は高い。

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響あり（screen-data mapping を追加）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 0-7
- 実際の Phase 数: 0-7 相当（Phase comment は本環境の writable tool 不在により PR body / report に集約）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。
