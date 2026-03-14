import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('app-root');

if (!rootElement) {
  console.error('Root element #app-root not found! Check your index.html.');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error: unknown) {
    console.error('Fatal Error during Web Rendering:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    const stack =
      error instanceof Error ? error.stack ?? 'No stack trace available.' : '';

    rootElement.innerHTML = `
      <div style="padding: 20px; color: #721c24; background: #f8d7da; font-family: sans-serif; border-radius: 8px;">
        <h2 style="margin-top: 0;">Application Error</h2>
        <p><strong>Message:</strong> ${message}</p>
        <details style="white-space: pre-wrap; cursor: pointer;">
          <summary>View Stack Trace</summary>
          <pre style="font-size: 12px; margin-top: 10px;">${stack}</pre>
        </details>
      </div>
    `;
  }
}
