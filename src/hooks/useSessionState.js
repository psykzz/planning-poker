import React from 'react';
import { addSubscription, removeSubscription } from '../api/client';
import {
  fetchOption,
  submitOption,
  OPT_CONFIRM_DEFAULT,
  OPT_CONFIRM_KEY,
  OPT_POINT_SEQ_DEFAULT,
  OPT_POINT_KEY,
} from '../api/options';
import { fetchScores, updateAllScores } from '../api/scores';
import { createUser, fetchAllUsers, updateUserPresence } from '../api/users';

export const REMOVE_SCORE = '-';
export const POINT_SEQUENCES = {
  fibonacci: [REMOVE_SCORE, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
  scrum: [REMOVE_SCORE, '☕', '?', 0, 1, 2, 3, 5, 8, 13, 20, 40, 100],
  standard: [REMOVE_SCORE, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};
const POINT_SEQUENCES_SORTED = Object.keys(POINT_SEQUENCES).sort();

function parseISOString(s) {
  const b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

export const useSessionState = ({ session, localUser }) => {
  const [user, setUser] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [scores, setScores] = React.useState([]);
  const [confirmEnabled, setConfirmEnabled] = React.useState(
    OPT_CONFIRM_DEFAULT === 'true',
  );
  const [sequence, setSequence] = React.useState(OPT_POINT_SEQ_DEFAULT);

  const showScores = scores.length > 0 && scores.every(score => score.revealed);
  const nextSequence =
    POINT_SEQUENCES_SORTED[
      (POINT_SEQUENCES_SORTED.indexOf(sequence) + 1) %
        POINT_SEQUENCES_SORTED.length
    ];

  const updateUsers = React.useCallback(async currentSession => {
    if (!currentSession) return;
    const allUsers = await fetchAllUsers(currentSession);
    const now = new Date();
    const afkSeconds = 30; // 3 * the presence timer
    const activeUsers = allUsers.filter(
      currentUser =>
        parseISOString(currentUser.last_presence) >
        now.setSeconds(now.getSeconds() - afkSeconds),
    );
    setUsers(activeUsers);
  }, []);

  const updatePresence = React.useCallback(
    async (currentSession, currentUser) => {
      if (!currentSession || !currentUser?.id) return;
      await updateUserPresence(
        currentSession,
        currentUser.id,
        new Date().toISOString(),
      );
      await updateUsers(currentSession);
    },
    [updateUsers],
  );

  const getOrCreateUser = React.useCallback(
    async (currentSession, candidate) => {
      if (!currentSession || !candidate?.id || !candidate?.name) {
        return;
      }

      const newUser = await createUser(currentSession, candidate);
      setUser(newUser);
    },
    [],
  );

  const updateScores = React.useCallback(async currentSession => {
    if (!currentSession) return;
    const nextScores = await fetchScores(currentSession);
    setScores(nextScores);
  }, []);

  const updateScore = React.useCallback(payload => {
    const oldUser = payload.new?.user_id;
    const newScore = {
      user_id: payload.new?.user_id,
      score: payload.new?.score,
      revealed: payload.new?.revealed,
    };
    setScores(currentScores => [
      ...currentScores.filter(score => score.user_id !== oldUser),
      newScore,
    ]);
  }, []);

  const removeScore = React.useCallback(payload => {
    const oldUser = payload.old?.user_id;
    setScores(currentScores => [
      ...currentScores.filter(score => score.user_id !== oldUser),
    ]);
  }, []);

  const updateSessionOptions = React.useCallback(async currentSession => {
    if (!currentSession) return;
    const pointSequence = await fetchOption(
      currentSession,
      OPT_POINT_KEY,
      OPT_POINT_SEQ_DEFAULT,
    );
    setSequence(pointSequence);
    // Confirm option is per-user, so not set for all users in session
  }, []);

  React.useEffect(() => {
    if (!session) return;
    const subscriptionId = addSubscription(session, 'scores', payload => {
      if (payload.eventType === 'DELETE') {
        removeScore(payload);
      } else {
        updateScore(payload);
      }
    });
    updateScores(session);
    return () => removeSubscription(subscriptionId);
  }, [session, removeScore, updateScore, updateScores]);

  React.useEffect(() => {
    if (!session) return;
    const subscriptionId = addSubscription(session, 'options', payload => {
      switch (payload.new?.key) {
        case OPT_CONFIRM_KEY:
          setConfirmEnabled(payload.new?.value === 'true');
          break;
        case OPT_POINT_KEY:
          setSequence(payload.new?.value || OPT_POINT_SEQ_DEFAULT);
          break;
        default:
          console.warn('Unknown option change', payload);
          break;
      }
    });
    updateSessionOptions(session);
    return () => removeSubscription(subscriptionId);
  }, [session, updateSessionOptions]);

  React.useEffect(() => {
    getOrCreateUser(session, localUser);
  }, [session, localUser, getOrCreateUser]);

  React.useEffect(() => {
    updateUsers(session);

    if (user?.id) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [session, user, updateUsers]);

  React.useEffect(() => {
    if (!session || !user?.id) return;
    const interval = setInterval(() => {
      updatePresence(session, user);
    }, 10000);
    updatePresence(session, user);
    return () => clearInterval(interval);
  }, [user, session, updatePresence]);

  React.useEffect(() => {
    if (!session || !user?.id) return;
    const onFocus = () => updatePresence(session, user);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, session, updatePresence]);

  const toggleScores = React.useCallback(
    (shouldUpdateAllScores = true) => {
      if (shouldUpdateAllScores) {
        updateAllScores(session, !showScores);
      }
    },
    [session, showScores],
  );

  const toggleConfirm = React.useCallback(() => {
    // Confirm option is per-user only, so set locally but not in the session database
    setConfirmEnabled(current => !current);
  }, []);

  const cycleSequence = React.useCallback(() => {
    submitOption(session, OPT_POINT_KEY, nextSequence);
    setSequence(nextSequence);
  }, [session, nextSequence]);

  return {
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
  };
};
