import { useState } from 'react';
import { Chess } from 'chess.js';
import type { DeviationInfo } from '../../types/opening';
import { classifyMove } from '../../utils/moveClassification';
import styles from './FeedbackPanel.module.css';

const CLASS_LABELS: Record<string, string> = {
  brilliant: '!! Brilliant',
  best: '! Best',
  good: 'Good',
  inaccuracy: '?! Inaccuracy',
  mistake: '? Mistake',
  blunder: '?? Blunder',
};

const CLASS_COLOURS: Record<string, string> = {
  brilliant: '#4db6ac',
  best: '#81c784',
  good: '#aed581',
  inaccuracy: '#ffb74d',
  mistake: '#ff8a65',
  blunder: '#e57373',
};

interface FeedbackPanelProps {
  deviation: DeviationInfo | null;
  engineEval: number | null;
  bestMoveUci: string | null;
  /** FEN at the moment the deviation was made (before the wrong move). */
  fenBeforeDeviation: string | null;
  onContinue: () => void;
  playerColour: 'white' | 'black';
}

/** Convert a UCI move like "e2e4" to SAN using the position before the move. */
function uciToSan(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci[4];
    const result = chess.move(promotion ? { from, to, promotion } : { from, to });
    return result?.san ?? null;
  } catch {
    return null;
  }
}

const FeedbackPanel = ({
  deviation,
  engineEval,
  bestMoveUci,
  fenBeforeDeviation,
  onContinue,
  playerColour,
}: FeedbackPanelProps) => {
  const [hintRevealed, setHintRevealed] = useState(false);

  if (!deviation) return null;

  const cpLoss =
    engineEval !== null
      ? playerColour === 'white'
        ? -engineEval   // White wants positive score; negative means loss
        : engineEval    // Black wants negative score; positive means loss for Black
      : null;

  const classification = cpLoss !== null ? classifyMove(cpLoss) : null;

  const bestSan =
    hintRevealed && bestMoveUci && fenBeforeDeviation
      ? uciToSan(fenBeforeDeviation, bestMoveUci)
      : null;

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Deviation</h3>

      <div className={styles.row}>
        <span className={styles.label}>You played</span>
        <span className={styles.move}>{deviation.playedSan}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Expected</span>
        <span className={styles.move}>{deviation.expectedSan}</span>
      </div>

      {classification && (
        <div
          className={styles.classification}
          style={{ color: CLASS_COLOURS[classification] }}
        >
          {CLASS_LABELS[classification]}
        </div>
      )}

      {engineEval !== null && (
        <div className={styles.evalRow}>
          <span className={styles.label}>Eval</span>
          <span className={styles.eval}>
            {engineEval >= 0 ? '+' : ''}
            {(engineEval / 100).toFixed(2)}
          </span>
        </div>
      )}

      <div className={styles.actions}>
        {!hintRevealed ? (
          <button className={styles.hintBtn} onClick={() => setHintRevealed(true)}>
            Show best move
          </button>
        ) : (
          <div className={styles.hint}>
            Best: <strong>{bestSan ?? bestMoveUci ?? '…'}</strong>
          </div>
        )}
        <button className={styles.continueBtn} onClick={onContinue}>
          Continue anyway →
        </button>
      </div>
    </div>
  );
};

export default FeedbackPanel;
