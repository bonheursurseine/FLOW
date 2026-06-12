import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { getInspirationalQuoteForDate } from '../utils/inspirationalQuotes';

import { InspirationalQuoteCard } from './InspirationalQuoteCard';

describe('InspirationalQuoteCard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the local quote of the day without any network call', () => {
    const date = new Date(2026, 5, 12, 9, 0, 0);
    const expectedQuote = getInspirationalQuoteForDate(date);

    render(<InspirationalQuoteCard date={date} />);

    expect(screen.getByText(`"${expectedQuote}"`)).toBeTruthy();
    expect(globalThis.fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Changer' }));

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('shows another valid local quote when the user changes it', () => {
    const date = new Date(2026, 5, 12, 9, 0, 0);
    const nextQuote = getInspirationalQuoteForDate(date, 1);

    render(<InspirationalQuoteCard date={date} />);
    fireEvent.click(screen.getByRole('button', { name: 'Changer' }));

    expect(screen.getByText(`"${nextQuote}"`)).toBeTruthy();
  });
});
