import React from 'react';
import { fetchRounds } from '../api/rounds';
import { addSubscription, removeSubscription } from '../api/client';

export const useRounds = ({ session }) => {
  const [rounds, setRounds] = React.useState([]);
  const [selectedRound, setSelectedRound] = React.useState(null);
  const [isViewingHistory, setIsViewingHistory] = React.useState(false);

  // Fetch initial rounds
  React.useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const initialRounds = await fetchRounds(session);
        setRounds(initialRounds);
      } catch (err) {
        // Silently ignore errors - rounds table might not exist yet or not be accessible
        console.warn('Failed to fetch rounds:', err);
        setRounds([]);
      }
    })();
  }, [session]);

  // Subscribe to new rounds
  React.useEffect(() => {
    if (!session) return;

    const handleNewRound = payload => {
      if (payload.eventType === 'INSERT') {
        setRounds(currentRounds => [payload.new, ...currentRounds]);
      } else if (payload.eventType === 'DELETE') {
        setRounds(currentRounds =>
          currentRounds.filter(r => r.id !== payload.old.id),
        );
      }
    };

    const channel = addSubscription(session, 'rounds', handleNewRound);

    return () => {
      removeSubscription(channel);
    };
  }, [session]);

  const selectRound = React.useCallback(
    roundId => {
      const round = rounds.find(r => r.id === roundId);
      if (round) {
        setSelectedRound(round);
        setIsViewingHistory(true);
      }
    },
    [rounds],
  );

  const returnToCurrent = React.useCallback(() => {
    setSelectedRound(null);
    setIsViewingHistory(false);
  }, []);

  return {
    rounds,
    selectedRound,
    isViewingHistory,
    selectRound,
    returnToCurrent,
  };
};
