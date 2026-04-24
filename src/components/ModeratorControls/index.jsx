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
  isModerator: isModeatorProp,
  onModeratorChange,
}) => {
  const [isModerator, setIsModerator] = React.useState(isModeatorProp ?? false);

  const setModerator = React.useCallback(
    value => {
      setIsModerator(value);
      onModeratorChange?.(value);
    },
    [onModeratorChange],
  );

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

  const reset = React.useCallback(() => {
    toggleScores(false);
    resetScores(session);
  }, [session, toggleScores]);

  const changePoints = React.useCallback(() => {
    reset();
    cycleSequence();
  }, [cycleSequence, reset]);

  if (!isModerator) {
    return (
      <button
        type="button"
        className={styles.moderator_notice}
        onClick={() => setModerator(true)}
      >
        Show Moderator Controls
      </button>
    );
  }

  return (
    <div className={styles.moderator_controls}>
      <button
        type="button"
        className={styles.moderator_notice}
        onClick={() => setModerator(false)}
      >
        Hide Moderator Controls
      </button>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.reveal}
          onClick={() =>
            confirm(`${showScores ? 'Hide' : 'Reveal'} all cards?`) &&
            toggleScores(true)
          }
        >
          {showScores ? 'Hide' : 'Reveal'}
        </button>
        <button
          type="button"
          className={styles.reset}
          onClick={() => confirm('Reset all cards?') && reset()}
        >
          Reset
        </button>
      </div>
      <div className={styles.options}>
        <button
          type="button"
          className={styles.confirm}
          onClick={() =>
            confirm('Disable your confirmation dialog?') && toggleConfirm()
          }
        >
          {confirmEnabled ? 'Disable' : 'Enable'} Confirm
        </button>
        <button
          type="button"
          className={styles.sequence}
          onClick={() =>
            confirm(`Use ${nextSequence} cards?`) && changePoints()
          }
        >
          Use {nextSequence} Cards
        </button>
      </div>
    </div>
  );
};
