import React from 'react';
import { Helmet } from 'react-helmet';
import { removeSubscription } from '../../api/client';
import { getScores, onNewScores, updateAllScores } from '../../api/scores';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUserPresence,
} from '../../api/users';
import { ModeratorControls } from '../ModeratorControls';
import { ScoreCards } from '../ScoreCards';
import { UserList } from '../UserList';

import * as styles from './planningpoker.module.css';

function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

export const PlanningPoker = ({ session, user: localUser }) => {
  const [user, setUser] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [scores, setScores] = React.useState([]);
  const [showScores, setShowScores] = React.useState(false);

  const updateUsers = async session => {
    const users = await getAllUsers(session);
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

  const updatePresence = async (session, user) => {
    await updateUserPresence(user.id, session, new Date().toISOString());
    await updateUsers(session);
  };

  const getOrCreateUser = async (session, user) => {
    const existingUser = await getUser(user.id);
    if (existingUser) {
      setUser(existingUser);
      return;
    }
    const newUser = await createUser(user.name, session);
    setUser(newUser);
  };

  const updateScores = async session => {
    const scores = await getScores(session);
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

  React.useEffect(() => {
    const subcriptionId = onNewScores(session, payload => {
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
  }, [user, session]);

  React.useEffect(() => {
    const onFocus = () => updatePresence(session, user);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, session]);

  const toggleScores = React.useCallback(
    (updateScores = true) => {
      console.log('Toggling scores', !showScores);
      if (updateScores) {
        updateAllScores(session, !showScores);
      }
      setShowScores(!showScores);
    },
    [session, showScores]
  );

  return (
    <>
      <Helmet>
        <title>Planning Poker - {session}</title>
      </Helmet>
      <UserList me={user} users={users} scores={scores} />
      <ScoreCards session={session} options={[0, 1, 2, 3, 5, 8, 13, 21]} />
      <ModeratorControls {...{ session, showScores, toggleScores }} />
    </>
  );
};
export default PlanningPoker;
