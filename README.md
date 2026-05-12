# Chess Opening Trainer

A focused opening trainer built with React 18 + TypeScript. Play through curated opening lines against a Stockfish engine, get immediate feedback on deviations, and track your mastery over time.

---

## Features

- **Play through book lines** — White or Black, against a Stockfish opponent that follows the book
- **Deviation detection** — any off-book move triggers Stockfish analysis and shows the best reply
- **Eval bar** — centipawn evaluation shown after a deviation
- **Move list** — full SAN history with deviations highlighted in red
- **Mastery tracking** — localStorage progress per opening; mastery increases after 3 consecutive clean runs
- **Multiple openings** — Sicilian Najdorf (B90) and Jobava London (D00) included; easy to add more

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Download sound files (one-time)

```bash
node scripts/download-sounds.mjs
```

This fetches `Move.mp3`, `Capture.mp3`, `Check.mp3`, and `GenericNotify.mp3` from the [Lichess open-source repository](https://github.com/lichess-org/lila) into `public/sounds/`.

### Copy Stockfish WASM files (one-time)

```bash
cp node_modules/stockfish/src/stockfish-nnue-16-single.js public/
cp node_modules/stockfish/src/stockfish-nnue-16-single.wasm public/
```

On Windows (PowerShell):

```powershell
Copy-Item node_modules/stockfish/src/stockfish-nnue-16-single.js public/
Copy-Item node_modules/stockfish/src/stockfish-nnue-16-single.wasm public/
```

### Run

```bash
npm run dev
```

---

## Adding Openings

### Option A — Import from Lichess database (recommended)

The import script fetches from the [Lichess open-source openings database](https://github.com/lichess-org/chess-openings) and generates a TypeScript stub with the moves pre-filled.

```bash
# Search by name (case-insensitive, partial match)
node scripts/import-opening.mjs "Ruy Lopez" --colour black

# Search by ECO code
node scripts/import-opening.mjs C65 --colour black

# Get multiple variations
node scripts/import-opening.mjs "Queen's Gambit" --colour white --max 5

# Pipe directly to a file
node scripts/import-opening.mjs "King's Indian" --colour black > src/data/openings/kingsIndian.ts
```

After generating the stub, fill in `description` and `keyIdeas`, then register the opening:

```ts
// src/data/openings/index.ts
import { kingsIndian } from './kingsIndian';

export const allOpenings: OpeningLine[] = [
  sicilianNajdorf,
  jobavaLondon,
  kingsIndian,   // ← add here
];
```

### Option B — Write manually

Create `src/data/openings/myOpening.ts`:

```ts
import type { OpeningLine } from '../../types/opening';

export const myOpening: OpeningLine = {
  id: 'my-opening-variation',
  name: 'My Opening: Main Variation',
  eco: 'A00',
  colour: 'white',          // which side the user plays
  moves: [
    'e4', 'e5',
    'Nf3', 'Nc6',
    // ...continue in SAN
  ],
  description: 'Short description of the opening.',
  keyIdeas: [
    'First strategic idea.',
    'Second strategic idea.',
  ],
};
```

**Verify the moves are legal** before committing:

```bash
node -e "
const { Chess } = require('chess.js');
const { myOpening } = require('./src/data/openings/myOpening.ts');
const c = new Chess();
myOpening.moves.forEach((m, i) => {
  if (!c.move(m)) { console.error('Illegal move at index', i, ':', m); process.exit(1); }
});
console.log('All moves valid');
"
```

---

## Project Structure

```
src/
  components/
    Board/            # react-chessboard wrapper
    EvalBar/          # centipawn evaluation bar
    FeedbackPanel/    # deviation feedback + hint reveal
    MoveList/         # SAN move history
    OpeningTree/      # sidebar: opening info + progress
  data/
    openings/         # opening line definitions (add yours here)
  hooks/
    useOpeningTrainer.ts   # core training loop (useReducer)
    useProgress.ts         # localStorage mastery tracking
    useStockfish.ts        # Stockfish Web Worker interface
  pages/
    OpeningSelect/    # opening picker
    Train/            # main trainer view
  types/
    opening.ts        # OpeningLine, TrainingState, etc.
    engine.ts         # Stockfish message types
  utils/
    moveClassification.ts  # centipawn loss → label
  workers/
    stockfish.worker.ts    # classic Web Worker (IIFE)
scripts/
  import-opening.mjs  # fetch opening stubs from Lichess DB
public/
  stockfish-nnue-16-single.js   # copied from node_modules (gitignored)
  stockfish-nnue-16-single.wasm
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

---

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Chess logic | chess.js v1 |
| Board UI | react-chessboard |
| Engine | Stockfish 16 WASM (Web Worker) |
| Styling | CSS Modules |
| State | useReducer + localStorage |

---

## Opening Data Sources

- **[Lichess openings](https://github.com/lichess-org/chess-openings)** — ECO-classified TSV files, CC0 licensed. Used by the import script.
- **[SCID ECO database](https://scid.sourceforge.net/)** — alternative comprehensive source.
- Opening descriptions and key ideas are written manually (or AI-assisted) — they aren't in any automated source.
