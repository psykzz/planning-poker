import React from 'react';
import { submitScore, deleteScore, ICON_SCORE_MAP } from '../../api/scores';

import * as styles from './scorecards.module.css';

export const ScoreCards = ({ options, session }) => {
  const onSelectCard = value => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user.id) return;

    const deleteValue = '-';
    if (value === deleteValue) {
      deleteScore(session, user.id);
    } else {
      submitScore(session, user.id, ICON_SCORE_MAP[value] || value);
    }

    const cardElements = document.querySelectorAll('[id^="score_val_"]');
    cardElements.forEach(card => {
      card.style.backgroundColor = '';
      card.style.borderColor = '';
    });

    if (value !== deleteValue) {
      const cardElement = document.getElementById(
        `score_val_${ICON_SCORE_MAP[value] || value}`
      );
      if (cardElement) {
        cardElement.style.backgroundColor = 'var(--bg-color-2)';
        cardElement.style.borderColor = 'var(--color-discord-blue)';
      }
    }
  };

  return (
    <div className={styles.card_container}>
      <div className={styles.options}>
        {options.map(opt => (
          <div
            key={`${ICON_SCORE_MAP[opt] || opt}`}
            id={`score_val_${ICON_SCORE_MAP[opt] || opt}`}
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
