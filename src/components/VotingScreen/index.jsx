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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const {
    user,
    users,
    scores,
    sequence,
    stage,
    isModerator,
    isSpectator,
    sessionDisplayName,
    confirmEnabled,
    toggleConfirm,
    setModeratorStatus,
    setSpectatorStatus,
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

  const navigatingRef = React.useRef(false);
  React.useEffect(() => {
    if (stage !== 'results' || navigatingRef.current) {
      return;
    }
    navigatingRef.current = true;
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

  const becomeSpectator = React.useCallback(async () => {
    try {
      await setSpectatorStatus(true);
    } catch (error) {
      toast.error('Could not switch to spectator mode. Please try again.');
      console.warn('Failed to switch spectator status', error);
    }
  }, [setSpectatorStatus]);

  const stopSpectating = React.useCallback(async () => {
    try {
      await setSpectatorStatus(false);
    } catch (error) {
      toast.error('Could not leave spectator mode. Please try again.');
      console.warn('Failed to switch spectator status', error);
    }
  }, [setSpectatorStatus]);

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
        isSpectator={isSpectator}
        sessionDisplayName={sessionDisplayName}
        toggleConfirm={toggleConfirm}
        setModeratorStatus={setModeratorStatus}
        setSpectatorStatus={setSpectatorStatus}
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

        <div className={styles.scrollable_content}>
          <UserList me={user} users={users} scores={scores} />
          <button
            type="button"
            className={styles.invite_line}
            onClick={copySessionId}
          >
            invite new members +
          </button>
          <div className={styles.sticky_cards}>
            {isSpectator ? (
              <p className={styles.spectator_hint}>
                Spectator mode is enabled.{' '}
                <button
                  type="button"
                  className={styles.spectator_stop_link}
                  onClick={stopSpectating}
                >
                  Stop spectating
                </button>
              </p>
            ) : (
              <ScoreCards
                session={session}
                options={POINT_SEQUENCES[sequence]}
                selectedScore={userScore?.score}
                onBecomeSpectator={becomeSpectator}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VotingScreen;
