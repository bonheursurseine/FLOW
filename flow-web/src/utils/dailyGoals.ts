import type { TrackingEntry } from '../types/tracking';

export interface DailyGoalWindowStats {
  achievedCount: number;
  decidedCount: number;
  pendingCount: number;
  totalGoals: number;
  windowDays: number;
}

export function findDailyGoalForDay(
  entries: TrackingEntry[],
  referenceDate: Date = new Date()
): TrackingEntry | undefined {
  return entries.find((entry) => entry.entryType === 'dailyGoal' && isSameLocalDay(entry.timestamp, referenceDate));
}

export function getDailyGoalStatusLabel(goalAchieved: boolean | undefined): string {
  if (goalAchieved === true) {
    return 'Atteint';
  }

  if (goalAchieved === false) {
    return 'Non atteint';
  }

  return 'Non renseigne';
}

export function analyzeDailyGoalWindow(
  entries: TrackingEntry[],
  windowDays: number,
  referenceDate: Date = new Date()
): DailyGoalWindowStats {
  const startDate = new Date(referenceDate);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (windowDays - 1));

  const goalEntries = entries.filter((entry) => {
    if (entry.entryType !== 'dailyGoal') {
      return false;
    }

    const entryDate = new Date(entry.timestamp);
    return Number.isNaN(entryDate.getTime()) === false && entryDate >= startDate;
  });

  const achievedCount = goalEntries.filter((entry) => entry.goalAchieved === true).length;
  const decidedCount = goalEntries.filter((entry) => typeof entry.goalAchieved === 'boolean').length;

  return {
    achievedCount,
    decidedCount,
    pendingCount: goalEntries.length - decidedCount,
    totalGoals: goalEntries.length,
    windowDays
  };
}

function isSameLocalDay(timestamp: string, referenceDate: Date): boolean {
  const entryDate = new Date(timestamp);

  if (Number.isNaN(entryDate.getTime())) {
    return false;
  }

  return (
    entryDate.getFullYear() === referenceDate.getFullYear() &&
    entryDate.getMonth() === referenceDate.getMonth() &&
    entryDate.getDate() === referenceDate.getDate()
  );
}
