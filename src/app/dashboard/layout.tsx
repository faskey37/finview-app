
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AppLoader } from "@/components/app-loader";
import { cn } from "@/lib/utils";
import { NotificationContext, useRealtimeNotifications, type Notification } from "@/hooks/use-notifications";
import { Toaster } from "@/components/ui/toaster";

function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            date: new Date(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10
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
  const { isCollapsed } = useSidebar();
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
    <div className="h-screen flex flex-col bg-background">
      <DashboardSidebar />
      <div className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <DashboardContent>{children}</DashboardContent>
      </NotificationProvider>
    </SidebarProvider>
  );
}
