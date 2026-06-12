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
            Changer
          </button>
        ) : undefined
      }
      eyebrow="Citation inspirante"
      title="Pour aujourd'hui"
    >
      <p className="inspirational-quote__text">"{quote}"</p>
      <p className="status-copy inspirational-quote__hint">Une phrase douce pour commencer ou terminer la journee.</p>
    </SectionCard>
  );
}
