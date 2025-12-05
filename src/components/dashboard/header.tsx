"use client";

import { Bell, Menu, LogOut, Settings, User, Sparkles, LayoutGrid, DollarSign, Wallet, Repeat, Target, BarChart2, TrendingUp, Newspaper, Bot, FileText, Trees, PiggyBank, Calculator, ChevronDown, Zap, Crown, CreditCard, Shield, Moon, Sun, Gift, HelpCircle, Globe, ChevronRight, ExternalLink, Check, Sparkle } from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGoals } from "@/hooks/use-goals";
import { getAccounts } from "@/services/accounts";
import { getGoals } from "@/services/goals";

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
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot, badge: "New", featured: true },
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

interface NavItemProps {
  href: string;
  label: string;
  isMobile?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NavLink = ({ href, label, isMobile }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  const link = (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg group",
        isActive 
          ? "text-primary bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm" 
          : "text-muted-foreground hover:text-primary hover:bg-accent/30"
      )}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
      )}
    </Link>
  );

  return isMobile ? <SheetClose asChild>{link}</SheetClose> : link;
};

const MobileNavItem = ({ href, label, icon: Icon, badge }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5",
          isActive 
            ? "text-primary bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm" 
            : "text-muted-foreground hover:text-primary"
        )}
      >
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isActive 
              ? "bg-primary/20 text-primary" 
              : "bg-accent/20 text-muted-foreground group-hover:text-primary group-hover:bg-primary/20"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <span className="font-medium flex-1">{label}</span>
        {badge && (
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-auto text-xs font-medium",
              badge === "Beta" && "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
              badge === "New" && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
            )}
          >
            {badge}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary" />
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
            "relative text-sm font-medium transition-all duration-300 group px-4 py-2 rounded-lg",
            hasActiveItem 
              ? "text-primary bg-gradient-to-r from-primary/10 to-primary/5" 
              : "text-muted-foreground hover:text-primary hover:bg-accent/30"
          )}
        >
          <span>{title}</span>
          <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          {hasActiveItem && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="center" sideOffset={5}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} passHref>
              <DropdownMenuItem className={cn(
                "flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 group",
                isActive && "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
              )}>
                {item.icon && (
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "bg-accent/20 text-muted-foreground group-hover:text-primary group-hover:bg-primary/20"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium",
                      item.badge === "Beta" && "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
                      item.badge === "New" && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.featured && (
                  <Sparkle className="h-3 w-3 text-primary/60" />
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  const userInitial = (userData?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const userName = userData?.displayName || user?.email?.split('@')[0] || 'User';

  function formatCurrency(totalBalance: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-b from-background/95 to-background/90 backdrop-blur supports-backdrop-blur:bg-background/60">
      {/* Premium Banner for non-pro users */}
      {!isPro && (
        <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Upgrade to Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlock advanced features and AI-powered insights
            </p>
            <Button 
              size="sm" 
              className="ml-4 h-7 px-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              asChild
            >
              <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo />
            {isPro && (
              <Badge variant="outline" className="ml-2 border-primary/30 bg-primary/10 text-primary text-xs font-medium">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 md:hidden border-border/50 hover:border-primary/30 hover:bg-accent/30"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-80 p-0 border-r-0">
              <div className="p-6 border-b border-border/50 bg-gradient-to-b from-background to-accent/5">
                <div className="flex items-center justify-between">
                  <Logo />
                  <div className="flex items-center gap-2">
                    {!isPro && (
                      <Button 
                        size="sm" 
                        className="h-8 px-3 bg-gradient-to-r from-primary to-purple-600"
                        asChild
                      >
                        <Link href="/dashboard/upgrade">
                          <Crown className="h-3 w-3 mr-1" />
                          Upgrade
                        </Link>
                      </Button>
                    )}
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </div>
              
              {/* User Profile in Mobile Menu */}
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-lg font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    {isPro && (
                      <div className="absolute -bottom-1 -right-1">
                        <Crown className="h-4 w-4 fill-primary text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <p className="text-xs text-primary mt-1">View Profile →</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-6 space-y-6 overflow-auto">
                {/* Main Navigation */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    Navigation
                  </h3>
                  {mainNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    Tools
                  </h3>
                  {toolsNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* AI Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      AI Features
                    </h3>
                    <Sparkles className="h-3 w-3 text-primary/60" />
                  </div>
                  {aiNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>

                {/* More */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    More
                  </h3>
                  {moreNavItems.map(item => (
                    <MobileNavItem key={item.href} {...item} />
                  ))}
                </div>
              </nav>

              {/* Bottom Section */}
              <div className="p-6 border-t border-border/50 space-y-4">
                <div className="space-y-2">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-accent/30 transition-colors">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link href="/help" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-accent/30 transition-colors">
                    <HelpCircle className="h-4 w-4" />
                    Help & Support
                  </Link>
                </div>
                <Separator />
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
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
        <div className="hidden lg:flex items-center justify-center flex-1">
          <nav className="flex items-center gap-1">
            {mainNavItems.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
            <DropdownNav title="Tools" items={toolsNavItems} />
            <DropdownNav title="AI Features" items={aiNavItems} />
            <DropdownNav title="More" items={moreNavItems} />
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Quick Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {aiNavItems.find(item => item.featured) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30"
                asChild
              >
                <Link href="/dashboard/assistant" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Assistant
                  <Sparkle className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full hover:bg-accent/30 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-primary to-accent"></span>
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
                        {unreadCount} new
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={markAsRead}
                      >
                        Mark all read
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex p-3 rounded-full bg-accent/20 mb-4">
                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No new notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 border-b border-border/50 last:border-0 transition-colors hover:bg-accent/30",
                        !n.read && "bg-gradient-to-r from-primary/5 to-transparent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          n.type === 'success' && "bg-emerald-500/20 text-emerald-600",
                          n.type === 'warning' && "bg-amber-500/20 text-amber-600",
                          n.type === 'info' && "bg-primary/20 text-primary",
                          n.type === 'error' && "bg-destructive/20 text-destructive",
                        )}>
                          {n.icon || <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">{n.title}</h4>
                            {!n.read && (
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground/70">
                              {formatDistanceToNow(n.date, { addSuffix: true })}
                            </span>
                            {n.action && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                onClick={() => n.action && n.action()}
                              >
                                {n.actionLabel || 'View'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
              <div className="p-4 border-t border-border/50">
                <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
                  <Link href="/dashboard/notifications">View all notifications</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu - FIXED with ScrollArea */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:bg-accent/30 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Avatar className="h-9 w-9 ring-1 ring-border group-hover:ring-primary/30 transition-all duration-300">
                  <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {isPro && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-purple-600 p-0.5">
                      <Crown className="h-full w-full text-white" />
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 p-0 max-h-[calc(100vh-100px)] overflow-hidden"
              sideOffset={5}
              collisionPadding={16}
            >
              <ScrollArea className="h-[600px]">
                {/* User Profile Section */}
                <div className="p-6 bg-gradient-to-br from-background to-accent/5 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-lg font-semibold">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      {isPro && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-purple-600 rounded-full p-1">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{userName}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-medium",
                            isPro 
                              ? "bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border-primary/30" 
                              : "bg-accent/20 text-muted-foreground"
                          )}
                        >
                          {isPro ? 'Pro Member' : 'Free Plan'}
                        </Badge>
                        <span className="text-xs text-muted-foreground/70">
                          Joined {userData?.createdAt ? formatDistanceToNow(userData.createdAt, { addSuffix: true }) : 'recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Quick Stats */}
                  <div className="p-4 border-b border-border/50">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Balance", value: formatCurrency(totalBalance), color: "text-blue-500" },
                        { label: "Accounts", value: getAccounts.length, color: "text-emerald-500" },
                        { label: "Goals", value: getGoals.length, color: "text-purple-500" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-2 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                {/* Navigation Links */}
                <div className="p-2">
                  <DropdownMenuGroup>
                    <Link href="/dashboard/profile">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div className="flex-1">
                          <span>Profile</span>
                          <p className="text-xs text-muted-foreground">Manage your personal information</p>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/settings">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div className="flex-1">
                          <span>Settings</span>
                          <p className="text-xs text-muted-foreground">Customize your preferences</p>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/billing">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <CreditCard className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div className="flex-1">
                          <span>Billing & Plans</span>
                          <p className="text-xs text-muted-foreground">Manage subscription and billing</p>
                        </div>
                        {isPro && (
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border-primary/30">
                            Pro
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Theme Toggle */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {mounted && theme === 'dark' ? (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Dark Mode</span>
                      </div>
                      <Switch
                        checked={mounted && theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Upgrade Section for Free Users */}
                  {!isPro && (
                    <>
                      <div className="p-3 m-2">
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-purple-600">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">Upgrade to Pro</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Unlock all features and priority support
                              </p>
                              <Button 
                                size="sm" 
                                className="mt-3 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                                asChild
                              >
                                <Link href="/dashboard/upgrade" className="flex items-center justify-center gap-2">
                                  <Sparkles className="h-3 w-3" />
                                  Upgrade Now
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Additional Links */}
                  <div className="p-2">
                    <Link href="/help">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <HelpCircle className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>Help & Support</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/privacy">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>Privacy & Security</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/feedback">
                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-accent/30">
                        <Gift className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>Send Feedback</span>
                      </DropdownMenuItem>
                    </Link>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}
                  <div className="p-2">
                    <DropdownMenuItem 
                      className="cursor-pointer p-3 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      v2.1.0 • Last login: Today
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs text-muted-foreground hover:text-primary"
                      asChild
                    >
                      <Link href="/dashboard/settings/security">
                        <Shield className="h-3 w-3 mr-1" />
                        Security
                      </Link>
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}