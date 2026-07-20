import { useState } from "react";
import { CEFRFilter, type CEFRLevel } from "./components/CEFRFilter";
import "./App.css";

/** Default selection mirrors Setup pills (A1/A2 on). */
const DEFAULT_SELECTED: CEFRLevel[] = ["A1", "A2"];

/**
 * Minimal host app: CEFRFilter + JSON debug dump of selection.
 */
function App() {
  const [selected, setSelected] = useState<CEFRLevel[]>(DEFAULT_SELECTED);

  return (
    <main className="app">
      <h1>IPA Sound Drill — React prototype (Phase 1)</h1>
      <p className="lede">
        Experimental CEFR filter. Not wired to production runtime data.
      </p>

      <section aria-labelledby="cefr-heading">
        <h2 id="cefr-heading">CEFR filter</h2>
        <CEFRFilter selected={selected} onChange={setSelected} />
      </section>

      <section aria-labelledby="debug-heading">
        <h2 id="debug-heading">Selected (debug)</h2>
        <pre className="debug">{JSON.stringify({ selected }, null, 2)}</pre>
      </section>
    </main>
  );
}

export default App;
