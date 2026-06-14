import { settingsRepository, type SettingsRepository } from '../../storage/settingsRepository';
import { trackingRepository, type TrackingRepository } from '../../storage/trackingRepository';
import type { LocalSettings, NotificationStatus, PwaInstallStatus } from '../../types/settings';
import type {
  CaffeineLevel,
  CheckInSchedule,
  EntryType,
  MealType,
  MigraineLevel,
  PhysicalActivityLevel,
  ScreenTimeLevel,
  SourceType,
  TrackingEntry
} from '../../types/tracking';

export const FLOW_LOCAL_BACKUP_FORMAT = 'flow-local-backup';
export const FLOW_LOCAL_BACKUP_VERSION = 1;

export interface FlowLocalBackup {
  format: typeof FLOW_LOCAL_BACKUP_FORMAT;
  version: typeof FLOW_LOCAL_BACKUP_VERSION;
  exportedAt: string;
  data: {
    entries: TrackingEntry[];
    schedules: CheckInSchedule[];
    settings: LocalSettings;
  };
}

interface FlowLocalBackupRepositories {
  localSettingsRepository?: Pick<SettingsRepository, 'clear' | 'getSettings' | 'saveSettings'>;
  trackingDataRepository?: Pick<
    TrackingRepository,
    'clearAll' | 'listEntries' | 'listSchedules' | 'saveEntry' | 'saveSchedule'
  >;
}

interface ExportFlowLocalBackupJsonOptions extends FlowLocalBackupRepositories {
  documentRef?: Document;
  now?: Date;
  urlApi?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
}

const ENTRY_TYPES = new Set<EntryType>([
  'form',
  'sleep',
  'hydration',
  'stress',
  'mentalLoad',
  'migraine',
  'caffeine',
  'physicalActivity',
  'meal',
  'nap',
  'screenTime',
  'medication',
  'meditation',
  'notableEvent',
  'freeNote',
  'dailyGoal',
  'checkIn'
]);

const SOURCE_TYPES = new Set<SourceType>(['spontaneous', 'scheduledCheckIn']);
const MIGRAINE_LEVELS = new Set<MigraineLevel>(['none', 'mild', 'moderate', 'severe']);
const CAFFEINE_LEVELS = new Set<CaffeineLevel>(['none', 'low', 'medium', 'high']);
const PHYSICAL_ACTIVITY_LEVELS = new Set<PhysicalActivityLevel>(['none', 'light', 'moderate', 'intense']);
const MEAL_TYPES = new Set<MealType>(['light', 'normal', 'heavy']);
const SCREEN_TIME_LEVELS = new Set<ScreenTimeLevel>(['low', 'medium', 'high', 'veryHigh']);
const PWA_INSTALL_STATUSES = new Set<PwaInstallStatus>(['unknown', 'installable', 'installed', 'dismissed']);
const NOTIFICATION_STATUSES = new Set<NotificationStatus>(['default', 'denied', 'granted', 'unsupported', 'unknown']);

export async function buildFlowLocalBackup({
  localSettingsRepository = settingsRepository,
  now = new Date(),
  trackingDataRepository = trackingRepository
}: FlowLocalBackupRepositories & { now?: Date } = {}): Promise<FlowLocalBackup> {
  const [entries, schedules, currentSettings] = await Promise.all([
    trackingDataRepository.listEntries(),
    trackingDataRepository.listSchedules(),
    localSettingsRepository.getSettings()
  ]);

  return {
    format: FLOW_LOCAL_BACKUP_FORMAT,
    version: FLOW_LOCAL_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: {
      entries,
      schedules,
      settings: currentSettings
    }
  };
}

