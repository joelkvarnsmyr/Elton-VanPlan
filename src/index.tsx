
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // KORRIGERING: Ändrad till namngiven import
import { loadApiKeys } from './services/secretService';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

// Toppnivå-renderingsfunktion.
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Ladda API-nycklar och rendera sedan appen.
loadApiKeys()
  .then(() => {
    console.log("🔑 Alla API-nycklar har laddats, startar applikationen...");
    renderApp();
  })
  .catch(error => {
    console.error("🔴 Ett kritiskt fel uppstod vid laddning av API-nycklar:", error);
    // Valfritt: rendera en felkomponent istället för appen.
    root.render(
      <div>
        <h1>Kritiskt fel</h1>
        <p>Kunde inte ladda nödvändig konfiguration. Vänligen kontrollera konsolen för mer information.</p>
      </div>
    );
  });

