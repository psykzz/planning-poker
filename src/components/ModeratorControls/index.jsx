import React from 'react';
import { toast } from 'react-toastify';
import { resetScores } from '../../api/scores';
import * as styles from './moderatorcontrols.module.css';

export const ModeratorControls = ({
  session,
  showScores,
  toggleScores,
  confirmEnabled,
  toggleConfirm,
  nextSequence,
  cycleSequence,
}) => {
  const [isModerator, setIsModerator] = React.useState(false);

  React.useEffect(() => {
    if (isModerator) {
      toast('Enabled Moderator controls!');
    }
  }, [isModerator]);

  const confirm = msg => {
    if (!confirmEnabled) {
      return true;
    }
    return window.confirm(msg);
  };

  const removeSelected = () => {
    const cardElements = document.querySelectorAll('[id^="score_val_"]');
    cardElements.forEach(card => {
      card.style.backgroundColor = '';
      card.style.borderColor = '';
    });
  };

  const reset = React.useCallback(() => {
    toggleScores(false); // Only change visuals
    removeSelected();
    resetScores(session);
  }, [session, toggleScores]);

  const changePoints = React.useCallback(() => {
    reset();
    cycleSequence();
  }, [cycleSequence, reset]);

  if (!isModerator) {
    return (
      <button
        className={styles.moderator_notice}
        onClick={() => setIsModerator(true)}
      >
        Show Moderator Controls
      </button>
    );
  }

  return (
    <div className={styles.moderator_controls}>
      <button
        className={styles.moderator_notice}
        onClick={() => setIsModerator(false)}
      >
        Hide Moderator Controls
      </button>
      <div className={styles.actions}>
        <div
          className={styles.reveal}
          onClick={() =>
            confirm(`${showScores ? 'Hide' : 'Reveal'} all cards?`) &&
            toggleScores(true)
          }
        >
          {showScores ? 'Hide' : 'Reveal'}
        </div>
        <div
          className={styles.reset}
          onClick={() => confirm('Reset all cards?') && reset()}
        >
          Reset
        </div>
      </div>
      <div className={styles.options}>
        <div
          className={styles.confirm}
          onClick={() =>
            confirm('Disable your confirmation dialog?') && toggleConfirm()
          }
        >
          {confirmEnabled ? 'Disable' : 'Enable'} Confirm
        </div>
        <div
          className={styles.sequence}
          onClick={() =>
            confirm(`Use ${nextSequence} cards?`) && changePoints()
          }
        >
          Use {nextSequence} Cards
        </div>
      </div>
    </div>
  );
};
