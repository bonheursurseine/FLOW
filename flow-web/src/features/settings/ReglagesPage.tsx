import { useEffect, useMemo, useState } from 'react';

import { SectionCard } from '../../components/SectionCard';
import { clearFlowStorage } from '../../storage/db';
import { settingsRepository } from '../../storage/settingsRepository';
import { trackingRepository } from '../../storage/trackingRepository';
import { detectNotificationCapability, requestNotificationPermission } from '../../services/notificationService';
import { detectPwaStatus } from '../../services/pwaService';
import type { LocalSettings } from '../../types/settings';
import type { CheckInSchedule, EntryType } from '../../types/tracking';
import { getEntryTypeLabel } from '../../utils/entryDisplay';
import { ENTRY_CARD_DEFINITIONS } from '../tracking/entryFormState';

import { LocalDataReset } from './LocalDataReset';
import { NotificationStatusCard } from './NotificationStatus';
import { PwaInstallHelp } from './PwaInstallHelp';

const TOGGLE_TYPES: EntryType[] = ['checkIn', ...ENTRY_CARD_DEFINITIONS.map((card) => card.entryType)];

export function ReglagesPage() {
  const [settings, setSettings] = useState<LocalSettings | null>(null);
  const [schedules, setSchedules] = useState<CheckInSchedule[]>([]);
  const [newScheduleTime, setNewScheduleTime] = useState('09:00');
  const [newScheduleLabel, setNewScheduleLabel] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationCapability, setNotificationCapability] = useState(detectNotificationCapability());
  const pwaStatus = useMemo(() => detectPwaStatus(), []);

  useEffect(() => {
    void Promise.all([settingsRepository.getSettings(), trackingRepository.listSchedules()]).then(
      ([nextSettings, nextSchedules]) => {
        setSettings(nextSettings);
        setSchedules(nextSchedules);
      }
    );
  }, []);

  async function handleToggleVisibleType(entryType: EntryType) {
    if (!settings) {
      return;
    }

    const currentValues = new Set(settings.visibleHomeEntryTypes);
    if (currentValues.has(entryType)) {
      currentValues.delete(entryType);
    } else {
      currentValues.add(entryType);
    }

    const nextSettings = await settingsRepository.updateSettings({
      visibleHomeEntryTypes: Array.from(currentValues)
    });
    setSettings(nextSettings);
  }

  async function handleSaveSchedule() {
    const saved = await trackingRepository.saveSchedule({
      id: editingScheduleId ?? undefined,
      time: newScheduleTime,
      label: newScheduleLabel,
      isEnabled: true
    });

    setSchedules((currentSchedules) =>
      [...currentSchedules.filter((schedule) => schedule.id !== saved.id), saved].toSorted((left, right) =>
        left.time.localeCompare(right.time)
      )
    );
    setNewScheduleLabel('');
    setNewScheduleTime('09:00');
    setEditingScheduleId(null);
  }

  async function handleToggleSchedule(schedule: CheckInSchedule) {
    const saved = await trackingRepository.saveSchedule({
      ...schedule,
      isEnabled: !schedule.isEnabled
    });

    setSchedules((currentSchedules) =>
      currentSchedules.map((currentSchedule) => (currentSchedule.id === saved.id ? saved : currentSchedule))
    );
  }

  async function handleDeleteSchedule(schedule: CheckInSchedule) {
    await trackingRepository.deleteSchedule(schedule.id);
    setSchedules((currentSchedules) => currentSchedules.filter((currentSchedule) => currentSchedule.id !== schedule.id));
    if (editingScheduleId === schedule.id) {
      setEditingScheduleId(null);
      setNewScheduleLabel('');
      setNewScheduleTime('09:00');
    }
  }

  function handleStartScheduleEdit(schedule: CheckInSchedule) {
    setEditingScheduleId(schedule.id);
    setNewScheduleTime(schedule.time);
    setNewScheduleLabel(schedule.label ?? '');
  }

  async function handleRequestPermission() {
    setNotificationBusy(true);
    const permission = await requestNotificationPermission();
    setNotificationCapability(detectNotificationCapability());

    if (settings) {
      const nextSettings = await settingsRepository.updateSettings({
        lastNotificationPromptAt: new Date().toISOString(),
        notificationStatus: permission
      });
      setSettings(nextSettings);
    }

    setNotificationBusy(false);
  }

  async function handleReset() {
    if (!window.confirm('Effacer toutes les données locales de FLOW sur cet appareil ?')) {
      return;
    }

    await clearFlowStorage();
    const [nextSettings, nextSchedules] = await Promise.all([
      settingsRepository.getSettings(),
      trackingRepository.listSchedules()
    ]);
    setSettings(nextSettings);
    setSchedules(nextSchedules);
  }

  return (
    <main className="app-shell__surface">
      <SectionCard eyebrow="Réglages" title="Rappels et affichage">
        <div className="settings-card">
          <strong>Cartes visibles sur l'accueil</strong>
          <div className="toggle-grid">
            {TOGGLE_TYPES.map((entryType) => {
              const isActive = settings?.visibleHomeEntryTypes.includes(entryType) ?? false;
              return (
                <button
                  className={isActive ? 'toggle-chip toggle-chip--active' : 'toggle-chip'}
                  key={entryType}
                  onClick={() => void handleToggleVisibleType(entryType)}
                  type="button"
                >
                  {getEntryTypeLabel(entryType)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="settings-card">
          <strong>Horaires de check-in</strong>
          <div className="schedule-form">
            <input onChange={(event) => setNewScheduleTime(event.target.value)} type="time" value={newScheduleTime} />
            <input
              onChange={(event) => setNewScheduleLabel(event.target.value)}
              placeholder="Label optionnel"
              type="text"
              value={newScheduleLabel}
            />
            <button className="quick-check-in__action" onClick={() => void handleSaveSchedule()} type="button">
              {editingScheduleId ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
          <div className="schedule-list">
            {schedules.map((schedule) => (
              <div className="schedule-item" key={schedule.id}>
                <div>
                  <strong>{schedule.time}</strong>
                  <p>{schedule.label || 'Sans label'}</p>
                </div>
                <div className="schedule-item__actions">
                  <button className="entry-sheet__secondary" onClick={() => handleStartScheduleEdit(schedule)} type="button">
                    Éditer
                  </button>
                  <button className="entry-sheet__secondary" onClick={() => void handleToggleSchedule(schedule)} type="button">
                    {schedule.isEnabled ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="entry-sheet__secondary" onClick={() => void handleDeleteSchedule(schedule)} type="button">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {schedules.length === 0 ? <p className="status-copy">Aucun horaire configuré pour le moment.</p> : null}
          </div>
        </div>

        <NotificationStatusCard
          capability={notificationCapability}
          isBusy={notificationBusy}
          onRequestPermission={() => void handleRequestPermission()}
        />
        <PwaInstallHelp pwaStatus={pwaStatus} />
        <div className="settings-card">
          <strong>Confidentialité</strong>
          <p>
            FLOW reste 100% local dans cette V1 web: pas de compte, pas de backend, pas de synchronisation, pas d'analytics externes.
          </p>
        </div>
        <LocalDataReset onReset={() => void handleReset()} />
      </SectionCard>
    </main>
  );
}
