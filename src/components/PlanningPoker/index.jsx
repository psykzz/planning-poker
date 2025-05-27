import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { addSubscription, removeSubscription } from '../../api/client';
import {
  fetchOption,
  submitOption,
  OPT_CONFIRM_DEFAULT,
  OPT_CONFIRM_KEY,
  OPT_POINT_SEQ_DEFAULT,
  OPT_POINT_KEY,
} from '../../api/options';
import { fetchScores, updateAllScores } from '../../api/scores';
import {
  createUser,
  fetchAllUsers,
  fetchUser,
  updateUserPresence,
} from '../../api/users';
import { ModeratorControls } from '../ModeratorControls';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';
import * as styles from './planningpoker.module.css';

// This is a special value that will trigger deleteing a score.
const REMOVE_SCORE = '-';
const POINT_SEQUENCES = {
  fibonacci: [REMOVE_SCORE, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
  scrum: [REMOVE_SCORE, '☕', '?', 0, 1, 2, 3, 5, 8, 13, 20, 40, 100],
  standard: [REMOVE_SCORE, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};
const POINT_SEQUENCES_SORTED = Object.keys(POINT_SEQUENCES).sort();

function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

const CopySession = session => {
  const [state, copyToClipboard] = useCopyToClipboard();
  console.log({ session });
  const copySessionId = React.useCallback(
    () =>
      copyToClipboard(
        `${window.location.origin}${window.location.pathname}#${session.sessionId}`
      ),
    [session, copyToClipboard]
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
  const [user, setUser] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [scores, setScores] = React.useState([]);
  const [confirmEnabled, setConfirmEnabled] = React.useState(
    OPT_CONFIRM_DEFAULT === 'true'
  );
  const [sequence, setSequence] = React.useState(OPT_POINT_SEQ_DEFAULT);

  const showScores = scores.length && scores.every(score => score.revealed);
  const nextSequence =
    POINT_SEQUENCES_SORTED[
      (POINT_SEQUENCES_SORTED.indexOf(sequence) + 1) %
        POINT_SEQUENCES_SORTED.length
    ];

  const updateUsers = async session => {
    const users = await fetchAllUsers(session);
    const now = new Date();
    const afkSeconds = 30; // 3 * the presence timer
    // filter users afk great than the limit
    const activeUsers = users.filter(
      user =>
        parseISOString(user.last_presence) >
        now.setSeconds(now.getSeconds() - afkSeconds)
    );
    setUsers(activeUsers);
  };

  const updatePresence = React.useCallback(async (session, user) => {
    await updateUserPresence(session, user.id, new Date().toISOString());
    await updateUsers(session);
  }, []);

  const getOrCreateUser = async (session, user) => {
    const existingUser = await fetchUser(user.id);
    if (existingUser) {
      setUser(existingUser);
      return;
    }
    const newUser = await createUser(session, user.name);
    setUser(newUser);
  };

  const updateScores = async session => {
    const scores = await fetchScores(session);
    setScores(scores);
  };

  const updateScore = payload => {
    const oldUser = payload.new?.user_id;
    const newScore = {
      user_id: payload.new?.user_id,
      score: payload.new?.score,
      revealed: payload.new?.revealed,
    };
    setScores(scores => [
      ...scores.filter(score => score.user_id !== oldUser),
      newScore,
    ]);
  };

  const removeScore = payload => {
    const oldUser = payload.old?.user_id;
    setScores(scores => [...scores.filter(score => score.user_id !== oldUser)]);
  };

  const updateSessionOptions = async session => {
    const pointSequence = await fetchOption(
      session,
      OPT_POINT_KEY,
      OPT_POINT_SEQ_DEFAULT
    );
    setSequence(pointSequence);
    // Confirm option is per-user, so not set for all users in session
  };

  React.useEffect(() => {
    const subcriptionId = addSubscription(session, 'scores', payload => {
      if (payload.eventType === 'DELETE') {
        removeScore(payload);
      } else {
        updateScore(payload);
      }
    });
    updateScores(session);
    return () => removeSubscription(subcriptionId);
  }, [session]);

  React.useEffect(() => {
    const subcriptionId = addSubscription(session, 'options', payload => {
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
    return () => removeSubscription(subcriptionId);
  }, [session]);

  React.useEffect(() => {
    getOrCreateUser(session, localUser);
  }, [session, localUser]);

  React.useEffect(() => {
    updateUsers(session);

    if (user?.id) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [session, user]);

  React.useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      updatePresence(session, user);
    }, 10000);
    // trigger one now
    updatePresence(session, user);
    return () => clearInterval(interval);
  }, [user, session, updatePresence]);

  React.useEffect(() => {
    const onFocus = () => updatePresence(session, user);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, session, updatePresence]);

  const toggleScores = React.useCallback(
    (shouldUpdateAllScores = true) => {
      console.log('Toggling scores', !showScores);
      if (shouldUpdateAllScores) {
        updateAllScores(session, !showScores);
      }
    },
    [session, showScores]
  );

  const toggleConfirm = React.useCallback(() => {
    console.log('Toggling confirm', !confirmEnabled);
    // Confirm option is per-user only, so set locally but not in the session database
    setConfirmEnabled(!confirmEnabled);
  }, [confirmEnabled]);

  const cycleSequence = React.useCallback(() => {
    console.log('Cycling sequence', nextSequence);
    submitOption(session, OPT_POINT_KEY, nextSequence);
    setSequence(nextSequence);
  }, [session, nextSequence]);

  return (
    <>
      <Helmet>
        <title>Planning Poker - {session}</title>
      </Helmet>
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
