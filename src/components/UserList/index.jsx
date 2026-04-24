import React from 'react';
import * as styles from './userlist.module.css';
import { SCORE_ICON_MAP } from '../../api/scores';

const standardDeviation = array => {
  const n = array.length;
  if (!n) return NaN;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
};

const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

export const UserList = ({ me, users, scores }) => {
  const numericScores = React.useMemo(
    () => scores.filter(score => score.score >= 0).map(score => score.score),
    [scores],
  );
  const lowest = React.useMemo(
    () => (numericScores.length ? Math.min(...numericScores) : null),
    [numericScores],
  );
  const highest = React.useMemo(
    () => (numericScores.length ? Math.max(...numericScores) : null),
    [numericScores],
  );
  const stddev = React.useMemo(
    () => (numericScores.length ? standardDeviation(numericScores) : null),
    [numericScores],
  );
  const avg = React.useMemo(
    () => (numericScores.length ? average(numericScores) : null),
    [numericScores],
  );
  const scoreByUser = React.useMemo(() => {
    const byUser = {};
    scores?.forEach(score => {
      byUser[score.user_id] = score;
    });
    return byUser;
  }, [scores]);

  const showScores = scores.length && scores.every(score => score.revealed);

  const sortedUsers = React.useMemo(() => {
    const ordered = [...(users || [])].sort((a, b) => a.id.localeCompare(b.id));
    if (showScores) {
      return ordered.sort(
        (a, b) =>
          (scoreByUser[b.id]?.score ?? 0) - (scoreByUser[a.id]?.score ?? 0),
      );
    }
    return ordered;
  }, [users, showScores, scoreByUser]);

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
    return (
      <div className={styles.score}>
        {SCORE_ICON_MAP[score.score.toString()] || score.score}
      </div>
    );
  };

  const User = ({ user }) => {
    const isMe = user.id === me?.id;
    const score = scoreByUser[user.id];
    const hasSubmittedScore = !!score;
    return (
      <li
        key={user.id}
        className={`${styles.user} ${isMe && styles.self} ${hasSubmittedScore && styles.has_score}`}
      >
        {isMe ? (
          <button
            type="button"
            className={`${styles.name} ${styles.me} ${styles.name_button}`}
            onClick={() => window.confirm('Reset your name?') && resetName()}
          >
            {user.name} (You)
          </button>
        ) : (
          <div className={styles.name}>{user.name}</div>
        )}
        <div className={`${styles.card} ${styles.no_hover}`}>
          <Score {...{ isMe, score }} />
        </div>
      </li>
    );
  };

  return (
    <section
      className={`${styles.user_list} ${
        sortedUsers?.length > 5 && styles.two_columns
      } ${showScores && styles.show_scores}`}
    >
      <ul className={styles.users}>
        {sortedUsers?.map(user => (
          <User key={user.id} user={user} />
        ))}
      </ul>

      {!!showScores && (
        <aside className={styles.averages}>
          <h3>Score Averages</h3>
          <div>Highest: {highest ?? '-'}</div>
          <div>Lowest: {lowest ?? '-'}</div>
          <div>Std Dev: {stddev?.toFixed ? stddev.toFixed(2) : '-'}</div>
          <div>Average: {avg?.toFixed ? avg.toFixed(2) : '-'}</div>
        </aside>
      )}
    </section>
  );
};
