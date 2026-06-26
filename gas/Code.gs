/**
 * IPA TTS proxy — OpenAI speech via GAS, cached on Google Drive.
 *
 * Script property: OPENAI_API_KEY
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 *
 * Query: GET ?word=luck[&accent=ga|rp]
 *        GET ?phrase=check%20it[&accent=ga]  (connected; GA only)
 *        GET ?warm=1&words=luck,colour&accent=ga  (Drive warmup; no audio body)
 *        GET ?weak=/kən/&ww=can&accent=ga|rp  (weak form; IPA input)
 */

const FOLDER_NAME = 'IPA-TTS-Audio';
const TTS_CACHE_VER = 'v2';
const TTS_MODEL = 'gpt-4o-mini-tts';
const TTS_VOICE = 'alloy';
const TTS_INSTRUCTIONS_GA = 'Pronounce the single English word in a clear General American accent. Use the citation (dictionary) form: full, unreduced vowels and the correct lexical stress — do not use the weak or reduced connected-speech form, even for function words. Say the word once, at a calm pace slightly slower than conversational, with neutral falling intonation. Articulate consonants precisely and keep contrasts distinct — especially /θ/–/f/, /ð/–/d/, /l/–/r/, /s/–/ʃ/, /b/–/v/, and word-final consonants — but stay natural and never exaggerate them into distortion. Do not spell the word, do not add any other words, do not pause, and do not use emotional or expressive delivery. Keep the delivery identical and consistent across all words.';
const TTS_INSTRUCTIONS_RP = 'Pronounce the single English word in a clear modern Received Pronunciation (standard Southern British) accent. Use the citation (dictionary) form: full, unreduced vowels and the correct lexical stress — do not use the weak or reduced connected-speech form, even for function words. Say the word once, at a calm pace slightly slower than conversational, with neutral falling intonation. Articulate consonants precisely and keep contrasts distinct — especially /θ/–/f/, /ð/–/d/, /l/–/r/, /s/–/ʃ/, /b/–/v/, and word-final consonants — but stay natural and never exaggerate them into distortion. Do not spell the word, do not add any other words, do not pause, and do not use emotional or expressive delivery. Keep the delivery identical and consistent across all words.';
const TTS_CONNECTED_INSTRUCTIONS = 'Pronounce the English phrase in a clear General American accent with natural connected speech: link words smoothly, apply assimilation and elision where native speakers would, and use weak forms where appropriate. Say the phrase once at a calm conversational pace with neutral intonation. Do not spell letters, do not add extra words, and do not pause between words unnaturally.';
const TTS_WEAK_INSTRUCTIONS_GA = 'Pronounce this English function word using its WEAK (reduced) form exactly as the IPA indicates, as it sounds inside connected speech — typically with a schwa /ə/. Use a clear General American accent, calm and natural, said once. Do NOT use the strong citation form. Do not spell it, add words, or pause.';
const TTS_WEAK_INSTRUCTIONS_RP = 'Pronounce this English function word using its WEAK (reduced) form exactly as the IPA indicates, as it sounds inside connected speech — typically with a schwa /ə/. Use a clear modern Received Pronunciation (standard Southern British) accent, calm and natural, said once. Do NOT use the strong citation form. Do not spell it, add words, or pause.';
// Normal single-word MP3s are ~12 KB+; near-silent glitches (e.g. flight at 5.7 KB) stay below this.
const TTS_MIN_BYTES = 9000;
const WARM_MAX = 6;

function getFolder_() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

function slugForInput_(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function normalizeAccent_(accent) {
  return String(accent || 'ga').toLowerCase() === 'rp' ? 'rp' : 'ga';
}

function fileNameFor_(input, accent) {
  const acc = normalizeAccent_(accent);
  return slugForInput_(input) + '__' + acc + '_' + TTS_CACHE_VER + '.mp3';
}

function fileNameForWeak_(weakWord, accent) {
  return slugForInput_(weakWord) + '__' + normalizeAccent_(accent) + '_weak_' + TTS_CACHE_VER + '.mp3';
}

function legacyFileNameFor_(input) {
  return slugForInput_(input) + '_' + TTS_CACHE_VER + '.mp3';
}

function getAudioFromDriveWeak_(weakWord, accent) {
  const folder = getFolder_();
  const name = fileNameForWeak_(weakWord, accent);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next().getBlob();
  return null;
}

function trashAudioOnDriveWeak_(weakWord, accent) {
  const folder = getFolder_();
  const name = fileNameForWeak_(weakWord, accent);
  const files = folder.getFilesByName(name);
  while (files.hasNext()) files.next().setTrashed(true);
}

function getAudioFromDrive_(input, accent) {
  const folder = getFolder_();
  const acc = normalizeAccent_(accent);
  const name = fileNameFor_(input, acc);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next().getBlob();
  if (acc === 'ga') {
    const legacy = legacyFileNameFor_(input);
    const legacyFiles = folder.getFilesByName(legacy);
    if (legacyFiles.hasNext()) return legacyFiles.next().getBlob();
  }
  return null;
}

function isAudioBlobTooShort_(blob) {
  return blob.getBytes().length < TTS_MIN_BYTES;
}

function trashAudioOnDrive_(input, accent) {
  const folder = getFolder_();
  const name = fileNameFor_(input, accent);
  const files = folder.getFilesByName(name);
  while (files.hasNext()) files.next().setTrashed(true);
}

function instructionsForWeak_(accent) {
  return normalizeAccent_(accent) === 'rp' ? TTS_WEAK_INSTRUCTIONS_RP : TTS_WEAK_INSTRUCTIONS_GA;
}

function instructionsFor_(accent, connected) {
  if (connected) return TTS_CONNECTED_INSTRUCTIONS;
  return normalizeAccent_(accent) === 'rp' ? TTS_INSTRUCTIONS_RP : TTS_INSTRUCTIONS_GA;
}

function fetchFromOpenAI_(text, instructions) {
  const key = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not set in Script Properties');

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/audio/speech', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      model: TTS_MODEL,
      input: text,
      voice: TTS_VOICE,
      instructions: instructions || TTS_INSTRUCTIONS_GA,
    }),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    throw new Error('OpenAI ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  }
  return res.getBlob();
}

