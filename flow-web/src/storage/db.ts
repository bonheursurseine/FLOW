import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

import type { LocalSettings } from '../types/settings';
import type { CheckInSchedule, TrackingEntry } from '../types/tracking';

const FLOW_DB_NAME = 'flow-web';
const FLOW_DB_VERSION = 1;

export const FLOW_STORE_NAMES = {
  entries: 'entries',
  schedules: 'schedules',
  settings: 'settings'
} as const;

export type FlowStoreName = (typeof FLOW_STORE_NAMES)[keyof typeof FLOW_STORE_NAMES];

interface SettingsRecord {
  key: string;
  value: LocalSettings;
}

interface FlowDatabaseSchema extends DBSchema {
  entries: {
    key: string;
    value: TrackingEntry;
    indexes: {
      'by-timestamp': string;
      'by-entry-type': string;
    };
  };
  schedules: {
    key: string;
    value: CheckInSchedule;
    indexes: {
      'by-time': string;
    };
  };
  settings: {
    key: string;
    value: SettingsRecord;
  };
}

type FlowStoreValue<TStore extends FlowStoreName> = TStore extends 'entries'
  ? TrackingEntry
  : TStore extends 'schedules'
    ? CheckInSchedule
    : SettingsRecord;

export interface FlowStorageAdapter {
  clear<TStore extends FlowStoreName>(storeName: TStore): Promise<void>;
  delete<TStore extends FlowStoreName>(storeName: TStore, key: string): Promise<void>;
  get<TStore extends FlowStoreName>(storeName: TStore, key: string): Promise<FlowStoreValue<TStore> | undefined>;
  getAll<TStore extends FlowStoreName>(storeName: TStore): Promise<Array<FlowStoreValue<TStore>>>;
  put<TStore extends FlowStoreName>(storeName: TStore, value: FlowStoreValue<TStore>): Promise<string>;
}

class MemoryStorageAdapter implements FlowStorageAdapter {
  private readonly stores: Record<FlowStoreName, Map<string, FlowStoreValue<FlowStoreName>>> = {
    entries: new Map(),
    schedules: new Map(),
    settings: new Map()
  };

  async clear<TStore extends FlowStoreName>(storeName: TStore): Promise<void> {
    this.stores[storeName].clear();
  }

  async delete<TStore extends FlowStoreName>(storeName: TStore, key: string): Promise<void> {
    this.stores[storeName].delete(key);
  }

  async get<TStore extends FlowStoreName>(
    storeName: TStore,
    key: string
  ): Promise<FlowStoreValue<TStore> | undefined> {
    const value = this.stores[storeName].get(key);
    return value ? cloneValue(value as FlowStoreValue<TStore>) : undefined;
  }

  async getAll<TStore extends FlowStoreName>(storeName: TStore): Promise<Array<FlowStoreValue<TStore>>> {
    return Array.from(this.stores[storeName].values(), (value) =>
      cloneValue(value as FlowStoreValue<TStore>)
    );
  }

  async put<TStore extends FlowStoreName>(storeName: TStore, value: FlowStoreValue<TStore>): Promise<string> {
    const key = getStoreKey(storeName, value);
    this.stores[storeName].set(key, cloneValue(value as FlowStoreValue<FlowStoreName>));
    return key;
  }
}

class IndexedDbStorageAdapter implements FlowStorageAdapter {
  constructor(private readonly db: IDBPDatabase<FlowDatabaseSchema>) {}

  async clear<TStore extends FlowStoreName>(storeName: TStore): Promise<void> {
    await this.db.clear(storeName);
  }

  async delete<TStore extends FlowStoreName>(storeName: TStore, key: string): Promise<void> {
    await this.db.delete(storeName, key);
  }

  async get<TStore extends FlowStoreName>(
    storeName: TStore,
    key: string
  ): Promise<FlowStoreValue<TStore> | undefined> {
    return (await this.db.get(storeName, key)) as FlowStoreValue<TStore> | undefined;
  }

  async getAll<TStore extends FlowStoreName>(storeName: TStore): Promise<Array<FlowStoreValue<TStore>>> {
    return (await this.db.getAll(storeName)) as Array<FlowStoreValue<TStore>>;
  }

