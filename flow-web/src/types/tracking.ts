export type EntryType =
  | 'form'
  | 'sleep'
  | 'hydration'
  | 'stress'
  | 'mentalLoad'
  | 'migraine'
  | 'caffeine'
  | 'physicalActivity'
  | 'meal'
  | 'nap'
  | 'screenTime'
  | 'medication'
  | 'meditation'
  | 'notableEvent'
  | 'freeNote'
  | 'checkIn';

export type SourceType = 'spontaneous' | 'scheduledCheckIn';

export type MigraineLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type CaffeineLevel = 'none' | 'low' | 'medium' | 'high';
export type PhysicalActivityLevel = 'none' | 'light' | 'moderate' | 'intense';
export type MealType = 'light' | 'normal' | 'heavy';
export type ScreenTimeLevel = 'low' | 'medium' | 'high' | 'veryHigh';

export interface TrackingEntry {
  id: string;
  timestamp: string;
  entryType: EntryType;
  sourceType: SourceType;
  notificationId?: string;
  scheduledTime?: string;
  completedFromNotification?: boolean;
  energyScore?: number;
  bedTime?: string;
  wakeTime?: string;
  sleepDuration?: number;
  sleepQuality?: number;
  hydrationAmountCl?: number;
  stressLevel?: number;
  mentalLoad?: number;
  migraineLevel?: MigraineLevel;
  migrainePainScore?: number;
  migraineMedicationTaken?: boolean;
  migraineMedicationNote?: string;
  caffeineLevel?: CaffeineLevel;
  caffeineCups?: number;
  physicalActivityLevel?: PhysicalActivityLevel;
  mealType?: MealType;
  napDuration?: number;
  screenTimeLevel?: ScreenTimeLevel;
  medicationNote?: string;
  meditationDuration?: number;
  eventNote?: string;
  freeNote?: string;
  comment?: string;
}

export interface TrackingEntryDraft extends Omit<TrackingEntry, 'id' | 'timestamp'> {
  id?: string;
  timestamp?: string;
}

export interface CheckInSchedule {
  id: string;
  time: string;
  isEnabled: boolean;
  label?: string;
}

export interface CheckInScheduleDraft extends Omit<CheckInSchedule, 'id'> {
  id?: string;
}
