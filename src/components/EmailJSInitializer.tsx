'use client';

import { useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/config/emailjs';

export function EmailJSInitializer() {
  useEffect(() => {
    // Initialize EmailJS at the application root
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  return null;
}
