/**
 * IPA TTS proxy — OpenAI speech via GAS, cached on Google Drive.
 *
 * Script property: OPENAI_API_KEY
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 *
 * Query: GET ?word=luck[&accent=ga|rp]
 *        GET ?phrase=check%20it[&phrase_ipa=/ˈtʃɛkɪt/][&accent=ga]  (connected; IPA input when phrase_ipa set)
 *        GET ?warm=1&words=luck,colour&accent=ga  (Drive warmup; no audio body)
 *        GET ?urls=1&words=luck,colour&accent=ga  (Drive public URLs; generate if missing)
 *        GET ?weak=/kən/&ww=can&accent=ga|rp  (weak form; IPA input)
 */

const FOLDER_NAME = 'IPA-TTS-Audio';
const TTS_CACHE_VER = 'v2';
const TTS_CONNECTED_CACHE_VER = 'v4';
const TTS_MODEL = 'gpt-4o-mini-tts';
const TTS_VOICE = 'alloy';
const ALLOWED_VOICES = [
  'alloy', 'nova', 'onyx', 'echo', 'fable', 'shimmer',
  'sage', 'coral', 'ash', 'ballad', 'verse'
];
const TTS_INSTRUCTIONS_GA = 'Pronounce the single English word in a clear General American accent. Use the citation (dictionary) form: full, unreduced vowels and the correct lexical stress — do not use the weak or reduced connected-speech form, even for function words. Say the word once, at a calm pace slightly slower than conversational, with neutral falling intonation. Articulate consonants precisely and keep contrasts distinct — especially /θ/–/f/, /ð/–/d/, /l/–/r/, /s/–/ʃ/, /b/–/v/, and word-final consonants — but stay natural and never exaggerate them into distortion. Do not spell the word, do not add any other words, do not pause, and do not use emotional or expressive delivery. Keep the delivery identical and consistent across all words.';
const TTS_INSTRUCTIONS_RP = 'Pronounce the single English word in a clear modern Received Pronunciation (standard Southern British) accent. Use the citation (dictionary) form: full, unreduced vowels and the correct lexical stress — do not use the weak or reduced connected-speech form, even for function words. Say the word once, at a calm pace slightly slower than conversational, with neutral falling intonation. Articulate consonants precisely and keep contrasts distinct — especially /θ/–/f/, /ð/–/d/, /l/–/r/, /s/–/ʃ/, /b/–/v/, and word-final consonants — but stay natural and never exaggerate them into distortion. Do not spell the word, do not add any other words, do not pause, and do not use emotional or expressive delivery. Keep the delivery identical and consistent across all words.';
const TTS_CONNECTED_INSTRUCTIONS = 'Pronounce the English phrase in a clear General American accent as one smooth, continuous utterance — like a native speaker in casual connected speech, not separate dictionary words. CRITICAL: never pause or break between words; there must be no audible gap or reset between syllables that belong to different words. Link across word boundaries: when a word ends in a consonant and the next begins with a vowel, run them together without re-articulating (e.g. "tell him" → tellim, not tell … him). Drop /h/ on weak pronouns after a consonant (him, her, his, he → im, er, is, i). For "of" before a consonant, use schwa only (/ə/): do NOT pronounce /v/ or /f/ (e.g. "lots of time" → lotsətime). Apply other natural weak forms, assimilation, and elision where expected. Keep reductions natural, not cartoonish. Say the phrase once at a calm conversational pace with neutral intonation. Do not spell letters, add words, or pause.';
const TTS_CONNECTED_IPA_INSTRUCTIONS = 'Pronounce this English phrase exactly as the IPA transcription indicates, in a clear General American accent. Follow every phoneme, stress mark, and reduction in the IPA — including schwa, elision, linking, and assimilation. Deliver as one smooth connected utterance with no pause between words. Do not spell the IPA symbols aloud, do not add words, and do not use citation forms that contradict the IPA.';
// Experimental instruction variants for A/B testing.
// Selected via ?instr_variant= URL parameter. Falls back to the current
// production instructions when absent or unknown.
const TTS_INSTR_VARIANTS = {
  current: null,
  rapid_casual: 'Deliver this English phrase in rapid, casual, connected speech in a General American accent. Do not pause between words. Link consonants to following vowels naturally. Speak at a fast conversational pace — faster than dictation, closer to how a native speaker chats with a friend. Do not use citation forms.',
  min_instr: 'Speak this English phrase naturally in General American, at conversational pace, as one connected utterance.',
  tempo_emphasis: 'Speak this English phrase rapidly and connectedly in General American. Prioritize connected speech (linking, elision, weak forms) over word-by-word clarity. Do not pause between words.',
};
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

