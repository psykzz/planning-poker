const normalizeName = value => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

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

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const parsed = safeParseJSON(window.localStorage.getItem('user'));
  return normalizeStoredUser(parsed);
};

export const setStoredUser = user => {
  if (typeof window === 'undefined') {
    return;
  }
  const normalized = normalizeStoredUser(user);
  if (!normalized) {
    window.localStorage.removeItem('user');
    return;
  }
  window.localStorage.setItem('user', JSON.stringify(normalized));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem('user');
};
