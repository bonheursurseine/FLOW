import type { TrackingEntry } from '../types/tracking';
import {
  average,
  type DailyAveragePoint,
  endOfDayDate,
  groupAverageByDate,
  groupAverageByHour,
  groupSumByWeek,
  indexDailyValue,
  pickRecentWindow,
  round,
  toDateKey,
  type WeeklyAggregatePoint
} from '../utils/dateBuckets';

export interface BucketComparisonPoint<TKey extends string = string> {
  average: number;
  count: number;
  key: TKey;
  label: string;
}

export interface MigraineFrequencyStats {
  averageEpisodesPerDay: number;
  averageEpisodesPerWeek: number;
  daysWithEpisodes: number;
  totalEpisodes: number;
}

export interface MigraineIntensityStats {
  averagePain: number | null;
  entriesWithPainScore: number;
}

export interface MigraineHourPoint {
  averagePain: number | null;
  count: number;
  hour: number;
}

export interface MigraineComparisonPoint<TKey extends string = string> {
  averageEpisodes: number;
  count: number;
  key: TKey;
  label: string;
}

export interface MigraineAnalytics {
  byHour: MigraineHourPoint[];
  frequency: MigraineFrequencyStats;
  intensity: MigraineIntensityStats;
  vsCaffeine: MigraineComparisonPoint<'none' | 'low' | 'high'>[];
  vsStress: MigraineComparisonPoint<'low' | 'medium' | 'high'>[];
}

export interface MeditationAnalytics {
  averageMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  weekly: WeeklyAggregatePoint[];
}

export interface AnalyticsSnapshot {
  scheduledCheckIns: {
    averageEnergyByHour: ReturnType<typeof averageEnergyByHour>;
    averageStressByHour: ReturnType<typeof averageStressByHour>;
    energyTrend: DailyAveragePoint[];
    stressTrend: DailyAveragePoint[];
  };
  form: {
    dailyAverage: DailyAveragePoint[];
    trend7d: DailyAveragePoint[];
    trend30d: DailyAveragePoint[];
  };
  comparisons: {
    mentalLoad: BucketComparisonPoint<'low' | 'medium' | 'high'>[];
    sleepDuration: BucketComparisonPoint<'under-6' | '6-to-8' | '8-plus'>[];
    sleepQuality: BucketComparisonPoint<'low' | 'medium' | 'high'>[];
    stress: BucketComparisonPoint<'low' | 'medium' | 'high'>[];
  };
  meditation: MeditationAnalytics;
  migraine: MigraineAnalytics;
}

type NumericBucket<TKey extends string> = {
  key: TKey;
  label: string;
  matches: (value: number) => boolean;
};

const SLEEP_DURATION_BUCKETS: Array<NumericBucket<'under-6' | '6-to-8' | '8-plus'>> = [
  { key: 'under-6', label: 'Moins de 6h', matches: (value) => value < 6 },
  { key: '6-to-8', label: 'Entre 6h et 8h', matches: (value) => value >= 6 && value < 8 },
  { key: '8-plus', label: '8h ou plus', matches: (value) => value >= 8 }
];

const QUALITY_BUCKETS: Array<NumericBucket<'low' | 'medium' | 'high'>> = [
  { key: 'low', label: 'Qualite basse (1-3)', matches: (value) => value <= 3 },
  { key: 'medium', label: 'Qualite moyenne (4-6)', matches: (value) => value >= 4 && value <= 6 },
  { key: 'high', label: 'Qualite haute (7-10)', matches: (value) => value >= 7 }
];

const STRESS_BUCKETS: Array<NumericBucket<'low' | 'medium' | 'high'>> = [
  { key: 'low', label: 'Stress bas (1-3)', matches: (value) => value <= 3 },
  { key: 'medium', label: 'Stress moyen (4-6)', matches: (value) => value >= 4 && value <= 6 },
  { key: 'high', label: 'Stress eleve (7-10)', matches: (value) => value >= 7 }
];

const MENTAL_LOAD_BUCKETS: Array<NumericBucket<'low' | 'medium' | 'high'>> = [
  { key: 'low', label: 'Charge basse (1-3)', matches: (value) => value <= 3 },
  { key: 'medium', label: 'Charge moyenne (4-6)', matches: (value) => value >= 4 && value <= 6 },
  { key: 'high', label: 'Charge elevee (7-10)', matches: (value) => value >= 7 }
];

const CAFFEINE_CUP_BUCKETS: Array<NumericBucket<'none' | 'low' | 'high'>> = [
  { key: 'none', label: '0 tasse', matches: (value) => value === 0 },
  { key: 'low', label: '1 tasse', matches: (value) => value > 0 && value < 2 },
  { key: 'high', label: '2 tasses ou plus', matches: (value) => value >= 2 }
];

