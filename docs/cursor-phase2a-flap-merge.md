# Cursor 作業指示書 — Phase 2a: Flap IPA 本データマージ + VntV レビューツール

**作成日:** 2026-07-02
**担当:** Cursor
**依頼者:** Claude
**前提:** `cursor-implementation-report-phase1-narrow-ipa-respell.md`（Phase 1 実装完了報告）を確認済み
**リポジトリ:** `nkhippo/English-Pronunciation-Trainer`（`main` ブランチ）
**添付データ:** `phase2a_flap_candidates.json`（186語）、`phase2a_review_needed.json`（52語）

---

## 0. 目的とスコープ

Phase 1 でスキーマ・表示ロジック・tokenizer 拡張が完了し、pilot 30語のマージまで確認済み。本 Phase 2a では:

1. **ルールベースで自動生成した 186 語ぶんの `ipa_actual_ga` を wordlist 本体にマージ**（pilot 30語との重複解決を含む）
2. **VntV 判定保留の 52 語について、Naoya が実際の TTS 音声を聞いて判定できる内部レビューツールを作成**
3. **Phase 1 で未実施だった手動テスト（T-1〜T-7）を、拡大したデータセットに対して効率よく実施できるよう、サンプリング済みテストチェックリストを整備**

respelling（`respell_ga`/`respell_rp`）と RP narrow（`ipa_actual_rp`）は本 Phase の対象外（Phase 2b 以降）。**触らないこと。**

---

## 1. 参照ドキュメント

| ファイル | 参照理由 |
|---|---|
| `cursor-phase1-narrow-ipa-respell.md` | Phase 1 指示書（本 Phase の前提） |
| `cursor-implementation-report-phase1-narrow-ipa-respell.md` | Phase 1 実装内容の確認 |
| `phase2a_flap_candidates.json`（添付） | マージ対象データ（186語） |
| `phase2a_review_needed.json`（添付） | VntV レビュー対象（52語） |
| `generate_flap_ipa.py`（添付、参考） | 生成ロジック本体。マージ対象データの生成根拠を確認したい場合に参照 |

---

## 2. Task A: Phase 2a データのマージ（186語）

### A-1. 重複語の扱い（重要）

添付の `phase2a_flap_candidates.json`（186語）と、既存 pilot 30語（Phase 1 でマージ済み）の間に **24語の重複** があります。うち **22語は値が完全一致**、**2語（`middle`, `thirty`）は不一致**です。

| 語 | pilot（既存値） | phase2a（新値） | 判定 |
|---|---|---|---|
| `middle` | `/ˈmɪɾl̩/` | `/ˈmɪdl̩/` | **phase2a が正**（設計確定ルール「d + 音節主音l は d のまま、フラップしない」に整合。pilot 側の手動データが誤り） |
| `thirty` | `/ˈθɝɾi/` | `/ˈθɝˌɾi/` | **phase2a が正**（元データ `ipa` の二次強勢記号 `ˌ` をそのまま保持するのが正しい変換。pilot 側で誤って除去していた） |

**マージ方針: `phase2a_flap_candidates.json` の値で `ipa_actual_ga` を常に上書きする**（pilot 由来かどうかを問わず、186語全件について新値を適用）。これにより `middle` と `thirty` の 2 語が自動的に修正されます。

### A-2. マージスクリプトの拡張

Phase 1 で作成した `scripts/merge_pilot_narrow_respell.py` は pilot 専用（4フィールド固定・完全一致必須）のため、Phase 2a 用に汎用マージスクリプトを新規作成します。

`scripts/merge_flap_candidates.py`:

