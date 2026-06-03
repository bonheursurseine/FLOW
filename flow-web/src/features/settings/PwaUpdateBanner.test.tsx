import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PwaUpdateBanner } from './PwaUpdateBanner';

describe('PwaUpdateBanner', () => {
  it('stays hidden when no update is available', () => {
    const view = render(<PwaUpdateBanner onApplyUpdate={async () => undefined} updateAvailable={false} />);

    expect(view.container.textContent).toBe('');
  });

  it('renders update copy and applies the update when requested', async () => {
    const user = userEvent.setup();
    let applyCount = 0;

    render(
      <PwaUpdateBanner
        onApplyUpdate={async () => {
          applyCount += 1;
        }}
        updateAvailable={true}
      />
    );

    expect(screen.getByText('Nouvelle version disponible')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Mettre a jour' })).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Mettre a jour' }));

    expect(applyCount).toBe(1);
  });
});
