import type { OpeningLine } from '../../types/opening';
import styles from './OpeningTree.module.css';

const MASTERY_LABELS = ['New', 'Familiar', 'Practised', 'Mastered'] as const;
const MASTERY_COLOURS = ['#9e9e9e', '#64b5f6', '#81c784', '#ffd54f'] as const;

interface OpeningTreeProps {
  opening: OpeningLine;
  moveIndex: number;
  masteryLevel: 0 | 1 | 2 | 3;
}

const OpeningTree = ({ opening, moveIndex, masteryLevel }: OpeningTreeProps) => {
  const total = opening.moves.length;
  const pct = total > 0 ? Math.round((moveIndex / total) * 100) : 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span
          className={styles.mastery}
          style={{ color: MASTERY_COLOURS[masteryLevel] }}
        >
          {MASTERY_LABELS[masteryLevel]}
        </span>
        <span className={styles.eco}>{opening.eco}</span>
      </div>

      <h2 className={styles.name}>{opening.name}</h2>
      <p className={styles.description}>{opening.description}</p>

      <div className={styles.progress}>
        <div className={styles.progressLabel}>
          Move {moveIndex} / {total}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.ideas}>
        <h3 className={styles.ideasTitle}>Key Ideas</h3>
        <ul className={styles.ideaList}>
          {opening.keyIdeas.map((idea, i) => (
            <li key={i} className={styles.idea}>
              {idea}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OpeningTree;
