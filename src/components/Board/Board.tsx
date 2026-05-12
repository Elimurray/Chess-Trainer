import { Chessboard } from 'react-chessboard';
import type { Square, PromotionPieceOption } from 'react-chessboard/dist/chessboard/types';
import styles from './Board.module.css';

interface BoardProps {
  fen: string;
  orientation: 'white' | 'black';
  onMove: (from: string, to: string, promotion?: string) => boolean;
  lastMove?: { from: string; to: string } | null;
  /** Square to highlight in red (user's deviated-to square). */
  deviationTo?: string | null;
  disabled?: boolean;
  /** Board size in pixels. Passed directly to react-chessboard. Default: 480. */
  size?: number;
}

const Board = ({ fen, orientation, onMove, lastMove, deviationTo, disabled, size = 720 }: BoardProps) => {
  const squareStyles: Partial<Record<Square, Record<string, string | number>>> = {};

  if (lastMove) {
    squareStyles[lastMove.from as Square] = { backgroundColor: 'rgba(255, 255, 100, 0.35)' };
    squareStyles[lastMove.to as Square] = { backgroundColor: 'rgba(255, 255, 100, 0.55)' };
  }

  if (deviationTo) {
    squareStyles[deviationTo as Square] = { backgroundColor: 'rgba(220, 50, 50, 0.55)' };
  }

  const handleDrop = (src: Square, tgt: Square): boolean => {
    if (disabled) return false;
    return onMove(src, tgt);
  };

  const handlePromotion = (
    piece?: PromotionPieceOption,
    from?: Square,
    to?: Square,
  ): boolean => {
    if (!piece || !from || !to) return false;
    // piece is "wQ" / "bR" etc.; chess.js wants lowercase letter
    const promo = piece[1].toLowerCase();
    return onMove(from, to, promo);
  };

  return (
    <div className={styles.wrapper}>
      <Chessboard
        position={fen}
        boardWidth={size}
        boardOrientation={orientation}
        onPieceDrop={handleDrop}
        onPromotionPieceSelect={handlePromotion}
        customSquareStyles={squareStyles}
        arePiecesDraggable={!disabled}
        promotionDialogVariant="modal"
        customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
};

export default Board;
