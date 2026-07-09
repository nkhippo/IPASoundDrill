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

const BATCH_MAX_MS = 5.75 * 60 * 1000;
const BATCH_MAX_WORDS_PER_RUN = 500;
const BATCH_OPENAI_PARALLEL = 20;
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

function classifyBatchWord_(word, accent) {
  if (!isValidBatchWord_(word)) {
    return { word: word, status: 'failed', error: 'invalid' };
  }
  let blob = getAudioFromDrive_(word, accent);
  if (blob && isAudioBlobTooShort_(blob)) {
    trashAudioOnDrive_(word, accent);
    blob = null;
  }
  if (blob) return { word: word, status: 'cached' };
  return { word: word, status: 'pending' };
}

function buildOpenAISpeechRequest_(word, instructions, apiKey) {
  return {
    url: 'https://api.openai.com/v1/audio/speech',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      model: TTS_MODEL,
      input: word,
      voice: TTS_VOICE,
      instructions: instructions,
    }),
    muteHttpExceptions: true,
  };
}

function generateOneFromResponse_(word, accent, response, request) {
  if (response.getResponseCode() !== 200) {
    return {
      word: word,
      status: 'failed',
      error: ('OpenAI ' + response.getResponseCode() + ': ' + response.getContentText().slice(0, 80)),
    };
  }
  let blob = response.getBlob();
  if (isAudioBlobTooShort_(blob)) {
    const retry = UrlFetchApp.fetch(request.url, request);
    if (retry.getResponseCode() === 200) blob = retry.getBlob();
  }
  if (!isAudioBlobTooShort_(blob)) {
    saveToDrive_(word, accent, blob);
    return { word: word, status: 'generated' };
  }
  return { word: word, status: 'failed', error: 'too_short' };
}

function generateWave_(words, accent, instructions, apiKey) {
  const requests = words.map(function(word) {
    return buildOpenAISpeechRequest_(word, instructions, apiKey);
  });
  const responses = UrlFetchApp.fetchAll(requests);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    try {
      out.push(generateOneFromResponse_(words[i], accent, responses[i], requests[i]));
    } catch (err) {
      out.push({
        word: words[i],
        status: 'failed',
        error: String(err.message || err).slice(0, 120),
      });
    }
  }
  return out;
}

/**
 * Classify up to maxWords, generate missing audio in parallel waves, return ordered results.
 */
function warmWordsChunk_(words, accent, started, maxMs) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in Script Properties');

  const instructions = instructionsFor_(accent, false);
  const classified = [];
  for (let i = 0; i < words.length; i++) {
    if (Date.now() - started > maxMs) break;
    classified.push(classifyBatchWord_(words[i], accent));
  }

  const pending = [];
  for (let i = 0; i < classified.length; i++) {
    if (classified[i].status === 'pending') pending.push(classified[i].word);
  }

  const generatedMap = {};
  for (let i = 0; i < pending.length; i += BATCH_OPENAI_PARALLEL) {
    if (Date.now() - started > maxMs) break;
    const wave = pending.slice(i, i + BATCH_OPENAI_PARALLEL);
    const waveResults = generateWave_(wave, accent, instructions, apiKey);
    for (let j = 0; j < waveResults.length; j++) {
      generatedMap[waveResults[j].word] = waveResults[j];
    }
  }

  const results = [];
  for (let i = 0; i < classified.length; i++) {
    const entry = classified[i];
    if (entry.status === 'pending') {
      const done = generatedMap[entry.word];
      if (!done) break;
      results.push(done);
    } else {
      results.push(entry);
    }
  }
  return results;
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

  const slice = words.slice(index, index + BATCH_MAX_WORDS_PER_RUN);
  const results = warmWordsChunk_(slice, 'ga', started, BATCH_MAX_MS);
  index += results.length;

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