function fileNameFor_(input, accent, cacheVer) {
  const acc = normalizeAccent_(accent);
  const ver = cacheVer || TTS_CACHE_VER;
  return slugForInput_(input) + '__' + acc + '_' + ver + '.mp3';
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

function getAudioFromDrive_(input, accent, cacheVer) {
  const folder = getFolder_();
  const acc = normalizeAccent_(accent);
  const name = fileNameFor_(input, acc, cacheVer);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next().getBlob();
  if (acc === 'ga' && !cacheVer) {
    const legacy = legacyFileNameFor_(input);
    const legacyFiles = folder.getFilesByName(legacy);
    if (legacyFiles.hasNext()) return legacyFiles.next().getBlob();
  }
  return null;
}

/** Same lookup as getAudioFromDrive_, but returns the Drive File (for public URL). */
function getAudioFileFromDrive_(input, accent, cacheVer) {
  const folder = getFolder_();
  const acc = normalizeAccent_(accent);
  const name = fileNameFor_(input, acc, cacheVer);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next();
  if (acc === 'ga' && !cacheVer) {
    const legacy = legacyFileNameFor_(input);
    const legacyFiles = folder.getFilesByName(legacy);
    if (legacyFiles.hasNext()) return legacyFiles.next();
  }
  return null;
}

function getPublicUrl_(fileId) {
  return 'https://drive.google.com/uc?export=download&id=' + fileId;
  // Fallback if CORS fails: 'https://drive.usercontent.google.com/download?id=' + fileId + '&export=download';
}

function getAudioFromDriveByName_(name) {
  const folder = getFolder_();
  const files = folder.getFilesByName(name);
  if (files.hasNext()) return files.next().getBlob();
  return null;
}

function isAudioBlobTooShort_(blob) {
  return blob.getBytes().length < TTS_MIN_BYTES;
}

function trashAudioOnDrive_(input, accent, cacheVer) {
  const folder = getFolder_();
  const name = fileNameFor_(input, accent, cacheVer);
  const files = folder.getFilesByName(name);
  while (files.hasNext()) files.next().setTrashed(true);
}

function trashAudioOnDriveByName_(name) {
  const folder = getFolder_();
  const files = folder.getFilesByName(name);
  while (files.hasNext()) files.next().setTrashed(true);
}

function instructionsForWeak_(accent) {
  return normalizeAccent_(accent) === 'rp' ? TTS_WEAK_INSTRUCTIONS_RP : TTS_WEAK_INSTRUCTIONS_GA;
}

function instructionsFor_(accent, connected, ipaMode) {
  if (connected && ipaMode) return TTS_CONNECTED_IPA_INSTRUCTIONS;
  if (connected) return TTS_CONNECTED_INSTRUCTIONS;
  return normalizeAccent_(accent) === 'rp' ? TTS_INSTRUCTIONS_RP : TTS_INSTRUCTIONS_GA;
}

function resolveVoice_(voice) {
  const v = String(voice || '').trim().toLowerCase();
  return ALLOWED_VOICES.indexOf(v) >= 0 ? v : TTS_VOICE;
}

function parseSpeed_(speedRaw) {
  const raw = String(speedRaw || '').trim();
  if (!raw) return 0;
  const parsed = parseFloat(raw);
  if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) return parsed;
  return 0;
}

function normalizeInstrVariant_(instrVariant) {
  const key = String(instrVariant || '').trim();
  if (key && Object.prototype.hasOwnProperty.call(TTS_INSTR_VARIANTS, key)) return key;
  return 'current';
}

function buildConnectedCacheKey_(safePhrase, accent, voice, speed, instrVariant) {
  const base = safePhrase + '__' + accent;
  const isProduction = (!voice || voice === TTS_VOICE)
    && (!speed || speed <= 0)
    && (!instrVariant || instrVariant === 'current');
  if (isProduction) return base + '_' + TTS_CONNECTED_CACHE_VER + '.mp3';

  let tag = 'exp';
  if (voice && voice !== TTS_VOICE) tag += '_v-' + voice;
  if (speed && speed > 0) tag += '_s-' + Math.round(speed * 100);
  if (instrVariant && instrVariant !== 'current') tag += '_i-' + instrVariant;
  return base + '_' + tag + '.mp3';
}

function fetchFromOpenAI_(text, options) {
  options = options || {};
  const key = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not set in Script Properties');

  const payload = {
    model: TTS_MODEL,
    voice: resolveVoice_(options.voice),
    input: text,
    response_format: 'mp3',
  };
  if (options.speed && options.speed > 0) payload.speed = options.speed;
  if (options.instructions) payload.instructions = options.instructions;

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/audio/speech', {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    throw new Error('OpenAI ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  }
  return res.getBlob();
}

