import { useEffect, useRef } from 'react';
import type { OpeningLine } from '../../types/opening';
import { useOpeningTrainer } from '../../hooks/useOpeningTrainer';
import { useProgress } from '../../hooks/useProgress';
import Board from '../../components/Board/Board';
import EvalBar from '../../components/EvalBar/EvalBar';
import MoveList from '../../components/MoveList/MoveList';
import OpeningTree from '../../components/OpeningTree/OpeningTree';
import FeedbackPanel from '../../components/FeedbackPanel/FeedbackPanel';
import styles from './Train.module.css';

interface TrainProps {
  opening: OpeningLine;
  onBack: () => void;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'playing': return 'Playing';
    case 'deviation': return 'Deviation';
    case 'complete': return 'Complete';
    default: return '';
  }
}

function statusClass(status: string, s: Record<string, string>): string {
  switch (status) {
    case 'playing': return s.statusPlaying;
    case 'deviation': return s.statusDeviation;
    case 'complete': return s.statusComplete;
    default: return '';
  }
}

const Train = ({ opening, onBack }: TrainProps) => {
  const { state, makeMove, reset } = useOpeningTrainer(opening);
  const { getProgress, recordResult } = useProgress();
  const progress = getProgress(opening.id);
  // Track whether we already recorded this particular completion.
  const recordedRef = useRef(false);

  useEffect(() => {
    if (state.status === 'complete' && !recordedRef.current) {
      recordedRef.current = true;
      recordResult(opening.id, state.deviationCount === 0);
    }
    if (state.status !== 'complete') {
      recordedRef.current = false;
    }
  }, [state.status, state.deviationCount, opening.id, recordResult]);

  const lastMove =
    state.history.length > 0
      ? (() => {
          const last = state.history[state.history.length - 1];
          return { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) };
        })()
      : null;

  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  // FEN right before the deviation move — used by FeedbackPanel to convert best-move UCI to SAN.
  const deviationStartFen =
    state.status !== 'deviation'
      ? null
      : state.history.length >= 2
      ? state.history[state.history.length - 2].fen
      : STARTING_FEN;

  // Square the user dropped their piece on when they deviated.
  const deviationToSquare =
    state.lastDeviation !== null && state.history.length > 0
      ? state.history[state.history.length - 1].uci.slice(2, 4)
      : null;

  const handleContinue = () => reset();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.openingLabel}>{opening.name}</span>
        <span className={`${styles.statusBadge} ${statusClass(state.status, styles)}`}>
          {statusLabel(state.status)}
        </span>
      </div>

      {state.status === 'complete' ? (
        <div className={styles.completeOverlay}>
          <div className={styles.completeTitle}>
            {state.deviationCount === 0 ? '🎯 Perfect!' : '✓ Line complete'}
          </div>
          <div className={styles.completeStats}>
            {state.deviationCount === 0
              ? 'No deviations — clean run!'
              : `${state.deviationCount} deviation${state.deviationCount !== 1 ? 's' : ''}`}
            {' · '}Completions: {progress.completions + 1}
            {' · '}Mastery: {progress.masteryLevel}/3
          </div>
          <div className={styles.completeActions}>
            <button className={styles.primaryBtn} onClick={reset}>Try again</button>
            <button className={styles.secondaryBtn} onClick={onBack}>Choose opening</button>
          </div>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.left}>
            <EvalBar
              eval={state.engineEval}
              visible={state.status === 'deviation'}
              playerColour={opening.colour}
            />
            <div>
              <Board
                fen={state.fen}
                orientation={opening.colour}
                onMove={makeMove}
                lastMove={lastMove}
                deviationTo={deviationToSquare}
                disabled={state.status === 'deviation'}
              />
              <div className={styles.turnIndicator}>
                {state.status === 'playing' &&
                  (opening.colour === 'white'
                    ? state.moveIndex % 2 === 0 ? 'Your turn (White)' : 'Engine thinking…'
                    : state.moveIndex % 2 === 1 ? 'Your turn (Black)' : 'Engine thinking…')}
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <OpeningTree
              opening={opening}
              moveIndex={state.moveIndex}
              masteryLevel={progress.masteryLevel}
            />
            <MoveList
              history={state.history}
              lastDeviation={state.lastDeviation}
              currentIndex={state.moveIndex}
            />
            {state.status === 'deviation' && (
              <FeedbackPanel
                deviation={state.lastDeviation}
                engineEval={state.engineEval}
                bestMoveUci={state.bestMove}
                fenBeforeDeviation={deviationStartFen}
                onContinue={handleContinue}
                playerColour={opening.colour}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Train;
