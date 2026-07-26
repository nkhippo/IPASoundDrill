# Pre-Issue Recon — F2 build infrastructure

## 対象 Issue
- Issue: #31
- 実施日: 2026-07-12

## 調査結果

### 1. vercel.json

**存在しない**（リポジトリルートに `vercel.json` なし）。

→ F2 で新規追加して問題ない（既存内容とのマージ競合なし）。

### 2. package.json

**存在しない**（リポジトリルートに `package.json` なし）。

現状は Node 依存のない静的サイト構成。F2 の `scripts/build-i18n-html.js` 導入時は `package.json` の新規追加が必要。

### 3. .github/workflows/

存在する workflow は **3 個のみ**（デプロイ用 workflow は無し。Pages の `static.yml` は Issue #7 で削除済み）。

| ファイル | `name` | `on` | 概要 |
|---|---|---|---|
| `trigger-cursor-on-ready.yml` | Trigger Cursor on ready-for-cursor | `issues: [labeled]` | `ready-for-cursor` ラベル時に Cursor Automation webhook を POST |
| `approval.yml` | PR Approval Handler | `issue_comment: [created]` | Naoya の approve/ok/lgtm コメントで PR を squash merge |
| `label-pr-needs-review.yml` | Label PR needs-review | `pull_request: [opened, reopened, synchronize, closed]` | 非 Naoya PR に `needs-review` 付与、マージ時に除去 |

いずれも **Cursor / PR 運用専用**。Vercel ビルドや静的生成を触る step は無い。F2 のビルド導入と GitHub Actions の直接競合は想定しにくい（デプロイは Vercel Git 連携側）。

### 4. リポジトリルート直下のファイル一覧

**ディレクトリ:** `.cursor/`, `.github/`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`

**ファイル:** `.gitignore`, `CLAUDE.md`, `README.md`, `index.html`, `wordlist_GA_a1a2_plus_phonics.csv`, `wordlist_GA_a1a2_plus_phonics.json`（＋ローカル `.DS_Store`）

Issue 例示の `index.html` / `README.md` / `wordlist_*` / `CLAUDE.md` **以外**のルート要素: `.cursor/`, `.github/`, `.gitignore`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`

#### `.gitignore` 全文

```
.DS_Store
.env
.env.*
*.pre-phase0a.json
scripts/*.log
```

**注意:** `node_modules/` / `dist/` / `build/` / `.vercel/` / 言語別生成ディレクトリ（`/en/` 等）のパターンは **含まれていない**。

### 5. src/ ディレクトリ

**存在しない。**

→ F2 の `src/index.template.html` 新規追加はディレクトリごと作成で問題なし（既存衝突なし）。

### 6. 既存の Vercel Deploy 設定

**推定: 静的サイトのデフォルト設定（明示設定ファイルなし）。**

根拠:
- リポジトリに `vercel.json` なし
- `.vercel/` / Build Output API 相当の `vercel/output` なし
- `package.json` なし → Framework Preset は実質「Other / 静的」相当で、ルートの `index.html` をそのまま配信していると推定
- `docs/OPERATIONS.md` § 1: `main` マージで Vercel 自動デプロイ（30–60 秒）。GitHub Actions 側のデプロイ job は無い

F2 でビルドが必要になると、Vercel プロジェクト設定（Install Command / Build Command / Output Directory）か `vercel.json` での明示が必須になる。

### 7. node_modules/ の gitignore 状況

`.gitignore` に **`node_modules/` は含まれていない**。

- 作業ツリーにも `node_modules/` ディレクトリは **存在しない**
- `package.json` 追加後にローカル / Vercel で `npm install` すると、現状のままでは誤ってコミットされるリスクがある
- **F2 では `.gitignore` に `node_modules/`（および生成物）を追加することを強く推奨**

### 8. middleware.ts の存在

**存在しない**（ルート・配下とも `middleware.ts` / `middleware.js` / `middleware.mjs` なし）。

