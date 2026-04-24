import React from 'react';
import { addSubscription, removeSubscription } from '../api/client';
import {
  fetchOption,
  submitOption,
  OPT_CONFIRM_DEFAULT,
  OPT_CONFIRM_KEY,
  OPT_MODERATORS_KEY,
  OPT_POINT_SEQ_DEFAULT,
  OPT_POINT_KEY,
  OPT_SESSION_NAME_KEY,
  OPT_STAGE_KEY,
  OPT_STAGE_DEFAULT,
  moderatorKey,
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

function parseModeratorIds(value) {
  const entries = (value || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
  return [...new Set(entries)];
}

export const useSessionState = ({ session, localUser }) => {
  const [user, setUser] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [scores, setScores] = React.useState([]);
  const [scoresLoaded, setScoresLoaded] = React.useState(false);
  const [confirmEnabled, setConfirmEnabled] = React.useState(
    OPT_CONFIRM_DEFAULT === 'true',
  );
  const [sequence, setSequence] = React.useState(OPT_POINT_SEQ_DEFAULT);
  const [isModerator, setIsModerator] = React.useState(false);
  const [sessionDisplayName, setSessionDisplayNameState] = React.useState('');
  const [stage, setStageState] = React.useState(null);

  const showScores = scores.length > 0 && scores.every(score => score.revealed);
  const nextSequence =
    POINT_SEQUENCES_SORTED[
      (POINT_SEQUENCES_SORTED.indexOf(sequence) + 1) %
        POINT_SEQUENCES_SORTED.length
    ];

  const updateUsers = React.useCallback(async currentSession => {
    if (!currentSession) return;
    const allUsers = await fetchAllUsers(currentSession);
    const afkSeconds = 30; // 3 * the presence timer
    const cutoffTimestamp = Date.now() - afkSeconds * 1000;
    const activeUsers = allUsers.filter(
      currentUser =>
        parseISOString(currentUser.last_presence).getTime() >
        cutoffTimestamp,
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
    setScoresLoaded(true);
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

  const updateSessionOptions = React.useCallback(
    async (currentSession, currentUserId) => {
      if (!currentSession) return;
      const pointSequence = await fetchOption(
        currentSession,
        OPT_POINT_KEY,
        OPT_POINT_SEQ_DEFAULT,
      );
      setSequence(pointSequence);

      const confirm = await fetchOption(
        currentSession,
        OPT_CONFIRM_KEY,
        OPT_CONFIRM_DEFAULT,
      );
      setConfirmEnabled(confirm === 'true');

      const displayName = await fetchOption(
        currentSession,
        OPT_SESSION_NAME_KEY,
        '',
      );
      setSessionDisplayNameState(displayName);

      const currentStage = await fetchOption(
        currentSession,
        OPT_STAGE_KEY,
        OPT_STAGE_DEFAULT,
      );
      setStageState(currentStage);

      if (currentUserId) {
        const moderatorsValue = await fetchOption(
          currentSession,
          OPT_MODERATORS_KEY,
          '',
        );
        const moderatorIds = parseModeratorIds(moderatorsValue);

        if (moderatorIds.includes(currentUserId)) {
          setIsModerator(true);
          return;
        }

        const legacyModValue = await fetchOption(
          currentSession,
          moderatorKey(currentUserId),
          'false',
        );
        const isLegacyModerator = legacyModValue === 'true';
        setIsModerator(isLegacyModerator);

        if (isLegacyModerator) {
          submitOption(
            currentSession,
            OPT_MODERATORS_KEY,
            [...new Set([...moderatorIds, currentUserId])].join(','),
          );
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!session) return;
    setScoresLoaded(false);
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
      const key = payload.new?.key;
      switch (key) {
        case OPT_CONFIRM_KEY:
          setConfirmEnabled(payload.new?.value === 'true');
          break;
        case OPT_POINT_KEY:
          setSequence(payload.new?.value || OPT_POINT_SEQ_DEFAULT);
          break;
        case OPT_SESSION_NAME_KEY:
          setSessionDisplayNameState(payload.new?.value || '');
          break;
        case OPT_STAGE_KEY:
          setStageState(payload.new?.value || OPT_STAGE_DEFAULT);
          break;
        case OPT_MODERATORS_KEY:
          if (user?.id) {
            const moderatorIds = parseModeratorIds(payload.new?.value);
            setIsModerator(moderatorIds.includes(user.id));
          }
          break;
        default:
          if (key?.startsWith('moderator:')) {
            // Keep legacy option behavior for older sessions.
            if (key === moderatorKey(user?.id)) {
              setIsModerator(payload.new?.value === 'true');
            }
          }
          break;
      }
    });
    updateSessionOptions(session, user?.id);
    return () => removeSubscription(subscriptionId);
  }, [session, user?.id, updateSessionOptions]);

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
    const next = !confirmEnabled;
    setConfirmEnabled(next);
    submitOption(session, OPT_CONFIRM_KEY, next.toString());
  }, [session, confirmEnabled]);

  const cycleSequence = React.useCallback(() => {
    submitOption(session, OPT_POINT_KEY, nextSequence);
    setSequence(nextSequence);
  }, [session, nextSequence]);

  const setModeratorStatus = React.useCallback(
    async value => {
      if (!session || !user?.id) return;
      setIsModerator(value);

      const moderatorsValue = await fetchOption(
        session,
        OPT_MODERATORS_KEY,
        '',
      );
      const moderatorIds = parseModeratorIds(moderatorsValue);
      const nextModeratorIds = value
        ? [...new Set([...moderatorIds, user.id])]
        : moderatorIds.filter(currentId => currentId !== user.id);

      submitOption(session, OPT_MODERATORS_KEY, nextModeratorIds.join(','));
    },
    [session, user],
  );

  const setSessionDisplayName = React.useCallback(
    name => {
      if (!session) return;
      setSessionDisplayNameState(name);
      submitOption(session, OPT_SESSION_NAME_KEY, name);
    },
    [session],
  );

  const setUserName = React.useCallback(
    async name => {
      const normalizedName = name?.trim();
      if (!session || !user?.id || !normalizedName) return;
      const updatedUser = await createUser(session, {
        ...user,
        name: normalizedName,
      });
      setUser(updatedUser);
      setUsers(currentUsers =>
        currentUsers.map(currentUser =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
    },
    [session, user],
  );

  const setStage = React.useCallback(
    value => {
      if (!session) return;
      setStageState(value);
      submitOption(session, OPT_STAGE_KEY, value);
    },
    [session],
  );

  return {
    user,
    users,
    scores,
    scoresLoaded,
    confirmEnabled,
    sequence,
    showScores,
    nextSequence,
    stage,
    isModerator,
    sessionDisplayName,
    toggleScores,
    toggleConfirm,
    cycleSequence,
    setModeratorStatus,
    setSessionDisplayName,
    setStage,
    setUserName,
  };
};
