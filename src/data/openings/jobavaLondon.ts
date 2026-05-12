import type { OpeningLine } from '../../types/opening';

const GROUP = 'jobava-london';
const ECO = 'D01';
const NAME = 'Jobava London System';
const COLOUR = 'white' as const;

// Variation 1 — 3...e6 Classical (most popular)
export const jobavaLondonE6: OpeningLine = {
  id: 'jobava-london-e6',
  name: NAME,
  variationName: '3...e6 Classical',
  groupId: GROUP,
  eco: ECO,
  colour: COLOUR,
  moves: [
    'd4',    'd5',
    'Nc3',   'Nf6',
    'Bf4',   'e6',
    'e3',    'Nbd7',
    'Nf3',   'c5',
    'dxc5',  'Bxc5',
    'Bd3',   'O-O',
    'O-O',   'Qe7',
    'Qe2',   'a6',
    'e4',    'dxe4',
    'Nxe4',  'Nxe4',
    'Bxe4',  'Nf6',
    'Bd3',
  ],
  description:
    '3...e6 is Black\'s most popular response, choosing a solid French-like ' +
    'structure. White launches a central pawn break with e4 after development, ' +
    'forcing simplification that leaves White with active pieces and queenside space.',
  keyIdeas: [
    'Exchange on c5 early to open lines for the bishop pair.',
    'Castle quickly and centralise with Qe2 before pushing e4.',
    'After the e4 exchange, the Bxe4 bishop dominates the long diagonal.',
    'Retreat Bd3 after the knight exchange to keep diagonal pressure.',
  ],
};

// Variation 2 — 3...Bf5 Symmetrical
export const jobavaLondonBf5: OpeningLine = {
  id: 'jobava-london-bf5',
  name: NAME,
  variationName: '3...Bf5 Symmetrical',
  groupId: GROUP,
  eco: ECO,
  colour: COLOUR,
  moves: [
    'd4',    'd5',
    'Nc3',   'Nf6',
    'Bf4',   'Bf5',
    'e3',    'e6',
    'Nf3',   'c6',
    'Bd3',   'Bxd3',
    'Qxd3',  'Nbd7',
    'O-O',   'Be7',
    'Ne5',   'O-O',
    'g4',    'Nxe5',
    'dxe5',  'Nd7',
    'h4',
  ],
  description:
    'Black mirrors White\'s bishop development with 3...Bf5. White exchanges ' +
    'bishops on d3, recaptures with the queen for central activity, then advances ' +
    'g4-h4 for an aggressive kingside pawn storm after establishing the Ne5 outpost.',
  keyIdeas: [
    'Exchange bishops on d3 to eliminate the symmetry and activate the queen.',
    'Install Ne5 as a dominant central outpost before launching the kingside attack.',
    'The g4-h4 advance is the key follow-up once Ne5 is in place.',
    'Black\'s light-squared bishop is gone, leaving the kingside light squares weak.',
  ],
};

// Variation 3 — 3...g6 King's Indian Setup
export const jobavaLondonG6: OpeningLine = {
  id: 'jobava-london-g6',
  name: NAME,
  variationName: "3...g6 King's Indian Setup",
  groupId: GROUP,
  eco: ECO,
  colour: COLOUR,
  moves: [
    'd4',    'd5',
    'Nc3',   'Nf6',
    'Bf4',   'g6',
    'e3',    'Bg7',
    'Nf3',   'O-O',
    'Be2',   'Nbd7',
    'O-O',   'c6',
    'h3',    'Re8',
    'a4',    'e5',
    'dxe5',  'Nxe5',
    'Nxe5',  'Rxe5',
    'Qd2',
  ],
  description:
    'Black sets up a King\'s Indian fianchetto with 3...g6, aiming for long-term ' +
    'counterplay with the Bg7. White develops solidly and waits for Black to push ' +
    'e5, then exchanges to expose the d5 pawn and centralise the queen.',
  keyIdeas: [
    'Develop quietly with Be2 and 0-0 — no need to rush the kingside.',
    'h3 prevents ...Bg4 and prepares later manoeuvring.',
    'When Black plays ...e5, capture immediately to open the position.',
    'After the exchanges on e5, Qd2 targets d5 and links the rooks.',
  ],
};

// Variation 4 — 3...Nc6 Dynamic
export const jobavaLondonNc6: OpeningLine = {
  id: 'jobava-london-nc6',
  name: NAME,
  variationName: '3...Nc6 Dynamic',
  groupId: GROUP,
  eco: ECO,
  colour: COLOUR,
  moves: [
    'd4',    'd5',
    'Nc3',   'Nf6',
    'Bf4',   'Nc6',
    'e3',    'Bf5',
    'Nf3',   'e6',
    'Bb5',   'Bd6',
    'Bxd6',  'Qxd6',
    'O-O',   'O-O',
    'Ne5',
  ],
  description:
    'Black develops the queen\'s knight aggressively with 3...Nc6, clashing in the ' +
    'centre immediately. White meets the mirrored ...Bf5 with Bb5, exchanging to ' +
    'double Black\'s bishops and follow up with the powerful Ne5 outpost.',
  keyIdeas: [
    'Bb5 targets the c6 knight and triggers a favourable bishop exchange on d6.',
    'After Bxd6 Qxd6, Black\'s queen is temporarily active but overextended.',
    'Ne5 immediately after castling creates threats against f7 and d7.',
    'The d5 pawn is under long-term pressure from White\'s central control.',
  ],
};

// Convenience re-export of all four as an array
export const jobavaLondonVariations: OpeningLine[] = [
  jobavaLondonE6,
  jobavaLondonBf5,
  jobavaLondonG6,
  jobavaLondonNc6,
];

// Keep the original export name pointing at the main line for backwards compatibility
export const jobavaLondon = jobavaLondonE6;
