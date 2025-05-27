import { supabase } from './client';

// Score icons use negative numbers so math functions can skip them
export const ICON_SCORE_MAP = {
  '☕': -2,
  '?': -1,
};
export const SCORE_ICON_MAP = {};
for (const [k, v] of Object.entries(ICON_SCORE_MAP)) {
  SCORE_ICON_MAP[v.toString()] = k;
}

export const submitScore = async (session, userId, score) => {
  const { error } = await supabase.from('scores').upsert([
    {
      score,
      user_id: userId,
      session_name: session,
      updated_at: new Date(),
      revealed: false,
    },
  ]);

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }
};

export const deleteScore = async (session, userId) => {
  const { error } = await supabase
    .from('scores')
    .delete()
    .match({ session_name: session, user_id: userId });

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }
};

export const resetScores = async session => {
  const { error } = await supabase
    .from('scores')
    .delete()
    .match({ session_name: session });

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }
};

export const updateAllScores = async (session, revealed) => {
  const { error } = await supabase
    .from('scores')
    .update({ revealed })
    .eq('session_name', session);

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }
};

export const fetchScores = async session => {
  const { data: scores, error } = await supabase
    .from('scores')
    .select('user_id,score,revealed')
    .eq('session_name', session);

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }

  return scores;
};
