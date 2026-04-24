import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { ModeratorControls } from '../ModeratorControls';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
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
    toggleScores,
    toggleConfirm,
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
    </>
  );
};
export default PlanningPoker;
