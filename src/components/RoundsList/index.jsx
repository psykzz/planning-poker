import React from 'react';
import { RoundDetail } from '../RoundDetail';
import * as styles from './roundslist.module.css';

const formatDate = date => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) {
    return 'Today';
  }

  if (d.getTime() === new Date(today.getTime() - 86400000).getTime()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = date => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const groupRoundsByDate = rounds => {
  const grouped = {};
  rounds.forEach(round => {
    const date = formatDate(round.created_at);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(round);
  });
  return grouped;
};

export const RoundsList = ({ rounds, selectedRound, onSelectRound }) => {
  const [expandedDate, setExpandedDate] = React.useState(null);

  const grouped = React.useMemo(() => groupRoundsByDate(rounds), [rounds]);

  if (rounds.length === 0) {
    return (
      <div className={styles.empty}>
        No rounds yet. Start voting to create one!
      </div>
    );
  }

  return (
    <div className={styles.rounds_list}>
      {Object.entries(grouped).map(([dateGroup, roundsInGroup]) => (
        <div key={dateGroup} className={styles.date_group}>
          <button
            className={styles.date_header}
            onClick={() =>
              setExpandedDate(expandedDate === dateGroup ? null : dateGroup)
            }
          >
            <span className={styles.date_text}>{dateGroup}</span>
            <span className={styles.count}>{roundsInGroup.length}</span>
            <span className={styles.chevron}>
              {expandedDate === dateGroup ? '▼' : '▶'}
            </span>
          </button>

          {expandedDate === dateGroup && (
            <div className={styles.rounds_in_group}>
              {roundsInGroup.map(round => (
                <div
                  key={round.id}
                  className={`${styles.round_item} ${
                    selectedRound?.id === round.id ? styles.selected : ''
                  }`}
                >
                  <button
                    className={styles.round_button}
                    onClick={() => onSelectRound(round.id)}
                  >
                    <span className={styles.time}>
                      {formatTime(round.created_at)}
                    </span>
                    <span className={styles.participants}>
                      {round.scores.length}{' '}
                      {round.scores.length === 1 ? 'vote' : 'votes'}
                    </span>
                  </button>

                  {selectedRound?.id === round.id && (
                    <div className={styles.details}>
                      <RoundDetail round={round} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoundsList;
