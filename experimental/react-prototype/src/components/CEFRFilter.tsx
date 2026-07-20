import { useMemo } from "react";

/** CEFR levels exposed by this prototype (A1–C2). */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export type CEFRFilterProps = {
  /** Currently selected levels (multi-select). */
  selected: readonly CEFRLevel[];
  /** Called with the next selection after a toggle. */
  onChange: (next: CEFRLevel[]) => void;
};

/**
 * Multi-toggle CEFR filter (skeleton of Setup / Vocab pills in the SPA).
 * Feature parity with production is intentionally out of scope for Phase 1.
 *
 * @param props.selected - Selected CEFR levels
 * @param props.onChange - Parent callback with the updated selection array
 */
export function CEFRFilter({ selected, onChange }: CEFRFilterProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  /**
   * Toggle one CEFR level and notify parent.
   * @param level - Level button that was clicked
   */
  function toggle(level: CEFRLevel): void {
    const next = new Set(selectedSet);
    if (next.has(level)) next.delete(level);
    else next.add(level);
    onChange(CEFR_LEVELS.filter((lv) => next.has(lv)));
  }

  return (
    <div className="cefr-filter" role="group" aria-label="CEFR level">
      {CEFR_LEVELS.map((level) => {
        const pressed = selectedSet.has(level);
        return (
          <button
            key={level}
            type="button"
            className="cefr-pill"
            data-cefr={level}
            aria-pressed={pressed}
            onClick={() => toggle(level)}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}
