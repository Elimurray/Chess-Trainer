import type { OpeningLine } from '../../types/opening';

// Sicilian Najdorf — English Attack (6.Be3) main line, training as Black.
// Line: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.Nb3 Be6
//       8.f3 Be7 9.Qd2 O-O 10.O-O-O Nbd7
export const sicilianNajdorf: OpeningLine = {
  id: 'sicilian-najdorf-english-attack',
  name: 'Sicilian Defence: Najdorf Variation — English Attack',
  eco: 'B90',
  colour: 'black',
  moves: [
    'e4', 'c5',
    'Nf3', 'd6',
    'd4', 'cxd4',
    'Nxd4', 'Nf6',
    'Nc3', 'a6',
    'Be3', 'e5',
    'Nb3', 'Be6',
    'f3', 'Be7',
    'Qd2', 'O-O',
    'O-O-O', 'Nbd7',
  ],
  description:
    'The Najdorf is one of the sharpest and most theoretically rich openings ' +
    'in chess. Black immediately stakes a claim in the centre with 5...a6, ' +
    'preparing ...e5 and preventing White pieces from reaching b5. In the ' +
    'English Attack White sets up f3, g4 with queenside castling for a direct ' +
    'kingside assault.',
  keyIdeas: [
    'The a6 move (the "Najdorf move") prevents Nb5 and prepares ...b5 expansion.',
    'After ...e5, Black grabs central space but creates a backward d6-pawn.',
    '...Be6 develops actively and contests White\'s plan before ...f3 is played.',
    'Castle kingside early — the king is safer before White launches the g4-g5 advance.',
    'Develop the b8-knight to d7 to support ...c5 breaks and keep the e5-pawn.',
    'Watch for the ...d5 central break once White commits the queenside king.',
  ],
};
