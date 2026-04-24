import React from 'react';
import { fetchRounds } from '../api/rounds';
import { addSubscription, removeSubscription } from '../api/client';

export const useRounds = ({ session }) => {
  const [rounds, setRounds] = React.useState([]);
  const [selectedRound, setSelectedRound] = React.useState(null);
  const [isViewingHistory, setIsViewingHistory] = React.useState(false);
  const sessionRef = React.useRef(session);
  const roundsRequestRef = React.useRef(0);

  React.useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const refreshRounds = React.useCallback(async currentSession => {
    if (!currentSession) {
      setRounds([]);
      setSelectedRound(null);
      setIsViewingHistory(false);
      return;
    }

    const requestId = ++roundsRequestRef.current;

    try {
      const nextRounds = await fetchRounds(currentSession);
      if (
        sessionRef.current !== currentSession ||
        requestId !== roundsRequestRef.current
      ) {
        return;
      }

      setRounds(nextRounds);
      setSelectedRound(currentRound => {
        if (!currentRound) {
          return null;
        }

        const nextSelectedRound =
          nextRounds.find(round => round.id === currentRound.id) || null;

        if (!nextSelectedRound) {
          setIsViewingHistory(false);
        }

        return nextSelectedRound;
      });
    } catch (err) {
      if (
        sessionRef.current !== currentSession ||
        requestId !== roundsRequestRef.current
      ) {
        return;
      }

      // Silently ignore errors - rounds table might not exist yet or not be accessible
      console.warn('Failed to fetch rounds:', err);
      setRounds([]);
      setSelectedRound(null);
      setIsViewingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    if (!session) {
      setRounds([]);
      setSelectedRound(null);
      setIsViewingHistory(false);
      return;
    }

    const channel = addSubscription(session, 'rounds', () => {
      refreshRounds(session);
    });

    refreshRounds(session);

    return () => {
      removeSubscription(channel);
    };
  }, [session, refreshRounds]);

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