```python
#!/usr/bin/env python3
"""
Merge rule-generated ipa_actual_ga candidates into the wordlist.
Overwrites ipa_actual_ga for every word present in the candidates file,
regardless of whether the word already has a value (Phase 2a candidates
are the authoritative, audited source — see cursor instructions §2 A-1
for the two words this intentionally corrects: middle, thirty).

Does NOT touch: ipa_actual_rp, respell_ga, respell_rp, or any other field.
"""
import json
import pathlib

WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
CANDIDATES = pathlib.Path("phase2a_flap_candidates.json")


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    candidates = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    lookup = {w["w"]: w for w in data}

    merged, corrected, skipped = 0, [], []
    for c in candidates:
        word = c["w"]
        if word not in lookup:
            skipped.append(word)
            continue
        entry = lookup[word]
        old_val = entry.get("ipa_actual_ga")
        new_val = c["ipa_actual_ga"]
        if old_val is not None and old_val != new_val:
            corrected.append((word, old_val, new_val))
        entry["ipa_actual_ga"] = new_val
        merged += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(f"merged {merged} / {len(candidates)} entries")
    if corrected:
        print(f"\ncorrected {len(corrected)} pre-existing values:")
        for word, old, new in corrected:
            print(f"  {word}: {old} -> {new}")
    if skipped:
        print(f"\nWARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
```

**実行方法:** `python3 scripts/merge_flap_candidates.py`

**期待される出力:**
```
merged 186 / 186 entries

corrected 2 pre-existing values:
  middle: /ˈmɪɾl̩/ -> /ˈmɪdl̩/
  thirty: /ˈθɝɾi/ -> /ˈθɝˌɾi/
```

### A-3. マージ後の検証

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
lookup = {w['w']: w for w in d}
has_narrow = [w for w in d if w.get('ipa_actual_ga')]
print(f'ipa_actual_ga を持つ語の総数: {len(has_narrow)}')
# 期待値: 30 (pilot) + 186 (phase2a) - 24 (重複) = 192
print('middle:', lookup['middle']['ipa_actual_ga'])
print('thirty:', lookup['thirty']['ipa_actual_ga'])
print('party:', lookup['party']['ipa_actual_ga'])
"
```

期待出力:
```
ipa_actual_ga を持つ語の総数: 192
middle: /ˈmɪdl̩/
thirty: /ˈθɝˌɾi/
party: /ˈpɑrɾi/
```

### A-4. 触ってはいけないフィールド（再掲）

- `ipa_actual_rp` — Phase 2a では GA のみ生成。RP は変更しない
- `respell_ga` / `respell_rp` — Phase 2b の対象。ここでは追加・変更しない
- `ipa` / `rp_ipa`（phonemic）— 絶対に変更しない

---

## 3. Task B: VntV レビューツール（52語・TTS 実音声判定用）

### 3-1. 背景

`phase2a_review_needed.json`（52語）は `winter`, `under`, `candy` のような「鼻音 + t/d + 母音」パターンで、GA話者間の実現に variation があるため機械的に確定できません。判断基準は言語学的な一般論ではなく **このアプリが使っている TTS（gpt-4o-mini-tts）が実際にどう発音しているか** です。Opus等のLLM判断は不要で、実際の音声を聞いて Naoya が判定するのが最も正確です。

### 3-2. 作成するツール

`tools/review-vntv.html`（本番アプリとは独立の内部ツール。`index.html` は一切変更しない）

**要件:**

- 52語を一覧表示。各行に:
  - 単語（`w`）
  - 現在の phonemic IPA（`ipa`）
  - 再生ボタン（既存 GAS TTS エンドポイント `?word=<w>&accent=ga` を叩く）
  - 判定用ラジオボタン 2 種:
    - 「nasal（n）を保持しているか」: 保持 / 削除 / わからない
    - 「t/d はどう聞こえるか」: フラップ(ɾ) / 元の子音のまま / 聞き取れない
  - コメント欄（自由記述、任意）
- 全52語の判定が終わったら「結果をエクスポート」ボタンで JSON ダウンロード
  - 出力フォーマット:
    ```json
    [
      { "w": "winter", "nasal": "deleted", "consonant": "flap", "note": "" },
      { "w": "under", "nasal": "kept", "consonant": "flap", "note": "ゆっくり発音時はnが残る" },
      ...
    ]
    ```
- 判定状況はブラウザの `localStorage`（キー: `vntv_review_v1`）に自動保存し、ページリロードしても入力内容が消えないようにする（**このツールは内部用のため window.storage の永続化APIは不要、標準の localStorage で問題ない**）
- 52語すべて判定済みになったら進捗表示（`38/52` のようなカウンタ）を画面上部に表示

**UIは最小限で良い**（本番の frontend-design スキルは適用不要）。プレーンな HTML + vanilla JS で十分。テーブルまたはカード一覧形式。

**データソース:** `phase2a_review_needed.json` をツール内に埋め込むか、`fetch()` で読み込む（同一ディレクトリに配置）。

### 3-3. 配置場所

`tools/review-vntv.html` と `tools/phase2a_review_needed.json`（コピー）を追加。`tools/` ディレクトリは GitHub Pages のビルド対象外にするか、`.nojekyll` 等で誤って公開されないよう配慮すること（既存の `scripts/` と同様の扱いで問題なければそれに倣う）。

### 3-4. 使い方の案内をレポートに含める

Naoya がこのツールをどう開くか（ローカルで `open tools/review-vntv.html` するだけで良いか、簡易サーバーが必要か）を実装レポートに明記すること。

---

## 4. Task C: 既存検証スクリプトの再実行

Phase 1 で使用した検証を Phase 2a データに対しても実行:

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
```