function fetchFromOpenAIWithRetry_(text, options) {
  const blob = fetchFromOpenAI_(text, options);
  if (!isAudioBlobTooShort_(blob)) return blob;
  return fetchFromOpenAI_(text, options);
}

function saveToDriveWeak_(weakWord, accent, blob) {
  const folder = getFolder_();
  const name = fileNameForWeak_(weakWord, accent);
  const existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);
  folder.createFile(blob.setName(name));
}

function saveToDrive_(input, accent, blob, cacheVer) {
  const folder = getFolder_();
  const name = fileNameFor_(input, accent, cacheVer);
  const existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);
  const file = folder.createFile(blob.setName(name));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    Logger.log('setSharing failed for ' + name + ': ' + e);
  }
  return file;
}

function saveToDriveByName_(name, blob) {
  const folder = getFolder_();
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

function resolveUrlOne_(word, accent) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) {
    return { word: word, status: 'failed', error: 'invalid' };
  }
  let file = getAudioFileFromDrive_(word, accent);
  if (file) {
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
    return { word: word, status: 'cache', url: getPublicUrl_(file.getId()) };
  }
  try {
    const instructions = instructionsFor_(accent, false);
    const fresh = fetchFromOpenAIWithRetry_(word, { instructions: instructions });
    if (!isAudioBlobTooShort_(fresh)) {
      const saved = saveToDrive_(word, accent, fresh);
      return { word: word, status: 'openai', url: getPublicUrl_(saved.getId()) };
    }
    return { word: word, status: 'failed', error: 'too_short' };
  } catch (err) {
    return { word: word, status: 'failed', error: String(err.message || err).slice(0, 120) };
  }
}

function handleUrls_(e) {
  const accent = normalizeAccent_(e && e.parameter && e.parameter.accent);
  const raw = String((e && e.parameter && e.parameter.words) || '').trim();
  if (!raw) return jsonResponse_({ ok: false, error: 'no words' });
  const words = raw.split(',').map(function(s) { return s.trim(); }).filter(Boolean).slice(0, WARM_MAX);
  const results = words.map(function(w) { return resolveUrlOne_(w, accent); });
  return jsonResponse_({ ok: true, accent: accent, results: results });
}

/**
 * Resumable: make IPA-TTS-Audio files publicly readable.
 * Stops after ~5.5 min and saves a Drive continuation token in Script Properties.
 * Re-run until logs show DONE. Use resetMigratePublicSharing() to start over.
 *
 * Props: MIGRATE_PUBLIC_CONT_TOKEN, MIGRATE_PUBLIC_DONE, MIGRATE_PUBLIC_STATS
 */
function migratePublicSharing() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('MIGRATE_PUBLIC_DONE') === '1') {
    const prev = props.getProperty('MIGRATE_PUBLIC_STATS') || '';
    Logger.log('DONE (already finished). Stats: ' + prev + '. Call resetMigratePublicSharing() to re-run.');
    return;
  }

  const MAX_MS = 5.5 * 60 * 1000;
  const started = Date.now();
  const folder = getFolder_();

  let files;
  const token = props.getProperty('MIGRATE_PUBLIC_CONT_TOKEN');
  if (token) {
    files = DriveApp.continueFileIterator(token);
  } else {
    files = folder.getFiles();
  }

  let stats = { n: 0, ok: 0, ng: 0, skipped: 0 };
  try {
    const raw = props.getProperty('MIGRATE_PUBLIC_STATS');
    if (raw) stats = JSON.parse(raw);
  } catch (e) {}

  while (files.hasNext()) {
    if (Date.now() - started > MAX_MS) {
      props.setProperty('MIGRATE_PUBLIC_CONT_TOKEN', files.getContinuationToken());
      props.setProperty('MIGRATE_PUBLIC_STATS', JSON.stringify(stats));
      Logger.log(
        'PAUSED: n=' + stats.n +
        ' ok=' + stats.ok +
        ' skipped=' + stats.skipped +
        ' ng=' + stats.ng +
        '. Re-run migratePublicSharing() to continue.'
      );
      return;
    }

    const f = files.next();
    stats.n++;
    try {
      const access = f.getSharingAccess();
      if (access === DriveApp.Access.ANYONE || access === DriveApp.Access.ANYONE_WITH_LINK) {
        stats.skipped++;
      } else {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        stats.ok++;
      }
    } catch (e) {
      stats.ng++;
      Logger.log('migrate failed for ' + f.getName() + ': ' + e);
    }
    if (stats.n % 100 === 0) {
      Logger.log(
        'progress: ' + stats.n +
        ' (ok=' + stats.ok +
        ', skipped=' + stats.skipped +
        ', ng=' + stats.ng + ')'
      );
    }
  }

  props.deleteProperty('MIGRATE_PUBLIC_CONT_TOKEN');
  props.setProperty('MIGRATE_PUBLIC_DONE', '1');
  props.setProperty('MIGRATE_PUBLIC_STATS', JSON.stringify(stats));
  Logger.log(
    'DONE: ' + stats.n +
    ' files, ' + stats.ok +
    ' public, ' + stats.skipped +
    ' skipped, ' + stats.ng +
    ' failed'
  );
}

