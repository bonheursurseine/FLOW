import { useState } from 'react';

interface PwaUpdateBannerProps {
  onApplyUpdate: () => Promise<void>;
  updateAvailable: boolean;
}

export function PwaUpdateBanner({ onApplyUpdate, updateAvailable }: PwaUpdateBannerProps) {
  const [isApplying, setIsApplying] = useState(false);

  if (!updateAvailable) {
    return null;
  }

  async function handleApplyUpdate() {
    setIsApplying(true);

    try {
      await onApplyUpdate();
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <section aria-label="Mise a jour disponible" className="status-card pwa-update-banner">
      <p className="status-label">Mise a jour</p>
      <h2>Nouvelle version disponible</h2>
      <p className="status-copy">Rafraichissez l application pour recuperer les derniers changements.</p>
      <button className="quick-check-in__action" disabled={isApplying} onClick={() => void handleApplyUpdate()} type="button">
        {isApplying ? 'Mise a jour...' : 'Mettre a jour'}
      </button>
    </section>
  );
}
