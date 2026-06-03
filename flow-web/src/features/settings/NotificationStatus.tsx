import type { NotificationCapability } from '../../services/notificationService';

interface NotificationStatusCardProps {
  capability: NotificationCapability;
  isBusy: boolean;
  onRequestPermission: () => void;
}

export function NotificationStatusCard({
  capability,
  isBusy,
  onRequestPermission
}: NotificationStatusCardProps) {
  return (
    <div className="settings-card">
      <div className="settings-card__row">
        <strong>Notifications web</strong>
        <span className="history-card__badge">{capability.permission}</span>
      </div>
      <p>{capability.detail}</p>
      {capability.supported && capability.permission !== 'granted' ? (
        <button className="quick-check-in__action" disabled={isBusy} onClick={onRequestPermission} type="button">
          {isBusy ? 'Demande...' : 'Autoriser les notifications'}
        </button>
      ) : null}
    </div>
  );
}
