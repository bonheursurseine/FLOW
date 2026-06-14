import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetFlowStorageForTests } from '../../storage/db';
import { trackingRepository } from '../../storage/trackingRepository';

import { DailyGoalCard } from './DailyGoalCard';

describe('DailyGoalCard', () => {
  beforeEach(async () => {
    await resetFlowStorageForTests();
  });

  it('creates a daily goal for the current day', async () => {
    render(<DailyGoalCard />);

    fireEvent.change(screen.getByLabelText('Quel est ton objectif principal aujourd hui ?'), {
      target: { value: 'Faire une marche douce' }
    });
    fireEvent.click(screen.getByRole('button', { name: "Enregistrer l'objectif" }));

    await waitFor(async () => {
      const entries = await trackingRepository.listEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].entryType).toBe('dailyGoal');
      expect(entries[0].goalText).toBe('Faire une marche douce');
      expect(entries[0].goalAchieved).toBeUndefined();
    });
  });

  it('updates the existing goal for the same day instead of creating a duplicate', async () => {
    const now = new Date();
    const existingTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30, 0).toISOString();

    const existingGoal = await trackingRepository.saveEntry({
      entryType: 'dailyGoal',
      sourceType: 'spontaneous',
      timestamp: existingTimestamp,
      goalText: 'Lire 10 pages'
    });

    render(<DailyGoalCard />);

    await screen.findByDisplayValue('Lire 10 pages');

    fireEvent.change(screen.getByLabelText('Quel est ton objectif principal aujourd hui ?'), {
      target: { value: 'Lire 20 pages' }
    });
    fireEvent.click(screen.getByLabelText('Objectif atteint ?'));
    fireEvent.click(screen.getByRole('button', { name: 'Mettre a jour l objectif' }));

    await waitFor(async () => {
      const entries = await trackingRepository.listEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe(existingGoal.id);
      expect(entries[0].goalText).toBe('Lire 20 pages');
      expect(entries[0].goalAchieved).toBe(true);
    });
  });
});
