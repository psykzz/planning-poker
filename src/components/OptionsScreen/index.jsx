import React from 'react';
import { useRouter } from 'next/router';
import { POINT_SEQUENCES, useSessionState } from '../../hooks/useSessionState';
import { submitOption } from '../../api/options';
import { OPT_POINT_KEY } from '../../api/options';
import * as styles from './optionsscreen.module.css';

export const OptionsScreen = ({ session, user: localUser }) => {
  const router = useRouter();
  const {
    user,
    sequence,
    confirmEnabled,
    isModerator,
    sessionDisplayName,
    toggleConfirm,
    setModeratorStatus,
    setSessionDisplayName,
  } = useSessionState({ session, localUser });

  const [nameInput, setNameInput] = React.useState('');

  React.useEffect(() => {
    setNameInput(sessionDisplayName);
  }, [sessionDisplayName]);

  const handleNameSave = React.useCallback(
    e => {
      e.preventDefault();
      setSessionDisplayName(nameInput.trim());
    },
    [nameInput, setSessionDisplayName],
  );

  const handleSequenceChange = React.useCallback(
    e => {
      submitOption(session, OPT_POINT_KEY, e.target.value);
    },
    [session],
  );

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <h1>Options</h1>
        <p>Configure this session.</p>
      </div>

      <div className={styles.settings}>
        {/* Session display name */}
        <div className={styles.setting}>
          <label className={styles.label} htmlFor="session-name">
            Session name
          </label>
          <form className={styles.inline_form} onSubmit={handleNameSave}>
            <input
              id="session-name"
              className={styles.text_input}
              type="text"
              value={nameInput}
              maxLength={80}
              placeholder="e.g. Sprint 42"
              onChange={e => setNameInput(e.target.value)}
            />
            <button type="submit" className={styles.save_btn}>
              Save
            </button>
          </form>
        </div>

        {/* Card type */}
        <div className={styles.setting}>
          <span className={styles.label}>Card type</span>
          <div className={styles.radio_group}>
            {Object.keys(POINT_SEQUENCES).map(seq => (
              <label key={seq} className={styles.radio_label}>
                <input
                  type="radio"
                  name="sequence"
                  value={seq}
                  checked={sequence === seq}
                  onChange={handleSequenceChange}
                />
                <span className={styles.radio_text}>
                  {seq.charAt(0).toUpperCase() + seq.slice(1)}
                </span>
                <span className={styles.radio_preview}>
                  ({POINT_SEQUENCES[seq].slice(1, 6).join(', ')}&hellip;)
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Confirm dialogs */}
        <div className={styles.setting}>
          <span className={styles.label}>Confirm dialogs</span>
          <label className={styles.toggle_label}>
            <input
              type="checkbox"
              checked={confirmEnabled}
              onChange={toggleConfirm}
            />
            <span>{confirmEnabled ? 'Enabled' : 'Disabled'}</span>
          </label>
          <p className={styles.hint}>
            When enabled, actions like reveal and reset ask for confirmation.
          </p>
        </div>

        {/* Moderator */}
        <div className={styles.setting}>
          <span className={styles.label}>Moderator</span>
          <label className={styles.toggle_label}>
            <input
              type="checkbox"
              checked={isModerator}
              onChange={e => setModeratorStatus(e.target.checked)}
            />
            <span>
              {isModerator ? 'You are a moderator' : 'Not a moderator'}
            </span>
          </label>
          <p className={styles.hint}>
            Moderators can reveal, reset, and change card types during the
            session.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.back_btn}
          onClick={() => router.replace(`/voting#${session}`)}
        >
          &larr; Back to voting
        </button>
      </div>
    </section>
  );
};
