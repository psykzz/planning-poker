import { supabase } from './client';

export const submitScore = async (userId, session, score) => {
  const { error } = await supabase
    .from('scores')
    .upsert([
      { score, user_id: userId, session_name: session, updated_at: new Date(), revealed: false },
    ]);

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }
};

export const deleteScore = async (userId, session) => {
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
export const getScores = async session => {
  const { data: scores, error } = await supabase
    .from('scores')
    .select('user_id,score,revealed')
    .eq('session_name', session);

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error));
  }

  return scores;
};

export const onNewScores = (session, callback) => {
  const subscription = supabase
    .from('scores')
    .on('*', payload => {
      console.log('Change received!', payload);
      callback(payload);
    })
    .subscribe();

  return subscription;
};
