import React from 'react';
import { useRouter } from 'next/router';
import { ModeratorControls } from '../ModeratorControls';
import { UserList } from '../UserList';
import { useSessionState } from '../../hooks/useSessionState';
import { resetScores } from '../../api/scores';
import * as styles from './resultsscreen.module.css';

export const ResultsScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const [isModerator, setIsModerator] = React.useState(false);
  const {
    user,
    users,
    scores,
    scoresLoaded,
    confirmEnabled,
    showScores,
    nextSequence,
    toggleScores,
    toggleConfirm,
    cycleSequence,
  } = useSessionState({ session, localUser });

  React.useEffect(() => {
    if (!scoresLoaded || showScores) {
      return;
    }

    router.replace(`/voting#${session}`);
  }, [router, scoresLoaded, session, showScores]);

  const confirm = msg => {
    if (!confirmEnabled) {
      return true;
    }
    return window.confirm(msg);
  };

  const goToVoting = React.useCallback(() => {
    if (isModerator && confirm('Reset scores and go back to voting?')) {
      resetScores(session);
    }
    router.replace(`/voting#${session}`);
  }, [router, session, isModerator, confirmEnabled]);

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <h1>Results Stage</h1>
        <p>
          {showScores
            ? 'All revealed cards and summary stats are shown below.'
            : 'Cards are still hidden. Reveal cards to view final results.'}
        </p>
      </div>

      <div className={styles.actions}>
        {isModerator && (
          <button className={styles.route} onClick={goToVoting}>
            Back to voting
          </button>
        )}
      </div>

      {!isModerator && (
        <button
          type="button"
          className={styles.moderator_notice}
          onClick={() => setIsModerator(true)}
        >
          Show Moderator Controls
        </button>
      )}

      <UserList me={user} users={users} scores={scores} />
      <ModeratorControls
        {...{
          session,
          showScores,
          toggleScores,
          confirmEnabled,
          toggleConfirm,
          nextSequence,
          cycleSequence,
        }}
      />
    </section>
  );
};

export default ResultsScreen;
