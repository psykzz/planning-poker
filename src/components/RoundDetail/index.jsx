import React from 'react';
import { SCORE_ICON_MAP } from '../../api/scores';
import { scoreStats } from '../../utils/scoreStats';
import * as styles from './rounddetail.module.css';

export const RoundDetail = ({ round }) => {
  const scores = React.useMemo(() => round?.scores || [], [round]);

  const { numericScores, lowest, highest } = React.useMemo(
    () => scoreStats(scores),
    [scores],
  );

  const sortedScores = React.useMemo(
    () =>
      [...scores].sort((a, b) => {
        const aScore = Number(a.score);
        const bScore = Number(b.score);
        const aIsNumeric = Number.isFinite(aScore) && aScore >= 0;
        const bIsNumeric = Number.isFinite(bScore) && bScore >= 0;

        if (aIsNumeric && bIsNumeric) {
          return bScore - aScore;
        }
        if (aIsNumeric) {
          return -1;
        }
        if (bIsNumeric) {
          return 1;
        }
        return String(a.score).localeCompare(String(b.score));
      }),
    [scores],
  );

  if (!scores.length) {
    return <div className={styles.empty}>No scores in this round</div>;
  }

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
