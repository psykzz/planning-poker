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
            <span className={styles.badge}>Free &amp; open source</span>
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
