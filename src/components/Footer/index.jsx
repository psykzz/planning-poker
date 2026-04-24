import React from 'react';
import * as styles from './styles.module.css';

export const Footer = () => (
  <footer className={styles.footer}>
    <a
      href="https://github.com/psykzz/planning-poker"
      target="_blank"
      rel="noreferrer"
    >
      Source
    </a>{' '}
    · built by psykzz
  </footer>
);
