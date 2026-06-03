import type { NotificationStatus } from '../types/settings';

export interface NotificationCapability {
  canSchedule: boolean;
  detail: string;
  permission: NotificationStatus;
  supported: boolean;
}

export function detectNotificationCapability(): NotificationCapability {
  const hasNotificationApi = typeof window !== 'undefined' && 'Notification' in window;
  const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const permission = hasNotificationApi ? Notification.permission : 'unsupported';

  if (!hasNotificationApi || !hasServiceWorker) {
    return {
      canSchedule: false,
      detail:
        'Les notifications web ne sont pas disponibles sur cet environnement. FLOW garde vos horaires localement.',
      permission,
      supported: false
    };
  }

  return {
    canSchedule: permission === 'granted',
    detail:
      permission === 'granted'
        ? 'Le navigateur autorise les notifications. Sur iPhone, leur fiabilite reste liee au support PWA du systeme.'
        : 'Les notifications web peuvent etre demandees, mais leur comportement depend encore du navigateur et de l installation PWA.',
    permission,
    supported: true
  };
}

export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.requestPermission();
}
