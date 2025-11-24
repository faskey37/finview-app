"use client";

import { Bell, ChevronsLeft, Menu, LogOut, Settings, User, Sparkles, LayoutGrid, DollarSign, Wallet, Repeat, Target, BarChart2, TrendingUp, Newspaper, Bot, FileText, Trees, PiggyBank, Calculator, ChevronDown, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { useAuth, signOutUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: DollarSign },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
];

const toolsNavItems = [
  { href: "/dashboard/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/recurring", label: "Recurring", icon: Repeat },
  { href: "/dashboard/net-worth", label: "Net Worth", icon: BarChart2 },
  { href: "/dashboard/calculators", label: "Calculators", icon: Calculator },
];

const aiNavItems = [
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot, badge: "New" },
  { href: "/dashboard/subscriptions", label: "AI Subscriptions", icon: Repeat },
  { href: "/dashboard/bill-negotiation", label: "AI Bill Negotiator", icon: FileText, badge: "Beta" },
  { href: "/dashboard/eco", label: "Eco Hub", icon: Trees },
];

const moreNavItems = [
  { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
  { href: "/dashboard/community", label: "Community", icon: User },
  { href: "/dashboard/news", label: "News", icon: Newspaper },
  { href: "/dashboard/score", label: "Health Score", icon: TrendingUp },
];

const allNavItems = [...mainNavItems, ...toolsNavItems, ...aiNavItems, ...moreNavItems];

const NavLink = ({ href, label, isMobile }: { href: string, label: string, isMobile?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  const link = (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg",
        isActive 
          ? "text-primary bg-primary/10 border border-primary/20" 
          : "text-muted-foreground hover:text-primary hover:bg-accent/50"
      )}
    >
      {label}
    </Link>
  );

  return isMobile ? <SheetClose asChild>{link}</SheetClose> : link;
};

const MobileNavItem = ({ href, label, icon: Icon, badge }: { href: string, label: string, icon: any, badge?: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
          isActive 
            ? "text-primary bg-primary/10 border border-primary/20" 
            : "text-muted-foreground hover:text-primary hover:bg-accent/50"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
        {badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {badge}
          </Badge>
        )}
      </Link>
    </SheetClose>
  );
};

const DropdownNav = ({ title, items }: { title: string, items: any[] }) => {
  const pathname = usePathname();
  const hasActiveItem = items.some(item => pathname === item.href);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "text-sm font-medium transition-all duration-200",
            hasActiveItem ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          {title}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} passHref>
              <DropdownMenuItem className={cn(
                "flex items-center gap-2 cursor-pointer transition-colors",
                isActive && "bg-primary/10 text-primary"
              )}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </DropdownMenuItem>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function DashboardHeader() {
  const { notifications, markAsRead } = useNotifications();
  const { user, userData, isPro } = useAuth();
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card/50 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-50 w-full supports-backdrop-blur:bg-background/60">
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex">
            <Logo />
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden border-border/40">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-80 p-0">
              <div className="p-6 border-b border-border/40">
                <Logo />
              </div>
              <nav className="flex-1 p-6 space-y-2 overflow-auto">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Main
                  </h3>
                  {mainNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* Tools */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tools
                  </h3>
                  {toolsNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* AI Features */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    AI Features
                  </h3>
                  {aiNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* More */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    More
                  </h3>
                  {moreNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>
              </nav>
              
              {/* User Section in Mobile Menu */}
              <div className="p-6 border-t border-border/40">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                    <AvatarFallback className="text-xs">
                      {(userData?.displayName?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {userData?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center Section - Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
          <nav className="flex items-center gap-1 text-sm font-medium">
            {/* Main Navigation Items */}
            {mainNavItems.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
            
            {/* Tools Dropdown */}
            <DropdownNav title="Tools" items={toolsNavItems} />
            
            {/* AI Features Dropdown */}
            <DropdownNav title="AI Features" items={aiNavItems} />
            
            {/* More Dropdown */}
            <DropdownNav title="More" items={moreNavItems} />
          </nav>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Upgrade Button for non-pro users */}
          {!isPro && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10"
              asChild
            >
              <Link href="/dashboard/upgrade">
                <Crown className="h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative hover:bg-accent/50 transition-colors"
                onClick={markAsRead}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  {notifications.map(n => (
                    <DropdownMenuItem 
                      key={n.id} 
                      className={cn(
                        "flex-col items-start whitespace-normal p-3 cursor-pointer transition-colors",
                        !n.read && "bg-accent/50"
                      )}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
                          <p className="text-xs text-muted-foreground/50 mt-2">
                            {formatDistanceToNow(n.date, { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                  <AvatarFallback className="text-sm">
                    {(userData?.displayName?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userData?.displayName || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {isPro && (
                  <Badge variant="default" className="mt-1 w-fit bg-gradient-to-r from-primary to-purple-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Member
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                {!isPro && (
                  <Link href="/dashboard/upgrade">
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="h-4 w-4 mr-2 text-accent" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}