export async function exportFlowLocalBackupJson({
  documentRef = document,
  localSettingsRepository = settingsRepository,
  now = new Date(),
  trackingDataRepository = trackingRepository,
  urlApi = URL
}: ExportFlowLocalBackupJsonOptions = {}): Promise<string> {
  if (typeof urlApi.createObjectURL !== 'function' || typeof urlApi.revokeObjectURL !== 'function') {
    throw new Error('JSON download is unavailable in this browser.');
  }

  const backup = await buildFlowLocalBackup({
    localSettingsRepository,
    now,
    trackingDataRepository
  });
  const filename = `flow-local-backup-${formatFilenameDate(now)}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' });
  const downloadUrl = urlApi.createObjectURL(blob);
  const link = documentRef.createElement('a');

  link.href = downloadUrl;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  documentRef.body.append(link);

  try {
    link.click();
  } finally {
    link.remove();
    urlApi.revokeObjectURL(downloadUrl);
  }

  return filename;
}

export function parseFlowLocalBackupJson(jsonText: string): FlowLocalBackup {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(jsonText);
  } catch {
    throw new Error('Le fichier JSON est invalide.');
  }

  if (!isRecord(parsedValue)) {
    throw new Error('Le format du backup JSON est invalide.');
  }

  if (parsedValue.format !== FLOW_LOCAL_BACKUP_FORMAT) {
    throw new Error('Le fichier ne correspond pas a un backup FLOW.');
  }

  if (parsedValue.version !== FLOW_LOCAL_BACKUP_VERSION) {
    throw new Error('La version du backup JSON est incompatible.');
  }

  if (!isIsoDateString(parsedValue.exportedAt)) {
    throw new Error("La date d'export du backup JSON est invalide.");
  }

  if (!isRecord(parsedValue.data)) {
    throw new Error('Les donnees du backup JSON sont invalides.');
  }

  const entries = parseTrackingEntries(parsedValue.data.entries);
  const schedules = parseSchedules(parsedValue.data.schedules);
  const parsedSettings = parseSettings(parsedValue.data.settings);

  return {
    format: FLOW_LOCAL_BACKUP_FORMAT,
    version: FLOW_LOCAL_BACKUP_VERSION,
    exportedAt: parsedValue.exportedAt,
    data: {
      entries,
      schedules,
      settings: parsedSettings
    }
  };
}

export async function importFlowLocalBackupJson(
  jsonText: string,
  repositories: FlowLocalBackupRepositories = {}
): Promise<FlowLocalBackup> {
  const backup = parseFlowLocalBackupJson(jsonText);
  await restoreFlowLocalBackup(backup, repositories);
  return backup;
}

export async function restoreFlowLocalBackup(
  backup: FlowLocalBackup,
  {
    localSettingsRepository = settingsRepository,
    trackingDataRepository = trackingRepository
  }: FlowLocalBackupRepositories = {}
): Promise<void> {
  await Promise.all([trackingDataRepository.clearAll(), localSettingsRepository.clear()]);

  for (const entry of backup.data.entries) {
    await trackingDataRepository.saveEntry(entry);
  }

  for (const schedule of backup.data.schedules) {
    await trackingDataRepository.saveSchedule(schedule);
  }

  await localSettingsRepository.saveSettings(backup.data.settings);
}

function parseTrackingEntries(value: unknown): TrackingEntry[] {
  if (!Array.isArray(value)) {
    throw new Error("La liste d'entrees du backup JSON est invalide.");
  }

  return value.map((entry, index) => parseTrackingEntry(entry, index));
}

function parseTrackingEntry(value: unknown, index: number): TrackingEntry {
  if (!isRecord(value)) {
    throw new Error(`L'entree ${index + 1} du backup JSON est invalide.`);
  }

  return {
    id: readRequiredString(value.id, `L'entree ${index + 1} doit contenir un id texte.`),
    timestamp: readRequiredString(value.timestamp, `L'entree ${index + 1} doit contenir un timestamp texte.`),
    entryType: readEnum(value.entryType, ENTRY_TYPES, `L'entree ${index + 1} contient un entryType invalide.`),
    sourceType: readEnum(value.sourceType, SOURCE_TYPES, `L'entree ${index + 1} contient un sourceType invalide.`),
    notificationId: readOptionalString(value.notificationId, `L'entree ${index + 1} contient un notificationId invalide.`),
    scheduledTime: readOptionalString(value.scheduledTime, `L'entree ${index + 1} contient un scheduledTime invalide.`),
    completedFromNotification: readOptionalBoolean(
      value.completedFromNotification,
      `L'entree ${index + 1} contient un completedFromNotification invalide.`
    ),
    energyScore: readOptionalNumber(value.energyScore, `L'entree ${index + 1} contient un energyScore invalide.`),
    bedTime: readOptionalString(value.bedTime, `L'entree ${index + 1} contient un bedTime invalide.`),
    wakeTime: readOptionalString(value.wakeTime, `L'entree ${index + 1} contient un wakeTime invalide.`),
    sleepDuration: readOptionalNumber(value.sleepDuration, `L'entree ${index + 1} contient un sleepDuration invalide.`),
    sleepQuality: readOptionalNumber(value.sleepQuality, `L'entree ${index + 1} contient un sleepQuality invalide.`),
    hydrationAmountCl: readOptionalNumber(
      value.hydrationAmountCl,
      `L'entree ${index + 1} contient un hydrationAmountCl invalide.`
    ),
    stressLevel: readOptionalNumber(value.stressLevel, `L'entree ${index + 1} contient un stressLevel invalide.`),
    mentalLoad: readOptionalNumber(value.mentalLoad, `L'entree ${index + 1} contient un mentalLoad invalide.`),
    migraineLevel: readOptionalEnum(
      value.migraineLevel,
      MIGRAINE_LEVELS,
      `L'entree ${index + 1} contient un migraineLevel invalide.`
    ),
    migrainePainScore: readOptionalNumber(
      value.migrainePainScore,
      `L'entree ${index + 1} contient un migrainePainScore invalide.`
    ),
    migraineMedicationTaken: readOptionalBoolean(
      value.migraineMedicationTaken,
      `L'entree ${index + 1} contient un migraineMedicationTaken invalide.`
    ),
    migraineMedicationNote: readOptionalString(
      value.migraineMedicationNote,
      `L'entree ${index + 1} contient un migraineMedicationNote invalide.`
    ),
    caffeineLevel: readOptionalEnum(
      value.caffeineLevel,
      CAFFEINE_LEVELS,
      `L'entree ${index + 1} contient un caffeineLevel invalide.`
    ),
    caffeineCups: readOptionalNumber(value.caffeineCups, `L'entree ${index + 1} contient un caffeineCups invalide.`),
    physicalActivityLevel: readOptionalEnum(
      value.physicalActivityLevel,
      PHYSICAL_ACTIVITY_LEVELS,
      `L'entree ${index + 1} contient un physicalActivityLevel invalide.`
    ),
    mealType: readOptionalEnum(value.mealType, MEAL_TYPES, `L'entree ${index + 1} contient un mealType invalide.`),
    napDuration: readOptionalNumber(value.napDuration, `L'entree ${index + 1} contient un napDuration invalide.`),
    screenTimeLevel: readOptionalEnum(
      value.screenTimeLevel,
      SCREEN_TIME_LEVELS,
      `L'entree ${index + 1} contient un screenTimeLevel invalide.`
    ),
    medicationNote: readOptionalString(
      value.medicationNote,
      `L'entree ${index + 1} contient un medicationNote invalide.`
    ),
    meditationDuration: readOptionalNumber(
      value.meditationDuration,
      `L'entree ${index + 1} contient un meditationDuration invalide.`
    ),
    eventNote: readOptionalString(value.eventNote, `L'entree ${index + 1} contient un eventNote invalide.`),
    freeNote: readOptionalString(value.freeNote, `L'entree ${index + 1} contient un freeNote invalide.`),
    goalText: readOptionalString(value.goalText, `L'entree ${index + 1} contient un goalText invalide.`),
    goalAchieved: readOptionalBoolean(
      value.goalAchieved,
      `L'entree ${index + 1} contient un goalAchieved invalide.`
    ),
    comment: readOptionalString(value.comment, `L'entree ${index + 1} contient un comment invalide.`)
  };
}

