export interface PwaUpdateSnapshot {
  applyUpdate?: () => Promise<void>;
  updateAvailable: boolean;
}

type PwaUpdateListener = (snapshot: PwaUpdateSnapshot) => void;

let currentSnapshot: PwaUpdateSnapshot = {
  updateAvailable: false
};

const listeners = new Set<PwaUpdateListener>();

export function getPwaUpdateSnapshot(): PwaUpdateSnapshot {
  return currentSnapshot;
}

export function subscribeToPwaUpdate(listener: PwaUpdateListener): () => void {
  listeners.add(listener);
  listener(currentSnapshot);

  return () => {
    listeners.delete(listener);
  };
}

export function announcePwaUpdate(applyUpdate: () => Promise<void>): void {
  currentSnapshot = {
    applyUpdate,
    updateAvailable: true
  };
  emitChange();
}

export function clearPwaUpdate(): void {
  currentSnapshot = {
    updateAvailable: false
  };
  emitChange();
}

function emitChange(): void {
  listeners.forEach((listener) => listener(currentSnapshot));
}
