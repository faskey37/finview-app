
"use client";

import { Bell, ChevronsLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./sidebar";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { notifications, markAsRead } = useNotifications();
  const { toggleSidebar, isCollapsed } = useSidebar();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex rounded-full"
            onClick={toggleSidebar}
        >
            <ChevronsLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
            <span className="sr-only">Toggle sidebar</span>
        </Button>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          <DashboardSidebar isMobile />
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4 justify-end">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative" onClick={markAsRead}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No new notifications</p>
            ) : (
              notifications.map(n => (
                <DropdownMenuItem key={n.id} className="flex-col items-start whitespace-normal">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">{formatDistanceToNow(n.date, { addSuffix: true })}</p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
