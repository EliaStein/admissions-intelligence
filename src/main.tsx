import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './config/emailjs';
import { App } from './App';
import './index.css';

// Initialize EmailJS at the application root
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
