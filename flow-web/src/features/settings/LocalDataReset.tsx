interface LocalDataResetProps {
  onReset: () => void;
}

export function LocalDataReset({ onReset }: LocalDataResetProps) {
  return (
    <div className="settings-card">
      <strong>Effacement local</strong>
      <p>Toutes les entrees, horaires et reglages stockes sur cet appareil seront supprimes.</p>
      <button className="entry-sheet__secondary" onClick={onReset} type="button">
        Effacer mes donnees locales
      </button>
    </div>
  );
}
