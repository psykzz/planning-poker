import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ukdwxekmgjfvkhaoygms.supabase.co',
  'sb_publishable_Mwx4xZP8VexXNBUvRqdo8w_saEtXkXm',
);

export const addSubscription = (session, dbTable, callback) => {
  const channel = supabase
    .channel(`${dbTable}-${session}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: dbTable,
        filter: `session_name=eq.${session}`,
      },
      payload => {
        console.log(`${dbTable} change received`, payload);
        callback(payload);
      },
    )
    .subscribe();
  return channel;
};

export const removeSubscription = channel => {
  supabase.removeChannel(channel);
};
