import React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { UserList } from '../UserList';
import { Sidebar } from '../Sidebar';
import { useSessionState } from '../../hooks/useSessionState';
import { useRounds } from '../../hooks/useRounds';
import { resetScoresWithRound } from '../../api/rounds';
import * as styles from './resultsscreen.module.css';

export const ResultsScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const { user, users, scores, confirmEnabled, stage, isModerator, sessionDisplayName, sequence, toggleConfirm, setModeratorStatus, setSessionDisplayName, setUserName, setStage } =
    useSessionState({ session, localUser });
  const { rounds, selectedRound, isViewingHistory, selectRound } =
    useRounds({ session });

  const navigatingRef = React.useRef(false);
  React.useEffect(() => {
    if (stage !== 'voting' || navigatingRef.current) {
      return;
    }
    navigatingRef.current = true;
    router.replace(`/voting#${session}`);
  }, [router, session, stage]);

  const goToVoting = React.useCallback(async () => {
    if (
      isModerator &&
      (!confirmEnabled || window.confirm('Reset scores and go back to voting?'))
    ) {
      try {
        setIsResetting(true);
        await resetScoresWithRound(session, scores, users);
        setStage('voting');
      } catch (error) {
        toast.error('Could not reset scores. Please try again.');
        console.warn('Failed to reset scores', error);
      } finally {
        setIsResetting(false);
      }
    }
  }, [session, scores, users, isModerator, confirmEnabled, setStage]);

  return (
    <div className={styles.container}>
      <button
        className={styles.menu_btn}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open session menu"
        type="button"
      >
        ☰
      </button>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
        user={user}
        rounds={rounds}
        selectedRound={selectedRound}
        isViewingHistory={isViewingHistory}
        onSelectRound={selectRound}
        sequence={sequence}
        confirmEnabled={confirmEnabled}
        isModerator={isModerator}
        sessionDisplayName={sessionDisplayName}
        toggleConfirm={toggleConfirm}
        setModeratorStatus={setModeratorStatus}
        setSessionDisplayName={setSessionDisplayName}
        setUserName={setUserName}
      />
      <section className={styles.screen}>
        <div className={styles.header}>
        <h1>{sessionDisplayName ? `${sessionDisplayName} - Results` : 'Results Stage'}</h1>
        <p>
          Everyone&apos;s submitted scores and summary stats are shown below.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.route}
          onClick={goToVoting}
          disabled={!isModerator || isResetting}
          title={
            !isModerator
              ? 'Become a moderator in Session to control the session stage'
              : isResetting
                ? 'Resetting scores'
                : ''
          }
        >
          {isResetting ? 'Resetting...' : 'Back to voting'}
        </button>
      </div>

      <div className={styles.scrollable_content}>
        <UserList me={user} users={users} scores={scores} forceReveal />
      </div>

      </section>
    </div>
  );
};

export default ResultsScreen;
