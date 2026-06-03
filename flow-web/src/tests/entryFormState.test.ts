import { describe, expect, it } from 'vitest';

import {
  ENTRY_CARD_DEFINITIONS,
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

    expect(errors).toEqual(["Ajoutez une note avant d'enregistrer."]);
  });

  it('prefills a draft from an existing entry without losing its values', () => {
    const draft = createDraftFromEntry({
      id: 'entry-1',
      timestamp: '2026-06-02T09:30:00.000Z',
      entryType: 'sleep',
      sourceType: 'spontaneous',
      bedTime: '23:00',
      wakeTime: '07:00',
      sleepDuration: 7.5,
      sleepQuality: 8,
      comment: 'Bonne nuit'
    });

    expect(draft.id).toBe('entry-1');
    expect(draft.bedTime).toBe('23:00');
    expect(draft.wakeTime).toBe('07:00');
    expect(draft.sleepDuration).toBe(7.5);
    expect(draft.sleepQuality).toBe(8);
    expect(draft.comment).toBe('Bonne nuit');
  });

  it('computes sleep duration from bed time and wake time overnight', () => {
    const normalized = normalizeEntryDraft({
      entryType: 'sleep',
      sourceType: 'spontaneous',
      bedTime: '23:00',
      wakeTime: '07:00'
    });

    expect(normalized.bedTime).toBe('23:00');
    expect(normalized.wakeTime).toBe('07:00');
    expect(normalized.sleepDuration).toBe(8);
  });

  it('computes sleep duration from bed time and wake time on the same day', () => {
    const normalized = normalizeEntryDraft({
      entryType: 'sleep',
      sourceType: 'spontaneous',
      bedTime: '01:15',
      wakeTime: '08:45'
    });

    expect(normalized.sleepDuration).toBe(7.5);
  });

  it('requires at least one sleep field after duration is auto-calculated', () => {
    const errors = validateEntryDraft({
      entryType: 'sleep',
      sourceType: 'spontaneous',
      bedTime: '   ',
      wakeTime: '   '
    });

    expect(errors).toEqual(['Ajoutez des heures, une qualité ou un commentaire.']);
  });

  it('keeps hydration in cl and caffeine in cup counts', () => {
    const hydration = normalizeEntryDraft({
      entryType: 'hydration',
      sourceType: 'spontaneous',
      hydrationAmountCl: 75
    });

    const caffeine = normalizeEntryDraft({
      entryType: 'caffeine',
      sourceType: 'spontaneous',
      caffeineCups: 2
    });

    expect(hydration.hydrationAmountCl).toBe(75);
    expect(hydration.entryType).toBe('hydration');
    expect(caffeine.caffeineCups).toBe(2);
    expect(caffeine.caffeineLevel).toBeUndefined();
  });

  it('allows zero cups for caffeine and still validates the entry', () => {
    const normalized = normalizeEntryDraft({
      entryType: 'caffeine',
      sourceType: 'spontaneous',
      caffeineCups: 0
    });

    expect(normalized.caffeineCups).toBe(0);
    expect(validateEntryDraft(normalized)).toEqual([]);
  });

  it('defines card titles and descriptions with emojis and French punctuation', () => {
    expect(ENTRY_CARD_DEFINITIONS).toEqual([
      { entryType: 'form', title: '😌 Forme', description: 'Noter votre niveau de forme du moment.' },
      { entryType: 'sleep', title: '😴 Sommeil', description: 'Durée, qualité et ressenti du sommeil.' },
      { entryType: 'hydration', title: '💧 Hydratation', description: 'Tracer une quantité bue en cL.' },
      { entryType: 'stress', title: '😵 Stress', description: 'Noter le stress du moment.' },
      { entryType: 'mentalLoad', title: '🧠 Charge mentale', description: 'Évaluer la charge mentale ressentie.' },
      { entryType: 'migraine', title: '🤕 Migraine', description: 'Épisode, intensité et contexte migraineux.' },
      { entryType: 'caffeine', title: '☕ Caféine', description: 'Tracer un nombre de tasses de caféine.' },
      { entryType: 'physicalActivity', title: '🏃 Activité physique', description: "Noter l'intensité de l'activité." },
      { entryType: 'meal', title: '🍽️ Repas', description: 'Documenter un repas léger ou copieux.' },
      { entryType: 'nap', title: '😴 Sieste', description: 'Noter une sieste et sa durée.' },
      { entryType: 'screenTime', title: "📱 Temps d'écran", description: "Suivre un niveau d'exposition aux écrans." },
      { entryType: 'medication', title: '💊 Médicament', description: "Garder une trace d'une prise." },
      { entryType: 'meditation', title: '🧘 Méditation', description: 'Noter une séance et sa durée.' },
      { entryType: 'notableEvent', title: '✨ Événement', description: 'Capturer un événement marquant.' },
      { entryType: 'freeNote', title: '📝 Note libre', description: 'Écrire une note rapide sans cadre.' }
    ]);
  });
});
