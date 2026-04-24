import React from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { useRouter } from 'next/router';
import { ModeratorControls } from '../ModeratorControls';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { resetScores } from '../../api/scores';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import * as styles from './votingscreen.module.css';

export const VotingScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const [isModerator, setIsModerator] = React.useState(false);
  const [clipboardState, copyToClipboard] = useCopyToClipboard();
  const {
    user,
    users,
    scores,
    scoresLoaded,
    confirmEnabled,
    sequence,
    showScores,
    nextSequence,
    toggleScores,
    toggleConfirm,
    cycleSequence,
  } = useSessionState({ session, localUser });
  const userScore = scores.find(score => score.user_id === user?.id);

  React.useEffect(() => {
    if (clipboardState.value) {
      toast.success(`Copied ${clipboardState.value}!`);
    }
  }, [clipboardState]);

  React.useEffect(() => {
    if (!scoresLoaded || !showScores) {
      return;
    }

    router.replace(`/results#${session}`);
  }, [router, scoresLoaded, session, showScores]);

  const copySessionId = React.useCallback(() => {
    copyToClipboard(
      `${window.location.origin}${window.location.pathname}#${session}`,
    );
  }, [copyToClipboard, session]);

  const confirm = msg => {
    if (!confirmEnabled) {
      return true;
    }
    return window.confirm(msg);
  };

  const goToResults = React.useCallback(() => {
    if (!confirm('Reset votes and open results?')) {
      return;
    }
    resetScores(session);
    toggleScores(true);
    router.replace(`/results#${session}`);
  }, [router, session, confirmEnabled, toggleScores]);

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <h1>Voting Stage</h1>
        <p>Pick a card, then reveal when everyone is ready.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.copy} onClick={copySessionId}>
          Copy session link
        </button>
        <button
          className={styles.route}
          disabled={!showScores && !isModerator}
          onClick={goToResults}
          title={
            !showScores && !isModerator
              ? 'Enable moderator controls or reveal cards to open results'
              : ''
          }
        >
          Open results
        </button>
      </div>

      <UserList me={user} users={users} scores={scores} />
      <ScoreCards
        session={session}
        options={POINT_SEQUENCES[sequence]}
        selectedScore={userScore?.score}
      />
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
        onModeratorChange={setIsModerator}
      />
    </section>
  );
};

export default VotingScreen;
