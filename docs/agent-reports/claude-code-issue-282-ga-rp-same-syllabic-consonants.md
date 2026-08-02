# fix(data): ga_rp_same 判定を「音の差」ベースに再定義 — 表記規約差のみの語を true に (#282) — 実装レポート

## 関連 Issue / PR

- Issue: #282
- PR: （本コミット後に作成）
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

Complexity: L2 × C5（wordlist データの `ga_rp_same` フィールド更新、複数語に影響。wordlist 契約フィールドに触れ UI の GA/RP 行表示に波及）。
"successful" の GA `/səkˈsɛsfl̩/` と RP `/səkˈsɛsfəl/` が実際には同じ音であるにもかかわらず、音節的子音（`l̩`/`n̩`/`m̩`）と schwa+consonant（`əl`/`ən`/`əm`）という**表記規約の差のみ**で `ga_rp_same: false` と判定され、UI に不要な RP 行が表示されていた。表記規約差のみの語を `ga_rp_same: true` に再分類し、IPA を schwa+consonant 形式に統一する。

## 実装内容

- `packages/core/data/wordlist.json` の `ga_rp_same: false` の語のうち、`ipa` と `rp_ipa` を `l̩→əl` / `n̩→ən` / `m̩→əm` に正規化した結果が完全一致する語を対象に:
  - `ipa` / `rp_ipa` を正規化後の統一表記（schwa+consonant 形式）に更新
  - `ga_rp_same` を `true` に変更
  - `ga_rp_same_reason` を削除
- **GA-only 異音カーブアウトの維持（Issue 提供スクリプトへの重要な補正）**: `docs/data-contract.md` の「GA-only 異音カーブアウト」規約により、`ipa_actual_ga`（narrow 転写）が存在し `ipa`（phonemic）と異なる語は、たとえ phonemic レベルの正規化後に GA=RP となっても、実際には GA 固有の異音（フラップ t `ɾ`、声門閉鎖 `ʔ` 等）を伴う「聞いて分かる差」であるため、`false` のまま維持した。Issue に例示された Node.js スクリプトはこの `ipa_actual_ga` を参照しておらず、そのまま適用すると `cloudy`（GA narrow `/ˈklaʊɾi/`）や `sentence`（GA narrow `/ˈsɛnʔn̩s/`）等 37 語を誤って `true` に変更してしまうことが判明したため、この 37 語は変更対象から除外した。この判断は Issue 本文の完了定義 4「実際に音が異なる語（`ɾ` vs `t`、母音差等）は `false` のまま変更されていない」と `docs/data-contract.md` 既存規約の双方に合致する。

## 変更ファイル

```
- packages/core/data/wordlist.json (M)
- docs/agent-reports/claude-code-issue-282-ga-rp-same-syllabic-consonants.md (A)
```

## デグレ防止検証

- Issue ホワイトリスト（`packages/core/data/wordlist.json` のみ）どおり、他ファイルには一切触れていない。
- 実装中の自己判断による追加変更: `ipa_actual_ga` による GA-only 異音カーブアウトを尊重し、37 語を変更対象から除外（上記「実装内容」参照）。Issue の完了定義・既存 `docs/data-contract.md` 規約と整合するため、halt せず適用。
- 実装中に発覚した懸念: 上記のみ。他に想定外の副作用なし。

## 動作確認

- 変更語数: **78 語**（`ga_rp_same: false → true`）
- "successful": `ga_rp_same: true`、`ipa` / `rp_ipa` ともに `/səkˈsɛsfəl/` に統一済みを確認
- "question": `ga_rp_same: true`（`n̩` ↔ `ən` パターン）に変更されたことを確認
- "butter": `ga_rp_same: false` のまま変更なし（`ɾ` vs `t` は実際の音の差）を確認
- "cloudy" / "could've" / "sentence" 等 37 語: `ga_rp_same: false` のまま維持（GA-only 異音カーブアウトにより除外）を確認
- `python3 tools/validate/validate_i18n.py` 実行 → ハード不整合 0 件（既存の WARN 5 件のみ、本変更前と同一）
- JSON パース確認: 5,397 エントリで変化なし、有効な JSON であることを確認
- 既存機能への影響: `ga_rp_same: true` になった 78 語は UI の RP 行が非表示になる（Issue で意図した挙動）。他語への影響なし。
- データ整合性: wordlist.json のみ変更。`connected_speech` / `weak_forms` は本 Issue の対象外（Issue 本文に明記なし、ホワイトリストにも含まれず）。

## 実装過程での気づき

- Issue 本文に例示された正規化スクリプトは `ipa`/`rp_ipa`（phonemic）のみを比較しており、`ipa_actual_ga`（narrow 転写）による GA-only 異音カーブアウトを考慮していなかった。素朴に適用すると 115 語が変更対象になるが、うち 37 語は実際には GA 固有の可聴な異音（フラップ t・声門閉鎖）を伴うため、カーブアウトを追加して 78 語に絞り込んだ。

## 後続への影響

- `docs/data-contract.md` の分布統計（`ga_rp_same_reason` 内訳: `structural_other` 615 → 537 程度、`identical` 1,527 → 1,605 程度）が本変更により古くなる可能性があるが、本 Issue のホワイトリストは `wordlist.json` のみのため、ドキュメント更新は本 PR の対象外（別 Issue での対応を推奨）。

## 残課題・申し送り

- `docs/data-contract.md` の分布統計テーブル（§154-155）の更新は本 Issue のスコープ外。数値が古くなった旨を Naoya に報告する。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一ファイル（wordlist.json）へのデータ値更新のみで、構造・スキーマ変更は伴わない。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C5（Runtime data / schema contract）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（wordlist の値変更のみ、スキーマ・パス構造は不変）
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

### 昇格・追加提案がある場合の詳細

なし
