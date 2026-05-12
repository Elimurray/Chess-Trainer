import styles from './EvalBar.module.css';

interface EvalBarProps {
  /** Centipawns from White's perspective (positive = White better). Null = not analysed. */
  eval: number | null;
  visible: boolean;
  playerColour: 'white' | 'black';
}

/** Sigmoid mapping: 0 cp → 50%, ±800 cp → ~90%/10%. */
function cpToWhitePct(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
}

function formatEval(cp: number, playerColour: 'white' | 'black'): string {
  const displayed = playerColour === 'black' ? -cp : cp;
  const abs = Math.abs(displayed);
  const sign = displayed >= 0 ? '+' : '−';
  return `${sign}${(abs / 100).toFixed(2)}`;
}

const EvalBar = ({ eval: cp, visible, playerColour }: EvalBarProps) => {
  if (!visible || cp === null) return null;

  const whitePct = cpToWhitePct(cp);
  // Bar: white fill at bottom, black fill at top.
  const blackPct = 100 - whitePct;

  return (
    <div className={styles.container} aria-label="Evaluation bar">
      <div className={styles.bar}>
        <div className={styles.blackSide} style={{ height: `${blackPct}%` }} />
        <div className={styles.whiteSide} style={{ height: `${whitePct}%` }} />
      </div>
      <span className={styles.label}>{formatEval(cp, playerColour)}</span>
    </div>
  );
};

export default EvalBar;
