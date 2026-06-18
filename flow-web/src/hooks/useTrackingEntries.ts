import { useEffect, useState } from 'react';

import { trackingRepository } from '../storage/trackingRepository';
import type { TrackingEntry } from '../types/tracking';

export function useTrackingEntries(): TrackingEntry[] {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);

  useEffect(() => {
    let isActive = true;

    async function refreshEntries() {
      const nextEntries = await trackingRepository.listEntries();

      if (isActive) {
        setEntries(nextEntries);
      }
    }

    const unsubscribe = trackingRepository.subscribeToEntries(() => {
      void refreshEntries();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return entries;
}
