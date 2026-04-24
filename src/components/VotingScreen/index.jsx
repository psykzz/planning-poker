import React from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { useRouter } from 'next/router';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { Sidebar } from '../Sidebar';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import { useRounds } from '../../hooks/useRounds';
import * as styles from './votingscreen.module.css';

export const VotingScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const [clipboardState, copyToClipboard] = useCopyToClipboard();
  const {
    user,
    users,
    scores,
    sequence,
    stage,
    isModerator,
    sessionDisplayName,
    confirmEnabled,
    toggleConfirm,
    setModeratorStatus,
    setSessionDisplayName,
    setUserName,
    setStage,
  } = useSessionState({ session, localUser });
  const { rounds, selectedRound, isViewingHistory, selectRound } = useRounds({
    session,
  });
  const userScore = scores.find(score => score.user_id === user?.id);

  React.useEffect(() => {
    if (clipboardState.value) {
      toast.success(`Copied ${clipboardState.value}!`);
    }
  }, [clipboardState]);

  React.useEffect(() => {
    if (stage !== 'results') {
      return;
    }

    router.replace(`/results#${session}`);
  }, [router, session, stage]);

  const copySessionId = React.useCallback(() => {
    copyToClipboard(
      `${window.location.origin}${window.location.pathname}#${session}`,
    );
  }, [copyToClipboard, session]);

  const goToResults = React.useCallback(() => {
    setStage('results');
  }, [setStage]);

  return (
    <div className={styles.container}>
      <Sidebar
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
          <h1>
            {sessionDisplayName
              ? `${sessionDisplayName} - Voting`
              : 'Voting Stage'}
          </h1>
          <p>Pick a card, then reveal when everyone is ready.</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.route}
            disabled={!isModerator}
            onClick={goToResults}
            type="button"
            title={
              !isModerator
                ? 'Become a moderator in Session to open results'
                : ''
            }
          >
            Open results
          </button>
        </div>

        <UserList me={user} users={users} scores={scores} />
        <button
          type="button"
          className={styles.invite_line}
          onClick={copySessionId}
        >
          invite new members +
        </button>
        <ScoreCards
          session={session}
          options={POINT_SEQUENCES[sequence]}
          selectedScore={userScore?.score}
        />
      </section>
    </div>
  );
};

export default VotingScreen;