  async put<TStore extends FlowStoreName>(storeName: TStore, value: FlowStoreValue<TStore>): Promise<string> {
    return (await this.db.put(storeName, value)) as string;
  }
}

let storagePromise: Promise<FlowStorageAdapter> | undefined;
let memoryStorage: MemoryStorageAdapter | undefined;
let activeIndexedDb: IDBPDatabase<FlowDatabaseSchema> | undefined;

function hasIndexedDbSupport(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

async function createIndexedDbStorage(): Promise<FlowStorageAdapter> {
  const db = await openDB<FlowDatabaseSchema>(FLOW_DB_NAME, FLOW_DB_VERSION, {
    upgrade(database) {
      const entries = database.objectStoreNames.contains(FLOW_STORE_NAMES.entries)
        ? undefined
        : database.createObjectStore(FLOW_STORE_NAMES.entries, { keyPath: 'id' });
      if (entries && !entries.indexNames.contains('by-timestamp')) {
        entries.createIndex('by-timestamp', 'timestamp');
      }
      if (entries && !entries.indexNames.contains('by-entry-type')) {
        entries.createIndex('by-entry-type', 'entryType');
      }

      const schedules = database.objectStoreNames.contains(FLOW_STORE_NAMES.schedules)
        ? undefined
        : database.createObjectStore(FLOW_STORE_NAMES.schedules, { keyPath: 'id' });
      if (schedules && !schedules.indexNames.contains('by-time')) {
        schedules.createIndex('by-time', 'time');
      }

      if (!database.objectStoreNames.contains(FLOW_STORE_NAMES.settings)) {
        database.createObjectStore(FLOW_STORE_NAMES.settings, { keyPath: 'key' });
      }
    }
  });

  activeIndexedDb = db;
  return new IndexedDbStorageAdapter(db);
}

function createMemoryStorage(): FlowStorageAdapter {
  memoryStorage ??= new MemoryStorageAdapter();
  return memoryStorage;
}

export function getFlowStorage(): Promise<FlowStorageAdapter> {
  if (!storagePromise) {
    storagePromise = hasIndexedDbSupport()
      ? createIndexedDbStorage().catch(() => createMemoryStorage())
      : Promise.resolve(createMemoryStorage());
  }

  return storagePromise;
}

export async function clearFlowStorage(): Promise<void> {
  const storage = await getFlowStorage();
  await Promise.all([
    storage.clear(FLOW_STORE_NAMES.entries),
    storage.clear(FLOW_STORE_NAMES.schedules),
    storage.clear(FLOW_STORE_NAMES.settings)
  ]);
}

export async function resetFlowStorageForTests(): Promise<void> {
  const previousStoragePromise = storagePromise;
  const previousIndexedDb = activeIndexedDb;
  const previousMemoryStorage = memoryStorage;

  storagePromise = undefined;
  activeIndexedDb = undefined;
  memoryStorage = undefined;

  if (previousStoragePromise) {
    try {
      const storage = await previousStoragePromise;
      await Promise.all([
        storage.clear(FLOW_STORE_NAMES.entries),
        storage.clear(FLOW_STORE_NAMES.schedules),
        storage.clear(FLOW_STORE_NAMES.settings)
      ]);
    } catch {
      // Ignore initialization failures during test reset so the next access can re-create storage.
    }
  } else if (previousMemoryStorage) {
    await Promise.all([
      previousMemoryStorage.clear(FLOW_STORE_NAMES.entries),
      previousMemoryStorage.clear(FLOW_STORE_NAMES.schedules),
      previousMemoryStorage.clear(FLOW_STORE_NAMES.settings)
    ]);
  }

  if (previousIndexedDb) {
    previousIndexedDb.close();
    await deleteFlowDatabase();
  }
}

function getStoreKey<TStore extends FlowStoreName>(storeName: TStore, value: FlowStoreValue<TStore>): string {
  if (storeName === FLOW_STORE_NAMES.settings) {
    return (value as SettingsRecord).key;
  }

  return (value as TrackingEntry | CheckInSchedule).id;
}

async function deleteFlowDatabase(): Promise<void> {
  if (typeof indexedDB === 'undefined' || typeof indexedDB.deleteDatabase !== 'function') {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(FLOW_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Failed to delete IndexedDB database.'));
    request.onblocked = () => resolve();
  });
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
