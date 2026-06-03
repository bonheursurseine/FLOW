import type {
  CaffeineLevel,
  EntryType,
  MealType,
  MigraineLevel,
  PhysicalActivityLevel,
  ScreenTimeLevel,
  SourceType
} from '../types/tracking';

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  caffeine: 'Cafeine',
  checkIn: 'Check-in',
  form: 'Forme',
  freeNote: 'Note libre',
  hydration: 'Hydratation',
  meal: 'Repas',
  medication: 'Medicament',
  meditation: 'Meditation',
  mentalLoad: 'Charge mentale',
  migraine: 'Migraine',
  nap: 'Sieste',
  notableEvent: 'Evenement',
  physicalActivity: 'Activite physique',
  screenTime: 'Temps d ecran',
  sleep: 'Sommeil',
  stress: 'Stress'
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  scheduledCheckIn: 'Programme',
  spontaneous: 'Spontane'
};

const MIGRAINE_LEVEL_LABELS: Record<MigraineLevel, string> = {
  mild: 'Migraine legere',
  moderate: 'Migraine moderee',
  none: 'Pas de migraine',
  severe: 'Migraine forte'
};

const CAFFEINE_LEVEL_LABELS: Record<CaffeineLevel, string> = {
  high: 'Cafeine elevee',
  low: 'Cafeine legere',
  medium: 'Cafeine moyenne',
  none: 'Cafeine absente'
};

const ACTIVITY_LEVEL_LABELS: Record<PhysicalActivityLevel, string> = {
  intense: 'Activite intense',
  light: 'Activite legere',
  moderate: 'Activite moderee',
  none: 'Pas d activite'
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  heavy: 'Repas copieux',
  light: 'Repas leger',
  normal: 'Repas normal'
};

const SCREEN_TIME_LEVEL_LABELS: Record<ScreenTimeLevel, string> = {
  high: 'Temps d ecran eleve',
  low: 'Temps d ecran faible',
  medium: 'Temps d ecran moyen',
  veryHigh: 'Temps d ecran tres eleve'
};

export function formatDurationMinutes(minutes: number | undefined): string {
  if (typeof minutes !== 'number' || Number.isNaN(minutes)) {
    return '-';
  }

  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${String(remainingMinutes).padStart(2, '0')}`;
  }

  return `${minutes} min`;
}

export function formatCaffeineCups(cups: number | undefined): string {
  if (typeof cups !== 'number' || Number.isNaN(cups)) {
    return 'Cafeine';
  }

  return `${cups} ${cups > 1 ? 'tasses' : 'tasse'}`;
}

export function formatHydrationCl(amountCl: number | undefined): string {
  if (typeof amountCl !== 'number' || Number.isNaN(amountCl)) {
    return 'Hydratation';
  }

  return `${amountCl} cL`;
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}h`;
}

export function formatOptionalText(value: string | undefined, fallback = '-'): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function formatShortDateTime(timestamp: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short'
  }).format(new Date(timestamp));
}

export function formatShortDate(timestamp: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(timestamp));
}

export function formatScore(value: number | undefined, suffix = '/10'): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }

  return `${value}${suffix}`;
}

export function getCaffeineLevelLabel(level: CaffeineLevel | undefined): string {
  return level ? CAFFEINE_LEVEL_LABELS[level] : 'Cafeine';
}

export function getEntryTypeLabel(entryType: EntryType): string {
  return ENTRY_TYPE_LABELS[entryType];
}

export function getMealTypeLabel(level: MealType | undefined): string {
  return level ? MEAL_TYPE_LABELS[level] : 'Repas';
}

export function getMigraineLevelLabel(level: MigraineLevel | undefined): string {
  return level ? MIGRAINE_LEVEL_LABELS[level] : 'Migraine';
}

export function getPhysicalActivityLevelLabel(level: PhysicalActivityLevel | undefined): string {
  return level ? ACTIVITY_LEVEL_LABELS[level] : 'Activite physique';
}

export function getScreenTimeLevelLabel(level: ScreenTimeLevel | undefined): string {
  return level ? SCREEN_TIME_LEVEL_LABELS[level] : 'Temps d ecran';
}

export function getSourceTypeLabel(sourceType: SourceType): string {
  return SOURCE_TYPE_LABELS[sourceType];
}
