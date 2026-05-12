import type { OpeningLine } from '../../types/opening';


export const sicilianDefenseHyperacceleratedDragon: OpeningLine = {
  id: 'sicilian-defense-hyperaccelerated-dragon',
  name: 'Sicilian Defense: Accelerated Dragon',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B27',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'g6',
    'd4',
    'cxd4',
    'Nxd4',
    'Bg7',
    'Nc3',
    'Nc6',
    'Be3',
    'Nf6',
    'f3',
    'O-O',
    'Qd2',
    'd5',
    'Nxc6',
    'bxc6',
    'e5',
    'Nd7',
    'f4',
    'e6'
  ],
  description:
    'The Hyperaccelerated Dragon begins with 2...g6, delaying ...Nc6 to keep ' +
    'options open. White sets up the English Attack (Be3, f3, Qd2) and Black ' +
    'counters with the central break ...d5. After Nxc6 bxc6 and e5, Black blockades ' +
    'with ...Nd7 and prepares long-term counterplay against White\'s pawn chain.',
  keyIdeas: [
    'Delay ...Nc6 — play ...g6 and ...Bg7 first to keep the c6 square flexible.',
    '...d5 is the key central break; time it after White commits with Qd2.',
    'After Nxc6 bxc6, the doubled c-pawns are compensated by the open b-file.',
    'The Nd7 blockade against e5 is solid; ...e6 completes the defensive structure.',
    'Long-term plan: ...c5 push or ...f6 break to undermine White\'s pawn chain.',
  ],
};

export const sicilianDefenseAcceleratedDragonExchangeVariation: OpeningLine = {
  id: 'sicilian-defense-accelerated-dragon-exchange-variation',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Exchange Variation',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B34',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'Nc6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'Nxc6',
    'bxc6',
    'Qd4',
    'Nf6',
    'e5',
    'Nd5',
    'e6',
    'f6',
    'exd7+',
    'Bxd7',
    'Bc4',
    'e5',
    'Qd1',
    'Be6'
  ],
  description:
    'The Exchange Variation sees White immediately trade on c6, creating doubled ' +
    'c-pawns, then playing Qd4 to target d5. After e5 and the forced pawn advances, ' +
    'White follows up with Bc4 eyeing f7. Black\'s compensation lies in the bishop ' +
    'pair and active piece play against White\'s over-extended queen.',
  keyIdeas: [
    'Accept the doubled c-pawns — the open b-file and bishop pair compensate.',
    'After Qd4, play ...Nf6 to develop and force White to advance e5.',
    '...Nd5 after e5 is the key defensive resource, centralising the knight.',
    'After the forced ...f6 exd7+ Bxd7 sequence, Bc4 targets f7 — watch for tactics.',
    'Black\'s goal: develop quickly and use the two bishops in the endgame.',
  ],
};

export const sicilianDefenseAcceleratedDragonModernBc4Variation: OpeningLine = {
  id: 'sicilian-defense-accelerated-dragon-modern-bc4-variation',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Modern Bc4 Variation',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B35',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'Nc6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'Nc3',
    'Bg7',
    'Be3',
    'Nf6',
    'Bc4',
    'O-O',
    'Bb3',
    'd6',
    'f3',
    'Bd7',
    'Qd2',
    'Rc8',
    'O-O-O',
    'Ne5'
  ],
  description:
    'The Modern Bc4 Variation is a Yugoslav Attack-style setup adapted for the ' +
    'Accelerated Dragon. White develops Bc4 targeting f7, then retreats to b3 ' +
    'before committing to queenside castling. Black\'s response ...Bd7 and ...Rc8 ' +
    'prepares the standard queenside counterplay, while ...Ne5 challenges the Bb3.',
  keyIdeas: [
    'Castle kingside immediately — do not delay against the dangerous Bc4.',
    '...d6 and ...Bd7 are the key development moves; Bd7 prepares ...Rc8 and ...Ne5.',
    '...Rc8 pressures the c-file before White castles queenside.',
    '...Ne5 challenges the Bb3 and gains central control after queenside castling.',
    'The counterplay race is typical Dragon: Black attacks c2/c3, White attacks h7.',
  ],
};

export const sicilianDefenseAcceleratedDragonMarCzyBindGurgenidzeVariation: OpeningLine = {
  id: 'sicilian-defense-accelerated-dragon-mar-czy-bind-gurgenidze-variation',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Gurgenidze Variation',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B36',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'Nc6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'c4',
    'Nf6',
    'Nc3',
    'Nxd4',
    'Qxd4',
    'd6',
    'Be2',
    'Bg7',
    'Be3',
    'O-O',
    'Qd2',
    'Be6',
    'O-O',
    'Qa5'
  ],
  description:
    'The Gurgenidze Variation arises when White sets up the Maróczy Bind (c4) and ' +
    'Black counters by immediately exchanging on d4, eliminating the well-placed ' +
    'knight. After Qxd4 d6, Black fianchettoes and castles before activating with ' +
    '...Be6 and ...Qa5, creating queenside pressure and keeping the position dynamic.',
  keyIdeas: [
    '...Nxd4 trades off White\'s key d4 knight early, relieving central pressure.',
    'After the exchange, fianchetto and castle quickly before White solidifies.',
    '...Be6 develops actively and can support ...d5 or ...Qa5 pressure.',
    '...Qa5 targets the a2 pawn and puts indirect pressure on the c3 knight.',
    'The Maróczy Bind restricts ...d5, so Black seeks counterplay on the queenside.',
  ],
};

