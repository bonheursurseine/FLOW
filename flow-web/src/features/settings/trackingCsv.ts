import { trackingRepository, type TrackingRepository } from '../../storage/trackingRepository';
import type { TrackingEntry } from '../../types/tracking';

export const TRACKING_ENTRY_COLUMNS = [
  'id',
  'timestamp',
  'entryType',
  'sourceType',
  'notificationId',
  'scheduledTime',
  'completedFromNotification',
  'energyScore',
  'bedTime',
  'wakeTime',
  'sleepDuration',
  'sleepQuality',
  'hydrationAmountCl',
  'stressLevel',
  'mentalLoad',
  'migraineLevel',
  'migrainePainScore',
  'migraineMedicationTaken',
  'migraineMedicationNote',
  'caffeineLevel',
  'caffeineCups',
  'physicalActivityLevel',
  'mealType',
  'napDuration',
  'screenTimeLevel',
  'medicationNote',
  'meditationDuration',
  'eventNote',
  'freeNote',
  'goalText',
  'goalAchieved',
  'comment'
] as const satisfies ReadonlyArray<keyof TrackingEntry>;

type TrackingEntryColumn = (typeof TRACKING_ENTRY_COLUMNS)[number];

interface ExportTrackingEntriesCsvOptions {
  documentRef?: Document;
  now?: Date;
  repository?: Pick<TrackingRepository, 'listEntries'>;
  urlApi?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
}

export function buildTrackingEntriesCsv(entries: TrackingEntry[]): string {
  const rows = [
    TRACKING_ENTRY_COLUMNS.join(','),
    ...entries.map((entry) => TRACKING_ENTRY_COLUMNS.map((column) => formatCsvCell(entry[column])).join(','))
  ];

  return rows.join('\r\n');
}

export function buildTrackingEntriesCsvDownloadContent(entries: TrackingEntry[]): string {
  return `\uFEFF${buildTrackingEntriesCsv(entries)}`;
}

export async function exportTrackingEntriesCsv({
  documentRef = document,
  now = new Date(),
  repository = trackingRepository,
  urlApi = URL
}: ExportTrackingEntriesCsvOptions = {}): Promise<string> {
  if (typeof urlApi.createObjectURL !== 'function' || typeof urlApi.revokeObjectURL !== 'function') {
    throw new Error('CSV download is unavailable in this browser.');
  }

  const entries = await repository.listEntries();
  const filename = `flow-tracking-entries-${formatFilenameDate(now)}.csv`;
  const blob = new Blob([buildTrackingEntriesCsvDownloadContent(entries)], { type: 'text/csv;charset=utf-8' });
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

function formatCsvCell(value: TrackingEntry[TrackingEntryColumn] | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }

  const normalized = String(value);

  if (normalized.includes('"') || normalized.includes(',') || normalized.includes('\n') || normalized.includes('\r')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}

function formatFilenameDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
