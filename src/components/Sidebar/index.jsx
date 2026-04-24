import React from 'react';
import { POINT_SEQUENCES } from '../../hooks/useSessionState';
import { useTheme } from '../../hooks/useTheme';
import { submitOption } from '../../api/options';
import { OPT_POINT_KEY } from '../../api/options';
import { RoundsList } from '../RoundsList';
import * as styles from './sidebar.module.css';

export const Sidebar = ({
  isOpen,
  onClose,
  session,
  user,
  rounds,
  selectedRound,
  isViewingHistory,
  onSelectRound,
  sequence,
  confirmEnabled,
  isModerator,
  isSpectator,
  sessionDisplayName,
  toggleConfirm,
  setModeratorStatus,
  setSpectatorStatus,
  setSessionDisplayName,
  setUserName,
}) => {
  const [themeMode, setThemeMode] = useTheme();
  const [activeTab, setActiveTab] = React.useState('rounds');
  const [userNameInput, setUserNameInput] = React.useState('');
  const [sessionNameInput, setSessionNameInput] = React.useState('');

  React.useEffect(() => {
    setSessionNameInput(sessionDisplayName);
  }, [sessionDisplayName]);

  React.useEffect(() => {
    setUserNameInput(user?.name || '');
  }, [user?.name]);

  const handleUserNameSave = React.useCallback(
    e => {
      e.preventDefault();
      setUserName(userNameInput);
    },
    [setUserName, userNameInput],
  );

  const handleSessionNameSave = React.useCallback(
    e => {
      e.preventDefault();
      setSessionDisplayName(sessionNameInput.trim());
    },
    [sessionNameInput, setSessionDisplayName],
  );

  const handleSequenceChange = React.useCallback(
    e => {
      submitOption(session, OPT_POINT_KEY, e.target.value);
    },
    [session],
  );

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Session</h2>
          <button
            className={styles.close_btn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'rounds' ? styles.active : ''}`}
            onClick={() => setActiveTab('rounds')}
          >
            Rounds
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'options' ? styles.active : ''}`}
            onClick={() => setActiveTab('options')}
          >
            Options
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.content}>
          {/* Rounds Tab */}
          {activeTab === 'rounds' && (
            <div className={styles.tab_content}>
              <RoundsList
                rounds={rounds}
                selectedRound={selectedRound}
                onSelectRound={onSelectRound}
              />
            </div>
          )}

          {/* Options Tab */}
          {activeTab === 'options' && (
            <div className={styles.tab_content}>
              <div className={styles.settings}>
                {/* User display name */}
                <div className={styles.setting}>
                  <label
                    className={styles.label}
                    htmlFor="display-name-sidebar"
                  >
                    Your display name
                  </label>
                  <form
                    className={styles.inline_form}
                    onSubmit={handleUserNameSave}
                  >
                    <input
                      id="display-name-sidebar"
                      className={styles.text_input}
                      type="text"
                      value={userNameInput}
                      maxLength={80}
                      placeholder="e.g. QA Tester"
                      onChange={e => setUserNameInput(e.target.value)}
                    />
                    <button type="submit" className={styles.save_btn}>
                      Save
                    </button>
                  </form>
                </div>

                <div className={styles.setting}>
                  <span className={styles.label}>Theme</span>
                  <div className={styles.radio_group}>
                    <label className={styles.radio_label}>
                      <input
                        type="radio"
                        name="theme-sidebar"
                        value="light"
                        checked={themeMode === 'light'}
                        onChange={e => setThemeMode(e.target.value)}
                      />
                      <span className={styles.radio_text}>Light</span>
                    </label>
                    <label className={styles.radio_label}>
                      <input
                        type="radio"
                        name="theme-sidebar"
                        value="dark"
                        checked={themeMode === 'dark'}
                        onChange={e => setThemeMode(e.target.value)}
                      />
                      <span className={styles.radio_text}>Dark</span>
                    </label>
                  </div>
                </div>

                <div className={styles.divider}>
                  <span>Session options</span>
                </div>

                {/* Session display name */}
                <div className={styles.setting}>
                  <label
                    className={styles.label}
                    htmlFor="session-name-sidebar"
                  >
                    Session name
                  </label>
                  <form
                    className={styles.inline_form}
                    onSubmit={handleSessionNameSave}
                  >
                    <input
                      id="session-name-sidebar"
                      className={styles.text_input}
                      type="text"
                      value={sessionNameInput}
                      maxLength={80}
                      placeholder="e.g. Sprint 42"
                      onChange={e => setSessionNameInput(e.target.value)}
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
                </div>

                <div className={styles.setting}>
                  <span className={styles.label}>Spectator mode</span>
                  <label className={styles.toggle_label}>
                    <input
                      type="checkbox"
                      checked={isSpectator}
                      onChange={e => setSpectatorStatus?.(e.target.checked)}
                    />
                    <span>
                      {isSpectator
                        ? 'You are spectating'
                        : 'You can submit votes'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
