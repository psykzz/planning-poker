import { supabase } from './client';

const isMissingRoundsTableError = error => error?.code === 'PGRST205';

// Create a hash of scores for duplicate detection
const hashScores = scores => {
  const normalized = scores
    .map(s => `${s.user_id}:${s.score}`)
    .sort()
    .join('|');
  return normalized;
};

export const saveRound = async (session, scores, users) => {
  if (!scores || scores.length === 0) {
    return; // Don't save empty rounds
  }

  // Create a snapshot of scores with user names included
  const scoresSnapshot = scores.map(score => {
    const user = users.find(u => u.id === score.user_id);
    return {
      user_id: score.user_id,
      user_name: user?.name || 'Unknown',
      score: score.score,
    };
  });

  const scoresHash = hashScores(scoresSnapshot);

  // Check if a round with identical scores was created in the last 10 seconds
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
  const { data: recentRounds, error: queryError } = await supabase
    .from('rounds')
    .select('id, scores')
    .eq('session_name', session)
    .gte('created_at', tenSecondsAgo)
    .limit(10);

  if (!queryError && recentRounds && recentRounds.length > 0) {
    // Check if any recent round has identical scores
    for (const round of recentRounds) {
      const recentHash = hashScores(round.scores);
      if (recentHash === scoresHash) {
        console.warn(
          'Skipping duplicate round - identical scores found in recent round',
        );
        return;
      }
    }
  }

  const { error } = await supabase.from('rounds').insert([
    {
      session_name: session,
      scores: scoresSnapshot,
    },
  ]);

  if (error) {
    if (isMissingRoundsTableError(error)) {
      return;
    }
    throw new Error(JSON.stringify(error));
  }
};

export const fetchRounds = async session => {
  const { data: rounds, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('session_name', session)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingRoundsTableError(error)) {
      return [];
    }
    throw new Error(JSON.stringify(error));
  }

  return rounds || [];
};

export const deleteRound = async roundId => {
  const { error } = await supabase.from('rounds').delete().eq('id', roundId);

  if (error) {
    if (isMissingRoundsTableError(error)) {
      return;
    }
    throw new Error(JSON.stringify(error));
  }
};

// Helper to reset scores and save a round snapshot
export const resetScoresWithRound = async (session, scores, users) => {
  // Only save round if there are scores to save
  if (scores && scores.length > 0) {
    try {
      await saveRound(session, scores, users);
    } catch (err) {
      // Silently ignore round save errors - rounds table might not exist yet
      console.warn('Failed to save round:', err);
    }
  }

  // Now reset the scores
  const { error } = await supabase
    .from('scores')
    .delete()
    .match({ session_name: session });

  if (error) {
    throw new Error(JSON.stringify(error));
  }
};
