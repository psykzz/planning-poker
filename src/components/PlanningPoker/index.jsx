import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import { resetScoresWithRound } from '../../api/rounds';
import * as styles from './planningpoker.module.css';

const CopySession = session => {
  const [state, copyToClipboard] = useCopyToClipboard();
  const copySessionId = React.useCallback(
    () =>
      copyToClipboard(
        `${window.location.origin}${window.location.pathname}#${session.sessionId}`,
      ),
    [session, copyToClipboard],
  );
  React.useEffect(() => {
    if (state.value) {
      toast.success(`Copied ${state.value}!`);
    }
  }, [state]);

  return (
    <button
      type="button"
      className={styles.copy_notice}
      onClick={copySessionId}
    >
      Copy session URL
    </button>
  );
};

export const PlanningPoker = ({ session, user: localUser }) => {
  const router = useRouter();
  const {
    user,
    users,
    scores,
    confirmEnabled,
    sequence,
    showScores,
    nextSequence,
    isModerator,
    toggleScores,
    cycleSequence,
  } = useSessionState({ session, localUser });
  const userScore = scores.find(score => score.user_id === user?.id);
  const goToNewScreen = React.useCallback(() => {
    router.push(`/${showScores ? 'results' : 'voting'}#${session}`);
  }, [router, session, showScores]);

  return (
    <>
      <Head>
        <title>Planning Poker - {session}</title>
      </Head>
      <button
        type="button"
        className={styles.new_screen_button}
        onClick={goToNewScreen}
      >
        Use new {showScores ? 'results' : 'voting'} screen
      </button>
      <CopySession sessionId={session} />
      <UserList me={user} users={users} scores={scores} />
      <ScoreCards
        session={session}
        options={POINT_SEQUENCES[sequence]}
        selectedScore={userScore?.score}
      />
      {isModerator && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '16px',
          }}
        >
          <button
            type="button"
            onClick={() =>
              (!confirmEnabled ||
                window.confirm(
                  `${showScores ? 'Hide' : 'Reveal'} all cards?`,
                )) &&
              toggleScores(true)
            }
          >
            {showScores ? 'Hide' : 'Reveal'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirmEnabled || window.confirm('Reset all scores?')) {
                toggleScores(false);
                resetScoresWithRound(session, scores, users);
              }
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !confirmEnabled ||
                window.confirm(`Switch to ${nextSequence} cards?`)
              ) {
                cycleSequence();
              }
            }}
          >
            Use {nextSequence} cards
          </button>
        </div>
      )}
    </>
  );
};
export default PlanningPoker;
