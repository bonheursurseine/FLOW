import type { EntryType } from './tracking';

export type PwaInstallStatus = 'unknown' | 'installable' | 'installed' | 'dismissed';
export type NotificationStatus = NotificationPermission | 'unsupported' | 'unknown';

export interface LocalSettings {
  visibleHomeEntryTypes: EntryType[];
  pwaInstallStatus: PwaInstallStatus;
  notificationStatus: NotificationStatus;
  lastInstallPromptAt?: string;
  lastNotificationPromptAt?: string;
  lastReviewPromptAt?: string;
  compactHistoryCards?: boolean;
}

const DEFAULT_VISIBLE_HOME_ENTRY_TYPES: ReadonlyArray<EntryType> = Object.freeze([
  'checkIn',
  'sleep',
  'stress',
  'mentalLoad',
  'migraine',
  'freeNote'
]);

export function createDefaultLocalSettings(): LocalSettings {
  return {
    visibleHomeEntryTypes: [...DEFAULT_VISIBLE_HOME_ENTRY_TYPES],
    pwaInstallStatus: 'unknown',
    notificationStatus: 'unknown'
  };
}

export const defaultLocalSettings: LocalSettings = createDefaultLocalSettings();
