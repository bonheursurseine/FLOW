import { useEffect, useMemo, useState } from 'react';

import { BottomSheet } from '../../components/BottomSheet';
import { trackingRepository } from '../../storage/trackingRepository';
import type {
  EntryType,
  MealType,
  MigraineLevel,
  PhysicalActivityLevel,
  ScreenTimeLevel,
  TrackingEntry,
  TrackingEntryDraft
} from '../../types/tracking';
import { getEntryTypeLabel } from '../../utils/entryDisplay';

import {
  calculateSleepDurationFromTimes,
  createDraftFromEntry,
  createEntryDraft,
  normalizeEntryDraft,
  validateEntryDraft
} from './entryFormState';

interface EntrySheetProps {
  entryType: EntryType | null;
  initialEntry?: TrackingEntry | null;
  onClose: () => void;
  onSaved?: (entry: TrackingEntry) => void;
  open: boolean;
}

export function EntrySheet({ entryType, initialEntry, onClose, onSaved, open }: EntrySheetProps) {
  const [draft, setDraft] = useState<TrackingEntryDraft | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !entryType) {
      return;
    }

    setDraft(initialEntry ? createDraftFromEntry(initialEntry) : createEntryDraft(entryType));
    setErrors([]);
  }, [entryType, initialEntry, open]);

  const title = useMemo(() => (entryType ? getEntryTypeLabel(entryType) : ''), [entryType]);

  if (!open || !entryType || !draft) {
    return null;
  }

  async function handleSave() {
    const currentDraft = draft;
    if (!currentDraft) {
      return;
    }

    const normalized = normalizeEntryDraft(currentDraft);
    const nextErrors = validateEntryDraft(normalized);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      const saved = await trackingRepository.saveEntry(normalized);
      onSaved?.(saved);
      onClose();
    } catch {
      setErrors(["Impossible d'enregistrer cette entrée pour le moment."]);
    } finally {
      setIsSaving(false);
    }
  }

  const footer = (
    <div className="entry-sheet__actions">
      <button className="entry-sheet__secondary" onClick={onClose} type="button">
        Annuler
      </button>
      <button className="quick-check-in__action" disabled={isSaving} onClick={handleSave} type="button">
        {isSaving ? 'Enregistrement...' : initialEntry ? 'Mettre a jour' : 'Enregistrer'}
      </button>
    </div>
  );

  return (
    <BottomSheet footer={footer} onClose={onClose} open={open} title={title}>
      <div className="entry-sheet">
        {errors.length > 0 ? (
          <div className="entry-sheet__errors" role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        {renderFields(entryType, draft, setDraft)}
      </div>
    </BottomSheet>
  );
}

function renderFields(
  entryType: EntryType,
  draft: TrackingEntryDraft,
  setDraft: (updater: TrackingEntryDraft) => void
) {
  const update = <TKey extends keyof TrackingEntryDraft>(fieldName: TKey, value: TrackingEntryDraft[TKey]) => {
    setDraft({
      ...draft,
      [fieldName]: value
    });
  };

  switch (entryType) {
    case 'form':
      return (
        <>
          <NumberField label="Forme / 10" onChange={(value) => update('energyScore', value)} value={draft.energyScore} />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'sleep':
      {
        const calculatedDuration = calculateSleepDurationFromTimes(draft.bedTime, draft.wakeTime);

        return (
          <>
            <TimeField label="Heure de couche" onChange={(value) => update('bedTime', value)} value={draft.bedTime} />
            <TimeField label="Heure de réveil" onChange={(value) => update('wakeTime', value)} value={draft.wakeTime} />
            <ReadOnlyField
              label="Durée calculée"
              value={calculatedDuration ? `${formatSleepDuration(calculatedDuration)}` : 'Renseignez les deux heures'}
            />
            <NumberField
              label="Qualité / 10"
              onChange={(value) => update('sleepQuality', value)}
              value={draft.sleepQuality}
            />
            <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
          </>
        );
      }
    case 'hydration':
      return (
        <>
          <NumberField
            label="Hydratation (cL)"
            onChange={(value) => update('hydrationAmountCl', value)}
            value={draft.hydrationAmountCl}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'stress':
      return (
        <>
          <NumberField label="Stress / 10" onChange={(value) => update('stressLevel', value)} value={draft.stressLevel} />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'mentalLoad':
      return (
        <>
          <NumberField label="Charge / 10" onChange={(value) => update('mentalLoad', value)} value={draft.mentalLoad} />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'migraine':
      return (
        <>
          <SelectField
            label="Niveau"
            onChange={(value) => update('migraineLevel', parseOptionalEnum<MigraineLevel>(value))}
            options={[
              { value: 'none', label: 'Pas de migraine' },
              { value: 'mild', label: 'Légère' },
              { value: 'moderate', label: 'Modérée' },
              { value: 'severe', label: 'Forte' }
            ]}
            value={draft.migraineLevel}
          />
          <NumberField
            label="Douleur / 10"
            onChange={(value) => update('migrainePainScore', value)}
            value={draft.migrainePainScore}
          />
          <ToggleField
            checked={Boolean(draft.migraineMedicationTaken)}
            label="Médicament pris"
            onChange={(checked) => update('migraineMedicationTaken', checked)}
          />
          <TextAreaField
            label="Note médicament"
            onChange={(value) => update('migraineMedicationNote', value)}
            value={draft.migraineMedicationNote}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'caffeine':
      return (
        <>
          <NumberField
            label="Nombre de tasses"
            onChange={(value) => update('caffeineCups', value)}
            value={draft.caffeineCups}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'physicalActivity':
      return (
        <>
          <SelectField
            label="Activité physique"
            onChange={(value) => update('physicalActivityLevel', parseOptionalEnum<PhysicalActivityLevel>(value))}
            options={[
              { value: 'none', label: 'Aucune' },
              { value: 'light', label: 'Légère' },
              { value: 'moderate', label: 'Modérée' },
              { value: 'intense', label: 'Intense' }
            ]}
            value={draft.physicalActivityLevel}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'meal':
      return (
        <>
          <SelectField
            label="Type de repas"
            onChange={(value) => update('mealType', parseOptionalEnum<MealType>(value))}
            options={[
              { value: 'light', label: 'Léger' },
              { value: 'normal', label: 'Normal' },
              { value: 'heavy', label: 'Copieux' }
            ]}
            value={draft.mealType}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'nap':
      return (
        <>
          <NumberField
            label="Durée de sieste (minutes)"
            onChange={(value) => update('napDuration', value)}
            value={draft.napDuration}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'screenTime':
      return (
        <>
          <SelectField
            label="Temps d'écran"
            onChange={(value) => update('screenTimeLevel', parseOptionalEnum<ScreenTimeLevel>(value))}
            options={[
              { value: 'low', label: 'Faible' },
              { value: 'medium', label: 'Moyen' },
              { value: 'high', label: 'Élevé' },
              { value: 'veryHigh', label: 'Très élevé' }
            ]}
            value={draft.screenTimeLevel}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'medication':
      return (
        <>
          <TextAreaField
            label="Note médicament"
            onChange={(value) => update('medicationNote', value)}
            value={draft.medicationNote}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'meditation':
      return (
        <>
          <NumberField
            label="Durée de méditation (minutes)"
            onChange={(value) => update('meditationDuration', value)}
            value={draft.meditationDuration}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'notableEvent':
      return (
        <>
          <TextAreaField
            label="Événement"
            onChange={(value) => update('eventNote', value)}
            value={draft.eventNote}
          />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'freeNote':
      return (
        <>
          <TextAreaField label="Note libre" onChange={(value) => update('freeNote', value)} value={draft.freeNote} />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'dailyGoal':
      return (
        <>
          <TextAreaField
            label="Quel est ton objectif principal aujourd hui ?"
            onChange={(value) => update('goalText', value)}
            value={draft.goalText}
          />
          <ToggleField
            checked={Boolean(draft.goalAchieved)}
            label="Objectif atteint ?"
            onChange={(checked) => update('goalAchieved', checked)}
          />
          <HelperText text="Meme partiellement, c est deja une information utile." />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
    case 'checkIn':
    default:
      return (
        <>
          <NumberField label="Énergie / 10" onChange={(value) => update('energyScore', value)} value={draft.energyScore} />
          <NumberField label="Stress / 10" onChange={(value) => update('stressLevel', value)} value={draft.stressLevel} />
          <TextAreaField label="Commentaire" onChange={(value) => update('comment', value)} value={draft.comment} />
        </>
      );
  }
}

interface NumberFieldProps {
  label: string;
  onChange: (value: number | undefined) => void;
  step?: number;
  value?: number;
}

function NumberField({ label, onChange, step = 1, value }: NumberFieldProps) {
  return (
    <label className="entry-sheet__field">
      <span>{label}</span>
      <input
        min={0}
        onChange={(event) => onChange(parseNumericValue(event.target.value))}
        step={step}
        type="number"
        value={value ?? ''}
      />
    </label>
  );
}

interface TimeFieldProps {
  label: string;
  onChange: (value: string | undefined) => void;
  value?: string;
}

function TimeField({ label, onChange, value }: TimeFieldProps) {
  return (
    <label className="entry-sheet__field">
      <span>{label}</span>
      <input
        onChange={(event) => onChange(parseTimeValue(event.target.value))}
        step={300}
        type="time"
        value={value ?? ''}
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value?: string;
}

function SelectField({ label, onChange, options, value }: SelectFieldProps) {
  return (
    <label className="entry-sheet__field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value ?? ''}>
        <option value="">Choisir</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface TextAreaFieldProps {
  label: string;
  onChange: (value: string) => void;
  value?: string;
}

function TextAreaField({ label, onChange, value }: TextAreaFieldProps) {
  return (
    <label className="entry-sheet__field">
      <span>{label}</span>
      <textarea onChange={(event) => onChange(event.target.value)} rows={3} value={value ?? ''} />
    </label>
  );
}

interface ToggleFieldProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

function ToggleField({ checked, label, onChange }: ToggleFieldProps) {
  return (
    <label className="entry-sheet__toggle">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function HelperText({ text }: { text: string }) {
  return <p className="status-copy">{text}</p>;
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <label className="entry-sheet__field">
      <span>{label}</span>
      <input readOnly type="text" value={value} />
    </label>
  );
}

function parseNumericValue(value: string): number | undefined {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalEnum<T extends string>(value: string): T | undefined {
  return value.length > 0 ? (value as T) : undefined;
}

function parseTimeValue(value: string): string | undefined {
  return value.trim().length > 0 ? value : undefined;
}

function formatSleepDuration(value: number): string {
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} h ${String(minutes).padStart(2, '0')} min`;
}
