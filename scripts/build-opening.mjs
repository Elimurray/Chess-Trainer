/**
 * Generates a complete TypeScript opening file with ALL named variations,
 * each automatically extended to training depth using the Lichess Opening
 * Explorer API (most popular master-level continuation at each step).
 *
 * Usage:
 *   node scripts/build-opening.mjs <search> --colour black|white [options]
 *
 * Options:
 *   --colour    black|white   Which side the user trains as (required)
 *   --token     <token>       Lichess API token (required for move extension)
 *   --depth     N             Target moves per line (default: 20)
 *   --min-games N             Min total games to follow a move (default: 50)
 *   --output    path          Write to file instead of stdout
 *
 * Get a free Lichess token (no permissions needed):
 *   https://lichess.org/account/oauth/token/create
 *
 * Examples:
 *   node scripts/build-opening.mjs "Accelerated Dragon" --colour black --token lip_xxx --depth 22
 *   node scripts/build-opening.mjs "Ruy Lopez: Berlin" --colour black --token lip_xxx --output src/data/openings/ruyLopezBerlin.ts
 *   node scripts/build-opening.mjs B36 --colour black --token lip_xxx
 *
 * Data sources:
 *   TSV names/ECO : https://github.com/lichess-org/chess-openings (CC0)
 *   Move stats    : https://explorer.lichess.ovh (Lichess API, requires free token)
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';

// Load .env from project root if present
try {
  const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2];
  }
} catch { /* no .env, that's fine */ }

// ─── CLI ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  console.error('Usage: node scripts/build-opening.mjs <search> --colour black|white [--depth N] [--min-games N] [--output path]');
  process.exit(1);
}

const searchArg = args[0].toLowerCase();
let colour = 'black';
let targetDepth = 20;
let minGames = 50;
let outputPath = null;
let lichessToken = process.env.LICHESS_TOKEN ?? null;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--colour'    && args[i+1]) colour       = args[++i];
  if (args[i] === '--token'     && args[i+1]) lichessToken = args[++i];
  if (args[i] === '--depth'     && args[i+1]) targetDepth  = parseInt(args[++i]);
  if (args[i] === '--min-games' && args[i+1]) minGames     = parseInt(args[++i]);
  if (args[i] === '--output'    && args[i+1]) outputPath   = args[++i];
}

if (!lichessToken) {
  process.stderr.write(
    'Warning: no token found. Lines will not be extended beyond the TSV depth.\n' +
    'Add LICHESS_TOKEN=lip_xxx to .env, or pass --token lip_xxx\n' +
    'Get a free token at: https://lichess.org/account/oauth/token/create\n\n'
  );
}

// ─── Lichess TSV ─────────────────────────────────────────────────────────────

const TSV_BASE = 'https://raw.githubusercontent.com/lichess-org/chess-openings/master';
const TSV_FILES = ['a','b','c','d','e'];

async function fetchTsv(letter) {
  const res = await fetch(`${TSV_BASE}/${letter}.tsv`);
  if (!res.ok) throw new Error(`TSV fetch failed: ${res.status}`);
  return (await res.text())
    .split('\n').slice(1).filter(Boolean)
    .map(line => { const [eco, name, pgn] = line.split('\t'); return { eco, name, pgn }; });
}

function pgnToSan(pgn) {
  return pgn.replace(/\d+\./g, '').replace(/\{[^}]*\}/g, '').trim().split(/\s+/).filter(Boolean);
}

// ─── Lichess Explorer API ────────────────────────────────────────────────────

const EXPLORER = 'https://explorer.lichess.ovh/lichess';

