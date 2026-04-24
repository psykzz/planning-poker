import React from 'react';
import { useRouter } from 'next/router';
import { UserList } from '../UserList';
import { useSessionState } from '../../hooks/useSessionState';
import { resetScores } from '../../api/scores';
import * as styles from './resultsscreen.module.css';

export const ResultsScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const { user, users, scores, confirmEnabled, stage, isModerator, setStage } =
    useSessionState({ session, localUser });

  React.useEffect(() => {
    if (stage !== 'voting') {
      return;
    }

    router.replace(`/voting#${session}`);
  }, [router, session, stage]);

  const goToVoting = React.useCallback(() => {
    if (
      isModerator &&
      (!confirmEnabled || window.confirm('Reset scores and go back to voting?'))
    ) {
      resetScores(session);
      setStage('voting');
    }
  }, [session, isModerator, confirmEnabled, setStage]);

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <h1>Results Stage</h1>
        <p>
          Everyone&apos;s submitted scores and summary stats are shown below.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.route}
          onClick={goToVoting}
          disabled={!isModerator}
          title={
            !isModerator
              ? 'Become a moderator in Options to control the session stage'
              : ''
          }
        >
          Back to voting
        </button>
      </div>

      <UserList me={user} users={users} scores={scores} forceReveal />
    </section>
  );
};

export default ResultsScreen;
