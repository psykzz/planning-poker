import { useCallback, useState } from 'react';

export const useCopyToClipboard = () => {
  const [state, setState] = useState({ value: null, error: null });

  const copy = useCallback(async text => {
    try {
      await navigator.clipboard.writeText(text);
      setState({ value: text, error: null });
    } catch (error) {
      setState({ value: null, error });
    }
  }, []);

  return [state, copy];
};
