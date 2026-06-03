import { render, screen } from '@testing-library/react';

import { QuickCheckInCard } from './QuickCheckInCard';

describe('QuickCheckInCard', () => {
  it('hides the eyebrow and helper copy while using the compact title style', () => {
    render(<QuickCheckInCard />);

    expect(screen.queryByText('Noter')).toBeNull();
    expect(screen.queryByText('Une saisie courte pour noter l energie et le stress en quelques secondes.')).toBeNull();

    const title = screen.getByRole('heading', { level: 1, name: 'Check-in rapide' });
    expect(title.classList.contains('quick-check-in__title')).toBe(true);
  });
});
