
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppLoader } from "@/components/app-loader";
import { cn } from "@/lib/utils";
import { NotificationContext, useRealtimeNotifications, type Notification } from "@/hooks/use-notifications";
import { Toaster } from "@/components/ui/toaster";
import { DashboardHeader } from "@/components/dashboard/header";
import { BellIcon, Sparkles } from "lucide-react";

function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            date: new Date(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20
    };
    
    const markAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useRealtimeNotifications();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <AppLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pt-20 md:pt-24">
          {children}
      </main>
      <Toaster />
    </div>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
      <NotificationProvider>
        <DashboardContent>{children}</DashboardContent>
      </NotificationProvider>
  );
}
