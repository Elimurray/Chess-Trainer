# Chess Opening Trainer — CLAUDE.md

Project context for AI-assisted development. Read this before making any changes.

---

## Build Status

### ✅ Implemented

| File | Notes |
|---|---|
| `src/types/opening.ts` | `OpeningLine`, `TrainingState`, `PlayedMove`, `DeviationInfo`, `ProgressStore` |
| `src/types/engine.ts` | `EngineStatus`, `EngineInfo`, `BestMoveResult`, `EngineState` |
| `src/utils/moveClassification.ts` | `classifyMove(centipawnLoss)` → `MoveClassification` |
| `src/workers/stockfish.worker.ts` | Classic IIFE worker; loads `/stockfish-nnue-16-single.js` via `importScripts` |
| `src/hooks/useStockfish.ts` | Worker lifecycle, UCI state machine, `analysePosition` / `stopAnalysis` |
| `src/hooks/useOpeningTrainer.ts` | `useReducer` training loop — engine auto-play, deviation detection, Stockfish trigger |
| `src/hooks/useProgress.ts` | localStorage reads/writes, mastery level logic |
| `src/data/openings/sicilianNajdorf.ts` | B90 English Attack, 20 moves, training as Black (all moves verified legal) |
| `src/data/openings/jobavaLondon.ts` | D00 Jobava London System, 25 moves, training as White (all moves verified legal) |
| `src/data/openings/index.ts` | `allOpenings` array |
| `src/components/Board/Board.tsx` | Wraps `react-chessboard`; handles orientation, highlights, promotion |
| `src/components/EvalBar/EvalBar.tsx` | Vertical bar, hidden during opening phase |
| `src/components/MoveList/MoveList.tsx` | Paired SAN history, deviation highlighting |
| `src/components/OpeningTree/OpeningTree.tsx` | Opening name, ECO, progress, key ideas |
| `src/components/FeedbackPanel/FeedbackPanel.tsx` | Deviation feedback, eval, hint reveal |
| `src/pages/OpeningSelect/OpeningSelect.tsx` | Opening picker grouped by colour |
| `src/pages/Train/Train.tsx` | Main trainer layout — wires all hooks and components |
| `src/App.tsx` | State-based navigation (no router needed) |
| `scripts/import-opening.mjs` | CLI tool — fetches from Lichess DB, generates TS stub with moves pre-filled |
| `README.md` | Setup, usage, opening import workflow |
| `.gitignore` | Excludes node_modules, dist, stockfish WASM files, screenshots |

### ⬜ Remaining

- Fill in `ruyLopez.ts` and `queensGambit.ts` stubs (use `scripts/import-opening.mjs`)
- `useProgress.ts` hook integration in `Train.tsx` (progress recorded on completion)
- Tests (Vitest)
- Polish: responsive layout, keyboard shortcuts

### ⚠️ One-time Setup

Before `npm run dev`, copy Stockfish WASM files to `public/`:
```bash
cp node_modules/stockfish/src/stockfish-nnue-16-single.js public/
cp node_modules/stockfish/src/stockfish-nnue-16-single.wasm public/
```

---

## Project Overview

A React + TypeScript application for mastering chess openings. The user plays through curated opening lines against a Stockfish engine. Deviations from the book are caught and analysed. Progress is tracked per opening line.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Chess logic | `chess.js` v1.x |
| Board UI | `react-chessboard` |
| Engine | `stockfish` WASM via Web Worker |
| Styling | CSS Modules (no Tailwind) |
| State | React Context + `useReducer` |
| Persistence | `localStorage` for progress tracking |
| Testing | Vitest + React Testing Library |

---

## Project Structure

```
src/
  workers/
    stockfish.worker.ts       # Web Worker wrapping the Stockfish WASM engine
  hooks/
    useStockfish.ts           # Communicates with stockfish.worker via postMessage
    useOpeningTrainer.ts      # Core training loop: tracks position in opening tree
    useProgress.ts            # Reads/writes localStorage progress per opening
  components/
    Board/
      Board.tsx               # react-chessboard wrapper — handles orientation, highlights
      Board.module.css
    EvalBar/
      EvalBar.tsx             # Vertical evaluation bar (hidden during opening phase)
    MoveList/
      MoveList.tsx            # SAN move history, highlights deviations
    OpeningTree/
      OpeningTree.tsx         # Sidebar: current opening name, variation, move count
    FeedbackPanel/
      FeedbackPanel.tsx       # Shows deviation feedback and best-move hints
  pages/
    Train/
      Train.tsx               # Main trainer view
    OpeningSelect/
      OpeningSelect.tsx       # Opening picker — choose colour + opening
  data/
    openings/
      index.ts                # Exports all openings
      sicilianNajdorf.ts
      ruyLopez.ts
      queensGambit.ts
      # ... add more here
  types/
    opening.ts                # OpeningLine, OpeningTree, TrainingSession types
    engine.ts                 # Stockfish message types
  utils/
    pgn.ts                    # PGN parsing helpers
    fen.ts                    # FEN utilities
    moveClassification.ts     # Centipawn delta → Brilliant/Best/Inaccuracy/Blunder
```

---

## Key Architectural Decisions

### Stockfish runs in a Web Worker
Never import or run Stockfish on the main thread. All engine communication goes through `useStockfish.ts` which owns the worker instance.

```ts
// useStockfish.ts pattern
const worker = new Worker(new URL('../workers/stockfish.worker.ts', import.meta.url));
worker.postMessage('uci');
worker.postMessage(`position fen ${fen}`);
worker.postMessage('go depth 15');
// Parse "bestmove e2e4 ponder d7d5" from worker messages
```

