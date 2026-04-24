import { supabase } from './client';

export const createUser = async (session, user) => {
  if (!user?.id || !user?.name) {
    throw new Error('User id and name are required');
  }

  const payload = {
    id: user.id,
    name: user.name,
    session_name: session,
    last_presence: new Date().toISOString(),
  };

  if (typeof user.is_spectator === 'boolean') {
    payload.is_spectator = user.is_spectator;
  }

  const { data: newUser, error } = await supabase
    .from('users')
    .upsert([payload], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return newUser;
};

export const updateUserPresence = async (session, userId, last_presence) => {
  if (!userId) return;
  const { error } = await supabase
    .from('users')
    .update({ last_presence, session_name: session })
    .eq('id', userId);

  if (error) {
    throw new Error(JSON.stringify(error));
  }
};

export const fetchAllUsers = async session => {
  let { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('session_name', session);

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return users;
};

export const fetchUser = async userId => {
  if (!userId) return;

  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId);

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  if (user?.length > 0) {
    return user[user?.length - 1]; // get latest user
  }
  return;
};
