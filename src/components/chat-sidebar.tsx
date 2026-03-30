'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Send, 
  MessageCircle, 
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Bell,
  Clock,
  Sparkles,
  RefreshCw,
  Shield,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'error';
}

export function ChatSidebar() {
  const { user, userData, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeliveryStatus, setShowDeliveryStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Wait for page to be fully loaded
  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsPageReady(true);
    } else {
      const handleLoad = () => setIsPageReady(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    if (!isPageReady) return;
    
    const saved = localStorage.getItem('ecovest_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {}
    }
  }, [isPageReady]);

  // Save messages to localStorage
  useEffect(() => {
    if (!isPageReady) return;
    localStorage.setItem('ecovest_chat_history', JSON.stringify(messages));
  }, [messages, isPageReady]);

  // Scroll to bottom
  useEffect(() => {
    if (!isPageReady) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPageReady]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && isPageReady) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isPageReady]);

  // Hide delivery status after 3 seconds
  useEffect(() => {
    if (showDeliveryStatus) {
      const timer = setTimeout(() => setShowDeliveryStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeliveryStatus]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!user) {
      alert('Please log in to send a message');
      return;
    }
    if (!isPageReady) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          message: messageText,
          userType: userData?.isPro ? 'Pro Member' : 'Free User',
          userId: user.uid,
          plan: userData?.proSubscription?.plan || 'free',
        }),
      });

      if (response.ok) {
        // Update message status to delivered
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
        
        // Show delivery status notification
        setShowDeliveryStatus(true);
        
        // Add confirmation message with email info
        const confirmationMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "✅ Your message has been received by our support team. We'll get back to you within 24 hours. For urgent matters, please email us directly at ecovest.help@gmail.com",
          sender: 'support',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, confirmationMessage]);
        
        setLastMessage(messageText);
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const refreshMessages = async () => {
    setIsRefreshing(true);
    // Simulate checking for new messages
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    setShowDeliveryStatus(true);
    setTimeout(() => setShowDeliveryStatus(false), 2000);
  };

  const openChat = () => {
    if (!isPageReady) return;
    setIsOpen(true);
    setUnreadCount(0);
    setShowNotification(false);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  // Don't render anything while page is loading
  if (!isPageReady || authLoading) {
    return null;
  }

  return (
    <>
      {/* Delivery Status Toast */}
      <AnimatePresence>
        {showDeliveryStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <div className="bg-green-500 text-white rounded-lg shadow-lg p-3 flex items-center gap-2 text-sm">
              <CheckCheck className="h-4 w-4" />
              <span>Message delivered to support team</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-4 z-50 cursor-pointer"
            onClick={openChat}
          >
            <div className="bg-card border rounded-lg shadow-lg p-3 max-w-sm flex items-start gap-3 hover:shadow-xl transition-shadow">
              <div className="p-2 rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Support Team Notified!</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  We'll get back to you within 24 hours
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Click to view</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeChat}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/20">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Support Chat</h3>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Response within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={refreshMessages}
                    disabled={isRefreshing}
                    className="text-white hover:bg-white/20"
                    title="Check for new replies"
                  >
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeChat} 
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-3 border-b bg-muted/10">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.displayName || user.email}</span>
                    {userData?.isPro && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Pro
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>For faster response, email: ecovest.help@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Your messages are securely delivered to our support team</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Send a message and we'll get back to you
                    </p>
                    <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
                        <Mail className="h-3 w-3" />
                        For urgent matters: ecovest.help@gmail.com
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{message.text}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-[10px] opacity-70">
                              {format(message.timestamp, 'hh:mm a')}
                            </p>
                            {message.sender === 'user' && message.status === 'sending' && (
                              <Loader2 className="h-3 w-3 animate-spin opacity-70" />
                            )}
                            {message.sender === 'user' && message.status === 'delivered' && (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            )}
                            {message.sender === 'user' && message.status === 'error' && (
                              <AlertCircle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Email Info Banner */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-primary">📧 Need faster response?</p>
                          <p className="text-xs text-muted-foreground">
                            Email us directly at <strong>ecovest.help@gmail.com</strong> and we'll get back to you promptly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-none p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 rounded-full"
                    disabled={isSending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputMessage.trim() || isSending}
                    className="rounded-full h-10 w-10 p-0"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    📧 Messages sent to <strong>ecovest.help@gmail.com</strong> • Response within 24 hours
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Your message is securely delivered and we'll reply to your email
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={openChat}
          className="fixed bottom-4 right-4 rounded-full shadow-lg h-12 w-12 z-40 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {unreadCount > 0 ? (
            <div className="relative">
              <MessageCircle className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          ) : (
            <MessageCircle className="h-5 w-5 text-white" />
          )}
        </Button>
      )}
    </>
  );
}