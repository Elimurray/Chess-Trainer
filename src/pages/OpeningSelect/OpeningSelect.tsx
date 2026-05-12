import { useState } from 'react';
import type { OpeningLine } from '../../types/opening';
import { allOpenings } from '../../data/openings';
import { useProgress } from '../../hooks/useProgress';
import styles from './OpeningSelect.module.css';

const MASTERY_STARS = ['☆☆☆', '★☆☆', '★★☆', '★★★'] as const;

interface OpeningSelectProps {
  onSelect: (opening: OpeningLine) => void;
}

/** Group openings by their groupId (falls back to id for ungrouped lines). */
function buildGroups(openings: OpeningLine[]): Map<string, OpeningLine[]> {
  const map = new Map<string, OpeningLine[]>();
  for (const o of openings) {
    const key = o.groupId ?? o.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  return map;
}

const OpeningSelect = ({ onSelect }: OpeningSelectProps) => {
  const { getProgress } = useProgress();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const whites = allOpenings.filter((o) => o.colour === 'white');
  const blacks = allOpenings.filter((o) => o.colour === 'black');

  const renderSection = (openings: OpeningLine[]) => {
    const groups = buildGroups(openings);
    return Array.from(groups.entries()).map(([groupKey, lines]) => {
      if (lines.length === 1) {
        const o = lines[0];
        return (
          <OpeningCard
            key={o.id}
            opening={o}
            progress={getProgress(o.id)}
            onSelect={onSelect}
          />
        );
      }

      const isExpanded = expandedGroup === groupKey;
      const bestMastery = Math.max(...lines.map((l) => getProgress(l.id).masteryLevel)) as 0 | 1 | 2 | 3;
      const anyCompletions = lines.some((l) => getProgress(l.id).completions > 0);

      return (
        <div key={groupKey} className={`${styles.card} ${styles.groupCard}`}>
          <button
            className={styles.groupHeader}
            onClick={() => setExpandedGroup(isExpanded ? null : groupKey)}
          >
            <div className={styles.cardTop}>
              <span className={styles.eco}>{lines[0].eco}</span>
              <span className={styles.stars}>{MASTERY_STARS[bestMastery]}</span>
            </div>
            <div className={styles.cardName}>{lines[0].name}</div>
            {anyCompletions && (
              <div className={styles.cardMeta}>
                {lines.filter((l) => getProgress(l.id).completions > 0).length} / {lines.length} variations practised
              </div>
            )}
            <div className={styles.variationCount}>
              <span>{lines.length} variations</span>
              <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>▾</span>
            </div>
          </button>

          {isExpanded && (
            <div className={styles.variationList}>
              {lines.map((line) => {
                const prog = getProgress(line.id);
                return (
                  <button
                    key={line.id}
                    className={styles.variationItem}
                    onClick={() => onSelect(line)}
                  >
                    <div className={styles.variationName}>
                      {line.variationName ?? line.name}
                    </div>
                    <div className={styles.variationMeta}>
                      <span>{Math.ceil(line.moves.length / 2)} moves</span>
                      <span>{MASTERY_STARS[prog.masteryLevel]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chess Opening Trainer</h1>
        <p className={styles.subtitle}>Choose an opening to practise</p>
      </header>

      {whites.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Playing as White</h2>
          <div className={styles.grid}>{renderSection(whites)}</div>
        </section>
      )}

      {blacks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Playing as Black</h2>
          <div className={styles.grid}>{renderSection(blacks)}</div>
        </section>
      )}
    </div>
  );
};

interface CardProps {
  opening: OpeningLine;
  progress: ReturnType<ReturnType<typeof useProgress>['getProgress']>;
  onSelect: (o: OpeningLine) => void;
}

const OpeningCard = ({ opening, progress, onSelect }: CardProps) => (
  <button className={styles.card} onClick={() => onSelect(opening)}>
    <div className={styles.cardTop}>
      <span className={styles.eco}>{opening.eco}</span>
      <span className={styles.stars}>{MASTERY_STARS[progress.masteryLevel]}</span>
    </div>
    <div className={styles.cardName}>{opening.name}</div>
    {progress.completions > 0 && (
      <div className={styles.cardMeta}>
        {progress.completions} completion{progress.completions !== 1 ? 's' : ''}
      </div>
    )}
  </button>
);

export default OpeningSelect;
