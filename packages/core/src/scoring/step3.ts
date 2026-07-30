/**
 * packages/core/src/scoring/step3.ts
 *
 * `3d`（学習状況）の卒業判定ロジック。`1a` / `3a`–`3c` / `3h` は
 * 「採点則・定数: 該当なし」（`docs/features/1a.md` / `3a.md` / `3b.md` / `3c.md` / `3h.md`）のため
 * 抽出対象外（Recon `docs/cursor/recon/pre-issue-recon-20260730-scoring-map.md` §2）。
 *
 * `apps/web/src/index.template.html` の `itemCefrLabel()` (旧 L3685) /
 * `progressPoolForDrill()` (旧 L2027) / `computeDrillProgress()` (旧 L2035) を
 * ロジック不変で移植。元実装は module-level `PRESET`/`CONNECTED`/`WEAK`/
 * `progressCefrSelected`/`CHECK_MAX`/`sessionItemKey` を参照していたが、
 * 純粋関数化のためすべて明示引数化する（グローバル依存の除去、ロジック改良ではない）。
 *
 * `docs/features/3d.md` 「採点則・定数」: 卒業判定は `ept_marks_v1` の値が 3。
 */

import type { Cefr } from "../types.js";

/** CEFR タグとして有効な値のみを返す（`^[ABC][12]$`）。 */
export function itemCefrLabel(c: { cefr?: string | null } | null | undefined): string {
  if (!c) return "";
  const raw = c.cefr;
  if (typeof raw === "string" && /^[ABC][12]$/.test(raw)) return raw;
  return "";
}

export interface DrillProgressPools<T> {
  /** `2a`/`2b`/`2c` の母集団（wordlist）。 */
  PRESET: T[];
  /** `2d` の母集団（connected_speech）。 */
  CONNECTED: T[];
  /** `2d` の母集団（weak_forms）。 */
  WEAK: T[];
}

/**
 * ドリル種別に応じた母集団を CEFR フィルタで絞り込む。
 * `2d` は `CONNECTED.concat(WEAK)`、それ以外は `PRESET`。
 */
export function progressPoolForDrill<T extends { cefr?: string | null }>(
  drillId: string,
  pools: DrillProgressPools<T>,
  cefrLevelsSelected: ReadonlySet<Cefr | string>
): T[] {
  const pool = drillId === "2d" ? pools.CONNECTED.concat(pools.WEAK) : pools.PRESET;
  return pool.filter((item) => {
    const level = itemCefrLabel(item);
    return !!level && cefrLevelsSelected.has(level);
  });
}

export interface DrillProgressResult {
  drillId: string;
  counts: [number, number, number, number];
  total: number;
  graduated: number;
  pct: number;
}

/**
 * ドリル種別の卒業率を算出する（`ept_marks_v1` の値が 3 のものを卒業として集計）。
 *
 * @param pool `progressPoolForDrill` で絞り込み済みの母集団
 * @param marks `{ "{drillId}:{itemKey}": 0..3 }` 形式のマーキングオブジェクト
 * @param checkMax マーキングの最大値（現行 `CHECK_MAX = 3`）
 * @param sessionItemKey アイテムからマーキングキーを導出する関数（元実装 `c.id||c.w`）
 */
export function computeDrillProgress<T>(
  drillId: string,
  pool: T[],
  marks: Record<string, number>,
  checkMax: number,
  sessionItemKey: (item: T) => string
): DrillProgressResult {
  const counts: [number, number, number, number] = [0, 0, 0, 0];
  pool.forEach((item) => {
    const raw = marks[drillId + ":" + sessionItemKey(item)];
    const mark = Number.isInteger(raw) ? Math.max(0, Math.min(checkMax, raw)) : 0;
    counts[mark]++;
  });
  const total = pool.length;
  const graduated = counts[3];
  return {
    drillId,
    counts,
    total,
    graduated,
    pct: total ? Math.round((graduated / total) * 100) : 0,
  };
}
