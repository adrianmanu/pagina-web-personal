import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { seedService } from './services/seedService';
import './index.css';

seedService.ensureSeeded();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
