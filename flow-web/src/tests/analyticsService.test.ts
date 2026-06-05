import { describe, expect, it } from 'vitest';

import {
  analyzeEntries,
  analyzeMeditation,
  analyzeMigraine,
  averageEnergyByHour,
  averageStressByHour,
  compareFormWithMentalLoad,
  compareFormWithSleepDuration,
  compareFormWithStress,
  dailyHydrationTotal,
  dailyFormAverage,
  formTrend
} from '../services/analyticsService';
import type { TrackingEntry } from '../types/tracking';

describe('analyticsService', () => {
  it('averages check-in energy and stress by hour regardless of source', () => {
    const entries = [
      createEntry({
        id: 'checkin-1',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T08:00:00',
        energyScore: 6,
        stressLevel: 4
      }),
      createEntry({
        id: 'checkin-2',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T08:30:00',
        energyScore: 8,
        stressLevel: 2
      }),
      createEntry({
        id: 'checkin-3',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T12:00:00',
        energyScore: 5,
        stressLevel: 7
      }),
      createEntry({
        id: 'spontaneous-checkin',
        entryType: 'checkIn',
        sourceType: 'spontaneous',
        timestamp: '2026-06-02T08:10:00',
        energyScore: 10,
        stressLevel: 1
      })
    ];

    expect(averageEnergyByHour(entries)).toEqual([
      { average: 8, count: 3, hour: 8 },
      { average: 5, count: 1, hour: 12 }
    ]);

    expect(averageStressByHour(entries)).toEqual([
      { average: 2.33, count: 3, hour: 8 },
      { average: 7, count: 1, hour: 12 }
    ]);
  });

  it('builds daily form trends and same-day comparisons', () => {
    const entries = [
      createEntry({
        id: 'form-1',
        entryType: 'form',
        timestamp: '2026-06-01T09:00:00',
        energyScore: 4
      }),
      createEntry({
        id: 'sleep-1',
        entryType: 'sleep',
        timestamp: '2026-06-01T07:00:00',
        sleepDuration: 5,
        sleepQuality: 4
      }),
      createEntry({
        id: 'stress-1',
        entryType: 'stress',
        timestamp: '2026-06-01T13:00:00',
        stressLevel: 8
      }),
      createEntry({
        id: 'load-1',
        entryType: 'mentalLoad',
        timestamp: '2026-06-01T14:00:00',
        mentalLoad: 8
      }),
      createEntry({
        id: 'form-2',
        entryType: 'form',
        timestamp: '2026-06-02T09:00:00',
        energyScore: 8
      }),
      createEntry({
        id: 'sleep-2',
        entryType: 'sleep',
        timestamp: '2026-06-02T07:00:00',
        sleepDuration: 8,
        sleepQuality: 8
      }),
      createEntry({
        id: 'stress-2',
        entryType: 'stress',
        timestamp: '2026-06-02T13:00:00',
        stressLevel: 3
      }),
      createEntry({
        id: 'load-2',
        entryType: 'mentalLoad',
        timestamp: '2026-06-02T14:00:00',
        mentalLoad: 3
      })
    ];

    expect(dailyFormAverage(entries)).toEqual([
      { average: 4, count: 1, date: '2026-06-01' },
      { average: 8, count: 1, date: '2026-06-02' }
    ]);

    expect(formTrend(entries, 7)).toEqual([
      { average: 4, count: 1, date: '2026-06-01' },
      { average: 8, count: 1, date: '2026-06-02' }
    ]);

    expect(compareFormWithSleepDuration(entries)).toEqual([
      { average: 4, count: 1, key: 'under-6', label: 'Moins de 6h' },
      { average: 8, count: 1, key: '8-plus', label: '8h ou plus' }
    ]);

    expect(compareFormWithStress(entries)).toEqual([
      { average: 8, count: 1, key: 'low', label: 'Stress bas (1-3)' },
      { average: 4, count: 1, key: 'high', label: 'Stress élevé (7-10)' }
    ]);

    expect(compareFormWithMentalLoad(entries)).toEqual([
      { average: 8, count: 1, key: 'low', label: 'Charge basse (1-3)' },
      { average: 4, count: 1, key: 'high', label: 'Charge élevée (7-10)' }
    ]);
  });

  it('totals hydration by day and exposes daily analytics for the analyse page', () => {
    const entries = [
      createEntry({
        id: 'hydration-1',
        entryType: 'hydration',
        timestamp: '2026-06-01T09:00:00',
        hydrationAmountCl: 25
      }),
      createEntry({
        id: 'hydration-2',
        entryType: 'hydration',
        timestamp: '2026-06-01T15:00:00',
        hydrationAmountCl: 40
      }),
      createEntry({
        id: 'hydration-3',
        entryType: 'hydration',
        timestamp: '2026-06-02T10:00:00',
        hydrationAmountCl: 60
      }),
      createEntry({
        id: 'checkin-1',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-01T08:00:00',
        energyScore: 5,
        stressLevel: 4
      }),
      createEntry({
        id: 'checkin-2',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-01T18:00:00',
        energyScore: 7,
        stressLevel: 6
      }),
      createEntry({
        id: 'checkin-3',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T08:00:00',
        energyScore: 8,
        stressLevel: 3
      })
    ];

    expect(dailyHydrationTotal(entries)).toEqual([
      { count: 2, date: '2026-06-01', total: 65 },
      { count: 1, date: '2026-06-02', total: 60 }
    ]);

    expect(analyzeEntries(entries)).toMatchObject({
      hydration: {
        dailyTotal: [
          { count: 2, date: '2026-06-01', total: 65 },
          { count: 1, date: '2026-06-02', total: 60 }
        ]
      },
      scheduledCheckIns: {
        stressTrend: [
          { average: 5, count: 2, date: '2026-06-01' },
          { average: 3, count: 1, date: '2026-06-02' }
        ]
      }
    });
  });

  it('summarizes migraine and meditation metrics', () => {
    const entries = [
      createEntry({
        id: 'migraine-1',
        entryType: 'migraine',
        timestamp: '2026-06-01T09:00:00',
        migraineLevel: 'moderate',
        migrainePainScore: 6
      }),
      createEntry({
        id: 'migraine-2',
        entryType: 'migraine',
        timestamp: '2026-06-01T09:30:00',
        migraineLevel: 'severe',
        migrainePainScore: 8
      }),
      createEntry({
        id: 'migraine-3',
        entryType: 'migraine',
        timestamp: '2026-06-02T14:00:00',
        migraineLevel: 'mild',
        migrainePainScore: 4
      }),
      createEntry({
        id: 'stress-day-1',
        entryType: 'stress',
        timestamp: '2026-06-01T12:00:00',
        stressLevel: 8
      }),
      createEntry({
        id: 'stress-day-2',
        entryType: 'stress',
        timestamp: '2026-06-02T12:00:00',
        stressLevel: 2
      }),
      createEntry({
        id: 'stress-day-3',
        entryType: 'stress',
        timestamp: '2026-06-03T12:00:00',
        stressLevel: 8
      }),
      createEntry({
        id: 'caffeine-day-1',
        entryType: 'caffeine',
        timestamp: '2026-06-01T08:00:00',
        caffeineCups: 2
      }),
      createEntry({
        id: 'caffeine-day-2',
        entryType: 'caffeine',
        timestamp: '2026-06-02T08:00:00',
        caffeineCups: 0
      }),
      createEntry({
        id: 'caffeine-day-3',
        entryType: 'caffeine',
        timestamp: '2026-06-03T08:00:00',
        caffeineCups: 2
      }),
      createEntry({
        id: 'meditation-1',
        entryType: 'meditation',
        timestamp: '2026-06-01T19:00:00',
        meditationDuration: 10
      }),
      createEntry({
        id: 'meditation-2',
        entryType: 'meditation',
        timestamp: '2026-06-03T19:00:00',
        meditationDuration: 20
      }),
      createEntry({
        id: 'meditation-3',
        entryType: 'meditation',
        timestamp: '2026-06-10T19:00:00',
        meditationDuration: 30
      })
    ];

    expect(analyzeMigraine(entries)).toEqual({
      byHour: [
        { averagePain: 7, count: 2, hour: 9 },
        { averagePain: 4, count: 1, hour: 14 }
      ],
      frequency: {
        averageEpisodesPerDay: 1.5,
        averageEpisodesPerWeek: 10.5,
        daysWithEpisodes: 2,
        totalEpisodes: 3
      },
      intensity: {
        averagePain: 6,
        entriesWithPainScore: 3
      },
      vsCaffeine: [
        { averageEpisodes: 1, count: 1, key: 'none', label: '0 tasse' },
        { averageEpisodes: 1, count: 2, key: 'high', label: '2 tasses ou plus' }
      ],
      vsStress: [
        { averageEpisodes: 1, count: 1, key: 'low', label: 'Stress bas (1-3)' },
        { averageEpisodes: 1, count: 2, key: 'high', label: 'Stress élevé (7-10)' }
      ]
    });

    expect(analyzeMeditation(entries)).toEqual({
      averageMinutes: 20,
      totalMinutes: 60,
      totalSessions: 3,
      weekly: [
        {
          averageMinutes: 15,
          sessionCount: 2,
          totalMinutes: 30,
          weekStart: '2026-06-01'
        },
        {
          averageMinutes: 30,
          sessionCount: 1,
          totalMinutes: 30,
          weekStart: '2026-06-08'
        }
      ]
    });
  });
});

function createEntry(
  overrides: Partial<TrackingEntry> & { id: string; timestamp: string }
): TrackingEntry {
  const { id, timestamp, ...rest } = overrides;

  return {
    comment: undefined,
    completedFromNotification: false,
    entryType: 'freeNote',
    eventNote: undefined,
    freeNote: undefined,
    id,
    medicationNote: undefined,
    migraineMedicationNote: undefined,
    migraineMedicationTaken: undefined,
    sourceType: 'spontaneous',
    timestamp,
    ...rest
  };
}
