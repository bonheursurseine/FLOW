import { beforeEach, describe, expect, it } from 'vitest';

import { resetFlowStorageForTests } from '../../storage/db';
import { settingsRepository } from '../../storage/settingsRepository';
import { trackingRepository } from '../../storage/trackingRepository';

import {
  buildFlowLocalBackup,
  importFlowLocalBackupJson,
  parseFlowLocalBackupJson
} from './flowLocalBackup';

describe('localJsonBackup', () => {
  beforeEach(async () => {
    await resetFlowStorageForTests();
  });

  it('builds a JSON export with entries, schedules, and settings', async () => {
    await trackingRepository.saveEntry({
      id: 'entry-1',
      timestamp: '2026-06-12T08:15:00.000Z',
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Backup me'
    });
    await trackingRepository.saveSchedule({
      id: 'schedule-1',
      time: '09:00',
      isEnabled: true,
      label: 'Morning'
    });
    await settingsRepository.saveSettings({
      visibleHomeEntryTypes: ['checkIn', 'freeNote'],
      pwaInstallStatus: 'installed',
      notificationStatus: 'granted',
      compactHistoryCards: true
    });

    const backup = await buildFlowLocalBackup({
      now: new Date('2026-06-12T10:00:00.000Z')
    });

    expect(backup).toEqual({
      format: 'flow-local-backup',
      version: 1,
      exportedAt: '2026-06-12T10:00:00.000Z',
      data: {
        entries: [
          {
            id: 'entry-1',
            timestamp: '2026-06-12T08:15:00.000Z',
            entryType: 'freeNote',
            sourceType: 'spontaneous',
            completedFromNotification: false,
            freeNote: 'Backup me'
          }
        ],
        schedules: [
          {
            id: 'schedule-1',
            time: '09:00',
            isEnabled: true,
            label: 'Morning'
          }
        ],
        settings: {
          visibleHomeEntryTypes: ['checkIn', 'freeNote'],
          pwaInstallStatus: 'installed',
          notificationStatus: 'granted',
          compactHistoryCards: true
        }
      }
    });
  });

  it('imports a valid JSON backup and overwrites previous local data', async () => {
    await trackingRepository.saveEntry({
      id: 'old-entry',
      timestamp: '2026-06-01T07:00:00.000Z',
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Old data'
    });

    const backupJson = JSON.stringify({
      format: 'flow-local-backup',
      version: 1,
      exportedAt: '2026-06-12T11:00:00.000Z',
      data: {
        entries: [
          {
            id: 'entry-2',
            timestamp: '2026-06-12T09:45:00.000Z',
            entryType: 'checkIn',
            sourceType: 'scheduledCheckIn',
            completedFromNotification: true,
            energyScore: 8,
            stressLevel: 3,
            comment: 'Imported entry'
          }
        ],
        schedules: [
          {
            id: 'schedule-2',
            time: '18:30',
            isEnabled: false,
            label: 'Evening'
          }
        ],
        settings: {
          visibleHomeEntryTypes: ['checkIn', 'sleep'],
          pwaInstallStatus: 'dismissed',
          notificationStatus: 'denied',
          lastNotificationPromptAt: '2026-06-12T09:00:00.000Z',
          compactHistoryCards: false
        }
      }
    });

    const imported = await importFlowLocalBackupJson(backupJson);
    const entries = await trackingRepository.listEntries();
    const schedules = await trackingRepository.listSchedules();
    const currentSettings = await settingsRepository.getSettings();

    expect(imported.data.entries).toHaveLength(1);
    expect(entries).toEqual([
      {
        id: 'entry-2',
        timestamp: '2026-06-12T09:45:00.000Z',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        completedFromNotification: true,
        energyScore: 8,
        stressLevel: 3,
        comment: 'Imported entry'
      }
    ]);
    expect(schedules).toEqual([
      {
        id: 'schedule-2',
        time: '18:30',
        isEnabled: false,
        label: 'Evening'
      }
    ]);
    expect(currentSettings).toEqual({
      visibleHomeEntryTypes: ['checkIn', 'sleep'],
      pwaInstallStatus: 'dismissed',
      notificationStatus: 'denied',
      lastNotificationPromptAt: '2026-06-12T09:00:00.000Z',
      compactHistoryCards: false
    });
  });

  it('rejects an invalid JSON backup before import', () => {
    expect(() =>
      parseFlowLocalBackupJson(
        JSON.stringify({
          format: 'flow-local-backup',
          version: 1,
          exportedAt: '2026-06-12T11:00:00.000Z',
          data: {
            entries: [
              {
                id: 'entry-3',
                timestamp: '2026-06-12T10:00:00.000Z',
                entryType: 'unknown-type',
                sourceType: 'spontaneous'
              }
            ],
            schedules: [],
            settings: {
              visibleHomeEntryTypes: ['checkIn'],
              pwaInstallStatus: 'unknown',
              notificationStatus: 'unknown'
            }
          }
        })
      )
    ).toThrow('entryType invalide');
  });

  it('preserves TrackingEntry number and boolean types during import', async () => {
    await importFlowLocalBackupJson(
      JSON.stringify({
        format: 'flow-local-backup',
        version: 1,
        exportedAt: '2026-06-12T12:00:00.000Z',
        data: {
          entries: [
            {
              id: 'entry-typed',
              timestamp: '2026-06-12T10:30:00.000Z',
              entryType: 'migraine',
              sourceType: 'spontaneous',
              completedFromNotification: false,
              energyScore: 6,
              migrainePainScore: 4,
              migraineMedicationTaken: true
            }
          ],
          schedules: [],
          settings: {
            visibleHomeEntryTypes: ['checkIn', 'migraine'],
            pwaInstallStatus: 'unknown',
            notificationStatus: 'unsupported'
          }
        }
      })
    );

    const [entry] = await trackingRepository.listEntries();

    expect(typeof entry.completedFromNotification).toBe('boolean');
    expect(typeof entry.energyScore).toBe('number');
    expect(typeof entry.migrainePainScore).toBe('number');
    expect(typeof entry.migraineMedicationTaken).toBe('boolean');
    expect(entry.completedFromNotification).toBe(false);
    expect(entry.energyScore).toBe(6);
    expect(entry.migrainePainScore).toBe(4);
    expect(entry.migraineMedicationTaken).toBe(true);
  });

  it('imports daily goal fields without breaking older backup behavior', async () => {
    await importFlowLocalBackupJson(
      JSON.stringify({
        format: 'flow-local-backup',
        version: 1,
        exportedAt: '2026-06-12T12:30:00.000Z',
        data: {
          entries: [
            {
              id: 'goal-entry',
              timestamp: '2026-06-12T08:30:00.000Z',
              entryType: 'dailyGoal',
              sourceType: 'spontaneous',
              goalText: 'Boire un verre d eau avant midi',
              goalAchieved: false,
              comment: 'Importe depuis le backup'
            }
          ],
          schedules: [],
          settings: {
            visibleHomeEntryTypes: ['checkIn', 'freeNote'],
            pwaInstallStatus: 'unknown',
            notificationStatus: 'unknown'
          }
        }
      })
    );

    const [entry] = await trackingRepository.listEntries();

    expect(entry).toMatchObject({
      id: 'goal-entry',
      entryType: 'dailyGoal',
      goalText: 'Boire un verre d eau avant midi',
      goalAchieved: false,
      comment: 'Importe depuis le backup'
    });
  });
});
