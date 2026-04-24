import React from 'react';
import * as styles from './styles.module.css';

export const DarkmodeToggle = () => {
  const storageKey = 'prefers-dark-mode';
  const [prefersDarkmode, setPrefersDarkmode] = React.useState(true);

  React.useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);
    let shouldUseDarkmode = null;
    if (storedValue !== null) {
      shouldUseDarkmode = JSON.parse(storedValue);
    }
    if (typeof shouldUseDarkmode !== 'boolean') {
      shouldUseDarkmode = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
    }
    setPrefersDarkmode(shouldUseDarkmode);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      prefersDarkmode ? 'dark' : 'light',
    );
  }, [prefersDarkmode]);

  const handleClick = React.useCallback(() => {
    setPrefersDarkmode(previous => {
      const next = !previous;
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      id="dm-toggle"
      className={`${styles.darkmode_toggle} ${
        prefersDarkmode ? styles.is_dark : ''
      }`}
      onClick={handleClick}
      aria-label="Toggle dark mode"
      aria-pressed={prefersDarkmode}
      title="Toggle dark mode"
    >
      <span className={styles.toggle_text}>
        {prefersDarkmode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};
