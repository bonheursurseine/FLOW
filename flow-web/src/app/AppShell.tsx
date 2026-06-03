import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { BottomTabBar } from '../components/BottomTabBar';
import { PwaUpdateBanner } from '../features/settings/PwaUpdateBanner';
import { getPwaUpdateSnapshot, subscribeToPwaUpdate } from '../services/pwaUpdateService';

export function AppShell() {
  const [pwaUpdate, setPwaUpdate] = useState(getPwaUpdateSnapshot());

  useEffect(() => subscribeToPwaUpdate(setPwaUpdate), []);

  return (
    <div className="app-shell app-shell--tabs">
      <div className="app-shell__body">
        <PwaUpdateBanner
          onApplyUpdate={pwaUpdate.applyUpdate ?? (async () => undefined)}
          updateAvailable={pwaUpdate.updateAvailable}
        />
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}
