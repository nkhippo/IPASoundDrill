# Cursor 指示書 — 連結句の文章埋め込み出題（キャリア文方式）

> 作成日: 2026-06-26
> 種別: 機能改善（連結句タブの出題形式）
> 入力: `connected_speech_with_carriers.json`（Claude 生成・検証済み）
> 対象: `data/connected_speech.json`（置換）、`index.html`（連結句の出題描画）
> 前提: 採点・音声・フィルタ等その他仕様は現状維持

Claude 設計サマリー。

---

## 1. 目的（要望）

現状: 連結句タブは連結IPA単体（例 `/breɪkəˈprɑmɪs/`）を提示し、元フレーズを入力させる。
変更後: **キャリア文（文脈文）の中にIPA部分だけを埋め込んで提示**する。

例: `Tom /breɪkəˈprɑmɪs/ to his best friend`
（※この例は説明用。実データのキャリア文は §3 の `carriers` を使用）

- パターン暗記を防ぐため、各句に**4種のキャリア文**を用意し、出題時にランダム選択
- **Claude API等を都度呼ばない**（キャリア文は静的データ）
- 対象は**連結句タブの全201句**（linking/assimilation/elision 全部）
- **その他仕様は不変**: 入力・採点対象はIPA部分の元フレーズ(`w`)のみ。音声(▶)で流すのは該当ワードのみ。reveal（回答）ではキャリア文は不要

---

## 2. データ（`connected_speech_with_carriers.json`）

既存 `connected_speech.json` に **`carriers` フィールドを追加**しただけ。他フィールドは不変。

```jsonc
{
  "id": "cs046",
  "w": "what do you want",
  "ipa": "/ˈwʌɾəjəˈwɑnt/",
  "rp_ipa": "/ˈwɒtdʒəˈwɒnt/",
  "cs_type": "linking",
  "level": 3,
  "src": "connected_speech",
  "cs_rule": { "en": "...", "ja": "..." },
  "gloss": { "en": "...", "ja": "...", "zh": "...", "ko": "..." },
  "carriers": [                       // ★追加: 4種。{P} がフレーズ位置
    "So, {P} for dinner?",
    "Tell me, {P}?",
    "{P} from the shop?",
    "{P} to drink?"
  ]
}
```

### `{P}` プレースホルダの仕様（重要）

- `{P}` は**フレーズ `w` が入る位置**。出題時に `{P}` を**IPA表示**に置換、周囲のテキストは綴りのまま文脈として表示
- 各キャリアに `{P}` は**ちょうど1個**
- **文頭大文字化**: `{P}` が文頭に来るキャリアは、レンダリング時に**IPA部分は大文字化しない**（IPAは小文字記号のため）。代わりに、文の見た目を保つため `{P}` が文中に来るキャリアと混在してよい。文頭の `{P}` でも IPA はそのまま `/.../ ` を表示すればよい（大文字化不要）
- データ側で「文末記号直後に `{P}` が来る」ケースは**排除済み**（中間大文字化が不要なように作成）。よってレンダリングは「先頭文字だけ大文字化、ただし先頭が `{P}` なら大文字化しない」で十分

検証済み（Claude）: 201句×4=804キャリア、`{P}`単一・隣接語重複なし・中間大文字化なし。

---

## 3. 実装（`index.html`）

### 3-1. データ置換

```bash
cp connected_speech_with_carriers.json data/connected_speech.json
```

`normalizeConnected()` に `carriers` を通す（保持するだけ）:
```javascript
function normalizeConnected(row){
  return { ...existing, carriers: row.carriers || null };
}
```

### 3-2. 出題時にキャリア文を選ぶ

連結句の出題（`renderDecode` が連結アイテムを描く箇所）で、キャリア文を1つランダム選択し、`{P}` をIPA描画に置換する。

```javascript
// セッションに当該カードのキャリアを固定（同じ問題内で再描画してもブレないよう、出題確定時に1つ選ぶ）
function pickCarrier(c){
  if(!c.carriers || !c.carriers.length) return null;
  return c.carriers[Math.floor(Math.random()*c.carriers.length)];
}
```

