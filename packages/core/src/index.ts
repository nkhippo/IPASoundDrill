/**
 * packages/core/src/index.ts
 *
 * `@ipasounddrill/core` の public entry point。型 / loader / 判定ロジックを re-export する。
 */

export * from "./types.js";
export * from "./loaders.js";
export * from "./tts.js";

export * as decode from "./scoring/decode.js";
export * as encode from "./scoring/encode.js";
export * as reveal from "./scoring/reveal.js";
export * as connectedSpeech from "./scoring/connectedSpeech.js";
export * as weakForms from "./scoring/weakForms.js";
export * as step3 from "./scoring/step3.js";
