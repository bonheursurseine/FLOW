import { render, screen } from '@testing-library/react';

import { EntrySheet } from './EntrySheet';

describe('EntrySheet', () => {
  it('shows sleep time fields and the calculated duration helper for sleep entries', () => {
    render(<EntrySheet entryType="sleep" onClose={() => undefined} open={true} />);

    expect(screen.getByLabelText('Heure de couche').getAttribute('type')).toBe('time');
    expect(screen.getByLabelText('Heure de reveil').getAttribute('type')).toBe('time');
    expect(screen.queryByLabelText('Duree de sommeil (heures)')).toBeNull();
    expect(screen.getByDisplayValue('Renseignez les deux heures')).not.toBeNull();
  });
});
