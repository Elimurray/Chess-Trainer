import type { MoveClassification } from '../utils/moveClassification';

export interface OpeningLine {
  id: string;
  name: string;
  /** Short label shown in the variation picker, e.g. "3...e6 Classical". */
  variationName?: string;
  /** Shared key for grouping related variations on the selection screen. */
  groupId?: string;
  eco: string;
  colour: 'white' | 'black';
  moves: string[];
  description: string;
  keyIdeas: string[];
}

export interface PlayedMove {
  san: string;
  uci: string;
  fen: string;
  classification?: MoveClassification;
}

export interface DeviationInfo {
  moveIndex: number;
  playedSan: string;
  expectedSan: string;
  evalBefore: number | null;
  evalAfter: number | null;
}

export interface TrainingState {
  opening: OpeningLine;
  moveIndex: number;
  status: 'playing' | 'deviation' | 'complete' | 'reviewing';
  lastDeviation: DeviationInfo | null;
  engineEval: number | null;
  bestMove: string | null;
  history: PlayedMove[];
  fen: string;
  deviationCount: number;
}

export interface ProgressRecord {
  attempts: number;
  completions: number;
  lastPlayed: string;
  masteryLevel: 0 | 1 | 2 | 3;
  consecutiveClean: number;
}

export interface ProgressStore {
  [openingId: string]: ProgressRecord;
}
