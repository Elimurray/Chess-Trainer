import { useEffect, useRef } from 'react';
import type { OpeningLine } from '../../types/opening';
import { useOpeningTrainer } from '../../hooks/useOpeningTrainer';
import { useProgress } from '../../hooks/useProgress';
import { useSounds } from '../../hooks/useSounds';
import Board from '../../components/Board/Board';
import EvalBar from '../../components/EvalBar/EvalBar';
import MoveList from '../../components/MoveList/MoveList';
import OpeningTree from '../../components/OpeningTree/OpeningTree';
import FeedbackPanel from '../../components/FeedbackPanel/FeedbackPanel';
import styles from './Train.module.css';

const MASTERY_STARS = ['☆☆☆', '★☆☆', '★★☆', '★★★'] as const;

interface TrainProps {
  opening: OpeningLine;
  onBack: () => void;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'playing':   return 'Playing';
    case 'deviation': return 'Deviation';
    case 'complete':  return 'Complete';
    default:          return '';
  }
}

function statusClass(status: string, s: Record<string, string>): string {
  switch (status) {
    case 'playing':   return s.statusPlaying;
    case 'deviation': return s.statusDeviation;
    case 'complete':  return s.statusComplete;
    default:          return '';
  }
}

const Train = ({ opening, onBack }: TrainProps) => {
  const { state, makeMove, reset } = useOpeningTrainer(opening);
  const { getProgress, recordResult } = useProgress();
  const progress = getProgress(opening.id);
  const sounds = useSounds();

  // Record completion once per run.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (state.status === 'complete' && !recordedRef.current) {
      recordedRef.current = true;
      recordResult(opening.id, state.deviationCount === 0);
    }
    if (state.status !== 'complete') recordedRef.current = false;
  }, [state.status, state.deviationCount, opening.id, recordResult]);

  // Play a sound whenever a move is added to history.
  const prevHistLen = useRef(0);
  useEffect(() => {
    if (state.history.length <= prevHistLen.current) return;
    prevHistLen.current = state.history.length;

    if (state.status === 'complete') {
      sounds.complete();
    } else if (state.status === 'deviation') {
      sounds.deviation();
    } else {
      const last = state.history[state.history.length - 1];
      if (last.san.includes('+') || last.san.includes('#')) {
        sounds.check();
      } else if (last.san.includes('x')) {
        sounds.capture();
      } else {
        sounds.move();
      }
    }
  }, [state.history.length, state.status, state.history, sounds]);

  // Reset sound counter on new opening.
  useEffect(() => { prevHistLen.current = 0; }, [opening]);

  const lastMove =
    state.history.length > 0
      ? (() => {
          const last = state.history[state.history.length - 1];
          return { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) };
        })()
      : null;

  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const deviationStartFen =
    state.status !== 'deviation'
      ? null
      : state.history.length >= 2
      ? state.history[state.history.length - 2].fen
      : STARTING_FEN;

  const deviationToSquare =
    state.lastDeviation !== null && state.history.length > 0
      ? state.history[state.history.length - 1].uci.slice(2, 4)
      : null;

  const isPerfect = state.deviationCount === 0;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.openingLabel}>
          {opening.variationName
            ? `${opening.name} — ${opening.variationName}`
            : opening.name}
        </span>
        <span className={`${styles.statusBadge} ${statusClass(state.status, styles)}`}>
          {statusLabel(state.status)}
        </span>
      </div>

      {/* Main layout — always rendered so the board stays visible behind the modal */}
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
              disabled={state.status === 'deviation' || state.status === 'complete'}
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
              onContinue={reset}
              playerColour={opening.colour}
            />
          )}
        </div>
      </div>

      {/* Completion modal — floats over the board */}
      {state.status === 'complete' && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>{isPerfect ? '🎯' : '✓'}</div>
            <div className={styles.modalTitle}>
              {isPerfect ? 'Perfect Run!' : 'Line Complete'}
            </div>
            <div className={styles.modalStats}>
              {isPerfect
                ? 'No deviations — clean run!'
                : `${state.deviationCount} deviation${state.deviationCount !== 1 ? 's' : ''}`}
            </div>
            <div className={styles.modalMastery}>
              <span className={styles.masteryStars}>{MASTERY_STARS[progress.masteryLevel]}</span>
              <span className={styles.masteryLabel}>
                Mastery {progress.masteryLevel}/3 · {progress.completions + 1} completion{progress.completions + 1 !== 1 ? 's' : ''}
              </span>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.primaryBtn} onClick={reset}>Try again</button>
              <button className={styles.secondaryBtn} onClick={onBack}>Choose opening</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Train;
