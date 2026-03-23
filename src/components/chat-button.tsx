'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for unread messages
    const checkUnread = setInterval(() => {
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = function() {
          window.Tawk_API.onUnreadCountChanged = function(count: number) {
            setUnreadCount(count);
          };
        };
      }
    }, 1000);

    return () => clearInterval(checkUnread);
  }, []);

  const toggleChat = () => {
    if (window.Tawk_API) {
      if (isOpen) {
        window.Tawk_API.minimize();
      } else {
        window.Tawk_API.showWidget();
        window.Tawk_API.maximize();
      }
      setIsOpen(!isOpen);
    }
  };

  return (
    <Button
      onClick={toggleChat}
      className="fixed bottom-4 right-4 rounded-full shadow-lg h-14 w-14 z-50 bg-primary hover:bg-primary/90"
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )}
    </Button>
  );
}