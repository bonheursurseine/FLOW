import type { PwaStatusSnapshot } from '../../services/pwaService';

interface PwaInstallHelpProps {
  pwaStatus: PwaStatusSnapshot;
}

export function PwaInstallHelp({ pwaStatus }: PwaInstallHelpProps) {
  return (
    <div className="settings-card">
      <div className="settings-card__row">
        <strong>Installation PWA</strong>
        <span className="history-card__badge">{pwaStatus.installed ? 'Installée' : 'Safari'}</span>
      </div>
      <p>
        {pwaStatus.installed
          ? 'FLOW tourne déjà en mode installé.'
          : "Installez FLOW depuis Safari pour une expérience plus proche d'une app quotidienne."}
      </p>
      {!pwaStatus.installed ? (
        <ol className="settings-list">
          {pwaStatus.instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
