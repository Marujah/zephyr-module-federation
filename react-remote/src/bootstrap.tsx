import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

export function mount(container: Element) {
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return () => root.unmount();
}
