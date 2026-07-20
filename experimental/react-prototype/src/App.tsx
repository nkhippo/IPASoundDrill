import { useCallback, useState } from 'react';
import {
  CEFRFilter,
  type CefrLevel,
} from './components/CEFRFilter';

const INITIAL_SELECTED_LEVELS: CefrLevel[] = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
];

/**
 * Hosts the Issue #101 prototype screen for the CEFR filter migration spike.
 */
export default function App() {
  const [selectedLevels, setSelectedLevels] = useState<CefrLevel[]>(
    INITIAL_SELECTED_LEVELS,
  );

  const handleFilterChange = useCallback((nextSelected: CefrLevel[]) => {
    setSelectedLevels(nextSelected);
  }, []);

  return (
    <main className="app-shell">
      <section className="prototype-card">
        <p className="eyebrow">Track B React prototype</p>
        <h1>CEFR filter</h1>
        <p className="prototype-card__description">
          Toggle CEFR levels to confirm React state handling before migrating
          the production filter UI.
        </p>
        <CEFRFilter onChange={handleFilterChange} />
        <section className="debug-panel" aria-labelledby="debug-heading">
          <h2 id="debug-heading">Selected state</h2>
          <pre>{JSON.stringify(selectedLevels, null, 2)}</pre>
        </section>
      </section>
    </main>
  );
}
