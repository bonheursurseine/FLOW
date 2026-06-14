import { fireEvent, render, screen } from '@testing-library/react';

import { EntrySheet } from './EntrySheet';

describe('EntrySheet', () => {
  it('shows sleep time fields and the calculated duration helper for sleep entries', () => {
    render(<EntrySheet entryType="sleep" onClose={() => undefined} open={true} />);

    expect(screen.getByLabelText('Heure de couche').getAttribute('type')).toBe('time');
    expect(screen.getByLabelText('Heure de réveil').getAttribute('type')).toBe('time');
    expect(screen.queryByLabelText('Durée de sommeil (heures)')).toBeNull();
    expect(screen.getByDisplayValue('Renseignez les deux heures')).not.toBeNull();
  });

  it('shows the calculated sleep duration in hours and minutes', () => {
    render(<EntrySheet entryType="sleep" onClose={() => undefined} open={true} />);

    fireEvent.change(screen.getByLabelText('Heure de couche'), { target: { value: '23:15' } });
    fireEvent.change(screen.getByLabelText('Heure de réveil'), { target: { value: '07:00' } });

    expect(screen.getByDisplayValue('7 h 45 min')).not.toBeNull();
  });

  it('shows a hydration field in cl', () => {
    render(<EntrySheet entryType="hydration" onClose={() => undefined} open={true} />);

    const field = screen.getByLabelText('Hydratation (cL)');
    expect(field.getAttribute('type')).toBe('number');
  });

  it('shows caffeine in cup counts instead of level bands', () => {
    render(<EntrySheet entryType="caffeine" onClose={() => undefined} open={true} />);

    expect(screen.getByLabelText('Nombre de tasses').getAttribute('type')).toBe('number');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('shows accented labels for activity and screen time entries', () => {
    const { rerender } = render(<EntrySheet entryType="physicalActivity" onClose={() => undefined} open={true} />);

    expect(screen.getByRole('combobox', { name: 'Activité physique' })).not.toBeNull();
    expect(screen.getByRole('option', { name: 'Légère' })).not.toBeNull();
    expect(screen.getByRole('option', { name: 'Modérée' })).not.toBeNull();

    rerender(<EntrySheet entryType="screenTime" onClose={() => undefined} open={true} />);

    expect(screen.getByRole('combobox', { name: "Temps d'écran" })).not.toBeNull();
    expect(screen.getByRole('option', { name: 'Élevé' })).not.toBeNull();
    expect(screen.getByRole('option', { name: 'Très élevé' })).not.toBeNull();
  });
  it('shows goal text and achieved status controls for daily goals', () => {
    render(<EntrySheet entryType="dailyGoal" onClose={() => undefined} open={true} />);

    expect(screen.getByLabelText('Quel est ton objectif principal aujourd hui ?')).not.toBeNull();
    expect(screen.getByLabelText('Objectif atteint ?').getAttribute('type')).toBe('checkbox');
    expect(screen.getByText('Meme partiellement, c est deja une information utile.')).not.toBeNull();
  });
});
