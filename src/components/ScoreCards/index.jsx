import React from 'react';
import { toast } from 'react-toastify';
import { submitScore, deleteScore, ICON_SCORE_MAP } from '../../api/scores';
import { getStoredUser } from '../../utils/userStorage';

import * as styles from './scorecards.module.css';

export const ScoreCards = ({ options, session, selectedScore }) => {
  const onSelectCard = React.useCallback(
    async value => {
      const user = getStoredUser();
      if (!user?.id) return;

      const deleteValue = '-';
      const scoreValue = ICON_SCORE_MAP[value] || value;

      try {
        if (value === deleteValue) {
          await deleteScore(session, user.id);
        } else {
          await submitScore(session, user.id, scoreValue);
        }
      } catch (error) {
        toast.error('Could not submit score. Please try again.');
        console.warn('Failed to submit score', error);
      }
    },
    [session],
  );

  const isSelected = React.useCallback(
    option => {
      if (option === '-') {
        return false;
      }
      return (ICON_SCORE_MAP[option] || option) === selectedScore;
    },
    [selectedScore],
  );

  return (
    <div className={styles.card_container}>
      <div className={styles.options} role="group" aria-label="Score cards">
        {options.map(opt => (
          <button
            type="button"
            key={`${ICON_SCORE_MAP[opt] || opt}`}
            id={`score_val_${ICON_SCORE_MAP[opt] || opt}`}
            className={`${styles.card} ${isSelected(opt) ? styles.card_selected : ''}`}
            onClick={() => onSelectCard(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
