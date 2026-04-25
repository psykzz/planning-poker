import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { nanoid } from 'nanoid';
import Layout from '../Layout';
import { DarkmodeToggle } from '../DarkmodeToggle';
import * as styles from './landingpage.module.css';

const steps = [
  {
    title: 'Create a session',
    desc: "Click the button below and you'll get a unique session link to share with your team.",
  },
  {
    title: 'Everyone joins',
    desc: "Team members open the link, enter their name, and they're in — no account needed.",
  },
  {
    title: 'Vote and reveal',
    desc: 'Pick a story-point card, reveal all votes at once, and discuss until consensus is reached.',
  },
];

const LandingPage = () => {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState(() => nanoid(7));

  const handleCreate = () => {
    const id = sessionId.trim() || nanoid(7);
    router.push(`/voting#${id}`);
  };

  return (
    <>
      <Head>
        <title>Planning Poker</title>
      </Head>
      <Layout>
        <div className={styles.wrapper}>
          <div className={styles.topbar}>
            <DarkmodeToggle />
          </div>
          <div className={styles.hero}>
            <a
              className={styles.badge}
              href="https://github.com/psykzz/planning-poker"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className={styles.badge_icon}
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Free &amp; open source
            </a>
            <h1 className={styles.title}>Planning Poker for agile teams</h1>
            <p className={styles.subtitle}>
              Estimate user stories together in real time. No sign-up, no
              downloads — just share a link and start voting.
            </p>
            <div className={styles.session_row}>
              <input
                className={styles.session_input}
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
                spellCheck={false}
                aria-label="Session ID"
              />
              <button className={styles.cta} onClick={handleCreate}>
                Start
              </button>
            </div>
          </div>

          <hr className={styles.divider} />

          <p className={styles.steps_heading}>How it works</p>
          <div className={styles.steps}>
            {steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <span className={styles.step_number}>Step {i + 1}</span>
                <p className={styles.step_title}>{step.title}</p>
                <p className={styles.step_desc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LandingPage;
