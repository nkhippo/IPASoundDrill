import { useEffect, useMemo, useState } from 'react';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export interface CEFRFilterProps {
  defaultSelected?: CefrLevel[];
  onChange: (selected: CefrLevel[]) => void;
}

/**
 * Renders the prototype CEFR toggle group and reports selected levels upward.
 */
export function CEFRFilter({
  defaultSelected = CEFR_LEVELS,
  onChange,
}: CEFRFilterProps) {
  const [selectedLevels, setSelectedLevels] = useState<Set<CefrLevel>>(
    () => new Set(defaultSelected),
  );
  const orderedSelection = useMemo(
    () => CEFR_LEVELS.filter((candidate) => selectedLevels.has(candidate)),
    [selectedLevels],
  );

  useEffect(() => {
    onChange(orderedSelection);
  }, [onChange, orderedSelection]);

  /**
   * Toggles one CEFR level while preserving the display order in callbacks.
   */
  function toggleLevel(level: CefrLevel) {
    setSelectedLevels((current) => {
      const next = new Set(current);

      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }

      return next;
    });
  }

  return (
    <fieldset className="cefr-filter" aria-label="CEFR level filter">
      <legend className="cefr-filter__legend">CEFR level</legend>
      <div className="cefr-filter__buttons">
        {CEFR_LEVELS.map((level) => {
          const isSelected = selectedLevels.has(level);

          return (
            <button
              aria-pressed={isSelected}
              className="cefr-filter__button"
              key={level}
              onClick={() => toggleLevel(level)}
              type="button"
            >
              {level}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
