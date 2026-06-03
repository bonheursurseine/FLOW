import { useState } from 'react';

import { trackingRepository } from '../../storage/trackingRepository';

import { createQuickCheckInDraft } from './entryFormState';

interface QuickCheckInCardProps {
  onSaved?: () => void;
}

export function QuickCheckInCard({ onSaved }: QuickCheckInCardProps) {
  const [energyScore, setEnergyScore] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setFeedback(null);

    try {
      await trackingRepository.saveEntry(
        createQuickCheckInDraft({
          energyScore,
          stressLevel
        })
      );
      setFeedback('Check-in enregistre.');
      onSaved?.();
    } catch {
      setFeedback('Impossible d enregistrer ce check-in pour le moment.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="quick-check-in-title" className="hero-card quick-check-in-card">
      <h1 className="quick-check-in__title" id="quick-check-in-title">
        Check-in rapide
      </h1>
      <div className="quick-check-in">
        <RangeField
          label={`Energie ${energyScore}/10`}
          max={10}
          min={1}
          onChange={setEnergyScore}
          value={energyScore}
        />
        <RangeField
          label={`Stress ${stressLevel}/10`}
          max={10}
          min={1}
          onChange={setStressLevel}
          value={stressLevel}
        />
        <button className="quick-check-in__action" disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {feedback ? <p className="quick-check-in__feedback">{feedback}</p> : null}
      </div>
    </section>
  );
}

interface RangeFieldProps {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}

function RangeField({ label, max, min, onChange, value }: RangeFieldProps) {
  return (
    <label className="quick-check-in__field">
      <span>{label}</span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={1}
        type="range"
        value={value}
      />
    </label>
  );
}
