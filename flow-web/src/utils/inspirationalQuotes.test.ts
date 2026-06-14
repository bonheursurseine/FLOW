import { getInspirationalQuoteForDate, inspirationalQuotes } from './inspirationalQuotes';

describe('inspirationalQuotes', () => {
  it('returns a quote from the local list', () => {
    const quote = getInspirationalQuoteForDate(new Date(2026, 5, 12, 8, 0, 0));

    expect(inspirationalQuotes).toContain(quote);
    expect(quote.author.length).toBeGreaterThan(0);
    expect(quote.text.length).toBeGreaterThan(0);
  });

  it('returns the same quote for the same calendar day', () => {
    const morning = new Date(2026, 5, 12, 8, 0, 0);
    const evening = new Date(2026, 5, 12, 22, 30, 0);

    expect(getInspirationalQuoteForDate(morning)).toBe(getInspirationalQuoteForDate(evening));
  });
});
