import React from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { ModeratorControls } from '../ModeratorControls';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import * as styles from './planningpoker.module.css';

const CopySession = session => {
  const [state, copyToClipboard] = useCopyToClipboard();
  console.log({ session });
  const copySessionId = React.useCallback(
    () =>
      copyToClipboard(
        `${window.location.origin}${window.location.pathname}#${session.sessionId}`,
      ),
    [session, copyToClipboard],
  );
  React.useEffect(() => {
    state.value && toast.success(`Copied ${state.value}!`);
  }, [state]);
  return (
    <div className={styles.copy_notice} onClick={copySessionId}>
      click to copy url
    </div>
  );
};

export const PlanningPoker = ({ session, user: localUser }) => {
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

  return (
    <>
      <Head>
        <title>Planning Poker - {session}</title>
      </Head>
      <CopySession sessionId={session} />
      <UserList me={user} users={users} scores={scores} />
      <ScoreCards session={session} options={POINT_SEQUENCES[sequence]} />
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
