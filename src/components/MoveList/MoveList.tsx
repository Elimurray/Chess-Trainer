import type { PlayedMove, DeviationInfo } from '../../types/opening';
import styles from './MoveList.module.css';

interface MovePair {
  number: number;
  white: PlayedMove | null;
  black: PlayedMove | null;
  whiteIndex: number;
  blackIndex: number;
}

function buildPairs(history: PlayedMove[]): MovePair[] {
  const pairs: MovePair[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i] ?? null,
      black: history[i + 1] ?? null,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }
  return pairs;
}

interface MoveListProps {
  history: PlayedMove[];
  lastDeviation: DeviationInfo | null;
  currentIndex: number;
}

const MoveList = ({ history, lastDeviation, currentIndex }: MoveListProps) => {
  const pairs = buildPairs(history);
  const deviationIndex = lastDeviation?.moveIndex ?? -1;

  if (pairs.length === 0) {
    return <div className={styles.empty}>No moves yet</div>;
  }

  return (
    <div className={styles.list}>
      {pairs.map((pair) => (
        <div key={pair.number} className={styles.row}>
          <span className={styles.num}>{pair.number}.</span>
          {pair.white && (
            <span
              className={[
                styles.move,
                pair.whiteIndex === currentIndex - 1 ? styles.current : '',
                pair.whiteIndex === deviationIndex ? styles.deviation : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {pair.white.san}
            </span>
          )}
          {pair.black && (
            <span
              className={[
                styles.move,
                pair.blackIndex === currentIndex - 1 ? styles.current : '',
                pair.blackIndex === deviationIndex ? styles.deviation : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {pair.black.san}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MoveList;
