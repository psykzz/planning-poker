import React from 'react';
import * as styles from './userlist.module.css';

const standardDeviation = array => {
  const n = array.length;
  if (!n) return NaN;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
};

const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

export const UserList = ({ me, users, scores }) => {
  const [vibrating, setVibrating] = React.useState(false);
  let lowest = React.useMemo(
    () => Math.min(...scores.map(score => score.score)),
    [scores]
  );
  let highest = React.useMemo(
    () => Math.max(...scores.map(score => score.score)),
    [scores]
  );
  let stddev = React.useMemo(
    () => standardDeviation(scores.map(score => score.score)),
    [scores]
  );
  let avg = React.useMemo(
    () => average(scores.map(score => score.score)),
    [scores]
  );
  const scoreByUser = {};
  scores?.forEach(score => {
    scoreByUser[score.user_id] = score;
  });

  const showScores = scores.length && scores.every(score => score.revealed);

  // Vibration effect
  // useVibrate(vibrating, [100, 0, 100]);
  // let timer = null;
  // React.useEffect(() => {
  //   if (!timer && showScores) {
  //     setVibrating(true);
  //     timer = setTimeout(() => {
  //       setVibrating(false);
  //     }, 1000);
  //   } else if (timer && !showScores) {
  //     clearTimeout(timer);
  //   }
  // }, [showScores]);

  // Stops the user list jumping around
  users?.sort((a, b) => a.id.localeCompare(b.id));
  try {
    // Try to sort by score as well.
    users?.sort((a,b) => (scoreByUser?.[a.id] ?? 0) > (scoreByUser?.[b.id] ?? 0));
  catch (e) { console.error(e); }
  const resetName = () => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem('user');
    window.location.reload();
  };

  const Score = ({ isMe, score }) => {
    if (!score) {
      return <div className={styles.score}>-</div>;
    }
    if (!score.revealed && !isMe) {
      return <div className={styles.score}>?</div>;
    }
    return <div className={styles.score}>{score.score}</div>;
  };

  const User = ({ user }) => {
    const isMe = user.id === me?.id;
    const score = scoreByUser[user.id];
    return (
      <div key={user.id} className={`${styles.user} ${isMe && styles.self}`}>
        <div
          className={`${styles.name} ${isMe && styles.me}`}
          onClick={() =>
            isMe && window.confirm('Reset your name?') && resetName()
          }
        >
          {user.name} {isMe && '(You)'}
        </div>
        <div className={`${styles.card} ${styles.no_hover}`}>
          <Score {...{ isMe, score }} />
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.user_list} ${showScores && styles.show_scores}`}>
      {users?.map(user => (
        <User key={user.id} user={user} />
      ))}

      {!!showScores && (
        <div className={styles.averages}>
          <h3>Score Averages</h3>
          <div>Highest: {highest}</div>
          <div>Lowest: {lowest}</div>
          <div>Std Dev: {stddev}</div>
          <div>Average: {avg}</div>
        </div>
      )}
    </div>
  );
};
