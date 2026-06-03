import { describe, expect, it } from 'vitest';

import {
  createDraftFromEntry,
  createQuickCheckInDraft,
  normalizeEntryDraft,
  validateEntryDraft
} from '../features/tracking/entryFormState';

describe('entryFormState', () => {
  it('clears irrelevant fields for meditation entries', () => {
    const normalized = normalizeEntryDraft({
      entryType: 'meditation',
      sourceType: 'spontaneous',
      energyScore: 5,
      stressLevel: 4,
      meditationDuration: 15
    });

    expect(normalized.energyScore).toBeUndefined();
    expect(normalized.stressLevel).toBeUndefined();
    expect(normalized.meditationDuration).toBe(15);
  });

  it('creates a quick check-in payload with the expected source and fields', () => {
    const draft = createQuickCheckInDraft({
      energyScore: 7,
      stressLevel: 3
    });

    expect(draft.entryType).toBe('checkIn');
    expect(draft.sourceType).toBe('spontaneous');
    expect(draft.energyScore).toBe(7);
    expect(draft.stressLevel).toBe(3);
  });

  it('rejects an empty free-note payload', () => {
    const errors = validateEntryDraft({
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: '   '
    });

    expect(errors).toEqual(['Ajoutez une note avant d enregistrer.']);
  });

  it('prefills a draft from an existing entry without losing its values', () => {
    const draft = createDraftFromEntry({
      id: 'entry-1',
      timestamp: '2026-06-02T09:30:00.000Z',
      entryType: 'sleep',
      sourceType: 'spontaneous',
      sleepDuration: 7.5,
      sleepQuality: 8,
      comment: 'Bonne nuit'
    });

    expect(draft.id).toBe('entry-1');
    expect(draft.sleepDuration).toBe(7.5);
    expect(draft.sleepQuality).toBe(8);
    expect(draft.comment).toBe('Bonne nuit');
  });
});
