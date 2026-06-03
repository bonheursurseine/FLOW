import { FLOW_STORE_NAMES, getFlowStorage } from './db';
import { createDefaultLocalSettings, type LocalSettings } from '../types/settings';

const SETTINGS_KEY = 'local-settings';

export interface SettingsRepository {
  clear(): Promise<void>;
  getSettings(): Promise<LocalSettings>;
  saveSettings(settings: LocalSettings): Promise<LocalSettings>;
  updateSettings(patch: Partial<LocalSettings>): Promise<LocalSettings>;
}

const localSettingsRepository: SettingsRepository = {
  async clear() {
    const storage = await getFlowStorage();
    await storage.delete(FLOW_STORE_NAMES.settings, SETTINGS_KEY);
  },

  async getSettings() {
    const storage = await getFlowStorage();
    const record = await storage.get(FLOW_STORE_NAMES.settings, SETTINGS_KEY);

    if (!record) {
      return createDefaultLocalSettings();
    }

    return mergeSettings(record.value);
  },

  async saveSettings(settings) {
    const nextSettings = mergeSettings(settings);
    const storage = await getFlowStorage();

    await storage.put(FLOW_STORE_NAMES.settings, {
      key: SETTINGS_KEY,
      value: nextSettings
    });

    return nextSettings;
  },

  async updateSettings(patch) {
    const current = await localSettingsRepository.getSettings();
    return localSettingsRepository.saveSettings({
      ...current,
      ...patch
    });
  }
};

export const settingsRepository = localSettingsRepository;

function mergeSettings(settings: Partial<LocalSettings>): LocalSettings {
  const defaults = createDefaultLocalSettings();

  return {
    ...defaults,
    ...settings,
    visibleHomeEntryTypes: [...(settings.visibleHomeEntryTypes ?? defaults.visibleHomeEntryTypes)]
  };
}
