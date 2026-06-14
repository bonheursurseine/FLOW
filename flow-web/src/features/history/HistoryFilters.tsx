import type { EntryType, SourceType } from '../../types/tracking';

interface HistoryFiltersProps {
  selectedSource: SourceType | 'all';
  selectedType: EntryType | 'all';
  onSourceChange: (value: SourceType | 'all') => void;
  onTypeChange: (value: EntryType | 'all') => void;
}

const ENTRY_TYPE_OPTIONS: Array<{ label: string; value: EntryType | 'all' }> = [
  { value: 'all', label: 'Tous les types' },
  { value: 'checkIn', label: 'Check-in' },
  { value: 'form', label: 'Forme' },
  { value: 'sleep', label: 'Sommeil' },
  { value: 'hydration', label: 'Hydratation' },
  { value: 'stress', label: 'Stress' },
  { value: 'mentalLoad', label: 'Charge mentale' },
  { value: 'migraine', label: 'Migraine' },
  { value: 'caffeine', label: 'Caféine' },
  { value: 'physicalActivity', label: 'Activité physique' },
  { value: 'meal', label: 'Repas' },
  { value: 'nap', label: 'Sieste' },
  { value: 'screenTime', label: "Temps d'écran" },
  { value: 'medication', label: 'Médicament' },
  { value: 'meditation', label: 'Méditation' },
  { value: 'notableEvent', label: 'Événement' },
  { value: 'freeNote', label: 'Note libre' },
  { value: 'dailyGoal', label: 'Objectif du jour' }
];

export function HistoryFilters({
  onSourceChange,
  onTypeChange,
  selectedSource,
  selectedType
}: HistoryFiltersProps) {
  return (
    <div className="filter-row">
      <label className="entry-sheet__field">
        <span>Type</span>
        <select onChange={(event) => onTypeChange(event.target.value as EntryType | 'all')} value={selectedType}>
          {ENTRY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="entry-sheet__field">
        <span>Source</span>
        <select
          onChange={(event) => onSourceChange(event.target.value as SourceType | 'all')}
          value={selectedSource}
        >
          <option value="all">Toutes</option>
          <option value="spontaneous">Spontané</option>
          <option value="scheduledCheckIn">Programme</option>
        </select>
      </label>
    </div>
  );
}