function parseSchedules(value: unknown): CheckInSchedule[] {
  if (!Array.isArray(value)) {
    throw new Error('La liste des horaires du backup JSON est invalide.');
  }

  return value.map((schedule, index) => {
    if (!isRecord(schedule)) {
      throw new Error(`L'horaire ${index + 1} du backup JSON est invalide.`);
    }

    return {
      id: readRequiredString(schedule.id, `L'horaire ${index + 1} doit contenir un id texte.`),
      time: readRequiredString(schedule.time, `L'horaire ${index + 1} doit contenir une heure texte.`),
      isEnabled: readRequiredBoolean(
        schedule.isEnabled,
        `L'horaire ${index + 1} doit contenir un isEnabled booleen.`
      ),
      label: readOptionalString(schedule.label, `L'horaire ${index + 1} contient un label invalide.`)
    };
  });
}

function parseSettings(value: unknown): LocalSettings {
  if (!isRecord(value)) {
    throw new Error('Les reglages du backup JSON sont invalides.');
  }

  if (!Array.isArray(value.visibleHomeEntryTypes)) {
    throw new Error('visibleHomeEntryTypes doit etre une liste.');
  }

  return {
    visibleHomeEntryTypes: value.visibleHomeEntryTypes.map((entryType, index) =>
      readEnum(entryType, ENTRY_TYPES, `visibleHomeEntryTypes[${index}] est invalide.`)
    ),
    pwaInstallStatus: readEnum(value.pwaInstallStatus, PWA_INSTALL_STATUSES, 'pwaInstallStatus est invalide.'),
    notificationStatus: readEnum(
      value.notificationStatus,
      NOTIFICATION_STATUSES,
      'notificationStatus est invalide.'
    ),
    lastInstallPromptAt: readOptionalString(value.lastInstallPromptAt, 'lastInstallPromptAt est invalide.'),
    lastNotificationPromptAt: readOptionalString(
      value.lastNotificationPromptAt,
      'lastNotificationPromptAt est invalide.'
    ),
    lastReviewPromptAt: readOptionalString(value.lastReviewPromptAt, 'lastReviewPromptAt est invalide.'),
    compactHistoryCards: readOptionalBoolean(value.compactHistoryCards, 'compactHistoryCards est invalide.')
  };
}

function formatFilenameDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readRequiredString(value: unknown, errorMessage: string): string {
  if (typeof value !== 'string') {
    throw new Error(errorMessage);
  }

  return value;
}

function readOptionalString(value: unknown, errorMessage: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(errorMessage);
  }

  return value;
}

function readRequiredBoolean(value: unknown, errorMessage: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(errorMessage);
  }

  return value;
}

function readOptionalBoolean(value: unknown, errorMessage: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new Error(errorMessage);
  }

  return value;
}

function readOptionalNumber(value: unknown, errorMessage: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(errorMessage);
  }

  return value;
}

function readEnum<TValue extends string>(
  value: unknown,
  allowedValues: ReadonlySet<TValue>,
  errorMessage: string
): TValue {
  if (typeof value !== 'string' || !allowedValues.has(value as TValue)) {
    throw new Error(errorMessage);
  }

  return value as TValue;
}

function readOptionalEnum<TValue extends string>(
  value: unknown,
  allowedValues: ReadonlySet<TValue>,
  errorMessage: string
): TValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return readEnum(value, allowedValues, errorMessage);
}
