import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '../../components/EmptyState';
import { SectionCard } from '../../components/SectionCard';
import { trackingRepository } from '../../storage/trackingRepository';
import type { EntryType, SourceType, TrackingEntry } from '../../types/tracking';
import { formatShortDateTime, getEntryTypeLabel, getSourceTypeLabel } from '../../utils/entryDisplay';
import { summarizeEntry } from '../../utils/entrySummary';

import { EntryDetailSheet } from './EntryDetailSheet';
import { HistoryFilters } from './HistoryFilters';

export function HistoriquePage() {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TrackingEntry | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<EntryType | 'all'>('all');

  useEffect(() => {
    void loadEntries();
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const sourceMatches = selectedSource === 'all' || entry.sourceType === selectedSource;
        const typeMatches = selectedType === 'all' || entry.entryType === selectedType;
        return sourceMatches && typeMatches;
      }),
    [entries, selectedSource, selectedType]
  );

  async function loadEntries() {
    const nextEntries = await trackingRepository.listEntries();
    setEntries(nextEntries);
  }

  async function handleDelete(entry: TrackingEntry) {
    await trackingRepository.deleteEntry(entry.id);
    setEntries((currentEntries) => currentEntries.filter((currentEntry) => currentEntry.id !== entry.id));
    setSelectedEntry(null);
  }

  function handleSaved(entry: TrackingEntry) {
    setEntries((currentEntries) => {
      const nextEntries = currentEntries.filter((currentEntry) => currentEntry.id !== entry.id);
      nextEntries.push(entry);
      return nextEntries.toSorted((left, right) => right.timestamp.localeCompare(left.timestamp));
    });
    setSelectedEntry(entry);
  }

  return (
    <main className="app-shell__surface">
      <SectionCard eyebrow="Historique" title="Toutes les entrées">
        <HistoryFilters
          onSourceChange={setSelectedSource}
          onTypeChange={setSelectedType}
          selectedSource={selectedSource}
          selectedType={selectedType}
        />
        {filteredEntries.length === 0 ? (
          <EmptyState
            description="Ajoutez quelques notes depuis l'onglet Noter pour remplir votre historique."
            title="Aucune entrée pour ces filtres"
          />
        ) : (
          <div className="history-list">
            {filteredEntries.map((entry) => (
              <button
                className="history-card"
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                type="button"
              >
                <div className="history-card__meta">
                  <span>{formatShortDateTime(entry.timestamp)}</span>
                  <span className="history-card__badge">{getSourceTypeLabel(entry.sourceType)}</span>
                </div>
                <strong>{getEntryTypeLabel(entry.entryType)}</strong>
                <p>{summarizeEntry(entry) || 'Entrée sans résumé.'}</p>
              </button>
            ))}
          </div>
        )}
      </SectionCard>
      <EntryDetailSheet
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={handleDelete}
        onSaved={handleSaved}
        open={selectedEntry !== null}
      />
    </main>
  );
}