function fetchFromOpenAIWithRetry_(text, instructions) {
  const blob = fetchFromOpenAI_(text, instructions);
  if (!isAudioBlobTooShort_(blob)) return blob;
  return fetchFromOpenAI_(text, instructions);
}

function saveToDriveWeak_(weakWord, accent, blob) {
  const folder = getFolder_();
  const name = fileNameForWeak_(weakWord, accent);
  const existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);
  folder.createFile(blob.setName(name));
}

function saveToDrive_(input, accent, blob) {
  const folder = getFolder_();
  const name = fileNameFor_(input, accent);
  const existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);
  folder.createFile(blob.setName(name));
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function warmOne_(word, accent) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) {
    return { word: word, status: 'failed', error: 'invalid' };
  }
  let blob = getAudioFromDrive_(word, accent);
  if (blob && isAudioBlobTooShort_(blob)) {
    trashAudioOnDrive_(word, accent);
    blob = null;
  }
  if (blob) return { word: word, status: 'cached' };
  try {
    const instructions = instructionsFor_(accent, false);
    const fresh = fetchFromOpenAIWithRetry_(word, instructions);
    if (!isAudioBlobTooShort_(fresh)) {
      saveToDrive_(word, accent, fresh);
      return { word: word, status: 'generated' };
    }
    return { word: word, status: 'failed', error: 'too_short' };
  } catch (err) {
    return { word: word, status: 'failed', error: String(err.message || err).slice(0, 120) };
  }
}

function handleWarm_(e) {
  const accent = normalizeAccent_(e && e.parameter && e.parameter.accent);
  const raw = String((e && e.parameter && e.parameter.words) || '').trim();
  if (!raw) return jsonResponse_({ ok: false, error: 'no words' });
  const words = raw.split(',').map(function(s) { return s.trim(); }).filter(Boolean).slice(0, WARM_MAX);
  const results = words.map(function(w) { return warmOne_(w, accent); });
  return jsonResponse_({ ok: true, accent: accent, results: results });
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.warm) return handleWarm_(e);

    const weakIpa = String((e && e.parameter && e.parameter.weak) || '').trim();
    const weakWord = String((e && e.parameter && e.parameter.ww) || '').trim();
    const phrase = String((e && e.parameter && e.parameter.phrase) || '').trim();
    const word = String((e && e.parameter && e.parameter.word) || '').trim();
    const accent = normalizeAccent_(e && e.parameter && e.parameter.accent);
    let input = '';
    let cacheKey = '';
    let connected = false;
    let weakMode = false;
    let cacheAccent = accent;

    if (weakIpa && weakWord) {
      if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(weakWord)) {
        return jsonResponse_({ ok: false, error: 'Invalid ww parameter' });
      }
      if (!/^\/[^/]+\/$/.test(weakIpa)) {
        return jsonResponse_({ ok: false, error: 'Invalid weak parameter' });
      }
      input = weakIpa;
      cacheKey = weakWord;
      weakMode = true;
      cacheAccent = accent;
    } else if (phrase) {
      if (!/^[\w\s'-]+$/.test(phrase)) {
        return jsonResponse_({ ok: false, error: 'Invalid phrase parameter' });
      }
      input = phrase;
      cacheKey = phrase;
      connected = true;
      cacheAccent = 'ga';
    } else if (word) {
      if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) {
        return jsonResponse_({ ok: false, error: 'Invalid or missing word parameter' });
      }
      input = word;
      cacheKey = word;
    } else {
      return jsonResponse_({ ok: false, error: 'Invalid or missing word parameter' });
    }

    const instructions = weakMode ? instructionsForWeak_(accent) : instructionsFor_(accent, connected);

    let blob = weakMode
      ? getAudioFromDriveWeak_(cacheKey, cacheAccent)
      : getAudioFromDrive_(cacheKey, cacheAccent);
    let source = 'drive';
    if (blob && isAudioBlobTooShort_(blob)) {
      if (weakMode) trashAudioOnDriveWeak_(cacheKey, cacheAccent);
      else trashAudioOnDrive_(cacheKey, cacheAccent);
      blob = null;
    }
    if (!blob) {
      blob = fetchFromOpenAIWithRetry_(input, instructions);
      source = 'openai';
      if (!isAudioBlobTooShort_(blob)) {
        if (weakMode) saveToDriveWeak_(cacheKey, cacheAccent, blob);
        else saveToDrive_(cacheKey, cacheAccent, blob);
      }
    }

    return jsonResponse_({
      ok: true,
      word: weakMode ? weakWord : input,
      accent: cacheAccent,
      source: source,
      mimeType: blob.getContentType() || 'audio/mpeg',
      audio: Utilities.base64Encode(blob.getBytes()),
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}
