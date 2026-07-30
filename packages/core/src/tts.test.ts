import { describe, expect, it } from "vitest";
import {
  createBundleTTS,
  createFetchTTS,
  createHybridTTS,
  createInMemoryTTSCache,
  type BundleAssets,
} from "./tts.js";

const GAS_URL = "https://script.google.com/macros/s/fake/exec";

function makeBundle(entries: Record<string, string>): BundleAssets {
  return {
    getUri(word, accent) {
      return entries[`${accent}:${word}`];
    },
  };
}

describe("createBundleTTS", () => {
  it("resolves a bundled asset URI", async () => {
    const bundle = makeBundle({ "ga:luck": "asset://ga/luck.mp3" });
    const tts = createBundleTTS(bundle);
    await expect(tts.getMp3Url("luck", "ga")).resolves.toBe("asset://ga/luck.mp3");
  });

  it("throws when the word is not bundled", async () => {
    const bundle = makeBundle({});
    const tts = createBundleTTS(bundle);
    await expect(tts.getMp3Url("luck", "ga")).rejects.toThrow(/no bundled asset/);
  });
});

describe("createFetchTTS", () => {
  it("builds a GAS query URL with word and accent", async () => {
    const tts = createFetchTTS(GAS_URL);
    const url = await tts.getMp3Url("luck", "rp");
    expect(url).toBe(`${GAS_URL}?word=luck&accent=rp`);
  });

  it("normalizes a trailing slash on the base URL", async () => {
    const tts = createFetchTTS(`${GAS_URL}/`);
    const url = await tts.getMp3Url("colour", "ga");
    expect(url).toBe(`${GAS_URL}?word=colour&accent=ga`);
  });
});

describe("createHybridTTS", () => {
  it("prefers the bundled asset when present", async () => {
    const bundle = makeBundle({ "ga:luck": "asset://ga/luck.mp3" });
    const tts = createHybridTTS(bundle, GAS_URL);
    await expect(tts.getMp3Url("luck", "ga")).resolves.toBe("asset://ga/luck.mp3");
  });

  it("falls back to GAS fetch and caches the result when not bundled", async () => {
    const bundle = makeBundle({});
    const cache = createInMemoryTTSCache();
    const tts = createHybridTTS(bundle, GAS_URL, cache);

    const first = await tts.getMp3Url("rare", "ga");
    expect(first).toBe(`${GAS_URL}?word=rare&accent=ga`);

    // Cache should now contain the fetched URL.
    await expect(cache.get("rare", "ga")).resolves.toBe(first);
  });

  it("returns the cached URI on subsequent calls without recomputation diverging", async () => {
    const bundle = makeBundle({});
    const cache = createInMemoryTTSCache();
    // Pre-seed the cache to simulate a prior on-demand fetch.
    await cache.set("rare", "ga", "file:///cache/rare_ga.mp3");
    const tts = createHybridTTS(bundle, GAS_URL, cache);

    await expect(tts.getMp3Url("rare", "ga")).resolves.toBe("file:///cache/rare_ga.mp3");
  });

  it("keeps ga and rp caches independent", async () => {
    const bundle = makeBundle({});
    const cache = createInMemoryTTSCache();
    const tts = createHybridTTS(bundle, GAS_URL, cache);

    const ga = await tts.getMp3Url("rare", "ga");
    const rp = await tts.getMp3Url("rare", "rp");
    expect(ga).not.toBe(rp);
    expect(ga).toContain("accent=ga");
    expect(rp).toContain("accent=rp");
  });
});
