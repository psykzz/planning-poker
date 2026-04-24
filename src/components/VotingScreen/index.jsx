import React from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { useRouter } from 'next/router';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import * as styles from './votingscreen.module.css';

export const VotingScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const [clipboardState, copyToClipboard] = useCopyToClipboard();
  const { user, users, scores, sequence, stage, isModerator, sessionDisplayName, setStage } =
    useSessionState({ session, localUser });
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
    <section className={styles.screen}>
      <div className={styles.header}>
        <h1>{sessionDisplayName ? `${sessionDisplayName} - Voting` : 'Voting Stage'}</h1>
        <p>Pick a card, then reveal when everyone is ready.</p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.route}
          onClick={() => router.push(`/options#${session}`)}
        >
          Options
        </button>
        <button
          className={styles.route}
          disabled={!isModerator}
          onClick={goToResults}
          title={
            !isModerator ? 'Become a moderator in Options to open results' : ''
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
  );
};

export default VotingScreen;
