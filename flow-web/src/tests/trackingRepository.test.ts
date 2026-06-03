import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetFlowStorageForTests } from '../storage/db';
import { settingsRepository } from '../storage/settingsRepository';
import { trackingRepository } from '../storage/trackingRepository';

describe('trackingRepository', () => {
  beforeEach(async () => {
    await resetFlowStorageForTests();
  });

  it('stores and returns a saved check-in', async () => {
    const entry = await trackingRepository.saveEntry({
      entryType: 'checkIn',
      sourceType: 'spontaneous',
      energyScore: 7,
      stressLevel: 4
    });

    const entries = await trackingRepository.listEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(entry.id);
    expect(entries[0].energyScore).toBe(7);
    expect(entries[0].stressLevel).toBe(4);
  });

  it('returns cloned entry data instead of live stored references', async () => {
    const saved = await trackingRepository.saveEntry({
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Initial note'
    });

    saved.freeNote = 'Mutated after save';

    const entries = await trackingRepository.listEntries();
    const [storedEntry] = entries;

    expect(storedEntry.freeNote).toBe('Initial note');

    storedEntry.freeNote = 'Mutated after read';

    const [reloadedEntry] = await trackingRepository.listEntries();
    expect(reloadedEntry.freeNote).toBe('Initial note');
  });

  it('normalizes schedule times before sorting them', async () => {
    await trackingRepository.saveSchedule({
      time: '9:00',
      isEnabled: true,
      label: 'Matin'
    });
    await trackingRepository.saveSchedule({
      time: '12:00',
      isEnabled: true,
      label: 'Midi'
    });
    await trackingRepository.saveSchedule({
      time: '08:30',
      isEnabled: true,
      label: 'Avant'
    });

    const schedules = await trackingRepository.listSchedules();

    expect(schedules.map((schedule) => schedule.time)).toEqual(['08:30', '09:00', '12:00']);
  });
});

describe('settingsRepository', () => {
  beforeEach(async () => {
    await resetFlowStorageForTests();
  });

  it('returns isolated default settings objects', async () => {
    const firstSettings = await settingsRepository.getSettings();
    firstSettings.visibleHomeEntryTypes.push('meal');

    const secondSettings = await settingsRepository.getSettings();

    expect(secondSettings.visibleHomeEntryTypes).not.toContain('meal');
  });

  it('updates settings without relying on method binding', async () => {
    const updateSettings = settingsRepository.updateSettings;

    const updated = await updateSettings({
      compactHistoryCards: true
    });

    expect(updated.compactHistoryCards).toBe(true);
  });
});

describe('db fallback behavior', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.doUnmock('idb');
    await resetFlowStorageForTests();
  });

  it('falls back to memory when IndexedDB open fails', async () => {
    vi.doMock('idb', () => ({
      openDB: vi.fn().mockRejectedValue(new Error('open failed'))
    }));

    const originalIndexedDb = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: {}
    });

    try {
      const { FLOW_STORE_NAMES, getFlowStorage, resetFlowStorageForTests: resetMockedStorage } = await import('../storage/db');

      await resetMockedStorage();

      const storage = await getFlowStorage();
      await storage.put(FLOW_STORE_NAMES.entries, {
        id: 'fallback-entry',
        timestamp: '2026-06-02T00:00:00.000Z',
        entryType: 'freeNote',
        sourceType: 'spontaneous',
        freeNote: 'Stored in memory'
      });

      const entries = await storage.getAll(FLOW_STORE_NAMES.entries);
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('fallback-entry');
    } finally {
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        value: originalIndexedDb
      });
      vi.doUnmock('idb');
      vi.resetModules();
    }
  });
});
