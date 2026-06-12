export const inspirationalQuotes = [
  'Un petit pas compte aussi.',
  "Aujourd'hui, je fais avec l'energie que j'ai.",
  "Avancer doucement, c'est avancer quand meme.",
  'Ce qui est fait avec douceur dure plus longtemps.',
  "Observer sans juger, c'est deja prendre soin.",
  'Faire simple peut etre une vraie force.',
  'Une pause peut aussi faire partie du progres.',
  'Je peux reprendre mon rythme la ou je suis.',
  "Le calme aussi est une facon d'avancer.",
  'Chaque effort discret a sa valeur.'
] as const;

export function getQuoteIndexForDate(date: Date, quoteCount: number = inspirationalQuotes.length) {
  if (quoteCount <= 0) {
    throw new Error('At least one inspirational quote is required.');
  }

  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return Math.abs(dayNumber) % quoteCount;
}

export function getInspirationalQuoteForDate(
  date: Date,
  rotationOffset: number = 0,
  quotes: readonly string[] = inspirationalQuotes
) {
  if (quotes.length === 0) {
    throw new Error('At least one inspirational quote is required.');
  }

  const normalizedOffset = ((rotationOffset % quotes.length) + quotes.length) % quotes.length;
  const index = (getQuoteIndexForDate(date, quotes.length) + normalizedOffset) % quotes.length;

  return quotes[index];
}