export function analyzeEntries(entries: TrackingEntry[]): AnalyticsSnapshot {
  const formDailyAverage = dailyFormAverage(entries);

  return {
    comparisons: {
      mentalLoad: compareFormWithMentalLoad(entries),
      sleepDuration: compareFormWithSleepDuration(entries),
      sleepQuality: compareFormWithSleepQuality(entries),
      stress: compareFormWithStress(entries)
    },
    form: {
      dailyAverage: formDailyAverage,
      trend30d: pickRecentWindow(formDailyAverage, 30),
      trend7d: pickRecentWindow(formDailyAverage, 7)
    },
    meditation: analyzeMeditation(entries),
    migraine: analyzeMigraine(entries),
    scheduledCheckIns: {
      averageEnergyByHour: averageEnergyByHour(entries),
      averageStressByHour: averageStressByHour(entries),
      energyTrend: scheduledCheckInEnergyTrend(entries),
      stressTrend: scheduledCheckInStressTrend(entries)
    }
  };
}

export function analyzeMeditation(entries: TrackingEntry[]): MeditationAnalytics {
  const meditationEntries = entries.filter(
    (entry) => entry.entryType === 'meditation' && typeof entry.meditationDuration === 'number'
  );

  const durations = meditationEntries
    .map((entry) => entry.meditationDuration)
    .filter((duration): duration is number => typeof duration === 'number' && !Number.isNaN(duration));

  return {
    averageMinutes: durations.length > 0 ? average(durations) : 0,
    totalMinutes: round(durations.reduce((sum, duration) => sum + duration, 0)),
    totalSessions: meditationEntries.length,
    weekly: groupSumByWeek(meditationEntries, (entry) => entry.meditationDuration)
  };
}

export function analyzeMigraine(entries: TrackingEntry[]): MigraineAnalytics {
  const migraineEntries = entries.filter((entry) => entry.entryType === 'migraine');
  const migraineCountByDay = countEntriesByDate(migraineEntries);
  const painScores = migraineEntries
    .map((entry) => entry.migrainePainScore)
    .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));

  const byHour = groupAverageByHour(migraineEntries, (entry) => entry.migrainePainScore).map((point) => ({
    averagePain: point.count > 0 ? point.average : null,
    count: point.count,
    hour: point.hour
  }));

  return {
    byHour,
    frequency: {
      averageEpisodesPerDay:
        migraineCountByDay.size > 0 ? round(migraineEntries.length / migraineCountByDay.size) : 0,
      averageEpisodesPerWeek:
        migraineCountByDay.size > 0 ? round((migraineEntries.length / migraineCountByDay.size) * 7) : 0,
      daysWithEpisodes: migraineCountByDay.size,
      totalEpisodes: migraineEntries.length
    },
    intensity: {
      averagePain: painScores.length > 0 ? average(painScores) : null,
      entriesWithPainScore: painScores.length
    },
    vsCaffeine: compareDailyCountsWithNumericBucket(
      migraineCountByDay,
      indexDailyValue(
        entries.filter((entry) => entry.entryType === 'caffeine'),
        (entry) => entry.caffeineCups
      ),
      CAFFEINE_CUP_BUCKETS
    ),
    vsStress: compareDailyCountsWithNumericBucket(
      migraineCountByDay,
      indexDailyValue(entries.filter((entry) => entry.entryType === 'stress'), (entry) => entry.stressLevel),
      STRESS_BUCKETS
    )
  };
}

export function averageEnergyByHour(entries: TrackingEntry[]) {
  return groupAverageByHour(scheduledCheckIns(entries), (entry) => entry.energyScore);
}

export function averageStressByHour(entries: TrackingEntry[]) {
  return groupAverageByHour(scheduledCheckIns(entries), (entry) => entry.stressLevel);
}

export function compareFormWithMentalLoad(entries: TrackingEntry[]) {
  return compareFormWithDailyNumericValue(
    entries.filter((entry) => entry.entryType === 'mentalLoad'),
    (entry) => entry.mentalLoad,
    MENTAL_LOAD_BUCKETS,
    entries
  );
}

export function compareFormWithSleepDuration(entries: TrackingEntry[]) {
  return compareFormWithDailyNumericValue(
    entries.filter((entry) => entry.entryType === 'sleep'),
    (entry) => entry.sleepDuration,
    SLEEP_DURATION_BUCKETS,
    entries
  );
}

export function compareFormWithSleepQuality(entries: TrackingEntry[]) {
  return compareFormWithDailyNumericValue(
    entries.filter((entry) => entry.entryType === 'sleep'),
    (entry) => entry.sleepQuality,
    QUALITY_BUCKETS,
    entries
  );
}

