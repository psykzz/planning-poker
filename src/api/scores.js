import { supabase } from './client';

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
