import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './AppShell';

const AnalysePage = lazy(async () => import('../features/analytics/AnalysePage').then((module) => ({ default: module.AnalysePage })));
const HistoriquePage = lazy(async () =>
  import('../features/history/HistoriquePage').then((module) => ({ default: module.HistoriquePage }))
);
const NoterPage = lazy(async () => import('../features/tracking/NoterPage').then((module) => ({ default: module.NoterPage })));
const ReglagesPage = lazy(async () =>
  import('../features/settings/ReglagesPage').then((module) => ({ default: module.ReglagesPage }))
);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<NoterPage />} />
          <Route path="historique" element={<HistoriquePage />} />
          <Route path="analyse" element={<AnalysePage />} />
          <Route path="reglages" element={<ReglagesPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="app-shell">
      <main className="app-shell__surface">
        <section className="status-card">
          <p className="status-label">Chargement</p>
          <h2>FLOW se prepare</h2>
          <p className="status-copy">Ouverture de l ecran en cours...</p>
        </section>
      </main>
    </div>
  );
}
