import type { EntryType } from '../../types/tracking';

import { ENTRY_CARD_DEFINITIONS } from './entryFormState';

interface EntryCardGridProps {
  onSelect: (entryType: EntryType) => void;
  visibleEntryTypes?: EntryType[];
}

export function EntryCardGrid({ onSelect, visibleEntryTypes }: EntryCardGridProps) {
  const cards = visibleEntryTypes
    ? ENTRY_CARD_DEFINITIONS.filter((card) => visibleEntryTypes.includes(card.entryType))
    : ENTRY_CARD_DEFINITIONS;

  return (
    <section aria-labelledby="entry-grid-title" className="status-card">
      <div>
        <p className="status-label">Entrees spontanees</p>
        <h2 id="entry-grid-title">Choisissez une carte</h2>
      </div>
      <div className="entry-card-grid">
        {cards.map((card) => (
          <button
            className="entry-card-grid__item"
            key={card.entryType}
            onClick={() => onSelect(card.entryType)}
            type="button"
          >
            <strong>{card.title}</strong>
            <span>{card.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
