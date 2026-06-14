import { useState } from 'react';

import { BottomSheet } from '../../components/BottomSheet';
import type { TrackingEntry } from '../../types/tracking';
import { getDailyGoalStatusLabel } from '../../utils/dailyGoals';
import { formatShortDateTime, getEntryTypeLabel, getSourceTypeLabel } from '../../utils/entryDisplay';
import { summarizeEntry } from '../../utils/entrySummary';
import { EntrySheet } from '../tracking/EntrySheet';

interface EntryDetailSheetProps {
  entry: TrackingEntry | null;
  onClose: () => void;
  onDelete: (entry: TrackingEntry) => Promise<void>;
  onSaved: (entry: TrackingEntry) => void;
  open: boolean;
}

export function EntryDetailSheet({ entry, onClose, onDelete, onSaved, open }: EntryDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!open || !entry) {
    return null;
  }

  if (isEditing) {
    return (
      <EntrySheet
        entryType={entry.entryType}
        initialEntry={entry}
        onClose={() => setIsEditing(false)}
        onSaved={(savedEntry) => {
          setIsEditing(false);
          onSaved(savedEntry);
        }}
        open
      />
    );
  }

  return (
    <BottomSheet
      footer={
        <div className="entry-sheet__actions">
          <button className="entry-sheet__secondary" onClick={() => void onDelete(entry)} type="button">
            Supprimer
          </button>
          <button className="quick-check-in__action" onClick={() => setIsEditing(true)} type="button">
            Modifier
          </button>
        </div>
      }
      onClose={onClose}
      open={open}
      title={getEntryTypeLabel(entry.entryType)}
    >
      <div className="entry-detail">
        <p className="entry-detail__summary">{summarizeEntry(entry) || getEntryTypeLabel(entry.entryType)}</p>
        <dl className="detail-list">
          <div>
            <dt>Date</dt>
            <dd>{formatShortDateTime(entry.timestamp)}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{getSourceTypeLabel(entry.sourceType)}</dd>
          </div>
          {entry.entryType === 'dailyGoal' && entry.goalText ? (
            <div>
              <dt>Objectif</dt>
              <dd>{entry.goalText}</dd>
            </div>
          ) : null}
          {entry.entryType === 'dailyGoal' ? (
            <div>
              <dt>Statut</dt>
              <dd>{getDailyGoalStatusLabel(entry.goalAchieved)}</dd>
            </div>
          ) : null}
          {entry.comment ? (
            <div>
              <dt>Commentaire</dt>
              <dd>{entry.comment}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </BottomSheet>
  );
}
