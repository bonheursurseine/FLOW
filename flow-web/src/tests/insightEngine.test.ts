import { describe, expect, it } from 'vitest';

import { generateInsights } from '../services/insightEngine';
import type { TrackingEntry } from '../types/tracking';

describe('insightEngine', () => {
  it('falls back to an explicit insufficient-data insight', () => {
    const insights = generateInsights([]);

    expect(insights).toHaveLength(1);
    expect(insights[0].title).toBe('Pas assez de données');
    expect(insights[0].message).toContain('Pas assez de données');
    expect(insights[0].tone).toBe('fallback');
  });

  it('uses cautious wording for a sleep and form pattern', () => {
    const entries = [
      createEntry({
        id: 'sleep-low-1',
        entryType: 'sleep',
        timestamp: '2026-06-01T07:00:00',
        sleepDuration: 5
      }),
      createEntry({
        id: 'form-low-1',
        entryType: 'form',
        timestamp: '2026-06-01T10:00:00',
        energyScore: 4
      }),
      createEntry({
        id: 'sleep-low-2',
        entryType: 'sleep',
        timestamp: '2026-06-02T07:00:00',
        sleepDuration: 5.5
      }),
      createEntry({
        id: 'form-low-2',
        entryType: 'form',
        timestamp: '2026-06-02T10:00:00',
        energyScore: 4.5
      }),
      createEntry({
        id: 'sleep-high-1',
        entryType: 'sleep',
        timestamp: '2026-06-03T07:00:00',
        sleepDuration: 8
      }),
      createEntry({
        id: 'form-high-1',
        entryType: 'form',
        timestamp: '2026-06-03T10:00:00',
        energyScore: 7.5
      }),
      createEntry({
        id: 'sleep-high-2',
        entryType: 'sleep',
        timestamp: '2026-06-04T07:00:00',
        sleepDuration: 8.5
      }),
      createEntry({
        id: 'form-high-2',
        entryType: 'form',
        timestamp: '2026-06-04T10:00:00',
        energyScore: 8
      })
    ];

    const insights = generateInsights(entries);
    const sleepInsight = insights.find((insight) => insight.id === 'sleep-form-pattern');

    expect(sleepInsight).toBeDefined();
    expect(sleepInsight?.message).toContain('moins de 6h de sommeil');
    expect(sleepInsight?.message).toContain('semblent associés');
    expect(sleepInsight?.message).not.toContain('cause');
    expect(sleepInsight?.tone).toBe('cautious');
  });

  it('builds a check-in insight from quick manual check-ins too', () => {
    const entries = [
      createEntry({
        id: 'checkin-1',
        entryType: 'checkIn',
        timestamp: '2026-06-01T08:00:00',
        energyScore: 8,
        stressLevel: 4
      }),
      createEntry({
        id: 'checkin-2',
        entryType: 'checkIn',
        timestamp: '2026-06-01T12:00:00',
        energyScore: 7,
        stressLevel: 5
      }),
      createEntry({
        id: 'checkin-3',
        entryType: 'checkIn',
        timestamp: '2026-06-01T18:00:00',
        energyScore: 4,
        stressLevel: 7
      }),
      createEntry({
        id: 'checkin-4',
        entryType: 'checkIn',
        timestamp: '2026-06-02T08:00:00',
        energyScore: 8,
        stressLevel: 4
      }),
      createEntry({
        id: 'checkin-5',
        entryType: 'checkIn',
        timestamp: '2026-06-02T12:00:00',
        energyScore: 7,
        stressLevel: 5
      }),
      createEntry({
        id: 'checkin-6',
        entryType: 'checkIn',
        timestamp: '2026-06-02T18:00:00',
        energyScore: 4,
        stressLevel: 7
      }),
      createEntry({
        id: 'checkin-7',
        entryType: 'checkIn',
        timestamp: '2026-06-03T08:00:00',
        energyScore: 8,
        stressLevel: 4
      }),
      createEntry({
        id: 'checkin-8',
        entryType: 'checkIn',
        timestamp: '2026-06-03T12:00:00',
        energyScore: 7,
        stressLevel: 5
      }),
      createEntry({
        id: 'checkin-9',
        entryType: 'checkIn',
        timestamp: '2026-06-03T18:00:00',
        energyScore: 4,
        stressLevel: 7
      })
    ];

    const insights = generateInsights(entries);
    const checkInInsight = insights.find((insight) => insight.category === 'checkIn');

    expect(checkInInsight).toBeDefined();
    expect(checkInInsight?.title).toBe('Check-ins');
    expect(checkInInsight?.message).toContain('check-ins');
    expect(checkInInsight?.message).toContain('18h');
    expect(checkInInsight?.tone).toBe('cautious');
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