→ F2 で任意追加する `middleware.ts` の名前空間衝突なし。ただし Vercel Middleware はプロジェクト種別に依存するため、静的サイト + Middleware の可否は F2 設計時に要確認。

### 9. 言語別ディレクトリの使用状況

ルート直下に以下は **すべて不在**:

- `en/`, `ja/`, `ko/`, `zh-Hans/`, `zh-Hant/`, `fil/`

→ ビルド生成物として `/en/index.html` 等を置いても、既存ディレクトリとの衝突なし。

（調査対象外の `docs/` / `data/` / `i18n/` 内の言語コード使用は別問題。ルート生成物とは非衝突。）

### 10. Node.js 関連ファイル

すべて **不在**:

| ファイル | 状態 |
|---|---|
| `package-lock.json` | absent |
| `yarn.lock` | absent |
| `pnpm-lock.yaml` | absent |
| `bun.lockb` | absent |
| `.nvmrc` | absent |
| `.node-version` | absent |
| ルートの `*.ts` / `*.js` | absent |

Python ツールは `scripts/`・`tools/` に存在。Node ビルドは完全に新規導入領域。

## 影響範囲の推定

Issue F2 設計への示唆:

1. **グリーンフィールドに近い。** `vercel.json` / `package.json` / `src/` / 言語別ディレクトリ / middleware はすべて未使用で、Phase 5 想定の新規ファイル群と既存資産の直接衝突はほぼ無い。
2. **最大のリスクは「gitignore 不足」と「Vercel ビルド設定の初導入」。** `node_modules` と生成 HTML をコミット対象から外すか、生成物をコミットして Build Command なしにするか、方針を F2 Issue で明示すること。
3. **GitHub Actions との競合は低い。** 現行 3 workflow は Cursor/PR 運用のみ。デプロイは Vercel Git Integration。F2 で Actions に build job を足す必然は薄い（Vercel 側 Build Command で足りる）。
4. **現行配信はルート `index.html` 一枚。** サブディレクトリ方式導入後は、`/` → 言語別 URL への redirect/rewrite と、既存ブックマーク互換を `vercel.json` で設計する必要がある。
5. **テンプレート化は `index.html`（約 3,259 行）の移動/分割を伴う。** Recon #26 の知見（静的 head 不足、`applyI18n` の title のみ更新）と合わせてホワイトリストを組むこと。

## 判断困難な事項

- Vercel Hobby 上で「静的サイト + `middleware.ts`（Accept-Language 302）」が制約なく使えるか、Dashboard の Framework Preset 変更が必要かは、本 Recon（リポジトリ調査のみ）では断定できない。F2 で最小 PoC かドキュメント確認が必要。
- 生成物（`/en/` 等）を Git に含めるか Vercel ビルド時のみ生成するかはプロダクト判断（Track A の運用簡易さ vs リポジトリ肥大）。

## Claude への申し送り

Issue F2 本文作成時に注意すべき点・競合リスク:

1. **新規追加は概ね安全:** `vercel.json`, `package.json`, `src/index.template.html`, `scripts/build-i18n-html.js`, `middleware.ts`（任意）, `/en/`…`/fil/` は既存と非衝突。
2. **必ずホワイトリストに入れるべき付随変更:** `.gitignore` に `node_modules/`、（方針次第で）生成ディレクトリ / `.vercel/`。
3. **デプロイ経路:** GitHub Actions を触らず、Vercel の Build Command（例: `node scripts/build-i18n-html.js`）+ Output 設定、または生成物コミット + Build なし、のどちらかを Issue で一本化すること。
4. **現行ルート `index.html`:** テンプレート化後も「開発用エントリ」か「ビルド入力」かを明記。ランタイム契約（wordlist / i18n / fonts パス）を壊さないこと。
5. **Middleware は任意:** 無くても `/` → `/en/` 固定 redirect でローンチ可能。Accept-Language は後追いでもよい。
6. **本 Issue は調査のみ。** 実装・設定変更は Issue F2 本体で行う。

---
_Cursor による自動投稿_
