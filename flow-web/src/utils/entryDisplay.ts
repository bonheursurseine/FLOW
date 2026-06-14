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
  caffeine: 'Caféine',
  checkIn: 'Check-in',
  dailyGoal: 'Objectif du jour',
  form: 'Forme',
  freeNote: 'Note libre',
  hydration: 'Hydratation',
  meal: 'Repas',
  medication: 'Médicament',
  meditation: 'Méditation',
  mentalLoad: 'Charge mentale',
  migraine: 'Migraine',
  nap: 'Sieste',
  notableEvent: 'Événement',
  physicalActivity: 'Activité physique',
  screenTime: "Temps d'écran",
  sleep: 'Sommeil',
  stress: 'Stress'
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  scheduledCheckIn: 'Programme',
  spontaneous: 'Spontané'
};

const MIGRAINE_LEVEL_LABELS: Record<MigraineLevel, string> = {
  mild: 'Migraine légère',
  moderate: 'Migraine modérée',
  none: 'Pas de migraine',
  severe: 'Migraine forte'
};

const CAFFEINE_LEVEL_LABELS: Record<CaffeineLevel, string> = {
  high: 'Caféine élevée',
  low: 'Caféine légère',
  medium: 'Caféine moyenne',
  none: 'Caféine absente'
};

const ACTIVITY_LEVEL_LABELS: Record<PhysicalActivityLevel, string> = {
  intense: 'Activité intense',
  light: 'Activité légère',
  moderate: 'Activité modérée',
  none: "Pas d'activité"
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  heavy: 'Repas copieux',
  light: 'Repas léger',
  normal: 'Repas normal'
};

const SCREEN_TIME_LEVEL_LABELS: Record<ScreenTimeLevel, string> = {
  high: "Temps d'écran élevé",
  low: "Temps d'écran faible",
  medium: "Temps d'écran moyen",
  veryHigh: "Temps d'écran très élevé"
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
    return 'Caféine';
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
  return level ? CAFFEINE_LEVEL_LABELS[level] : 'Caféine';
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
  return level ? ACTIVITY_LEVEL_LABELS[level] : 'Activité physique';
}

export function getScreenTimeLevelLabel(level: ScreenTimeLevel | undefined): string {
  return level ? SCREEN_TIME_LEVEL_LABELS[level] : "Temps d'écran";
}

export function getSourceTypeLabel(sourceType: SourceType): string {
  return SOURCE_TYPE_LABELS[sourceType];
}
