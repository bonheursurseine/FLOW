import { useEffect, useState } from 'react';

import { InspirationalQuoteCard } from '../../components/InspirationalQuoteCard';
import { settingsRepository } from '../../storage/settingsRepository';
import type { LocalSettings } from '../../types/settings';
import type { EntryType } from '../../types/tracking';

import { DailyGoalCard } from './DailyGoalCard';
import { EntryCardGrid } from './EntryCardGrid';
import { EntrySheet } from './EntrySheet';
import { QuickCheckInCard } from './QuickCheckInCard';

export function NoterPage() {
  const [activeEntryType, setActiveEntryType] = useState<EntryType | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [settings, setSettings] = useState<LocalSettings | null>(null);

  useEffect(() => {
    void settingsRepository.getSettings().then(setSettings);
  }, []);

  function handleOpen(entryType: EntryType) {
    setFeedback(null);
    setActiveEntryType(entryType);
  }

  function handleClose() {
    setActiveEntryType(null);
  }

  function handleSaved() {
    setFeedback('Entree enregistree localement.');
  }

  return (
    <main className="app-shell__surface">
      <QuickCheckInCard onSaved={() => setFeedback('Check-in rapide enregistre.')} />
      <InspirationalQuoteCard />
      <DailyGoalCard onSaved={() => setFeedback('Objectif du jour enregistre localement.')} />
      <EntryCardGrid
        onSelect={handleOpen}
        visibleEntryTypes={settings?.visibleHomeEntryTypes.filter((entryType) => entryType !== 'checkIn')}
      />
      {feedback ? <p className="status-copy">{feedback}</p> : null}
      <EntrySheet entryType={activeEntryType} onClose={handleClose} onSaved={handleSaved} open={activeEntryType !== null} />
    </main>
  );
}
