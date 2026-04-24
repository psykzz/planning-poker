const normalizeName = value => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const STORAGE_KEY = 'user';

const normalizeId = value => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (typeof globalThis?.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return '';
};

const safeParseJSON = value => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeStoredProfile = candidate => {
  const name = normalizeName(candidate?.name);
  if (!name) {
    return;
  }
  return { name };
};

const normalizeStoredState = candidate => {
  if (!candidate || typeof candidate !== 'object') {
    return { profile: undefined, sessions: {} };
  }

  if ('id' in candidate || 'name' in candidate) {
    return {
      profile: normalizeStoredProfile(candidate),
      sessions: {},
    };
  }

  const profile = normalizeStoredProfile(candidate.profile);
  const sessions = Object.entries(candidate.sessions || {}).reduce(
    (result, [session, user]) => {
      const normalizedSession = normalizeName(session);
      const normalizedUser = normalizeStoredUser(user);
      if (normalizedSession && normalizedUser) {
        result[normalizedSession] = normalizedUser;
      }
      return result;
    },
    {},
  );

  return { profile, sessions };
};

const readStoredState = () =>
  normalizeStoredState(safeParseJSON(window.localStorage.getItem(STORAGE_KEY)));

export const normalizeStoredUser = candidate => {
  if (!candidate || typeof candidate !== 'object') {
    return;
  }

  const name = normalizeName(candidate.name);
  if (!name) {
    return;
  }

  const id = normalizeId(candidate.id);
  if (!id) {
    return;
  }

  return { id, name };
};

export const getStoredUserName = () => {
  if (typeof window === 'undefined') {
    return;
  }
  return readStoredState().profile?.name;
};

export const getStoredUser = session => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!session) {
    return;
  }
  const normalizedSession = normalizeName(session);
  if (!normalizedSession) {
    return;
  }
  return readStoredState().sessions[normalizedSession];
};

export const setStoredUser = (user, session) => {
  if (typeof window === 'undefined') {
    return;
  }
  const normalized = normalizeStoredUser(user);
  const normalizedSession = normalizeName(session);

  if (!normalized) {
    if (!normalizedSession) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const currentState = readStoredState();
    const nextSessions = { ...currentState.sessions };
    delete nextSessions[normalizedSession];

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile: currentState.profile,
        sessions: nextSessions,
      }),
    );
    return;
  }

  const currentState = readStoredState();
  const nextState = {
    profile: { name: normalized.name },
    sessions: normalizedSession
      ? {
          ...currentState.sessions,
          [normalizedSession]: normalized,
        }
      : currentState.sessions,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
