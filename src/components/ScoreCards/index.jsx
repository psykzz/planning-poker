import React from 'react';
import { submitScore, deleteScore } from '../../api/scores';

import * as styles from './scorecards.module.css';

export const ScoreCards = ({ options, session }) => {
  const onSelectCard = value => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user.id) return;

    if (value === '-') {
      deleteScore(session, user.id);
    } else {
      submitScore(session, user.id, value);
    }
  };

  return (
    <div className={styles.card_container}>
      <div className={styles.options}>
        {options.map(opt => (
          <div
            key={opt}
            className={styles.card}
            onClick={() => onSelectCard(opt)}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};
