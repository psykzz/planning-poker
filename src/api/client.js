import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://coinnqngrwlwlfhwtkih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTI0Nzg1MCwiZXhwIjoxOTUwODIzODUwfQ.bsG7ieEq9-tpfwACvQ_T-5DTU-xWyX2fWb3JezQFqdg'
);

export const addSubscription = (session, dbTable, callback) => {
  return supabase
    .from(`${dbTable}:session_name=eq.${session}`)
    .on('*', payload => {
      console.log(`${dbTable} change received`, payload);
      callback(payload);
    })
    .subscribe();
};

export const removeSubscription = subscriptionId => {
  supabase.removeSubscription(subscriptionId);
};
