'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

export function TawkChat() {
  useEffect(() => {
    // Add a small delay to ensure page is loaded
    const timer = setTimeout(() => {
      // Don't load if already loaded
      if (document.querySelector('script[src*="embed.tawk.to"]')) {
        return;
      }

      // Initialize Tawk.to
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Load the script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/69c0cfbefb7ce31c367646f6/1jkcin0jo';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);

      console.log('Tawk chat loaded');
    }, 1500); // Delay to avoid loader interference

    return () => clearTimeout(timer);
  }, []);

  return null;
}