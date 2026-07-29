import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearStoredUser,
  getStoredUser,
  getStoredUserName,
  normalizeStoredUser,
  setStoredUser,
} from './userStorage';

const createStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
};

describe('userStorage utilities', () => {
  beforeEach(() => {
    globalThis.window = { localStorage: createStorage() };
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it('normalizes valid users and rejects users without a name', () => {
    expect(
      normalizeStoredUser({
        id: 'user-1',
        name: '  Ada  ',
        is_spectator: true,
      }),
    ).toEqual({ id: 'user-1', name: 'Ada', is_spectator: true });
    expect(normalizeStoredUser({ id: 'user-1', name: '  ' })).toBeUndefined();
  });

  it('serializes and deserializes users by session', () => {
    const user = { id: 'user-1', name: 'Ada' };

    setStoredUser(user, ' session-a ');

    expect(getStoredUser('session-a')).toEqual(user);
    expect(getStoredUser('session-b')).toBeUndefined();
    expect(getStoredUserName()).toBe('Ada');
  });

  it('keeps users from separate sessions and removes one session at a time', () => {
    const firstUser = { id: 'user-1', name: 'Ada' };
    const secondUser = { id: 'user-2', name: 'Grace' };

    setStoredUser(firstUser, 'session-a');
    setStoredUser(secondUser, 'session-b');
    setStoredUser(undefined, 'session-a');

    expect(getStoredUser('session-a')).toBeUndefined();
    expect(getStoredUser('session-b')).toEqual(secondUser);
    expect(getStoredUserName()).toBe('Grace');
  });

  it('clears all stored users', () => {
    setStoredUser({ id: 'user-1', name: 'Ada' }, 'session-a');

    clearStoredUser();

    expect(getStoredUser('session-a')).toBeUndefined();
    expect(getStoredUserName()).toBeUndefined();
  });
});