### Opening data format
Openings are stored as arrays of SAN move strings, not FEN. The trainer walks the array and validates the user's move against the expected move at each index.

```ts
// types/opening.ts
export interface OpeningLine {
  id: string;
  name: string;           // e.g. "Sicilian Defence: Najdorf Variation"
  eco: string;            // e.g. "B90"
  colour: 'white' | 'black';
  moves: string[];        // SAN: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", ...]
  description: string;
  keyIdeas: string[];
}
```

### Training loop logic (useOpeningTrainer.ts)
1. Load opening line → initialise `chess.js` instance
2. User plays a move → validate with `chess.move()`
3. Check if move matches `openingLine.moves[currentMoveIndex]`
   - **Match**: advance index, play engine's reply (next move in line), continue
   - **Deviation**: send position to Stockfish for analysis, show feedback
4. Opening "complete" when `currentMoveIndex >= openingLine.moves.length`
5. On completion, update localStorage progress for this opening ID

### Move classification thresholds
```ts
// utils/moveClassification.ts
// centipawnLoss = evaluation before move - evaluation after move (from side's perspective)
if (centipawnLoss <= 0)    return 'brilliant';  // better than book
if (centipawnLoss <= 10)   return 'best';
if (centipawnLoss <= 25)   return 'good';
if (centipawnLoss <= 50)   return 'inaccuracy';
if (centipawnLoss <= 150)  return 'mistake';
return 'blunder';
```

---

## State Shape

```ts
// Training session state (useReducer)
interface TrainingState {
  opening: OpeningLine;
  chess: Chess;                    // chess.js instance
  moveIndex: number;               // position in opening line
  status: 'playing' | 'deviation' | 'complete' | 'reviewing';
  lastDeviation: DeviationInfo | null;
  engineEval: number | null;       // centipawns, from white's perspective
  bestMove: string | null;         // UCI format e.g. "e2e4"
  history: PlayedMove[];
}
```

---

## Conventions

- All chess moves are **SAN** in the UI and data layer; convert to/from UCI only when talking to Stockfish
- `chess.js` is the single source of truth for board state — never manually track piece positions
- Components are **dumb** — all game logic lives in hooks
- CSS Modules only — no inline styles, no Tailwind utility classes
- No `any` types — strict TypeScript throughout
- Prefer `const` arrow functions for components

---

## Adding a New Opening

### Preferred: import from Lichess database

```bash
node scripts/import-opening.mjs "Ruy Lopez" --colour black > src/data/openings/ruyLopez.ts
```

This fetches from https://github.com/lichess-org/chess-openings (CC0 TSV files: eco/name/pgn/uci/epd),
strips move numbers from PGN, and outputs a TypeScript stub with `moves[]` pre-filled.
You only need to fill in `description` and `keyIdeas` manually.

### Manually

1. Create `src/data/openings/myOpening.ts` following the `OpeningLine` interface
2. Export it from `src/data/openings/index.ts`
3. Verify moves are legal:

```bash
node -e "
const { Chess } = require('chess.js');
const chess = new Chess();
const moves = ['e4','e5']; // paste your moves array here
moves.forEach((m, i) => { if (!chess.move(m)) { console.error('Bad move at', i, m); process.exit(1); } });
console.log('All valid');
"
```

SAN gotcha: chess.js returns `null` for illegal moves (no exception). When two pieces of the same type can reach the same square, use disambiguation e.g. `"Nbd7"` not `"Nd7"`. Run the verification script to catch these.

---

## Engine Communication Reference

Stockfish UCI commands used in this project:

```
uci                          → initialise, wait for "uciok"
isready                      → wait for "readyok" before sending position
position fen <FEN>           → set position
go depth 15                  → analyse to depth 15 (sufficient for opening phase)
stop                         → halt search early if needed
quit                         → terminate worker
```

Parse `bestmove` from output:
```ts
if (message.startsWith('bestmove')) {
  const uciMove = message.split(' ')[1]; // e.g. "e2e4"
  // Convert to SAN via chess.js before displaying
}
```

Parse eval from `info` lines:
```ts
// "info depth 15 seldepth 20 score cp 34 ..."
const match = message.match(/score cp (-?\d+)/);
const eval_cp = match ? parseInt(match[1]) : null;
```

---

## localStorage Schema

```ts
// Key: "opening-progress"
interface ProgressStore {
  [openingId: string]: {
    attempts: number;
    completions: number;
    lastPlayed: string;       // ISO date
    masteryLevel: 0 | 1 | 2 | 3;  // 0=new, 3=mastered
  }
}
```

Mastery level increases after 3 consecutive clean completions (no deviations).

---

## Known Constraints / Gotchas

- **WASM in Vite**: Stockfish WASM requires `?url` import and the worker file must be in `public/` or handled via a custom Vite plugin. Check `vite.config.ts` for the `optimizeDeps` exclusion.
- **chess.js move()**: Returns `null` for illegal moves in v1.x (not an exception). Always null-check.
- **Board orientation**: When training as Black, set `boardOrientation="black"` on `<Chessboard>` and ensure engine plays White's moves (odd indices in the moves array).
- **FEN after engine reply**: After playing the engine's book move, update the FEN from `chess.fen()` — don't reconstruct it manually.
- **Eval bar direction**: Eval is always from White's perspective (positive = White better). Flip display sign when user is playing Black.

---

## Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run test         # Vitest
npm run test:ui      # Vitest UI
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
```

---

## Out of Scope (for now)

- Multiplayer / online play
- Full game analysis (this is an *opening* trainer only)
- Cloud sync of progress
- Mobile app
- Custom opening input by the user (openings are hardcoded in `data/`)
