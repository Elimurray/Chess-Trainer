export type EngineStatus = 'idle' | 'initialising' | 'ready' | 'analysing';

export interface EngineInfo {
  depth: number;
  score: number;
  mate: number | null;
  pv: string[];
}

export interface BestMoveResult {
  move: string;
  ponder: string | null;
}

export interface EngineState {
  status: EngineStatus;
  lastInfo: EngineInfo | null;
  bestMove: BestMoveResult | null;
}
