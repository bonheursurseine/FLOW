import type { PwaInstallStatus } from '../types/settings';

export interface PwaStatusSnapshot {
  displayMode: 'browser' | 'standalone';
  installStatus: PwaInstallStatus;
  instructions: string[];
  installed: boolean;
}

export function detectPwaStatus(): PwaStatusSnapshot {
  const standaloneMatch =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const navigatorStandalone =
    typeof navigator !== 'undefined' &&
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const installed = standaloneMatch || navigatorStandalone;

  return {
    displayMode: installed ? 'standalone' : 'browser',
    installStatus: installed ? 'installed' : 'unknown',
    instructions: [
      'Ouvrez FLOW dans Safari sur iPhone.',
      'Touchez le bouton de partage.',
      'Choisissez "Sur l ecran d accueil".',
      'Lancez ensuite FLOW depuis son icone pour une experience plus proche d une app.'
    ],
    installed
  };
}
