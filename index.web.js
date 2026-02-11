import React from 'react';
import { render } from 'react-dom';
import App from './App';

// Para web, renderizamos diretamente com React DOM
const rootElement = document.getElementById('app-root');

if (!rootElement) {
  console.error('Root element #app-root not found!');
} else {
  try {
    render(<App />, rootElement);
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>Error loading application</h2>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
}