> 出題確定タイミング（`renderCard` で `S.cur` 確定時）に `S.curCarrier = pickCarrier(c)` を一度だけ設定し、描画はそれを参照。これで同一問題の再描画でキャリアが変わらない。

### 3-3. 描画: 文中にIPAを埋め込む

連結句のとき、現状は `renderIpaInto($("dIpa"), activeIpa(c), ...)` でIPA単体を描画している。これを**キャリア文テンプレートの中にIPA塊を埋め込む**形に変更する。

```javascript
function renderConnectedPrompt(c){
  const ipaHtml = buildIpaHtml(activeIpa(c));   // 既存 renderIpaInto のHTML生成部を関数化
  const carrier = S.curCarrier || "{P}";
  // {P} の前後テキストをエスケープし、{P} を ipaHtml に置換
  const [before, after] = carrier.split("{P}");
  const html =
    '<span class="carrier">' + escapeHtml(capIfNeeded(before)) + '</span>' +
    ipaHtml +
    '<span class="carrier">' + escapeHtml(after) + '</span>';
  $("dIpa").innerHTML = html;
  // IPA記号のタップ解説リスナーは ipaHtml 部分にのみ付与（既存ロジック流用）
  bindIpaSegments($("dIpa"));
}
function capIfNeeded(before){
  // before が空（=文頭が{P}）なら大文字化しない。そうでなければ先頭大文字化。
  if(!before) return "";
  return before.length ? before.charAt(0).toUpperCase()+before.slice(1) : before;
}
```

> `renderIpaInto` は現在「IPAの描画 + クリックリスナー付与」を一体でやっている。これを「HTML生成（`buildIpaHtml`）」と「リスナー付与（`bindIpaSegments`）」に分け、連結句では文脈付きで使う。**単語モード/Encode/Mode B の挙動は変えない**（従来どおり `renderIpaInto` を呼ぶ）。

### 3-4. スタイル

- `.carrier` は通常テキスト色・やや小さめ、IPA塊（`.ipa` 内の `/.../`）は従来の見た目を維持
- 文とIPAが自然に1行/折り返しで並ぶように `display:inline`/適切な余白
- 画像の現状デザイン（枠・スラッシュ・nucleus下線）はIPA塊側で維持

### 3-5. 不変（重要・要望どおり）

- **採点**: 入力欄は従来どおり元フレーズ `w` を入力。`decodeCheck()` は `spellCheck(text, c.w)` のまま**変更なし**
- **音声(▶)**: 流すのは該当ワード（`c.w`）の音声のみ。**変更なし**（連結句は GA 固定の既存仕様）
- **reveal**: 回答画面ではキャリア文を出さない。従来どおり元フレーズ・IPA・gloss・cs_rule を表示
- **入力プレースホルダ**: 「Type the phrase」のまま

---

## 4. DoD

- [ ] `data/connected_speech.json` が `carriers`（各4個）を持つ201句
- [ ] 連結句の出題が「文中にIPA塊を埋め込む」形で表示される
- [ ] キャリア文は出題ごとにランダム選択（同一問題の再描画では固定）
- [ ] IPA記号タップ解説がIPA塊部分で従来どおり動く
- [ ] 採点対象は元フレーズ `w` のみ（変更なし）
- [ ] 音声は該当ワードのみ（変更なし）
- [ ] reveal はキャリア文なし（変更なし）
- [ ] 単語/Encode/Mode B の描画は不変
- [ ] API 呼び出しゼロ（キャリアは静的データ）

---

## 5. 留意

- キャリア文は英文の自然さ優先で作成済み。`{P}` は語形変化させない前提（フレーズ `w` をそのまま挿入）
- 文頭 `{P}` のキャリアは IPA を大文字化しない（IPA記号に大文字なし）。データは中間大文字化が不要なように作成済み
- RP選択時も同じキャリアでよい（`{P}` 部分が `rp_ipa` になるだけ。`activeIpa(c)` がGA/RPを切替）

---

## 6. Claude への申し送り

- 201句×4キャリア、検証済み（`{P}`単一・隣接語重複なし・文末直後プレースホルダなし）
- 採点・音声・reveal は意図的に不変
- 連結句の `carriers` 多言語化は不要（キャリアは英文の文脈。学習対象は英語そのもの）
