import React from 'react';
import { render } from 'react-dom';
import App from './App';

const rootElement = document.getElementById('app-root');

if (!rootElement) {
  console.error('Root element #app-root not found! Check your index.html.');
} else {
  try {
    render(<App />, rootElement);
  } catch (error) {
    console.error('Fatal Error during Web Rendering:', error);

    rootElement.innerHTML = `
      <div style="padding: 20px; color: #721c24; background: #f8d7da; font-family: sans-serif; border-radius: 8px;">
        <h2 style="margin-top: 0;">Application Error</h2>
        <p><strong>Message:</strong> ${error.message}</p>
        <details style="white-space: pre-wrap; cursor: pointer;">
          <summary>View Stack Trace</summary>
          <pre style="font-size: 12px; margin-top: 10px;">${error.stack}</pre>
        </details>
      </div>
    `;
  }
}