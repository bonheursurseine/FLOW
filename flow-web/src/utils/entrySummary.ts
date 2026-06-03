import type { TrackingEntry } from '../types/tracking';
import {
  formatCaffeineCups,
  formatDurationMinutes,
  formatHydrationCl,
  formatOptionalText,
  formatScore,
  getCaffeineLevelLabel,
  getEntryTypeLabel,
  getMealTypeLabel,
  getMigraineLevelLabel,
  getPhysicalActivityLevelLabel,
  getScreenTimeLevelLabel
} from './entryDisplay';

export function summarizeEntry(entry: TrackingEntry): string {
  switch (entry.entryType) {
    case 'checkIn':
      return summarizeParts([
        `Energie ${formatScore(entry.energyScore)}`,
        `Stress ${formatScore(entry.stressLevel)}`
      ]);
    case 'form':
      return summarizeParts([`Forme ${formatScore(entry.energyScore)}`, entry.comment]);
    case 'sleep':
      return summarizeParts([
        entry.sleepDuration ? `Sommeil ${entry.sleepDuration}h` : undefined,
        entry.sleepQuality ? `Qualite ${formatScore(entry.sleepQuality)}` : undefined,
        entry.comment
      ]);
    case 'hydration':
      return summarizeParts([
        entry.hydrationAmountCl ? `Hydratation ${formatHydrationCl(entry.hydrationAmountCl)}` : undefined,
        entry.comment
      ]);
    case 'stress':
      return summarizeParts([`Stress ${formatScore(entry.stressLevel)}`, entry.comment]);
    case 'mentalLoad':
      return summarizeParts([`Charge ${formatScore(entry.mentalLoad)}`, entry.comment]);
    case 'migraine':
      return summarizeParts([
        getMigraineLevelLabel(entry.migraineLevel),
        entry.migrainePainScore ? `Douleur ${formatScore(entry.migrainePainScore)}` : undefined,
        entry.comment
      ]);
    case 'caffeine':
      return summarizeParts([
        typeof entry.caffeineCups === 'number' ? `Cafeine ${formatCaffeineCups(entry.caffeineCups)}` : getCaffeineLevelLabel(entry.caffeineLevel),
        entry.comment
      ]);
    case 'physicalActivity':
      return summarizeParts([getPhysicalActivityLevelLabel(entry.physicalActivityLevel), entry.comment]);
    case 'meal':
      return summarizeParts([getMealTypeLabel(entry.mealType), entry.comment]);
    case 'nap':
      return summarizeParts([
        entry.napDuration ? `Sieste ${formatDurationMinutes(entry.napDuration)}` : undefined,
        entry.comment
      ]);
    case 'screenTime':
      return summarizeParts([getScreenTimeLevelLabel(entry.screenTimeLevel), entry.comment]);
    case 'medication':
      return summarizeParts([entry.medicationNote, entry.comment]);
    case 'meditation':
      return summarizeParts([
        entry.meditationDuration
          ? `Meditation ${formatDurationMinutes(entry.meditationDuration)}`
          : 'Meditation',
        entry.comment
      ]);
    case 'notableEvent':
      return summarizeParts([entry.eventNote, entry.comment]);
    case 'freeNote':
      return summarizeParts([entry.freeNote, entry.comment]);
    default:
      return summarizeParts([entry.comment]) || getEntryTypeLabel(entry.entryType);
  }
}

function summarizeParts(parts: Array<string | undefined>): string {
  const filtered = parts
    .map((part) => formatOptionalText(part, ''))
    .filter((part) => part.length > 0);

  return filtered.join(' - ');
}
