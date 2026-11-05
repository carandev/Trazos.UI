import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@carandev/trazos-ui/styles.css';
import { App } from './App';
import './playground.css';

const root = document.getElementById('root');
if (root === null) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
