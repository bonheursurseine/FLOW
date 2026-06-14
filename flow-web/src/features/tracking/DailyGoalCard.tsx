import { useEffect, useState } from 'react';

import { SectionCard } from '../../components/SectionCard';
import { trackingRepository } from '../../storage/trackingRepository';
import type { TrackingEntry, TrackingEntryDraft } from '../../types/tracking';
import { findDailyGoalForDay } from '../../utils/dailyGoals';

import { createEntryDraft, createDraftFromEntry, normalizeEntryDraft, validateEntryDraft } from './entryFormState';

interface DailyGoalCardProps {
  onSaved?: (entry: TrackingEntry) => void;
}

export function DailyGoalCard({ onSaved }: DailyGoalCardProps) {
  const [draft, setDraft] = useState<TrackingEntryDraft>(() => createEntryDraft('dailyGoal'));
  const [todayEntry, setTodayEntry] = useState<TrackingEntry | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadTodayGoal();
  }, []);

  async function loadTodayGoal() {
    const entries = await trackingRepository.listEntries();
    const existingGoal = findDailyGoalForDay(entries) ?? null;

    setTodayEntry(existingGoal);
    setDraft(existingGoal ? createDraftFromEntry(existingGoal) : createEntryDraft('dailyGoal'));
  }

  async function handleSave() {
    const normalized = normalizeEntryDraft({
      ...draft,
      entryType: 'dailyGoal',
      sourceType: 'spontaneous',
      id: todayEntry?.id,
      timestamp: todayEntry?.timestamp
    });
    const nextErrors = validateEntryDraft(normalized);

    if (nextErrors.length > 0) {
      setError(nextErrors[0]);
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const saved = await trackingRepository.saveEntry(normalized);
      setTodayEntry(saved);
      setDraft(createDraftFromEntry(saved));
      setFeedback('Objectif du jour enregistre localement.');
      onSaved?.(saved);
    } catch {
      setError("Impossible d'enregistrer l'objectif pour le moment.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Aujourd hui" title="Objectif du jour">
      <label className="entry-sheet__field">
        <span>Quel est ton objectif principal aujourd hui ?</span>
        <textarea
          onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, goalText: event.target.value }))}
          rows={3}
          value={draft.goalText ?? ''}
        />
      </label>

      <label className="entry-sheet__toggle">
        <input
          checked={Boolean(draft.goalAchieved)}
          onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, goalAchieved: event.target.checked }))}
          type="checkbox"
        />
        <span>Objectif atteint ?</span>
      </label>

      <p className="status-copy">Meme partiellement, c est deja une information utile.</p>

      <label className="entry-sheet__field">
        <span>Commentaire optionnel</span>
        <textarea
          onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, comment: event.target.value }))}
          rows={2}
          value={draft.comment ?? ''}
        />
      </label>

      <button className="quick-check-in__action" disabled={isSaving} onClick={() => void handleSave()} type="button">
        {isSaving ? 'Enregistrement...' : todayEntry ? 'Mettre a jour l objectif' : "Enregistrer l'objectif"}
      </button>

      {error ? <p className="status-copy">{error}</p> : null}
      {feedback ? <p className="quick-check-in__feedback">{feedback}</p> : null}
    </SectionCard>
  );
}
