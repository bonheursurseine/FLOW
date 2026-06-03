interface LocalDataResetProps {
  onReset: () => void;
}

export function LocalDataReset({ onReset }: LocalDataResetProps) {
  return (
    <div className="settings-card">
      <strong>Effacement local</strong>
      <p>Toutes les entrées, horaires et réglages stockés sur cet appareil seront supprimés.</p>
      <button className="entry-sheet__secondary" onClick={onReset} type="button">
        Effacer mes données locales
      </button>
    </div>
  );
}
