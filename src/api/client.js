import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://coinnqngrwlwlfhwtkih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTI0Nzg1MCwiZXhwIjoxOTUwODIzODUwfQ.bsG7ieEq9-tpfwACvQ_T-5DTU-xWyX2fWb3JezQFqdg',
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
