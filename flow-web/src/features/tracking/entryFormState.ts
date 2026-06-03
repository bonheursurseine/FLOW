import type { EntryType, SourceType, TrackingEntry, TrackingEntryDraft } from '../../types/tracking';

export interface EntryCardDefinition {
  description: string;
  entryType: EntryType;
  title: string;
}

export const ENTRY_CARD_DEFINITIONS: EntryCardDefinition[] = [
  { entryType: 'form', title: '😌 Forme', description: 'Noter votre niveau de forme du moment.' },
  { entryType: 'sleep', title: '😴 Sommeil', description: 'Durée, qualité et ressenti du sommeil.' },
  { entryType: 'hydration', title: '💧 Hydratation', description: 'Tracer une quantité bue en cL.' },
  { entryType: 'stress', title: '😵 Stress', description: 'Noter le stress du moment.' },
  { entryType: 'mentalLoad', title: '🧠 Charge mentale', description: 'Évaluer la charge mentale ressentie.' },
  { entryType: 'migraine', title: '🤕 Migraine', description: 'Épisode, intensité et contexte migraineux.' },
  { entryType: 'caffeine', title: '☕ Caféine', description: 'Tracer un nombre de tasses de caféine.' },
  { entryType: 'physicalActivity', title: '🏃 Activité physique', description: "Noter l'intensité de l'activité." },
  { entryType: 'meal', title: '🍽️ Repas', description: 'Documenter un repas léger ou copieux.' },
  { entryType: 'nap', title: '😴 Sieste', description: 'Noter une sieste et sa durée.' },
  { entryType: 'screenTime', title: "📱 Temps d'écran", description: "Suivre un niveau d'exposition aux écrans." },
  { entryType: 'medication', title: '💊 Médicament', description: "Garder une trace d'une prise." },
  { entryType: 'meditation', title: '🧘 Méditation', description: 'Noter une séance et sa durée.' },
  { entryType: 'notableEvent', title: '✨ Événement', description: 'Capturer un événement marquant.' },
  { entryType: 'freeNote', title: '📝 Note libre', description: 'Écrire une note rapide sans cadre.' }
];

const SCORE_MIN = 1;
const SCORE_MAX = 10;

export function createDraftFromEntry(entry: TrackingEntry): TrackingEntryDraft {
  return { ...entry };
}

export function createEntryDraft(
  entryType: EntryType,
  sourceType: SourceType = entryType === 'checkIn' ? 'spontaneous' : 'spontaneous'
): TrackingEntryDraft {
  return normalizeEntryDraft({
    entryType,
    sourceType,
    completedFromNotification: sourceType === 'scheduledCheckIn'
  });
}

export function createQuickCheckInDraft(input: {
  energyScore: number;
  stressLevel: number;
  sourceType?: SourceType;
  comment?: string;
}): TrackingEntryDraft {
  return normalizeEntryDraft({
    comment: input.comment,
    completedFromNotification: input.sourceType === 'scheduledCheckIn',
    energyScore: input.energyScore,
    entryType: 'checkIn',
    sourceType: input.sourceType ?? 'spontaneous',
    stressLevel: input.stressLevel
  });
}

