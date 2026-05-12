/**
 * Downloads chess piece sounds from the Lichess open-source repository
 * (MIT licensed) into public/sounds/.
 *
 * Usage:  node scripts/download-sounds.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE =
  'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard';

const FILES = [
  'Move.mp3',
  'Capture.mp3',
  'Check.mp3',
  'GenericNotify.mp3',
];

const OUT = join(process.cwd(), 'public', 'sounds');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  const url = `${BASE}/${file}`;
  process.stdout.write(`Downloading ${file}… `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    writeFileSync(join(OUT, file), Buffer.from(buf));
    console.log('done');
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }
}

console.log(`\nSounds written to public/sounds/`);
