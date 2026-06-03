import { Outlet } from 'react-router-dom';

import { BottomTabBar } from '../components/BottomTabBar';

export function AppShell() {
  return (
    <div className="app-shell app-shell--tabs">
      <div className="app-shell__body">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}