- ERROR が出ないことを確認
- `encodeCheck()` 関数の diff がゼロであることを再確認（Phase 2a はデータ追加のみでロジック変更なしのはずだが、念のため）

追加で、narrow IPA を含む語（192語）についてtokenizerが正しく処理できるか一括チェック:

```javascript
// ブラウザ DevTools または簡易 Node スクリプトで
// wordlist の ipa_actual_ga を持つ全語に対して tokenize() を実行し、
// 例外や空配列が出ないことを確認
```

このチェック用の簡易スクリプトを `scripts/verify_tokenize_narrow.py`（または同等の Node スクリプト）として用意し、結果を実装レポートに記載すること。

---

## 5. Task D: Phase 1 未実施テスト（T-1〜T-7）のサンプリング実施

### 5-1. 背景

Phase 1 実装レポート §4「既知事項」で、T-1〜T-7 の実機手動テストが未実施と報告されています。データが 30語→192語に拡大した今、全語の手動確認は非現実的なため、**代表サンプルでのテスト実施**を提案します。

### 5-2. サンプリング方針

以下の組み合わせを最低限カバーするサンプルを選定し、テスト結果を実装レポートに記載すること（Cursor 側で実施可能な範囲。ブラウザ操作を伴う目視確認は Naoya に委ねて構わないが、その場合は「どの語を・どの手順で・何を確認すべきか」を明記したチェックリストとして渡すこと）:

| カテゴリ | サンプル語 | 確認observ点 |
|---|---|---|
| R1 (VtV flap) | `party` | Decode/Reveal で narrow 表示、Encode 非影響 |
| R1 (VdV flap) | `body` | 同上 |
| R2 (音節主音l, t→ɾ) | `bottle` | l̩ の表示、tokenize 正常性 |
| R2 (音節主音l, nt→ʔ) | `gentle` | ʔ の表示（Phase 2aで修正した語） |
| R3 (音節主音n, t→ʔ) | `button` | ʔ + n̩ の表示 |
| R3 (音節主音n, d→d) | `garden` | d + n̩ の表示 |
| narrow なし語 | `stop` | narrow フィールドなし語で phonemic フォールバック、dictionary form 行が非表示 |
| Phase2a 修正語 | `middle`, `thirty` | pilot時代の誤値ではなく修正後の値が表示されている |
| RP 切替 | `party`（RP設定） | narrow が RP では null → phonemic フォールバック、respelling が RP版に切替 |

