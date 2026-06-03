import {
  averageEnergyByHour,
  compareFormWithSleepDuration,
  compareFormWithStress,
  scheduledCheckInEnergyTrend
} from './analyticsService';
import type { TrackingEntry } from '../types/tracking';

export interface Insight {
  category: 'checkIn' | 'sleep' | 'stress' | 'fallback';
  id: string;
  message: string;
  supportingCount: number;
  title: string;
  tone: 'cautious' | 'fallback';
}

const MIN_COMPARISON_POINTS = 2;
const MIN_SCHEDULED_TREND_POINTS = 3;

export function generateInsights(entries: TrackingEntry[]): Insight[] {
  const insights: Insight[] = [];

  const sleepComparison = compareFormWithSleepDuration(entries);
  const shortSleep = sleepComparison.find((point) => point.key === 'under-6');
  const longSleep = sleepComparison.find((point) => point.key === '8-plus');

  if (
    shortSleep &&
    longSleep &&
    shortSleep.count >= MIN_COMPARISON_POINTS &&
    longSleep.count >= MIN_COMPARISON_POINTS &&
    longSleep.average - shortSleep.average >= 1
  ) {
    insights.push({
      category: 'sleep',
      id: 'sleep-form-pattern',
      message:
        'Les jours avec moins de 6h de sommeil semblent associes a une forme plus basse que les jours avec 8h ou plus.',
      supportingCount: shortSleep.count + longSleep.count,
      title: 'Sommeil et forme',
      tone: 'cautious'
    });
  }

  const stressComparison = compareFormWithStress(entries);
  const lowStress = stressComparison.find((point) => point.key === 'low');
  const highStress = stressComparison.find((point) => point.key === 'high');

  if (
    lowStress &&
    highStress &&
    lowStress.count >= MIN_COMPARISON_POINTS &&
    highStress.count >= MIN_COMPARISON_POINTS &&
    lowStress.average - highStress.average >= 1
  ) {
    insights.push({
      category: 'stress',
      id: 'stress-form-pattern',
      message:
        'Les jours avec un stress eleve semblent associes a une forme plus basse que les jours avec un stress bas.',
      supportingCount: lowStress.count + highStress.count,
      title: 'Stress et forme',
      tone: 'cautious'
    });
  }

  const energyByHour = averageEnergyByHour(entries);
  const scheduledTrend = scheduledCheckInEnergyTrend(entries);

  if (energyByHour.length >= MIN_SCHEDULED_TREND_POINTS && scheduledTrend.length >= MIN_SCHEDULED_TREND_POINTS) {
    const overallAverage =
      energyByHour.reduce((sum, point) => sum + point.average, 0) / energyByHour.length;
    const lowestHour = energyByHour.reduce((lowest, point) =>
      point.average < lowest.average ? point : lowest
    );

    if (overallAverage - lowestHour.average >= 1) {
      insights.push({
        category: 'checkIn',
        id: 'scheduled-energy-dip',
        message: `Les check-ins programmes suggerent une energie un peu plus basse autour de ${formatHour(lowestHour.hour)}.`,
        supportingCount: scheduledTrend.reduce((sum, point) => sum + point.count, 0),
        title: 'Check-ins programmes',
        tone: 'cautious'
      });
    }
  }

  if (insights.length === 0) {
    return [
      {
        category: 'fallback',
        id: 'not-enough-data',
        message:
          'Pas assez de donnees pour faire ressortir des tendances fiables pour le moment. Continue quelques entrees sur plusieurs jours pour avoir un premier apercu prudent.',
        supportingCount: entries.length,
        title: 'Pas assez de donnees',
        tone: 'fallback'
      }
    ];
  }

  return insights;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}h`;
}
