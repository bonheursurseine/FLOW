import { useState } from 'react';

import { getInspirationalQuoteForDate, inspirationalQuotes } from '../utils/inspirationalQuotes';

import { SectionCard } from './SectionCard';

interface InspirationalQuoteCardProps {
  date?: Date;
  showRefreshButton?: boolean;
}

export function InspirationalQuoteCard({ date, showRefreshButton = true }: InspirationalQuoteCardProps) {
  const [referenceDate] = useState(() => date ?? new Date());
  const [rotationOffset, setRotationOffset] = useState(0);

  const quote = getInspirationalQuoteForDate(referenceDate, rotationOffset);

  return (
    <SectionCard
      action={
        showRefreshButton ? (
          <button
            className="entry-sheet__secondary inspirational-quote__action"
            onClick={() => setRotationOffset((currentOffset) => (currentOffset + 1) % inspirationalQuotes.length)}
            type="button"
          >
            Autre citation
          </button>
        ) : undefined
      }
      eyebrow="Citation inspirante"
      title="Pour aujourd'hui"
    >
      <p className="inspirational-quote__text">"{quote.text}"</p>
      <p className="inspirational-quote__author">{quote.author}</p>
      <p className="inspirational-quote__role">{quote.role}</p>
      <p className="status-copy inspirational-quote__hint">Des mots venus de personnes qui ont cherche, construit, explore ou transforme.</p>
    </SectionCard>
  );
}
