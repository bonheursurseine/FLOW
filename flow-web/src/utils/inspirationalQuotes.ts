export interface InspirationalQuote {
  author: string;
  role: string;
  text: string;
}

export const inspirationalQuotes: readonly InspirationalQuote[] = [
  {
    text: "Dans la vie, rien n'est a craindre, tout est a comprendre.",
    author: 'Marie Curie',
    role: 'physicienne et chimiste'
  },
  {
    text: "Le hasard ne favorise que les esprits prepares.",
    author: 'Louis Pasteur',
    role: 'chimiste et microbiologiste'
  },
  {
    text: "La vraie generosite envers l'avenir consiste a tout donner au present.",
    author: 'Albert Camus',
    role: 'ecrivain et philosophe'
  },
  {
    text: "Changer la vie aujourd'hui meme. Ne pas miser sur l'avenir, agir sans attendre.",
    author: 'Simone de Beauvoir',
    role: 'philosophe et ecrivaine'
  },
  {
    text: "Douter de tout ou tout croire nous dispensent de reflechir.",
    author: 'Henri Poincare',
    role: 'mathematicien et physicien'
  },
  {
    text: "Fais de ta vie un reve, et d'un reve, une realite.",
    author: 'Antoine de Saint-Exupery',
    role: 'ecrivain et aviateur'
  },
  {
    text: 'Faites ce que vous pouvez, avec ce que vous avez, la ou vous etes.',
    author: 'Theodore Roosevelt',
    role: "homme d'Etat et explorateur"
  },
  {
    text: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'equilibre.",
    author: 'Albert Einstein',
    role: 'physicien'
  }
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
  quotes: readonly InspirationalQuote[] = inspirationalQuotes
) {
  if (quotes.length === 0) {
    throw new Error('At least one inspirational quote is required.');
  }

  const normalizedOffset = ((rotationOffset % quotes.length) + quotes.length) % quotes.length;
  const index = (getQuoteIndexForDate(date, quotes.length) + normalizedOffset) % quotes.length;

  return quotes[index];
}