/** Clear migrate continuation state so migratePublicSharing() starts from scratch. */
function resetMigratePublicSharing() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('MIGRATE_PUBLIC_CONT_TOKEN');
  props.deleteProperty('MIGRATE_PUBLIC_DONE');
  props.deleteProperty('MIGRATE_PUBLIC_STATS');
  Logger.log('Migrate public sharing state reset. Run migratePublicSharing() to start fresh.');
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.urls) return handleUrls_(e);
    if (e && e.parameter && e.parameter.warm) return handleWarm_(e);

    const weakIpa = String((e && e.parameter && e.parameter.weak) || '').trim();
    const weakWord = String((e && e.parameter && e.parameter.ww) || '').trim();
    const phrase = String((e && e.parameter && e.parameter.phrase) || '').trim();
    const phraseIpa = String((e && e.parameter && e.parameter.phrase_ipa) || '').trim();
    const word = String((e && e.parameter && e.parameter.word) || '').trim();
    const accent = normalizeAccent_(e && e.parameter && e.parameter.accent);
    const voice = String((e && e.parameter && e.parameter.voice) || '').trim();
    const speedRaw = String((e && e.parameter && e.parameter.speed) || '').trim();
    const instrVariantRaw = String((e && e.parameter && e.parameter.instr_variant) || '').trim();
    const effectiveVoice = resolveVoice_(voice);
    const speed = parseSpeed_(speedRaw);
    const instrVariant = normalizeInstrVariant_(instrVariantRaw);
    let input = '';
    let cacheKey = '';
    let connectedCacheFile = '';
    let connected = false;
    let weakMode = false;
    let cacheAccent = accent;

    let connectedIpa = false;

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
      if (phraseIpa) {
        if (!/^\/[^/]+\/$/.test(phraseIpa)) {
          return jsonResponse_({ ok: false, error: 'Invalid phrase_ipa parameter' });
        }
        input = phraseIpa;
        connectedIpa = true;
      } else {
        input = phrase;
      }
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

    const instructions = weakMode
      ? instructionsForWeak_(accent)
      : instructionsFor_(accent, connected, connectedIpa);
    let effectiveInstructions = instructions;
    if (connected) {
      const variantInstr = TTS_INSTR_VARIANTS[instrVariant];
      if (variantInstr !== null && variantInstr !== undefined) effectiveInstructions = variantInstr;
      connectedCacheFile = buildConnectedCacheKey_(slugForInput_(cacheKey), cacheAccent, effectiveVoice, speed, instrVariant);
    }
    const phraseCacheVer = connected ? TTS_CONNECTED_CACHE_VER : null;

    let blob;
    if (weakMode) {
      blob = getAudioFromDriveWeak_(cacheKey, cacheAccent);
    } else if (connected) {
      blob = getAudioFromDriveByName_(connectedCacheFile);
    } else {
      blob = getAudioFromDrive_(cacheKey, cacheAccent, phraseCacheVer);
    }
    let source = 'cache';
    if (blob && isAudioBlobTooShort_(blob)) {
      if (weakMode) trashAudioOnDriveWeak_(cacheKey, cacheAccent);
      else if (connected) trashAudioOnDriveByName_(connectedCacheFile);
      else trashAudioOnDrive_(cacheKey, cacheAccent, phraseCacheVer);
      blob = null;
    }
    if (!blob) {
      blob = fetchFromOpenAIWithRetry_(input, {
        voice: effectiveVoice,
        speed: connected ? speed : 0,
        instructions: effectiveInstructions,
      });
      source = 'openai';
      if (!isAudioBlobTooShort_(blob)) {
        if (weakMode) saveToDriveWeak_(cacheKey, cacheAccent, blob);
        else if (connected) saveToDriveByName_(connectedCacheFile, blob);
        else saveToDrive_(cacheKey, cacheAccent, blob, phraseCacheVer);
      }
    }

    return jsonResponse_({
      ok: true,
      word: weakMode ? weakWord : input,
      accent: cacheAccent,
      source: source,
      mimeType: blob.getContentType() || 'audio/mpeg',
      audio: Utilities.base64Encode(blob.getBytes()),
      meta: {
        source: source,
        voice: effectiveVoice,
        speed: speed > 0 ? speed : 1.0,
        instr_variant: instrVariant,
      },
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}
