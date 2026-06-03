/// <reference types="vite-plugin-pwa/client" />

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import { App } from './app/App';
import { announcePwaUpdate, clearPwaUpdate } from './services/pwaUpdateService';
import './styles/tokens.css';
import './styles/globals.css';

const updateSW = registerSW({
  onNeedRefresh() {
    announcePwaUpdate(async () => {
      clearPwaUpdate();
      await updateSW(true);
    });
  },
  onOfflineReady() {
    console.info('FLOW is ready for offline use.');
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
