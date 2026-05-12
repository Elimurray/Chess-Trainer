/**
 * Fetches opening lines from the Lichess open-source openings database
 * (https://github.com/lichess-org/chess-openings) and generates a TypeScript
 * stub that you can drop into src/data/openings/.
 *
 * Usage:
 *   node scripts/import-opening.mjs <search-term> [--colour white|black] [--max 1]
 *
 * Examples:
 *   node scripts/import-opening.mjs "Ruy Lopez"
 *   node scripts/import-opening.mjs "Queen's Gambit" --colour white --max 3
 *   node scripts/import-opening.mjs B90
 *
 * The search term can be a partial opening name (case-insensitive) or an ECO code.
 * Results are printed to stdout; redirect to a file to save:
 *   node scripts/import-opening.mjs "Ruy Lopez" > src/data/openings/ruyLopez.ts
 *
 * Data source: https://github.com/lichess-org/chess-openings (Creative Commons)
 * Each TSV contains: eco | name | pgn | uci | epd
 */

const LICHESS_BASE =
  'https://raw.githubusercontent.com/lichess-org/chess-openings/master';

// Lichess splits openings across five TSV files (a–e)
const FILES = ['a', 'b', 'c', 'd', 'e'];

// --- CLI args ---
const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  console.error(
    'Usage: node scripts/import-opening.mjs <search> [--colour white|black] [--max N]',
  );
  process.exit(1);
}

const searchArg = args[0].toLowerCase();
let colour = 'white';
let maxResults = 1;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--colour' && args[i + 1]) colour = args[++i];
  if (args[i] === '--max' && args[i + 1]) maxResults = parseInt(args[++i]);
}

// --- Helpers ---

/** Convert PGN move text to a flat SAN array.
 *  "1. e4 c5 2. Nf3 Nc6" → ["e4", "c5", "Nf3", "Nc6"]
 */
function pgnToSanArray(pgn) {
  return pgn
    .replace(/\d+\./g, '')   // remove move numbers (1. 2. etc)
    .replace(/\{[^}]*\}/g, '') // remove comments
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Derive a camelCase identifier from an opening name.
 *  "Ruy Lopez: Berlin Defence" → "ruyLopezBerlinDefence"
 */
function toId(name) {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}

/** Derive a file-safe kebab-case id from an opening name.
 *  "Ruy Lopez: Berlin Defence" → "ruy-lopez-berlin-defence"
 */
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Emit a TypeScript OpeningLine stub. */
function toTypeScript(entry, colour) {
  const { eco, name, pgn } = entry;
  const moves = pgnToSanArray(pgn);
  const camel = toId(name);
  const slug = toSlug(name);

  return `import type { OpeningLine } from '../../types/opening';

export const ${camel}: OpeningLine = {
  id: '${slug}',
  name: '${name}',
  eco: '${eco}',
  colour: '${colour}',
  moves: [
    ${moves.map((m, i) => `'${m}'${i < moves.length - 1 ? ',' : ''}`).join('\n    ')}
  ],
  description:
    'TODO: describe the opening and its main strategic themes.',
  keyIdeas: [
    'TODO: add 3–5 key ideas for this opening.',
  ],
};
`;
}

// --- Fetch and search ---

async function fetchTsv(letter) {
  const url = `${LICHESS_BASE}/${letter}.tsv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  return text
    .split('\n')
    .slice(1) // skip header
    .filter(Boolean)
    .map((line) => {
      const [eco, name, pgn] = line.split('\t');
      return { eco, name, pgn };
    });
}

async function main() {
  process.stderr.write(`Fetching Lichess openings database…\n`);

  const rows = (await Promise.all(FILES.map(fetchTsv))).flat();

  const matches = rows.filter(
    (r) =>
      r.eco?.toLowerCase() === searchArg ||
      r.name?.toLowerCase().includes(searchArg),
  );

  if (!matches.length) {
    process.stderr.write(`No openings found matching "${args[0]}"\n`);
    process.stderr.write(
      `Try a broader search, e.g. just "Ruy" or "Sicilian".\n`,
    );
    process.exit(1);
  }

  process.stderr.write(
    `Found ${matches.length} match(es). Showing first ${Math.min(maxResults, matches.length)}.\n`,
  );

  const toShow = matches.slice(0, maxResults);
  for (const entry of toShow) {
    if (maxResults > 1) {
      process.stderr.write(`\n=== ${entry.eco} — ${entry.name} ===\n`);
    }
    console.log(toTypeScript(entry, colour));
  }
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
