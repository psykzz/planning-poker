import { supabase } from './client';

export const OPT_CONFIRM_DEFAULT = 'true';
export const OPT_CONFIRM_KEY = 'confirm';

export const OPT_POINT_SEQ_DEFAULT = 'standard';
export const OPT_POINT_KEY = 'point_sequence';

export const submitOption = async (session, optionKey, value) => {
  const { error } = await supabase
    .from('options')
    .upsert([
      { key: optionKey, value: value?.toString() || '', session_name: session },
    ]);

  if (error && !Array.isArray(error)) {
    const errStr = JSON.stringify(error);
    throw new Error(errStr);
  }
};

export const fetchOption = async (session, optionKey, defaultValue) => {
  let { data: options, error } = await supabase
    .from('options')
    .select('key,value,session_name')
    .eq('session_name', session)
    .eq('key', optionKey);

  if (error && !Array.isArray(error)) {
    const errStr = JSON.stringify(error);
    throw new Error(errStr);
  }

  if (options?.length > 0) {
    return options[0].value;
  }

  return defaultValue;
};
