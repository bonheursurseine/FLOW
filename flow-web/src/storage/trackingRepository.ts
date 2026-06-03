import { FLOW_STORE_NAMES, getFlowStorage } from './db';
import type { CheckInSchedule, CheckInScheduleDraft, TrackingEntry, TrackingEntryDraft } from '../types/tracking';

export interface TrackingRepository {
  clearAll(): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  deleteSchedule(id: string): Promise<void>;
  listEntries(): Promise<TrackingEntry[]>;
  listSchedules(): Promise<CheckInSchedule[]>;
  saveEntry(entry: TrackingEntryDraft): Promise<TrackingEntry>;
  saveSchedule(schedule: CheckInScheduleDraft): Promise<CheckInSchedule>;
}

const trackingDataRepository: TrackingRepository = {
  async clearAll() {
    const storage = await getFlowStorage();
    await Promise.all([
      storage.clear(FLOW_STORE_NAMES.entries),
      storage.clear(FLOW_STORE_NAMES.schedules)
    ]);
  },

  async deleteEntry(id) {
    const storage = await getFlowStorage();
    await storage.delete(FLOW_STORE_NAMES.entries, id);
  },

  async deleteSchedule(id) {
    const storage = await getFlowStorage();
    await storage.delete(FLOW_STORE_NAMES.schedules, id);
  },

  async listEntries() {
    const storage = await getFlowStorage();
    const entries = await storage.getAll(FLOW_STORE_NAMES.entries);
    return entries.toSorted((left, right) => right.timestamp.localeCompare(left.timestamp));
  },

  async listSchedules() {
    const storage = await getFlowStorage();
    const schedules = await storage.getAll(FLOW_STORE_NAMES.schedules);
    return schedules.toSorted((left, right) => left.time.localeCompare(right.time));
  },

  async saveEntry(entry) {
    const {
      id,
      timestamp,
      entryType = 'freeNote',
      sourceType = 'spontaneous',
      completedFromNotification = false,
      ...rest
    } = entry;

    const fullEntry: TrackingEntry = {
      id: id ?? createId(),
      timestamp: timestamp ?? new Date().toISOString(),
      entryType,
      sourceType,
      completedFromNotification,
      ...rest
    };

    const storage = await getFlowStorage();
    await storage.put(FLOW_STORE_NAMES.entries, fullEntry);
    return fullEntry;
  },

  async saveSchedule(schedule) {
    const fullSchedule: CheckInSchedule = {
      id: schedule.id ?? createId(),
      time: normalizeScheduleTime(schedule.time),
      isEnabled: schedule.isEnabled ?? true,
      label: normalizeOptionalText(schedule.label)
    };

    const storage = await getFlowStorage();
    await storage.put(FLOW_STORE_NAMES.schedules, fullSchedule);
    return fullSchedule;
  }
};

export const trackingRepository = trackingDataRepository;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `flow-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeScheduleTime(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);

  if (!match) {
    return trimmed;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return trimmed;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
