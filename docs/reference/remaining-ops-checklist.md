# 残作業チェックリスト（運用・手動）

> **更新日:** 2026-07-11  
> **対象:** Phase R / T / V / B を `main` にマージ済みの時点で、**コード外の手動作業**と**意図的に未着手の項目**。  
> 正本の設計は `PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md`。詳細手順は各 Phase レポートと `gas/README.md`。

GitHub Pages（静的）: https://nkhippo.github.io/IPASoundDrill/  
（`main` push で自動公開。**GAS は別デプロイ**）

---

## A. 必須（Phase T の効果を出すため）

| # | 作業 | 手順の正本 | 完了条件 |
|---|------|------------|----------|
| A1 | GAS エディタに最新 `gas/Code.gs` を反映し、**ウェブアプリを新しいバージョンとして再デプロイ** | [`gas/README.md`](../../gas/README.md)、[`cursor/reports/cursor-implementation-report-phase-t.md`](../cursor/reports/cursor-implementation-report-phase-t.md) §5 | `?urls=1` が Drive 公開 URL を返す |
| A2 | エディタで **`migratePublicSharing()` を実行**（既存 Drive MP3 を `ANYONE_WITH_LINK` 化）。**複数回実行が必要** — 約 5.5 分で PAUSED したら再実行し、ログが DONE になるまで続ける。やり直しは `resetMigratePublicSharing()` | 同上 / `gas/Code.gs` | 既存キャッシュ語もクライアント直 fetch 可能 |
| A3 | `index.html` の `GAS_TTS_URL` は**原則変更不要**（再デプロイで同一 `/exec` を維持する運用）。**今回のデプロイ URL は `index.html` に反映済み**（変わった場合のみ再更新） | Phase T レポート §5 / `index.html` | Pages 上のアプリが新デプロイを叩く |

**注意:** リポジトリ上の `Code.gs` は Phase T 済みでも、**Apps Script 側に未反映なら `?urls=1` は効かない**（従来の base64 経路にフォールバック）。

---

## B. 推奨（語彙 5,397 と Drive キャッシュの整合）

| # | 作業 | 手順の正本 | 完了条件 |
|---|------|------------|----------|
| B1 | リポジトリの `gas/BatchWords.gs`（**5,397 語**）を GAS プロジェクトへ貼り付け | `python3 scripts/export_batch_words.py` → [`gas/README.md`](../../gas/README.md) | GAS 側リスト件数 = 5,397 |
| B2 | GA BatchWarm の進捗確認。旧 3,059 時代のままなら `getBatchStatusGA` で確認し、必要ならトリガー継続（または `resetBatchGA` 後に再走） | `gas/BatchWarm.gs` / `gas/README.md` | `done: true` かつ全語 GA が Drive に存在 |
| B3 | （任意）RP 用 BatchWarm スケジューラ — **未実装・スコープ外** | Phase T レポート §7 | — |

**補足（Phase B）:** IPA は変えていないため「品質監査の結果として BatchWarm を必須再走」ではない。ただし **語数拡大後に Drive が未生成の語**がある場合は、warm 経路の遅延回避のため B2 が有効。

---

## C. 検証（GitHub Pages + DevTools）

| # | 確認 | 期待 |
|---|------|------|
| C1 | Start 直後 Network | `?urls=1&accent=…` と `drive.google.com/uc?...`（または usercontent）が出る |
| C2 | Start 直後 | `warm=1&accent=rp` が**すぐには出ない**（idle まで延期） |
| C3 | 1問目 wall time | cold &lt; 8s / Drive warm &lt; 1s / preread hit &lt; 500ms（目標。実測は環境依存） |
| C4 | CORS 失敗時 | base64（`?word=`）へフォールバック。必要なら `getPublicUrl_` を `drive.usercontent.google.com` 形式へ |
| C5 | `#/vocab` / `#/vocab/phrases` | 語彙ページ表示、Back と Menu が独立 |
| C6 | Phase B スポット | `comprehensive`/`corporal` の zh、`damn` の POS、Fil サンプル（例: `determiner`→pantukoy） |

---

## D. 意図的未着手（製品バックログ・削除しない）

これらは仕様から消えたのではなく、**別タスク待ち**。

| 項目 | 参照 |
|------|------|
| R4 pending **127** 語の TTS レビュー（narrow IPA） | `docs/reference/r4-pending-review-guide.md`、`data/pipeline/r4_pending_review_list.*` |
| Phase 2 M3+（CEFR-J B2 残り約 1,423） | `PURPOSE.md` Phase 2 節 |
| 連結句 RP TTS | `PURPOSE.md` 依存表、`DESIGN.md` §4 |
| `neighbors_rp` 再計算 | `docs/reference/rp-neighbors-priority-decision.md` |
| Connected / Weak の `?urls=1` 化 | Phase T §7 |
| 語彙 CEFR/POS フィルタ・仮想スクロール・詳細ページ | Phase V §5 |
| Fil カテゴリ A（38 語）の native レビュー、Phase 1 バッチ再監査 | Phase B §5 |

---

## 完了済み（再作業不要）

| Phase | 内容 | レポート |
|-------|------|----------|
| R | RP パイプライン / happY / `ga_rp_same` | `cursor-implementation-report-phase-r.md` |
| T | クライアント TTS 遅延対策（body-first / `?urls=1` コード / preread）※**GAS 反映は A 節** | `cursor-implementation-report-phase-t.md` |
| V | 語彙 `#vocabPage` + hash routing | `cursor-implementation-report-phase-v.md` |
| B | gloss.zh / Fil / バッチ同期 / 複合 POS i18n | `cursor-implementation-report-phase-b-batch-audit.md` |
