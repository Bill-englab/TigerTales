import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnlockMode } from '../static/unlock-mode.mjs';

function fakeStorage() {
  const values = new Map();
  return {
    getItem: key => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: key => { values.delete(key); },
    keys: () => [...values.keys()],
  };
}

test('unlock-all is off until the grown-up turns it on', () => {
  const mode = createUnlockMode({ storage: fakeStorage(), username: 'leo' });
  assert.equal(mode.enabled, false);
  assert.equal(mode.set(true), true);
  assert.equal(mode.enabled, true);
  assert.equal(mode.set(false), false);
  assert.equal(mode.enabled, false);
});

test('the choice is remembered per account in this browser', () => {
  const storage = fakeStorage();
  createUnlockMode({ storage, username: 'leo' }).set(true);
  assert.equal(createUnlockMode({ storage, username: 'leo' }).enabled, true);
  assert.equal(createUnlockMode({ storage, username: 'maya' }).enabled, false);
  createUnlockMode({ storage, username: 'leo' }).set(false);
  assert.equal(createUnlockMode({ storage, username: 'leo' }).enabled, false);
  assert.deepEqual(storage.keys(), []);
});

test('blocked storage keeps the choice for this page without throwing', () => {
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
  };
  const mode = createUnlockMode({ storage: blocked, username: 'leo' });
  assert.equal(mode.enabled, false);
  assert.equal(mode.set(true), true);
  assert.equal(mode.enabled, true);
  const missing = createUnlockMode({ storage: null, username: 'leo' });
  assert.equal(missing.set(true), true);
  assert.equal(missing.enabled, true);
});