export function compareFormWithStress(entries: TrackingEntry[]) {
  return compareFormWithDailyNumericValue(
    entries.filter((entry) => entry.entryType === 'stress'),
    (entry) => entry.stressLevel,
    STRESS_BUCKETS,
    entries
  );
}

export function dailyFormAverage(entries: TrackingEntry[]): DailyAveragePoint[] {
  return groupAverageByDate(
    entries.filter((entry) => entry.entryType === 'form'),
    (entry) => entry.energyScore
  );
}

export function formTrend(entries: TrackingEntry[], dayCount: number, anchorDateKey?: string): DailyAveragePoint[] {
  return pickRecentWindow(dailyFormAverage(entries), dayCount, anchorDateKey);
}

export function scheduledCheckInEnergyTrend(entries: TrackingEntry[]): DailyAveragePoint[] {
  return groupAverageByDate(scheduledCheckIns(entries), (entry) => entry.energyScore);
}

export function scheduledCheckInStressTrend(entries: TrackingEntry[]): DailyAveragePoint[] {
  return groupAverageByDate(scheduledCheckIns(entries), (entry) => entry.stressLevel);
}

function compareDailyCountsWithCategory<TKey extends string>(
  countByDay: Map<string, number>,
  categoryByDay: Map<string, TKey>,
  labelSelector: (key: TKey) => string
): MigraineComparisonPoint<TKey>[] {
  const grouped = new Map<TKey, number[]>();

  for (const [date, category] of categoryByDay.entries()) {
    const count = countByDay.get(date) ?? 0;
    const counts = grouped.get(category) ?? [];
    counts.push(count);
    grouped.set(category, counts);
  }

  return Array.from(grouped.entries())
    .map(([key, counts]) => ({
      averageEpisodes: average(counts),
      count: counts.length,
      key,
      label: labelSelector(key)
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function compareDailyCountsWithNumericBucket<TKey extends string>(
  countByDay: Map<string, number>,
  valueByDay: Map<string, number>,
  buckets: Array<NumericBucket<TKey>>
): MigraineComparisonPoint<TKey>[] {
  const grouped = new Map<TKey, number[]>();

  for (const [date, value] of valueByDay.entries()) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      continue;
    }

    const bucket = resolveBucket(value, buckets);
    if (!bucket) {
      continue;
    }

    const count = countByDay.get(date) ?? 0;
    const counts = grouped.get(bucket.key) ?? [];
    counts.push(count);
    grouped.set(bucket.key, counts);
  }

  return buckets
    .filter((bucket) => grouped.has(bucket.key))
    .map((bucket) => {
      const counts = grouped.get(bucket.key) ?? [];
      return {
        averageEpisodes: average(counts),
        count: counts.length,
        key: bucket.key,
        label: bucket.label
      };
    });
}

function compareFormWithDailyNumericValue<TKey extends string>(
  entriesWithMeasure: TrackingEntry[],
  measureSelector: (entry: TrackingEntry) => number | undefined,
  buckets: Array<NumericBucket<TKey>>,
  allEntries: TrackingEntry[]
): BucketComparisonPoint<TKey>[] {
  const formAverageByDay = new Map(dailyFormAverage(allEntries).map((point) => [point.date, point.average]));
  const valueByDay = indexDailyValue(entriesWithMeasure, measureSelector);
  const grouped = new Map<TKey, number[]>();

  for (const [date, value] of valueByDay.entries()) {
    const formAverage = formAverageByDay.get(date);
    if (typeof formAverage !== 'number') {
      continue;
    }

    const bucket = resolveBucket(value, buckets);
    if (!bucket) {
      continue;
    }

    const values = grouped.get(bucket.key) ?? [];
    values.push(formAverage);
    grouped.set(bucket.key, values);
  }

  return buckets
    .filter((bucket) => grouped.has(bucket.key))
    .map((bucket) => {
      const values = grouped.get(bucket.key) ?? [];
      return {
        average: average(values),
        count: values.length,
        key: bucket.key,
        label: bucket.label
      };
    });
}

function countEntriesByDate(entries: TrackingEntry[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const date = toDateKey(entry.timestamp);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return counts;
}

function resolveBucket<TKey extends string>(value: number, buckets: Array<NumericBucket<TKey>>) {
  return buckets.find((bucket) => bucket.matches(value));
}

function scheduledCheckIns(entries: TrackingEntry[]): TrackingEntry[] {
  return entries.filter(
    (entry) => entry.entryType === 'checkIn' && entry.sourceType === 'scheduledCheckIn'
  );
}