export function normalizeEntryDraft(draft: TrackingEntryDraft): TrackingEntryDraft {
  const entryType = draft.entryType ?? 'freeNote';
  const sourceType = draft.sourceType ?? (entryType === 'checkIn' ? 'spontaneous' : 'spontaneous');
  const base: TrackingEntryDraft = {
    id: draft.id,
    timestamp: draft.timestamp,
    entryType,
    sourceType,
    notificationId: normalizeText(draft.notificationId),
    scheduledTime: normalizeText(draft.scheduledTime),
    completedFromNotification: sourceType === 'scheduledCheckIn' ? Boolean(draft.completedFromNotification) : false
  };

  switch (entryType) {
    case 'checkIn':
      return {
        ...base,
        energyScore: normalizeScore(draft.energyScore),
        stressLevel: normalizeScore(draft.stressLevel),
        comment: normalizeText(draft.comment)
      };
    case 'form':
      return {
        ...base,
        energyScore: normalizeScore(draft.energyScore),
        comment: normalizeText(draft.comment)
      };
    case 'sleep':
      {
        const bedTime = normalizeTimeValue(draft.bedTime);
        const wakeTime = normalizeTimeValue(draft.wakeTime);
        const hasAnySleepTime = bedTime !== undefined || wakeTime !== undefined;
        const sleepDuration = hasAnySleepTime
          ? calculateSleepDurationFromTimes(bedTime, wakeTime)
          : normalizePositiveNumber(draft.sleepDuration);

        return {
          ...base,
          bedTime,
          wakeTime,
          sleepDuration,
          sleepQuality: normalizeScore(draft.sleepQuality),
          comment: normalizeText(draft.comment)
        };
      }
    case 'hydration':
      return {
        ...base,
        hydrationAmountCl: normalizePositiveNumber(draft.hydrationAmountCl),
        comment: normalizeText(draft.comment)
      };
    case 'stress':
      return {
        ...base,
        stressLevel: normalizeScore(draft.stressLevel),
        comment: normalizeText(draft.comment)
      };
    case 'mentalLoad':
      return {
        ...base,
        mentalLoad: normalizeScore(draft.mentalLoad),
        comment: normalizeText(draft.comment)
      };
    case 'migraine':
      return {
        ...base,
        migraineLevel: draft.migraineLevel,
        migrainePainScore: normalizeScore(draft.migrainePainScore),
        migraineMedicationTaken:
          typeof draft.migraineMedicationTaken === 'boolean' ? draft.migraineMedicationTaken : undefined,
        migraineMedicationNote: normalizeText(draft.migraineMedicationNote),
        comment: normalizeText(draft.comment)
      };
    case 'caffeine':
      return {
        ...base,
        caffeineCups: normalizeNonNegativeNumber(draft.caffeineCups),
        caffeineLevel: undefined,
        comment: normalizeText(draft.comment)
      };
    case 'physicalActivity':
      return {
        ...base,
        physicalActivityLevel: draft.physicalActivityLevel,
        comment: normalizeText(draft.comment)
      };
    case 'meal':
      return {
        ...base,
        mealType: draft.mealType,
        comment: normalizeText(draft.comment)
      };
    case 'nap':
      return {
        ...base,
        napDuration: normalizePositiveNumber(draft.napDuration),
        comment: normalizeText(draft.comment)
      };
    case 'screenTime':
      return {
        ...base,
        screenTimeLevel: draft.screenTimeLevel,
        comment: normalizeText(draft.comment)
      };
    case 'medication':
      return {
        ...base,
        medicationNote: normalizeText(draft.medicationNote),
        comment: normalizeText(draft.comment)
      };
    case 'meditation':
      return {
        ...base,
        meditationDuration: normalizePositiveNumber(draft.meditationDuration),
        comment: normalizeText(draft.comment)
      };
    case 'notableEvent':
      return {
        ...base,
        eventNote: normalizeText(draft.eventNote),
        comment: normalizeText(draft.comment)
      };
    case 'freeNote':
    default:
      return {
        ...base,
        freeNote: normalizeText(draft.freeNote),
        comment: normalizeText(draft.comment)
      };
  }
}