### 5-3. 成果物

`docs/testing/phase2a-manual-test-checklist.md` として、上記サンプルの具体的な手順（Phase 1 指示書の T-1〜T-7 相当のフォーマットを踏襲）をまとめ、Naoya が実施しやすい形にすること。

---

## 6. DoD（Definition of Done）チェックリスト

### データマージ

- [ ] `scripts/merge_flap_candidates.py` が作成されている
- [ ] 実行結果 `merged 186 / 186 entries` が出力される
- [ ] `corrected` に `middle` と `thirty` の 2 件が表示される
- [ ] マージ後、`ipa_actual_ga` を持つ語の総数が 192（30+186-24）である
- [ ] `ipa_actual_rp` / `respell_ga` / `respell_rp` / `ipa` / `rp_ipa` が一切変更されていない（`git diff` で確認）

### VntV レビューツール

- [ ] `tools/review-vntv.html` が作成され、52語すべてが表示される
- [ ] 各語で TTS 再生ボタンが機能する（既存 GAS エンドポイントを利用）
- [ ] 判定結果が localStorage に保存され、リロード後も保持される
- [ ] エクスポート機能で JSON がダウンロードできる
- [ ] 進捗カウンタが正しく表示される

### 検証

- [ ] `validate_i18n.py` / `gen_audit_docs.py` が ERROR なしで完走
- [ ] `encodeCheck()` の diff がゼロ
- [ ] 192語全件で tokenize() が例外なく実行できる（`verify_tokenize_narrow` スクリプトの結果を報告）

### テストチェックリスト

- [ ] `docs/testing/phase2a-manual-test-checklist.md` が作成されている
- [ ] 表5-2 の全サンプル語について具体的な確認手順が記載されている

### ドキュメント

- [ ] `docs/DESIGN.md` に Phase 2a のマージ方針（186語・上書き方式）を追記
- [ ] `docs/SPECIFICATION.md` の変更履歴に Phase 2a を追加

---

## 7. 触ってはいけない箇所（Do Not Touch）— 再掲＋追加

Phase 1 の指示書 §12 に加え、以下も対象外:

| 箇所 | 理由 |
|---|---|
| `index.html`（本番アプリ） | Task B のレビューツールは `tools/` 配下の独立ファイルとして作成し、本番アプリには一切組み込まない |
| `ipa_actual_rp` フィールド | Phase 2a は GA のみ。RP フラップは発生しないため対象外 |
| `respell_ga` / `respell_rp` | Phase 2b の対象。本 Phase では触らない |
| `phase2a_review_needed.json` の52語の `ipa_actual_ga` | まだ判定待ち。Task B のツールでの判定結果が Claude に戻ってくるまでマージしない |

---

## 8. 実装レポート提出物

完了時、以下を Naoya 経由で Claude に渡すこと:

1. **実装レポート MD** (`report-phase2a-flap-merge.md`)
   - マージ実行結果（`corrected` 内容含む）
   - DoD チェック結果
   - `tools/review-vntv.html` の使い方説明
   - `verify_tokenize_narrow` の実行結果
2. **`docs/testing/phase2a-manual-test-checklist.md`**（Naoya のテスト実施用）

Naoya は `tools/review-vntv.html` で 52語の判定を行い、エクスポートした JSON を次のチャットに添付してください。それを元に Claude が残り52語の `ipa_actual_ga` を確定し、Phase 2a を完了させます。

---

## 開発ワークフロー確認

```
Cursor（186語マージ + VntVレビューツール作成 + テストチェックリスト整備）
  ↓ 実装レポート MD + review-vntv.html
Naoya（52語をTTS再生しながら判定 → JSON エクスポート + T1-T7サンプルテスト実施）
  ↓ 判定結果JSON + テスト結果を新チャットに添付
Claude（残り52語の ipa_actual_ga 確定 + Phase 2a 完了 + Phase 2b 着手判断）
```