export const sicilianDefenseAcceleratedDragonSimaginVariation: OpeningLine = {
  id: 'sicilian-defense-accelerated-dragon-simagin-variation',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Simagin Variation',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B37',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'Nc6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'c4',
    'Bg7',
    'Nc2',
    'd6',
    'Be2',
    'Nh6',
    'O-O',
    'O-O',
    'Nc3',
    'f5',
    'exf5',
    'Nxf5',
    'Ne3',
    'Nfd4'
  ],
  description:
    'The Simagin Variation is an ambitious response to the Maróczy Bind in which ' +
    'Black develops the knight to h6 rather than f6, preparing an immediate ...f5 ' +
    'pawn thrust. After White retreats to Nc2 and castles, Black launches ...f5, ' +
    'exchanges on e5, and plants the knight on d4, achieving strong central control.',
  keyIdeas: [
    '...Nh6 instead of ...Nf6 keeps the f-pawn free for the ...f5 advance.',
    'Castle first, then play ...f5 — the king needs to be safe before opening lines.',
    'After exf5 Nxf5, the Nf5 is well-placed and threatens ...Nfd4.',
    '...Nfd4 is the Simagin hallmark: the knight dominates the centre from d4.',
    'The position is unbalanced and tactical — ideal for players who like counterplay.',
  ],
};

export const sicilianDefenseAcceleratedDragonMarCzyBindBreyerVariation: OpeningLine = {
  id: 'sicilian-defense-accelerated-dragon-mar-czy-bind-breyer-variation',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Breyer Variation',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B39',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'Nc6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'c4',
    'Bg7',
    'Be3',
    'Nf6',
    'Nc3',
    'Ng4',
    'Qxg4',
    'Nxd4',
    'Qd1',
    'Ne6',
    'Be2',
    'Bxc3+',
    'bxc3',
    'Qa5'
  ],
  description:
    'The Breyer Variation is a sharp piece sacrifice: Black plays ...Ng4 to force ' +
    'Qxg4, then immediately grabs the d4 knight with ...Nxd4. After the queen ' +
    'retreats, ...Ne6 secures the knight, and ...Bxc3+ wrecks White\'s pawn structure. ' +
    'Black follows with ...Qa5 to target the doubled c-pawns and exploit the weaknesses.',
  keyIdeas: [
    '...Ng4 forces Qxg4, giving Black a tempo to capture the d4 knight.',
    'After Qxg4 Nxd4, the queen must retreat — Black has equalised material and gained time.',
    '...Ne6 is essential: stabilise the knight before White can chase it away.',
    '...Bxc3+ creates doubled c-pawns — a long-term structural weakness for White.',
    '...Qa5 targets c3 and a2, exploiting the weakened queenside immediately.',
  ],
};

export const sicilianDefenseDragonVariationAcceleratedDragon: OpeningLine = {
  id: 'sicilian-defense-dragon-variation-accelerated-dragon',
  name: 'Sicilian Defense: Accelerated Dragon',
  variationName: 'Accelerated Dragon',
  groupId: 'sicilian-defense-accelerated-dragon',
  eco: 'B54',
  colour: 'black',
  moves: [
    'e4',
    'c5',
    'Nf3',
    'd6',
    'd4',
    'cxd4',
    'Nxd4',
    'g6',
    'Nc3',
    'Bg7',
    'Be3',
    'Nf6',
    'f3',
    'O-O',
    'Qd2',
    'Nc6',
    'O-O-O',
    'd5',
    'exd5',
    'Nxd5',
    'Nxc6',
    'bxc6'
  ],
  description:
    'This line starts with the ...d6 move order (B54) but transposes into Accelerated ' +
    'Dragon territory after ...g6 and ...Bg7. White builds the English Attack with ' +
    'f3, Qd2, and O-O-O, while Black plays the thematic ...d5 central break. After ' +
    'the forced exchanges, Black has the open b-file and active pieces as compensation.',
  keyIdeas: [
    'The ...d6 move order avoids some early Maróczy Bind lines before transposing.',
    'Castle quickly — White will launch a kingside attack after O-O-O.',
    '...d5 is the critical central break; delay until after castling and ...Nc6.',
    'After exd5 Nxd5 Nxc6 bxc6, the open b-file gives Black real counterplay.',
    'Long-term plan: activate the bishop on g7 and use the b-file for rook pressure.',
  ],
};


export const sicilianDefenseAcceleratedDragonVariations: OpeningLine[] = [
  sicilianDefenseHyperacceleratedDragon,
  sicilianDefenseAcceleratedDragonExchangeVariation,
  sicilianDefenseAcceleratedDragonModernBc4Variation,
  sicilianDefenseAcceleratedDragonMarCzyBindGurgenidzeVariation,
  sicilianDefenseAcceleratedDragonSimaginVariation,
  sicilianDefenseAcceleratedDragonMarCzyBindBreyerVariation,
  sicilianDefenseDragonVariationAcceleratedDragon,
];