export function validateEntryDraft(draft: TrackingEntryDraft): string[] {
  const normalized = normalizeEntryDraft(draft);

  switch (normalized.entryType) {
    case 'checkIn':
      return requireFields(normalized, ['energyScore', 'stressLevel'], 'Le check-in rapide demande énergie et stress.');
    case 'form':
      return requireOne(normalized, ['energyScore', 'comment'], 'Ajoutez une note de forme ou un commentaire.');
    case 'sleep':
      return validateSleepDraft(normalized);
    case 'hydration':
      return requireOne(normalized, ['hydrationAmountCl', 'comment'], "Ajoutez une quantité d'hydratation ou un commentaire.");
    case 'stress':
      return requireOne(normalized, ['stressLevel', 'comment'], 'Ajoutez un niveau de stress ou un commentaire.');
    case 'mentalLoad':
      return requireOne(normalized, ['mentalLoad', 'comment'], 'Ajoutez une charge mentale ou un commentaire.');
    case 'migraine':
      return requireOne(
        normalized,
        ['migraineLevel', 'migrainePainScore', 'migraineMedicationNote', 'comment'],
        'Ajoutez au moins une information sur la migraine.'
      );
    case 'caffeine':
      return requireOne(normalized, ['caffeineCups', 'comment'], 'Ajoutez un nombre de tasses ou un commentaire.');
    case 'physicalActivity':
      return requireOne(
        normalized,
        ['physicalActivityLevel', 'comment'],
        "Ajoutez un niveau d'activité ou un commentaire."
      );
    case 'meal':
      return requireOne(normalized, ['mealType', 'comment'], 'Ajoutez un type de repas ou un commentaire.');
    case 'nap':
      return requireOne(normalized, ['napDuration', 'comment'], 'Ajoutez une durée de sieste ou un commentaire.');
    case 'screenTime':
      return requireOne(normalized, ['screenTimeLevel', 'comment'], "Ajoutez un niveau d'écran ou un commentaire.");
    case 'medication':
      return requireOne(normalized, ['medicationNote', 'comment'], 'Ajoutez une note de medicament ou un commentaire.');
    case 'meditation':
      return requireOne(
        normalized,
        ['meditationDuration', 'comment'],
        'Ajoutez une durée de méditation ou un commentaire.'
      );
    case 'notableEvent':
      return requireOne(normalized, ['eventNote', 'comment'], 'Ajoutez un evenement ou un commentaire.');
    case 'freeNote':
    default:
      return requireOne(normalized, ['freeNote', 'comment'], "Ajoutez une note avant d'enregistrer.");
  }
}

function normalizePositiveNumber(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return undefined;
  }

  return value;
}

function normalizeNonNegativeNumber(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return undefined;
  }

  return value;
}

function normalizeScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }

  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}

function normalizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeTimeValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return undefined;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function calculateSleepDurationFromTimes(
  bedTime: string | undefined,
  wakeTime: string | undefined
): number | undefined {
  if (!bedTime || !wakeTime) {
    return undefined;
  }

  const bedMinutes = parseTimeToMinutes(bedTime);
  const wakeMinutes = parseTimeToMinutes(wakeTime);

  if (bedMinutes === undefined || wakeMinutes === undefined || bedMinutes === wakeMinutes) {
    return undefined;
  }

  const differenceMinutes = wakeMinutes > bedMinutes ? wakeMinutes - bedMinutes : 24 * 60 - bedMinutes + wakeMinutes;
  return differenceMinutes / 60;
}

function parseTimeToMinutes(value: string): number | undefined {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return undefined;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined;
  }

  return hour * 60 + minute;
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null;
}

function requireFields(
  draft: TrackingEntryDraft,
  fieldNames: Array<keyof TrackingEntryDraft>,
  message: string
): string[] {
  return fieldNames.every((fieldName) => hasValue(draft[fieldName])) ? [] : [message];
}

function requireOne(
  draft: TrackingEntryDraft,
  fieldNames: Array<keyof TrackingEntryDraft>,
  message: string
): string[] {
  return fieldNames.some((fieldName) => hasValue(draft[fieldName])) ? [] : [message];
}

function validateSleepDraft(draft: TrackingEntryDraft): string[] {
  return hasValue(draft.sleepDuration) || hasValue(draft.sleepQuality) || hasValue(draft.comment)
    ? []
    : ['Ajoutez des heures, une qualité ou un commentaire.'];
}
