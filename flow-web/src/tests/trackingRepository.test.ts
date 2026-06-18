import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetFlowStorageForTests } from '../storage/db';
import { settingsRepository } from '../storage/settingsRepository';
import { trackingRepository } from '../storage/trackingRepository';
import type { CheckInScheduleDraft, TrackingEntryDraft } from '../types/tracking';
import { toDateKey } from '../utils/dateBuckets';

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

  it('fills default entry fields and sorts entries by newest timestamp first', async () => {
    const latest = await trackingRepository.saveEntry({
      freeNote: 'Latest entry'
    } as TrackingEntryDraft);

    await trackingRepository.saveEntry({
      id: 'older-entry',
      timestamp: '2026-06-01T09:00:00.000Z',
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Older entry'
    });

    const entries = await trackingRepository.listEntries();

    expect(latest.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(latest.timestamp ?? ''))).toBe(false);
    expect(latest.entryType).toBe('freeNote');
    expect(latest.sourceType).toBe('spontaneous');
    expect(latest.completedFromNotification).toBe(false);
    expect(entries.map((entry) => entry.id)).toEqual([latest.id, 'older-entry']);
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

  it('keeps legacy entries compatible alongside daily goal entries', async () => {
    await trackingRepository.saveEntry({
      id: 'legacy-note',
      timestamp: '2026-06-11T09:00:00.000Z',
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Ancienne note'
    });

    await trackingRepository.saveEntry({
      id: 'daily-goal-1',
      timestamp: '2026-06-12T09:00:00.000Z',
      entryType: 'dailyGoal',
      sourceType: 'spontaneous',
      goalText: 'Faire une pause dehors',
      goalAchieved: false
    });

    const entries = await trackingRepository.listEntries();

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: 'daily-goal-1',
      entryType: 'dailyGoal',
      goalText: 'Faire une pause dehors',
      goalAchieved: false
    });
    expect(entries[1]).toMatchObject({
      id: 'legacy-note',
      entryType: 'freeNote',
      freeNote: 'Ancienne note'
    });
    expect(entries[1].goalText).toBeUndefined();
    expect(entries[1].goalAchieved).toBeUndefined();
  });

  it('updates only the date portion of an existing entry timestamp', async () => {
    const originalTimestamp = new Date(2026, 5, 10, 8, 45, 30, 120).toISOString();
    const saved = await trackingRepository.saveEntry({
      timestamp: originalTimestamp,
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Note deplacee'
    });

    const updated = await trackingRepository.updateEntryDate(saved.id, '2026-06-15');
    const originalDate = new Date(originalTimestamp);
    const updatedDate = new Date(updated.timestamp);

    expect(updated.id).toBe(saved.id);
    expect(updated.freeNote).toBe('Note deplacee');
    expect(toDateKey(updated.timestamp)).toBe('2026-06-15');
    expect(updatedDate.getHours()).toBe(originalDate.getHours());
    expect(updatedDate.getMinutes()).toBe(originalDate.getMinutes());
    expect(updatedDate.getSeconds()).toBe(originalDate.getSeconds());
    expect(updatedDate.getMilliseconds()).toBe(originalDate.getMilliseconds());

    const [storedEntry] = await trackingRepository.listEntries();
    expect(storedEntry).toEqual(updated);
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

  it('defaults schedules to enabled and trims optional labels', async () => {
    const schedule = await trackingRepository.saveSchedule({
      time: ' 7:5 ',
      label: '   '
    } as CheckInScheduleDraft);

    expect(schedule.time).toBe('07:05');
    expect(schedule.isEnabled).toBe(true);
    expect(schedule.label).toBeUndefined();
  });

  it('keeps invalid schedule times trimmed instead of coercing them', async () => {
    const schedule = await trackingRepository.saveSchedule({
      time: ' 24:00 ',
      label: 'Night'
    } as CheckInScheduleDraft);

    expect(schedule.time).toBe('24:00');
  });

  it('deletes entries and schedules and can clear all persisted tracking data', async () => {
    const entry = await trackingRepository.saveEntry({
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'To remove'
    });
    const schedule = await trackingRepository.saveSchedule({
      time: '08:00',
      isEnabled: true,
      label: 'Morning'
    });

    await trackingRepository.deleteEntry(entry.id);
    await trackingRepository.deleteSchedule(schedule.id);

    expect(await trackingRepository.listEntries()).toEqual([]);
    expect(await trackingRepository.listSchedules()).toEqual([]);

    await trackingRepository.saveEntry({
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Will be cleared'
    });
    await trackingRepository.saveSchedule({
      time: '12:00',
      isEnabled: true,
      label: 'Noon'
    });

    await trackingRepository.clearAll();

    expect(await trackingRepository.listEntries()).toEqual([]);
    expect(await trackingRepository.listSchedules()).toEqual([]);
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
