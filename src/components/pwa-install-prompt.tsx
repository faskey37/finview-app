'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-sm z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Install EcoVest</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Install our app for a better experience
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleInstall}
          >
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleDismiss}
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}