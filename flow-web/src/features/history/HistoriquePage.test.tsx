import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetFlowStorageForTests } from '../../storage/db';
import { trackingRepository } from '../../storage/trackingRepository';
import { toDateKey } from '../../utils/dateBuckets';

import { HistoriquePage } from './HistoriquePage';

describe('HistoriquePage', () => {
  beforeEach(async () => {
    await resetFlowStorageForTests();
  });

  it('opens a prefilled date editor and saves the updated date', async () => {
    await trackingRepository.saveEntry({
      timestamp: new Date(2026, 5, 10, 8, 30, 0).toISOString(),
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Deplacer cette note'
    });

    render(<HistoriquePage />);

    await screen.findByText('Deplacer cette note');

    fireEvent.click(screen.getByRole('button', { name: 'Modifier la date de Note libre' }));

    const dateInput = screen.getByLabelText('Nouvelle date') as HTMLInputElement;
    expect(dateInput.value).toBe('2026-06-10');

    fireEvent.change(dateInput, { target: { value: '2026-06-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(async () => {
      const [entry] = await trackingRepository.listEntries();
      expect(toDateKey(entry.timestamp)).toBe('2026-06-15');
      expect(entry.freeNote).toBe('Deplacer cette note');
    });
  });

  it('shows a validation error and keeps the stored date unchanged when the date is invalid', async () => {
    await trackingRepository.saveEntry({
      timestamp: new Date(2026, 5, 10, 8, 30, 0).toISOString(),
      entryType: 'freeNote',
      sourceType: 'spontaneous',
      freeNote: 'Date invalide'
    });

    render(<HistoriquePage />);

    await screen.findByText('Date invalide');

    fireEvent.click(screen.getByRole('button', { name: 'Modifier la date de Note libre' }));
    fireEvent.change(screen.getByLabelText('Nouvelle date'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText("Choisissez une date valide avant d'enregistrer.")).not.toBeNull();

    const [entry] = await trackingRepository.listEntries();
    expect(toDateKey(entry.timestamp)).toBe('2026-06-10');
  });
});
