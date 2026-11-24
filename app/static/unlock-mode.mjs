// Unlock-all is a per-account display choice kept in this browser. Storage can
// be unavailable (blocked origin, private mode); the choice then lasts for this
// page only and nothing is thrown.
const KEY = 'tigertales-unlock-all';

export function createUnlockMode({ storage, username }) {
  const key = `${KEY}:${username}`;
  let enabled = false;
  if (storage) {
    try { enabled = storage.getItem(key) === '1'; } catch (_) { /* unreadable storage */ }
  }
  return {
    get enabled() { return enabled; },
    set(value) {
      enabled = Boolean(value);
      if (!storage) return enabled;
      try {
        if (enabled) storage.setItem(key, '1');
        else storage.removeItem(key);
      } catch (_) { /* keep the page-local choice */ }
      return enabled;
    },
  };
}
