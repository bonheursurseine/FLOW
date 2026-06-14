import { describe, expect, it, vi } from 'vitest';

import * as analyticsService from '../services/analyticsService';
import {
  analyzeDailyGoals,
  analyzeEntries,
  analyzeMeditation,
  analyzeMigraine,
  averageEnergyByHour,
  averageStressByHour,
  compareFormWithMentalLoad,
  compareFormWithSleepDuration,
  compareFormWithSleepQuality,
  compareSleepDurationWithNextDayState,
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
    expect(compareFormWithSleepQuality(entries)).toMatchObject([
      { average: 4, count: 1, key: 'medium' },
      { average: 8, count: 1, key: 'high' }
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

  it("relates sleep duration to the next day's form and energy", () => {
    const entries = [
      createEntry({
        id: 'sleep-short-1',
        entryType: 'sleep',
        timestamp: '2026-06-01T07:00:00',
        sleepDuration: 5
      }),
      createEntry({
        id: 'form-short-1',
        entryType: 'form',
        timestamp: '2026-06-01T09:00:00',
        energyScore: 4
      }),
      createEntry({
        id: 'checkin-short-1',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-01T08:00:00',
        energyScore: 5,
        stressLevel: 3
      }),
      createEntry({
        id: 'checkin-short-2',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-01T18:00:00',
        energyScore: 7,
        stressLevel: 4
      }),
      createEntry({
        id: 'sleep-short-2',
        entryType: 'sleep',
        timestamp: '2026-06-02T07:00:00',
        sleepDuration: 5.5
      }),
      createEntry({
        id: 'form-short-2',
        entryType: 'form',
        timestamp: '2026-06-02T09:00:00',
        energyScore: 5
      }),
      createEntry({
        id: 'checkin-short-3',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T08:00:00',
        energyScore: 6,
        stressLevel: 4
      }),
      createEntry({
        id: 'sleep-long-1',
        entryType: 'sleep',
        timestamp: '2026-06-03T07:00:00',
        sleepDuration: 8
      }),
      createEntry({
        id: 'form-long-1',
        entryType: 'form',
        timestamp: '2026-06-03T09:00:00',
        energyScore: 8
      }),
      createEntry({
        id: 'checkin-long-1',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-03T08:00:00',
        energyScore: 8,
        stressLevel: 3
      }),
      createEntry({
        id: 'sleep-long-2',
        entryType: 'sleep',
        timestamp: '2026-06-04T07:00:00',
        sleepDuration: 8.5
      }),
      createEntry({
        id: 'form-long-2',
        entryType: 'form',
        timestamp: '2026-06-04T09:00:00',
        energyScore: 9
      }),
      createEntry({
        id: 'checkin-long-2',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-04T08:00:00',
        energyScore: 9,
        stressLevel: 2
      })
    ];

    expect(compareSleepDurationWithNextDayState(entries)).toEqual([
      {
        averageEnergy: 6,
        averageForm: 4.5,
        countEnergyDays: 2,
        countFormDays: 2,
        countSleepDays: 2,
        key: 'under-6',
        label: 'Moins de 6h'
      },
      {
        averageEnergy: 8.5,
        averageForm: 8.5,
        countEnergyDays: 2,
        countFormDays: 2,
        countSleepDays: 2,
        key: '8-plus',
        label: '8h ou plus'
      }
    ]);
  });

  it('keeps sleep follow-up buckets when only part of the same-day data exists', () => {
    const entries = [
      createEntry({
        id: 'sleep-short',
        entryType: 'sleep',
        timestamp: '2026-06-01T07:00:00',
        sleepDuration: 5
      }),
      createEntry({
        id: 'form-short',
        entryType: 'form',
        timestamp: '2026-06-01T09:00:00',
        energyScore: 4
      }),
      createEntry({
        id: 'sleep-long',
        entryType: 'sleep',
        timestamp: '2026-06-02T07:00:00',
        sleepDuration: 8
      }),
      createEntry({
        id: 'checkin-long',
        entryType: 'checkIn',
        sourceType: 'scheduledCheckIn',
        timestamp: '2026-06-02T08:00:00',
        energyScore: 9,
        stressLevel: 2
      })
    ];

    expect(compareSleepDurationWithNextDayState(entries)).toEqual([
      {
        averageEnergy: undefined,
        averageForm: 4,
        countEnergyDays: 0,
        countFormDays: 1,
        countSleepDays: 1,
        key: 'under-6',
        label: 'Moins de 6h'
      },
      {
        averageEnergy: 9,
        averageForm: undefined,
        countEnergyDays: 1,
        countFormDays: 0,
        countSleepDays: 1,
        key: '8-plus',
        label: '8h ou plus'
      }
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

    expect(
      (
        analyticsService as typeof analyticsService & {
          dailyHydrationLiters: (entries: TrackingEntry[]) => Array<{ date: string; liters: number }>;
        }
      ).dailyHydrationLiters(entries)
    ).toEqual([
      { date: '2026-06-01', liters: 0.65 },
      { date: '2026-06-02', liters: 0.6 }
    ]);

    expect(analyzeEntries(entries)).toMatchObject({
      dailyGoals: {
        last7Days: {
          achievedCount: 0,
          decidedCount: 0,
          pendingCount: 0,
          totalGoals: 0,
          windowDays: 7
        }
      },
      hydration: {
        dailyTotal: [
          { count: 2, date: '2026-06-01', total: 65 },
          { count: 1, date: '2026-06-02', total: 60 }
        ]
      },
      sleep: {
        nextDayStateByDuration: []
      },
      scheduledCheckIns: {
        stressTrend: [
          { average: 5, count: 2, date: '2026-06-01' },
          { average: 3, count: 1, date: '2026-06-02' }
        ]
      }
    });
  });

  it('summarizes daily goal completion over recent windows', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-12T12:00:00.000Z'));

    try {
      const entries = [
        createEntry({
          id: 'goal-1',
          entryType: 'dailyGoal',
          timestamp: '2026-06-10T08:00:00',
          goalText: 'Marcher',
          goalAchieved: true
        }),
        createEntry({
          id: 'goal-2',
          entryType: 'dailyGoal',
          timestamp: '2026-06-08T08:00:00',
          goalText: 'Respirer',
          goalAchieved: false
        }),
        createEntry({
          id: 'goal-3',
          entryType: 'dailyGoal',
          timestamp: '2026-05-20T08:00:00',
          goalText: 'Lire',
          goalAchieved: true
        }),
        createEntry({
          id: 'goal-4',
          entryType: 'dailyGoal',
          timestamp: '2026-06-12T08:00:00',
          goalText: 'Faire une pause'
        })
      ];

      expect(analyzeDailyGoals(entries)).toEqual({
        last7Days: {
          achievedCount: 1,
          decidedCount: 2,
          pendingCount: 1,
          totalGoals: 3,
          windowDays: 7
        },
        last30Days: {
          achievedCount: 2,
          decidedCount: 3,
          pendingCount: 1,
          totalGoals: 4,
          windowDays: 30
        }
      });
    } finally {
      vi.useRealTimers();
    }
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

  it('ignores invalid meditation durations and missing migraine pain scores', () => {
    const entries = [
      createEntry({
        id: 'meditation-valid',
        entryType: 'meditation',
        timestamp: '2026-06-01T19:00:00',
        meditationDuration: 15
      }),
      createEntry({
        id: 'meditation-nan',
        entryType: 'meditation',
        timestamp: '2026-06-02T19:00:00',
        meditationDuration: Number.NaN
      }),
      createEntry({
        id: 'migraine-1',
        entryType: 'migraine',
        timestamp: '2026-06-01T09:00:00',
        migraineLevel: 'moderate'
      }),
      createEntry({
        id: 'migraine-2',
        entryType: 'migraine',
        timestamp: '2026-06-02T14:00:00',
        migraineLevel: 'severe'
      })
    ];

    expect(analyzeMeditation(entries)).toEqual({
      averageMinutes: 15,
      totalMinutes: 15,
      totalSessions: 1,
      weekly: [
        {
          averageMinutes: 15,
          sessionCount: 1,
          totalMinutes: 15,
          weekStart: '2026-06-01'
        }
      ]
    });

    expect(analyzeMigraine(entries)).toEqual({
      byHour: [],
      frequency: {
        averageEpisodesPerDay: 1,
        averageEpisodesPerWeek: 7,
        daysWithEpisodes: 2,
        totalEpisodes: 2
      },
      intensity: {
        averagePain: null,
        entriesWithPainScore: 0
      },
      vsCaffeine: [],
      vsStress: []
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
