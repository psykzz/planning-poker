import React from 'react';
import * as styles from './userlist.module.css';
import { SCORE_ICON_MAP } from '../../api/scores';
import { scoreStats } from '../../utils/scoreStats';

export const UserList = ({ me, users, scores, forceReveal = false }) => {
  const userById = React.useMemo(() => {
    const byId = {};
    (users || []).forEach(user => {
      byId[user.id] = user;
    });
    return byId;
  }, [users]);

  const scoringUserScores = React.useMemo(
    () =>
      (scores || []).filter(score => {
        const scoreUser = userById[score.user_id];
        return !scoreUser?.is_spectator;
      }),
    [scores, userById],
  );

  const { numericScores, lowest, highest, avg, stddev } = React.useMemo(
    () => scoreStats(scoringUserScores),
    [scoringUserScores],
  );

  const { highestUsers, lowestUsers } = React.useMemo(() => {
    if (!numericScores.length || highest == null || lowest == null) {
      return { highestUsers: [], lowestUsers: [] };
    }

    const numericUserScores = scoringUserScores.filter(
      score => score.score >= 0,
    );
    const getNamesForValue = value =>
      numericUserScores
        .filter(score => score.score === value)
        .map(score => userById[score.user_id]?.name || 'Unknown')
        .filter((name, index, names) => names.indexOf(name) === index);

    return {
      highestUsers: getNamesForValue(highest),
      lowestUsers: getNamesForValue(lowest),
    };
  }, [numericScores.length, highest, lowest, scoringUserScores, userById]);

  const formatSummaryStat = (value, names) => {
    if (value == null) return '-';
    if (!names?.length) return value;
    return `${value} (${names.join(', ')})`;
  };

  const scoreByUser = React.useMemo(() => {
    const byUser = {};
    scores?.forEach(score => {
      byUser[score.user_id] = score;
    });
    return byUser;
  }, [scores]);

  const showScores =
    forceReveal || (scores.length > 0 && scores.every(score => score.revealed));

  const { votingUsers, spectatorUsers } = React.useMemo(() => {
    const ordered = [...(users || [])].sort((a, b) => a.id.localeCompare(b.id));
    if (showScores) {
      ordered.sort((a, b) => {
        if (a.is_spectator !== b.is_spectator) {
          return a.is_spectator ? 1 : -1;
        }
        return (
          (scoreByUser[b.id]?.score ?? 0) - (scoreByUser[a.id]?.score ?? 0)
        );
      });
    }
    return {
      votingUsers: ordered.filter(u => !u.is_spectator),
      spectatorUsers: ordered.filter(u => u.is_spectator),
    };
  }, [users, showScores, scoreByUser]);

  const Score = ({ isMe, score }) => {
    if (!score) {
      return <div className={styles.score}>-</div>;
    }
    if (!forceReveal && !score.revealed && !isMe) {
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
        <div className={`${styles.name} ${isMe ? styles.me : ''}`}>
          {user.name}
          {isMe ? ' (You)' : ''}
        </div>
        <div className={`${styles.card} ${styles.no_hover}`}>
          <Score {...{ isMe, score }} />
        </div>
      </li>
    );
  };

  return (
    <section
      className={`${styles.user_list} ${
        votingUsers?.length > 5 && styles.two_columns
      } ${showScores && styles.show_scores}`}
    >
      {spectatorUsers.length > 0 && (
        <p className={styles.spectators_line}>
          <span className={styles.spectators_label}>Spectators:</span>{' '}
          {spectatorUsers.map((u, i) => (
            <span key={u.id}>
              {u.id === me?.id ? <strong>{u.name} (You)</strong> : u.name}
              {i < spectatorUsers.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}
      <ul className={styles.users}>
        {votingUsers?.map(user => (
          <User key={user.id} user={user} />
        ))}
      </ul>

      {!!showScores && (
        <aside className={styles.averages}>
          <h3>Score Averages</h3>
          <div>Highest: {formatSummaryStat(highest, highestUsers)}</div>
          <div>Lowest: {formatSummaryStat(lowest, lowestUsers)}</div>
          <div>Std Dev: {stddev?.toFixed ? stddev.toFixed(2) : '-'}</div>
          <div>Average: {avg?.toFixed ? avg.toFixed(2) : '-'}</div>
        </aside>
      )}
    </section>
  );
};
