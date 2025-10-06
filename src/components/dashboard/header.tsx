
"use client";

import { Bell, ChevronsLeft, CreditCard, LifeBuoy, LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardSidebar } from "./sidebar";
import Link from "next/link";
import { useAuth, signOutUser } from "@/hooks/use-auth.tsx";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useSidebar } from "@/hooks/use-sidebar";

export function DashboardHeader() {
  const { user, userData } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30 shadow-sm">
        <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex"
            onClick={toggleSidebar}
        >
            <ChevronsLeft />
            <span className="sr-only">Toggle sidebar</span>
        </Button>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <DashboardSidebar isMobile />
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative" onClick={markAsRead}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-2 w-2">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.photoURL || user?.photoURL || ""} alt={user?.displayName || "User"} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                    {user?.displayName || "My Account"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
              <Link href="/dashboard/profile"><UserIcon/>Profile</Link>
            </DropdownMenuItem>
             {!userData?.isPro && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/upgrade"><CreditCard/>Upgrade</Link>
              </DropdownMenuItem>
            )}
             <DropdownMenuItem><LifeBuoy/>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}><LogOut/>Logout</DropdownMenuItem>
          </DropdownMenuContent> 
        </DropdownMenu>
      </div>
    </header>
  );
}
