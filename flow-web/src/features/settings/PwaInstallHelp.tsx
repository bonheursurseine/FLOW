import type { PwaStatusSnapshot } from '../../services/pwaService';

interface PwaInstallHelpProps {
  pwaStatus: PwaStatusSnapshot;
}

export function PwaInstallHelp({ pwaStatus }: PwaInstallHelpProps) {
  return (
    <div className="settings-card">
      <div className="settings-card__row">
        <strong>Installation PWA</strong>
        <span className="history-card__badge">{pwaStatus.installed ? 'Installee' : 'Safari'}</span>
      </div>
      <p>
        {pwaStatus.installed
          ? 'FLOW tourne deja en mode installe.'
          : 'Installez FLOW depuis Safari pour une experience plus proche d une app quotidienne.'}
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
