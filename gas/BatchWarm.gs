/**
 * GA batch warmup — time-triggered Drive stock generation.
 *
 * Setup:
 *   1. Run scripts/export_batch_words.py (generates BatchWords.gs + batch_words.csv)
 *   2. Paste Code.gs, BatchWarm.gs, BatchWords.gs into the GAS project
 *   3. Script property OPENAI_API_KEY (required)
 *   4. Optional: BATCH_SPREADSHEET_ID — column A of sheet "words" overrides BatchWords.gs
 *   5. Run resetBatchGA() once, then installBatchTriggerGA(5)
 *   6. Monitor with getBatchStatusGA()
 */

const BATCH_MAX_MS = 4.5 * 60 * 1000;
const BATCH_MAX_WORDS_PER_RUN = 24;
const BATCH_SHEET_NAME = 'words';
const PROP_BATCH_SPREADSHEET_ID = 'BATCH_SPREADSHEET_ID';
const PROP_BATCH_INDEX_GA = 'BATCH_INDEX_GA';
const PROP_BATCH_LAST_RUN_GA = 'BATCH_LAST_RUN_GA';

function getBatchProps_() {
  return PropertiesService.getScriptProperties();
}

function getBatchIndexGA_() {
  return parseInt(getBatchProps_().getProperty(PROP_BATCH_INDEX_GA) || '0', 10);
}

function setBatchIndexGA_(index) {
  getBatchProps_().setProperty(PROP_BATCH_INDEX_GA, String(index));
}

function isValidBatchWord_(word) {
  return /^[a-zA-Z][a-zA-Z'-]*$/.test(word);
}

function getBatchWordListFromSheet_() {
  const id = getBatchProps_().getProperty(PROP_BATCH_SPREADSHEET_ID);
  if (!id) return null;
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(BATCH_SHEET_NAME) || ss.getSheets()[0];
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  const words = [];
  for (let i = 0; i < values.length; i++) {
    const raw = String(values[i][0] || '').trim();
    if (!raw) continue;
    if (i === 0 && raw.toLowerCase() === 'word') continue;
    if (isValidBatchWord_(raw)) words.push(raw);
  }
  if (!words.length) throw new Error('Batch spreadsheet has no valid words in column A');
  return words;
}

function getBatchWordList_() {
  const fromSheet = getBatchWordListFromSheet_();
  if (fromSheet) return fromSheet;
  if (typeof BATCH_WORD_LIST !== 'undefined' && BATCH_WORD_LIST && BATCH_WORD_LIST.length) {
    return BATCH_WORD_LIST;
  }
  throw new Error('No word list: add BatchWords.gs or set BATCH_SPREADSHEET_ID');
}

function summarizeBatchResults_(results) {
  const summary = { cached: 0, generated: 0, failed: 0 };
  for (let i = 0; i < results.length; i++) {
    const st = results[i].status;
    if (summary[st] !== undefined) summary[st]++;
    else summary.failed++;
  }
  return summary;
}

/**
 * Time-trigger entry point — warms GA audio for the next chunk of words.
 */
function batchWarmGA() {
  const started = Date.now();
  const words = getBatchWordList_();
  let index = getBatchIndexGA_();

  if (index >= words.length) {
    Logger.log('batchWarmGA: already complete (' + words.length + ' words)');
    return;
  }

  const results = [];
  while (index < words.length && results.length < BATCH_MAX_WORDS_PER_RUN) {
    if (Date.now() - started > BATCH_MAX_MS) break;
    results.push(warmOne_(words[index], 'ga'));
    index++;
  }

  setBatchIndexGA_(index);
  const summary = summarizeBatchResults_(results);
  const status = {
    at: new Date().toISOString(),
    accent: 'ga',
    index: index,
    total: words.length,
    done: index >= words.length,
    processedThisRun: results.length,
    summary: summary,
    lastWords: results.slice(-3),
  };
  getBatchProps_().setProperty(PROP_BATCH_LAST_RUN_GA, JSON.stringify(status));
  Logger.log('batchWarmGA: ' + index + '/' + words.length + ' ' + JSON.stringify(summary));
}

/** Reset GA batch progress to the beginning. */
function resetBatchGA() {
  setBatchIndexGA_(0);
  getBatchProps_().deleteProperty(PROP_BATCH_LAST_RUN_GA);
  Logger.log('resetBatchGA: index reset to 0 (' + getBatchWordList_().length + ' words)');
}

/** Log current GA batch progress (run from editor to inspect). */
function getBatchStatusGA() {
  const words = getBatchWordList_();
  const index = getBatchIndexGA_();
  const lastRaw = getBatchProps_().getProperty(PROP_BATCH_LAST_RUN_GA);
  const status = {
    index: index,
    total: words.length,
    done: index >= words.length,
    percent: Math.floor((index / words.length) * 1000) / 10,
    nextWord: index < words.length ? words[index] : null,
    lastRun: lastRaw ? JSON.parse(lastRaw) : null,
  };
  Logger.log(JSON.stringify(status, null, 2));
  return status;
}

/**
 * Install a time-based trigger for batchWarmGA.
 * @param {number} everyMinutes 1, 5, 10, 15, or 30 (default 5)
 */
function installBatchTriggerGA(everyMinutes) {
  const allowed = [1, 5, 10, 15, 30];
  let minutes = parseInt(everyMinutes, 10) || 5;
  if (allowed.indexOf(minutes) === -1) {
    minutes = allowed.reduce(function(best, n) {
      return Math.abs(n - minutes) < Math.abs(best - minutes) ? n : best;
    }, 5);
  }
  uninstallBatchTriggerGA_();
  ScriptApp.newTrigger('batchWarmGA')
    .timeBased()
    .everyMinutes(minutes)
    .create();
  Logger.log('installBatchTriggerGA: every ' + minutes + ' minutes');
}

/** Remove all batchWarmGA time triggers. */
function uninstallBatchTriggerGA() {
  uninstallBatchTriggerGA_();
  Logger.log('uninstallBatchTriggerGA: done');
}

function uninstallBatchTriggerGA_() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'batchWarmGA') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