async function topMove(uciMoves) {
  if (!lichessToken) return null;
  const play = uciMoves.join(',');
  const url = `${EXPLORER}?variant=standard&speeds=blitz,rapid,classical&ratings=1800,2000,2200,2500&play=${play}&topGames=0&recentGames=0`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${lichessToken}`, 'Accept': 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 401) {
      process.stderr.write('\n  ✗ Token rejected (401). Check your --token value.\n');
      process.exit(1);
    }
    return null;
  }
  const data = await res.json();
  if (!data.moves?.length) return null;
  const best = data.moves
    .map(m => ({ ...m, total: m.white + m.draws + m.black }))
    .sort((a, b) => b.total - a.total)[0];
  return best.total >= minGames ? best : null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── chess.js (loaded from node_modules) ─────────────────────────────────────

// Dynamic import from the CJS build so we don't need ESM config
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Chess } = require('chess.js');

// ─── Extend a short line to training depth ───────────────────────────────────

async function extendLine(sanMoves, label) {
  const chess = new Chess();
  const uciMoves = [];

  for (const san of sanMoves) {
    const r = chess.move(san);
    if (!r) { process.stderr.write(`  ✗ Illegal move "${san}" in base line — skipping\n`); return null; }
    uciMoves.push(r.from + r.to + (r.promotion ?? ''));
  }

  process.stderr.write(`  Extending "${label}" from ${sanMoves.length} moves`);

  while (chess.history().length < targetDepth) {
    const best = await topMove(uciMoves);
    if (!best) break;
    const r = chess.move(best.san);
    if (!r) break;
    uciMoves.push(r.from + r.to + (r.promotion ?? ''));
    process.stderr.write('.');
    await sleep(350); // respect rate limits
  }

  process.stderr.write(` → ${chess.history().length} moves\n`);
  return chess.history(); // SAN array
}

// ─── Identifier helpers ──────────────────────────────────────────────────────

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toCamel(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/** Split "Opening Name: Sub, Variation" into [baseName, variationSuffix] */
function splitName(name) {
  // Try ": X, Y" pattern → base = "Opening Name: X", variation = "Y"
  const commaIdx = name.lastIndexOf(', ');
  if (commaIdx > 0) return [name.slice(0, commaIdx), name.slice(commaIdx + 2)];
  // No comma → no named sub-variation
  return [name, null];
}

// ─── TypeScript emitter ──────────────────────────────────────────────────────

function emitVariant(entry, extendedMoves, groupId, groupName, colour) {
  const [, variationName] = splitName(entry.name);
  const varName = toCamel(entry.name);
  const slug = toSlug(entry.name);
  const movesStr = extendedMoves
    .map((m, i) => `    '${m}'${i < extendedMoves.length - 1 ? ',' : ''}`)
    .join('\n');

  const varLabel = variationName ? `\n  variationName: '${variationName.replace(/'/g, "\\'")}',` : '';

  return `export const ${varName}: OpeningLine = {
  id: '${slug}',
  name: '${groupName.replace(/'/g, "\\'")}',${varLabel}
  groupId: '${groupId}',
  eco: '${entry.eco}',
  colour: '${colour}',
  moves: [
${movesStr}
  ],
  description:
    'TODO: describe the opening and its main strategic themes.',
  keyIdeas: [
    'TODO: add 3–5 key ideas for this opening.',
  ],
};`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  process.stderr.write('Fetching Lichess TSV database…\n');
  const all = (await Promise.all(TSV_FILES.map(fetchTsv))).flat();

  // Filter by search
  const matches = all.filter(r =>
    r.eco?.toLowerCase() === searchArg || r.name?.toLowerCase().includes(searchArg)
  );

  if (!matches.length) {
    process.stderr.write(`No entries found for "${args[0]}"\n`);
    process.exit(1);
  }

  // Deduplicate: remove entries whose move sequence is a strict prefix of a longer entry
  const withMoves = matches.map(r => ({ ...r, sans: pgnToSan(r.pgn) }));
  const unique = withMoves.filter(entry =>
    !withMoves.some(other =>
      other !== entry &&
      other.sans.length > entry.sans.length &&
      entry.sans.every((m, i) => m === other.sans[i])
    )
  );

  process.stderr.write(`Found ${matches.length} entries → ${unique.length} unique leaf variations\n\n`);

  // Derive group info from the most common base name
  const baseCounts = new Map();
  for (const e of unique) {
    const [base] = splitName(e.name);
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);
  }
  const groupName = [...baseCounts.entries()].sort((a,b) => b[1]-a[1])[0][0];
  const groupId = toSlug(groupName);

  const varNames = [];
  const blocks = [];
  const usedNames = new Map(); // deduplicate variable names

  for (const entry of unique) {
    process.stderr.write(`\n[${entry.eco}] ${entry.name}\n`);
    const extended = await extendLine(entry.sans, entry.name);
    if (!extended || extended.length < 6) {
      process.stderr.write(`  Skipped (too short after extension)\n`);
      continue;
    }
    // Deduplicate: if the camelCase name already exists, append a counter
    let varName = toCamel(entry.name);
    if (usedNames.has(varName)) {
      const count = usedNames.get(varName) + 1;
      usedNames.set(varName, count);
      varName = varName + count;
    } else {
      usedNames.set(varName, 1);
    }
    varNames.push(varName);
    blocks.push(emitVariant(entry, extended, groupId, groupName, colour).replace(
      /^export const \w+/,
      `export const ${varName}`
    ));
  }

  if (!varNames.length) {
    process.stderr.write('No valid variations generated.\n');
    process.exit(1);
  }

  const exportArrayName = toCamel(groupName) + 'Variations';
  const output = [
    `import type { OpeningLine } from '../../types/opening';\n`,
    ...blocks,
    `\nexport const ${exportArrayName}: OpeningLine[] = [\n${varNames.map(n => `  ${n},`).join('\n')}\n];`,
  ].join('\n\n');

  if (outputPath) {
    const dir = dirname(outputPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(outputPath, output);
    process.stderr.write(`\nWritten to ${outputPath}\n`);
  } else {
    console.log(output);
  }
}

main().catch(err => { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); });
