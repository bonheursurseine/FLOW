/// <reference types="vite-plugin-pwa/client" />

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import { App } from './app/App';
import './styles/tokens.css';
import './styles/globals.css';

registerSW({
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
