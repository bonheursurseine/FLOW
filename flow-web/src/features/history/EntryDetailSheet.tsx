import { useEffect, useState } from 'react';

import { BottomSheet } from '../../components/BottomSheet';
import { trackingRepository } from '../../storage/trackingRepository';
import type { TrackingEntry } from '../../types/tracking';
import { getDailyGoalStatusLabel } from '../../utils/dailyGoals';
import { isValidDateInputValue, toDateInputValue } from '../../utils/dateInput';
import { formatShortDateTime, getEntryTypeLabel, getSourceTypeLabel } from '../../utils/entryDisplay';
import { summarizeEntry } from '../../utils/entrySummary';
import { EntrySheet } from '../tracking/EntrySheet';

interface EntryDetailSheetProps {
  entry: TrackingEntry | null;
  initialMode?: 'details' | 'editDate';
  onClose: () => void;
  onDelete: (entry: TrackingEntry) => Promise<void>;
  onSaved: (entry: TrackingEntry) => void;
  open: boolean;
}

export function EntryDetailSheet({
  entry,
  initialMode = 'details',
  onClose,
  onDelete,
  onSaved,
  open
}: EntryDetailSheetProps) {
  const [mode, setMode] = useState<'details' | 'editDate' | 'editEntry'>(initialMode);
  const [dateValue, setDateValue] = useState('');
  const [dateErrors, setDateErrors] = useState<string[]>([]);
  const [isSavingDate, setIsSavingDate] = useState(false);

  useEffect(() => {
    if (!open || !entry) {
      return;
    }

    setMode(initialMode);
    setDateValue(toDateInputValue(entry.timestamp));
    setDateErrors([]);
    setIsSavingDate(false);
  }, [entry, initialMode, open]);

  if (!open || !entry) {
    return null;
  }

  const currentEntry = entry;

  if (mode === 'editEntry') {
    return (
      <EntrySheet
        entryType={currentEntry.entryType}
        initialEntry={currentEntry}
        onClose={() => setMode('details')}
        onSaved={(savedEntry) => {
          setMode('details');
          onSaved(savedEntry);
        }}
        open
      />
    );
  }

  async function handleSaveDate() {
    if (!isValidDateInputValue(dateValue)) {
      setDateErrors(["Choisissez une date valide avant d'enregistrer."]);
      return;
    }

    setIsSavingDate(true);
    setDateErrors([]);

    try {
      const savedEntry = await trackingRepository.updateEntryDate(currentEntry.id, dateValue);
      onSaved(savedEntry);
      setMode('details');
    } catch {
      setDateErrors(["Impossible d'enregistrer cette date pour le moment."]);
    } finally {
      setIsSavingDate(false);
    }
  }

  const footer =
    mode === 'editDate' ? (
      <div className="entry-sheet__actions">
        <button className="entry-sheet__secondary" onClick={() => setMode('details')} type="button">
          Annuler
        </button>
        <button className="quick-check-in__action" disabled={isSavingDate} onClick={() => void handleSaveDate()} type="button">
          {isSavingDate ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    ) : (
      <div className="entry-sheet__actions entry-sheet__actions--triple">
        <button className="entry-sheet__secondary" onClick={() => void onDelete(currentEntry)} type="button">
          Supprimer
        </button>
        <button className="entry-sheet__secondary" onClick={() => setMode('editDate')} type="button">
          Modifier la date
        </button>
        <button className="quick-check-in__action" onClick={() => setMode('editEntry')} type="button">
          Modifier
        </button>
      </div>
    );

  return (
    <BottomSheet
      footer={footer}
      onClose={onClose}
      open={open}
      title={mode === 'editDate' ? 'Modifier la date' : getEntryTypeLabel(currentEntry.entryType)}
    >
      {mode === 'editDate' ? (
        <div className="entry-sheet">
          {dateErrors.length > 0 ? (
            <div className="entry-sheet__errors" role="alert">
              {dateErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
          <p className="status-copy">Choisissez une nouvelle date. L'heure actuelle de l'entrée sera conservée.</p>
          <label className="entry-sheet__field">
            <span>Nouvelle date</span>
            <input
              onChange={(event) => setDateValue(event.target.value)}
              type="date"
              value={dateValue}
            />
          </label>
        </div>
      ) : (
        <div className="entry-detail">
          <p className="entry-detail__summary">
            {summarizeEntry(currentEntry) || getEntryTypeLabel(currentEntry.entryType)}
          </p>
          <dl className="detail-list">
            <div>
              <dt>Date</dt>
              <dd>{formatShortDateTime(currentEntry.timestamp)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{getSourceTypeLabel(currentEntry.sourceType)}</dd>
            </div>
            {currentEntry.entryType === 'dailyGoal' && currentEntry.goalText ? (
              <div>
                <dt>Objectif</dt>
                <dd>{currentEntry.goalText}</dd>
              </div>
            ) : null}
            {currentEntry.entryType === 'dailyGoal' ? (
              <div>
                <dt>Statut</dt>
                <dd>{getDailyGoalStatusLabel(currentEntry.goalAchieved)}</dd>
              </div>
            ) : null}
            {currentEntry.comment ? (
              <div>
                <dt>Commentaire</dt>
                <dd>{currentEntry.comment}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      )}
    </BottomSheet>
  );
}
