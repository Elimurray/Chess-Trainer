import { useReducer, useRef, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import type {
  OpeningLine,
  TrainingState,
  PlayedMove,
  DeviationInfo,
} from "../types/opening";
import { useStockfish } from "./useStockfish";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the move at `index` should be played by the engine. */
function isEngineMove(index: number, colour: "white" | "black"): boolean {
  // Even indices = White's move; odd indices = Black's move.
  if (colour === "white") return index % 2 === 1;
  return index % 2 === 0;
}

/** Strip check / checkmate indicators before comparing SAN strings. */
const normSan = (s: string) => s.replace(/[+#]/g, "");

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: "RESET"; opening: OpeningLine; fen: string }
  | {
      type: "ENGINE_PLAYED";
      move: PlayedMove;
      nextFen: string;
      nextIndex: number;
    }
  | {
      type: "USER_CORRECT";
      move: PlayedMove;
      nextFen: string;
      nextIndex: number;
    }
  | {
      type: "USER_DEVIATION";
      move: PlayedMove;
      deviation: DeviationInfo;
      fen: string;
    }
  | { type: "ANALYSIS_UPDATE"; engineEval: number; bestMove: string };

function reducer(state: TrainingState, action: Action): TrainingState {
  switch (action.type) {
    case "RESET":
      return {
        opening: action.opening,
        moveIndex: 0,
        status: "playing",
        lastDeviation: null,
        engineEval: null,
        bestMove: null,
        history: [],
        fen: action.fen,
        deviationCount: 0,
      };

    case "ENGINE_PLAYED": {
      const complete = action.nextIndex >= state.opening.moves.length;
      return {
        ...state,
        moveIndex: action.nextIndex,
        fen: action.nextFen,
        history: [...state.history, action.move],
        status: complete ? "complete" : "playing",
      };
    }

    case "USER_CORRECT": {
      const complete = action.nextIndex >= state.opening.moves.length;
      return {
        ...state,
        moveIndex: action.nextIndex,
        fen: action.nextFen,
        history: [...state.history, action.move],
        status: complete ? "complete" : "playing",
        lastDeviation: null,
      };
    }

    case "USER_DEVIATION":
      return {
        ...state,
        fen: action.fen,
        history: [...state.history, action.move],
        status: "deviation",
        lastDeviation: action.deviation,
        deviationCount: state.deviationCount + 1,
      };

    case "ANALYSIS_UPDATE":
      return {
        ...state,
        engineEval: action.engineEval,
        bestMove: action.bestMove,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseOpeningTrainerResult {
  state: TrainingState;
  /** Returns true if the move was legal (regardless of whether it matched the line). */
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  reset: () => void;
}

function buildInitialState(opening: OpeningLine): TrainingState {
  return {
    opening,
    moveIndex: 0,
    status: "playing",
    lastDeviation: null,
    engineEval: null,
    bestMove: null,
    history: [],
    fen: new Chess().fen(),
    deviationCount: 0,
  };
}

export function useOpeningTrainer(
  opening: OpeningLine,
): UseOpeningTrainerResult {
  const [state, dispatch] = useReducer(reducer, opening, buildInitialState);
  // chess.js instance lives in a ref — mutable, must stay in sync with state.fen.
  const chessRef = useRef<Chess>(new Chess());
  const { engineState, analysePosition } = useStockfish();

  // Reset when the opening prop changes.
  useEffect(() => {
    const chess = new Chess();
    chessRef.current = chess;
    dispatch({ type: "RESET", opening, fen: chess.fen() });
  }, [opening]);

  // Mirror Stockfish analysis results into training state after a deviation.
  useEffect(() => {
    if (state.status !== "deviation") return;
    const info = engineState.lastInfo;
    if (!info) return;
    dispatch({
      type: "ANALYSIS_UPDATE",
      engineEval: info.score,
      bestMove: engineState.bestMove?.move ?? "",
    });
  }, [engineState.lastInfo, engineState.bestMove, state.status]);

  // Auto-play engine book moves whenever moveIndex advances (with a short delay).
  useEffect(() => {
    if (state.status !== "playing") return;
    const { moveIndex, opening: line } = state;
    if (moveIndex >= line.moves.length) return;
    if (!isEngineMove(moveIndex, line.colour)) return;

    const timer = setTimeout(() => {
      const chess = chessRef.current;
      const san = line.moves[moveIndex];
      const result = chess.move(san);
      if (!result) {
        console.error(
          `[useOpeningTrainer] Illegal engine book move at index ${moveIndex}: ${san}`,
        );
        return;
      }
      dispatch({
        type: "ENGINE_PLAYED",
        move: {
          san: result.san,
          uci: result.from + result.to + (result.promotion ?? ""),
          fen: chess.fen(),
        },
        nextFen: chess.fen(),
        nextIndex: moveIndex + 1,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [state.status, state.moveIndex, state.opening]);

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (state.status !== "playing") return false;

      const chess = chessRef.current;
      const fenBefore = chess.fen();
      const result = chess.move(
        promotion ? { from, to, promotion } : { from, to },
      );
      if (!result) return false;

      const playedMove: PlayedMove = {
        san: result.san,
        uci: result.from + result.to + (result.promotion ?? ""),
        fen: chess.fen(),
      };

      const expectedSan = state.opening.moves[state.moveIndex];

      if (normSan(result.san) === normSan(expectedSan)) {
        dispatch({
          type: "USER_CORRECT",
          move: playedMove,
          nextFen: chess.fen(),
          nextIndex: state.moveIndex + 1,
        });
      } else {
        const deviation: DeviationInfo = {
          moveIndex: state.moveIndex,
          playedSan: result.san,
          expectedSan,
          evalBefore: null,
          evalAfter: null,
        };
        dispatch({
          type: "USER_DEVIATION",
          move: playedMove,
          deviation,
          fen: chess.fen(),
        });
        // Analyse from the position BEFORE the deviation so we can classify the error.
        analysePosition(fenBefore);
      }

      return true;
    },
    [state.status, state.moveIndex, state.opening, analysePosition],
  );

  const reset = useCallback(() => {
    const chess = new Chess();
    chessRef.current = chess;
    dispatch({ type: "RESET", opening, fen: chess.fen() });
  }, [opening]);

  return { state, makeMove, reset };
}
