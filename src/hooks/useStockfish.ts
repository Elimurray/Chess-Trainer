import { useEffect, useRef, useState, useCallback } from 'react';
import type { EngineState, EngineInfo, BestMoveResult } from '../types/engine';

const DEFAULT_DEPTH = 15;

export interface UseStockfishResult {
  engineState: EngineState;
  analysePosition: (fen: string, depth?: number) => void;
  stopAnalysis: () => void;
}

function parseInfoLine(line: string): EngineInfo | null {
  const depthMatch = line.match(/\bdepth (\d+)/);
  const scoreMatch = line.match(/\bscore cp (-?\d+)/);
  const mateMatch = line.match(/\bscore mate (-?\d+)/);
  const pvMatch = line.match(/\bpv (.+)/);

  if (!depthMatch) return null;

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  const mate = mateMatch ? parseInt(mateMatch[1], 10) : null;
  const pv = pvMatch ? pvMatch[1].trim().split(' ') : [];

  return {
    depth: parseInt(depthMatch[1], 10),
    score,
    mate,
    pv,
  };
}

function parseBestMoveLine(line: string): BestMoveResult | null {
  // "bestmove e2e4 ponder d7d5"  or  "bestmove (none)"
  const match = line.match(/^bestmove (\S+)(?:\s+ponder (\S+))?/);
  if (!match || match[1] === '(none)') return null;
  return { move: match[1], ponder: match[2] ?? null };
}

export function useStockfish(): UseStockfishResult {
  const workerRef = useRef<Worker | null>(null);
  const [engineState, setEngineState] = useState<EngineState>({
    status: 'idle',
    lastInfo: null,
    bestMove: null,
  });

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/stockfish.worker.ts', import.meta.url),
    );
    workerRef.current = worker;

    setEngineState((s) => ({ ...s, status: 'initialising' }));

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = event.data;

      if (line === 'uciok') {
        worker.postMessage('isready');
        return;
      }

      if (line === 'readyok') {
        setEngineState((s) => ({ ...s, status: 'ready' }));
        return;
      }

      if (line.startsWith('info') && line.includes('score')) {
        const info = parseInfoLine(line);
        if (info) {
          setEngineState((s) => ({ ...s, lastInfo: info }));
        }
        return;
      }

      if (line.startsWith('bestmove')) {
        const result = parseBestMoveLine(line);
        setEngineState((s) => ({
          ...s,
          status: 'ready',
          bestMove: result,
        }));
      }
    };

    worker.onerror = (err) => {
      console.error('[useStockfish] Worker error:', err);
    };

    worker.postMessage('uci');

    return () => {
      worker.postMessage('quit');
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const analysePosition = useCallback((fen: string, depth = DEFAULT_DEPTH) => {
    const worker = workerRef.current;
    if (!worker) return;

    setEngineState((s) => ({ ...s, status: 'analysing', bestMove: null, lastInfo: null }));
    worker.postMessage('stop');
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  }, []);

  const stopAnalysis = useCallback(() => {
    workerRef.current?.postMessage('stop');
    setEngineState((s) => (s.status === 'analysing' ? { ...s, status: 'ready' } : s));
  }, []);

  return { engineState, analysePosition, stopAnalysis };
}
