import React from 'react';
import { SCORE_ICON_MAP } from '../../api/scores';
import * as styles from './rounddetail.module.css';

export const RoundDetail = ({ round }) => {
  if (!round || !round.scores) {
    return <div className={styles.empty}>No scores in this round</div>;
  }

  const scores = round.scores || [];

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

  const sortedScores = React.useMemo(
    () => [...scores].sort((a, b) => (b.score >= 0 ? 1 : -1)),
    [scores],
  );

  return (
    <div className={styles.round_detail}>
      <div className={styles.scores_list}>
        {sortedScores.map(score => (
          <div key={score.user_id} className={styles.score_item}>
            <span className={styles.user_name}>{score.user_name}</span>
            <span className={styles.score_value}>
              {SCORE_ICON_MAP[score.score.toString()] || score.score}
            </span>
          </div>
        ))}
      </div>

      {numericScores.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.label}>Lowest:</span>
            <span className={styles.value}>{lowest}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Highest:</span>
            <span className={styles.value}>{highest}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundDetail;
