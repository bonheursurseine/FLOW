import type { TrackingEntry } from '../types/tracking';

export interface DailyAveragePoint {
  average: number;
  count: number;
  date: string;
}

export interface HourlyAveragePoint {
  average: number;
  count: number;
  hour: number;
}

export interface WeeklyAggregatePoint {
  averageMinutes: number;
  sessionCount: number;
  totalMinutes: number;
  weekStart: string;
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function endOfDayDate(dateKey: string): Date {
  const date = parseDateKey(dateKey);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function getHourOfDay(timestamp: string): number {
  return new Date(timestamp).getHours();
}

export function groupAverageByDate(
  entries: TrackingEntry[],
  valueSelector: (entry: TrackingEntry) => number | undefined
): DailyAveragePoint[] {
  const grouped = new Map<string, number[]>();

  for (const entry of entries) {
    const value = valueSelector(entry);
    if (typeof value !== 'number' || Number.isNaN(value)) {
      continue;
    }

    const dateKey = toDateKey(entry.timestamp);
    const values = grouped.get(dateKey) ?? [];
    values.push(value);
    grouped.set(dateKey, values);
  }

  return Array.from(grouped.entries())
    .map(([date, values]) => ({
      average: average(values),
      count: values.length,
      date
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function groupAverageByHour(
  entries: TrackingEntry[],
  valueSelector: (entry: TrackingEntry) => number | undefined
): HourlyAveragePoint[] {
  const grouped = new Map<number, number[]>();

  for (const entry of entries) {
    const value = valueSelector(entry);
    if (typeof value !== 'number' || Number.isNaN(value)) {
      continue;
    }

    const hour = getHourOfDay(entry.timestamp);
    const values = grouped.get(hour) ?? [];
    values.push(value);
    grouped.set(hour, values);
  }

  return Array.from(grouped.entries())
    .map(([hour, values]) => ({
      average: average(values),
      count: values.length,
      hour
    }))
    .sort((left, right) => left.hour - right.hour);
}

export function groupSumByWeek(
  entries: TrackingEntry[],
  valueSelector: (entry: TrackingEntry) => number | undefined
): WeeklyAggregatePoint[] {
  const grouped = new Map<string, number[]>();

  for (const entry of entries) {
    const value = valueSelector(entry);
    if (typeof value !== 'number' || Number.isNaN(value)) {
      continue;
    }

    const weekStart = toWeekStartKey(entry.timestamp);
    const values = grouped.get(weekStart) ?? [];
    values.push(value);
    grouped.set(weekStart, values);
  }

  return Array.from(grouped.entries())
    .map(([weekStart, values]) => ({
      averageMinutes: average(values),
      sessionCount: values.length,
      totalMinutes: round(values.reduce((sum, value) => sum + value, 0)),
      weekStart
    }))
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart));
}

export function indexDailyCategory<TCategory extends string>(
  entries: TrackingEntry[],
  valueSelector: (entry: TrackingEntry) => TCategory | undefined,
  rankSelector?: (value: TCategory) => number
): Map<string, TCategory> {
  const dailyValues = new Map<string, TCategory>();

  for (const entry of entries) {
    const value = valueSelector(entry);
    if (!value) {
      continue;
    }

    const dateKey = toDateKey(entry.timestamp);
    const previous = dailyValues.get(dateKey);

    if (!previous || shouldReplaceCategory(previous, value, rankSelector)) {
      dailyValues.set(dateKey, value);
    }
  }

  return dailyValues;
}

export function indexDailyValue(
  entries: TrackingEntry[],
  valueSelector: (entry: TrackingEntry) => number | undefined
): Map<string, number> {
  const grouped = groupAverageByDate(entries, valueSelector);
  return new Map(grouped.map((point) => [point.date, point.average]));
}

export function pickRecentWindow(points: DailyAveragePoint[], dayCount: number, anchorDateKey?: string): DailyAveragePoint[] {
  if (points.length === 0 || dayCount <= 0) {
    return [];
  }

  const anchorKey = anchorDateKey ?? points[points.length - 1].date;
  const anchor = endOfDayDate(anchorKey);
  const earliest = new Date(anchor);
  earliest.setDate(anchor.getDate() - (dayCount - 1));

  return points.filter((point) => {
    const pointDate = endOfDayDate(point.date);
    return pointDate >= earliest && pointDate <= anchor;
  });
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function toDateKey(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export function toWeekStartKey(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? new Date(timestamp) : new Date(timestamp);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return toDateKey(date);
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function shouldReplaceCategory<TCategory extends string>(
  previous: TCategory,
  next: TCategory,
  rankSelector?: (value: TCategory) => number
): boolean {
  if (!rankSelector) {
    return false;
  }

  return rankSelector(next) >= rankSelector(previous);
}
