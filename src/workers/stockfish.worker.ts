// Classic Web Worker that wraps the Stockfish UCI engine.
//
// This file is compiled as IIFE (not ES module) so importScripts is available.
// Vite config: worker.format = 'iife'
//
// One-time setup — copy WASM files to public/:
//   cp node_modules/stockfish/src/stockfish-nnue-16-single.{js,wasm} public/
//
// The stockfish script auto-detects a worker environment (no window.document)
// and self-configures: it installs its own onmessage handler and forwards
// engine output via postMessage. Nothing else is required in this file.

declare function importScripts(...urls: string[]): void;

importScripts('/stockfish-nnue-16-single.js');
