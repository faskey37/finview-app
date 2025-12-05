"use client";

import { 
  Bell, Menu, LogOut, Settings, User, Sparkles, LayoutGrid, DollarSign, Wallet, 
  Repeat, Target, BarChart2, TrendingUp, Newspaper, Bot, FileText, Trees, 
  PiggyBank, Calculator, ChevronDown, Zap, Crown, CreditCard, Shield, Moon, 
  Sun, Gift, HelpCircle, Globe, ChevronRight, ExternalLink, Check, Sparkle, 
  Home, Search, LineChart, CreditCard as CreditCardIcon, Users as UsersIcon,
  Award, Clock, Eye, EyeOff, Lock, ShieldCheck, Rocket, PieChart, Brain,
  Cloud, MessageSquare, Database, Network, ZapOff, TrendingDown, Download,
  BellRing, CheckCircle, AlertTriangle, Calendar, BarChart, 
  DollarSign as DollarIcon, Coins, WalletCards, Calculator as CalculatorIcon,
  Target as TargetIcon
} from "lucide-react";
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
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { useAuth, signOutUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccounts } from "@/hooks/use-accounts";
import { useGoals } from "@/hooks/use-goals";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/hooks/use-transactions";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltips";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Enhanced navigation items with better organization
const mainNavItems = [
  { 
    href: "/dashboard", 
    label: "Overview", 
    icon: Home, 
    description: "Your financial dashboard",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    href: "/dashboard/accounts", 
    label: "Accounts", 
    icon: WalletCards, 
    description: "Manage all accounts",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    href: "/dashboard/transactions", 
    label: "Transactions", 
    icon: DollarIcon, 
    description: "View all transactions",
    color: "from-violet-500 to-purple-500"
  },
  { 
    href: "/dashboard/investments", 
    label: "Investments", 
    icon: TrendingUp, 
    description: "Investment portfolio",
    color: "from-amber-500 to-orange-500"
  },
];

const toolsNavItems = [
  { 
    href: "/dashboard/budgets", 
    label: "Budgets", 
    icon: PieChart, 
    description: "Track spending limits",
    color: "from-rose-500 to-pink-500"
  },
  { 
    href: "/dashboard/goals", 
    label: "Goals", 
    icon: TargetIcon, 
    description: "Financial targets",
    color: "from-indigo-500 to-blue-500"
  },
  { 
    href: "/dashboard/recurring", 
    label: "Recurring", 
    icon: Repeat, 
    description: "Manage subscriptions",
    color: "from-green-500 to-emerald-500"
  },
  { 
    href: "/dashboard/net-worth", 
    label: "Net Worth", 
    icon: LineChart, 
    description: "Track net worth growth",
    color: "from-cyan-500 to-sky-500"
  },
  { 
    href: "/dashboard/calculators", 
    label: "Calculators", 
    icon: CalculatorIcon, 
    description: "Financial calculators",
    color: "from-purple-500 to-violet-500"
  },
];

const aiNavItems = [
  { 
    href: "/dashboard/assistant", 
    label: "AI Assistant", 
    icon: Brain, 
    badge: "AI", 
    featured: true,
    description: "Get financial advice",
    color: "from-fuchsia-500 to-pink-500"
  },
  { 
    href: "/dashboard/subscriptions", 
    label: "AI Subscriptions", 
    icon: Repeat, 
    description: "Smart subscription tracking",
    color: "from-blue-500 to-indigo-500"
  },
  { 
    href: "/dashboard/bill-negotiation", 
    label: "AI Bill Negotiator", 
    icon: FileText, 
    badge: "Beta",
    description: "Optimize your bills",
    color: "from-orange-500 to-amber-500"
  },
  { 
    href: "/dashboard/eco", 
    label: "Eco Hub", 
    icon: Trees, 
    description: "Sustainable finance",
    color: "from-green-500 to-emerald-500"
  },
];

const moreNavItems = [
  { 
    href: "/dashboard/reports", 
    label: "Reports", 
    icon: BarChart, 
    description: "Detailed analytics",
    color: "from-slate-500 to-gray-500"
  },
  { 
    href: "/dashboard/community", 
    label: "Community", 
    icon: UsersIcon, 
    description: "Connect with others",
    color: "from-purple-500 to-pink-500"
  },
  { 
    href: "/dashboard/news", 
    label: "Market News", 
    icon: Newspaper, 
    description: "Latest financial news",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    href: "/dashboard/score", 
    label: "Health Score", 
    icon: TrendingUp, 
    description: "Financial wellness",
    color: "from-emerald-500 to-teal-500"
  },
];

interface NavItemProps {
  href: string;
  label: string;
  isMobile?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  featured?: boolean;
  description?: string;
  color?: string;
}

const NavLink = ({ href, label, isMobile, icon: Icon, badge, featured, description, color }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  const link = (
    <Link
      href={href}
      className={cn(
        "relative group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
        isActive 
          ? "text-primary bg-gradient-to-r from-primary/10 via-primary/5 to-primary/2 border border-primary/20 shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:text-primary hover:bg-accent/20"
      )}
    >
      {Icon && (
        <div className={cn(
          "p-3 rounded-xl transition-all duration-300",
          "group-hover:scale-110 group-hover:rotate-3",
          isActive 
            ? `bg-gradient-to-br ${color} text-white shadow-lg` 
            : "bg-accent/20 text-muted-foreground group-hover:text-primary group-hover:bg-primary/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{label}</span>
          {badge && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-bold px-2 py-0.5",
                badge === "AI" && "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0",
                badge === "Beta" && "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0",
                badge === "New" && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate mt-1">{description}</p>
        )}
      </div>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-4 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );

  return isMobile ? <SheetClose asChild>{link}</SheetClose> : link;
};

// Quick Stats Component
function QuickStats() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { formatCurrency } = useCurrency();
  
  const totalBalance = accounts.reduce((acc, account) => 
    account.type !== 'Credit Card' ? acc + account.balance : acc - account.balance, 0
  );
  
  const thisMonthIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
    
  const thisMonthExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsRate = thisMonthIncome > 0 ? 
    ((thisMonthIncome - thisMonthExpense) / thisMonthIncome * 100).toFixed(1) : "0";

  return (
    <div className="hidden lg:flex items-center gap-4">
      <TooltipProvider>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-help">
                <Wallet className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">{formatCurrency(totalBalance)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Balance</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-help">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold">{formatCurrency(thisMonthIncome)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Monthly Income</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-help">
                <PiggyBank className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-semibold">{savingsRate}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Savings Rate</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// Search Component
function GlobalSearch() {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-accent/30 transition-all duration-300"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-full mt-2 w-80 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/20 p-2 z-50"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions, accounts, or help..."
                className="pl-10 pr-4 h-12 bg-transparent border-0 focus:ring-0"
                autoFocus
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1">Quick Actions</p>
              <div className="space-y-1">
                {[
                  { icon: DollarSign, label: "Add Transaction", shortcut: "T" },
                  { icon: Calculator, label: "Run Calculation", shortcut: "C" },
                  { icon: Target, label: "View Goals", shortcut: "G" },
                ].map((item, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start text-sm hover:bg-accent/30"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                    <span className="ml-auto text-xs text-muted-foreground bg-accent/20 px-2 py-1 rounded">
                      ⌘{item.shortcut}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Notification Badge with Count
function NotificationBadge({ count }: { count: number }) {
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-ping"
          />
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs p-0 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </Badge>
        </>
      )}
    </div>
  );
}

export function DashboardHeader() {
  const { notifications, markAsRead, markNotificationAsRead } = useNotifications();
  const { user, userData, isPro } = useAuth();
  const { accounts } = useAccounts();
  const { goals } = useGoals();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : 
                   today.getHours() < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    setMounted(true);
    // Add keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  const userInitial = (userData?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const userName = userData?.displayName || user?.email?.split('@')[0] || 'User';

  const totalBalance = accounts.reduce((acc, account) => 
    account.type !== 'Credit Card' ? acc + account.balance : acc - account.balance, 0
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-b from-background/95 via-background/90 to-background/80 backdrop-blur-xl supports-backdrop-blur:bg-background/60">
        {/* Premium Banner with Animation */}
        {!isPro && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-b border-primary/30"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 animate-pulse">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Upgrade to Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock AI insights, advanced analytics, and premium features
              </p>
              <Button 
                size="sm" 
                className="ml-4 h-7 px-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                  <Rocket className="h-3 w-3" />
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Logo />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <span className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  WealthFlow
                </span>
              </motion.div>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 md:hidden border-border/50 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-[320px] p-0 border-r-0 bg-gradient-to-b from-background via-background to-accent/5">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Logo />
                      <span className="text-lg font-bold">WealthFlow</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      isPro 
                        ? "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-600 border-amber-500/30" 
                        : "bg-accent/20"
                    )}>
                      {isPro ? 'PRO' : 'FREE'}
                    </Badge>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {/* User Profile */}
                    <Link href="/dashboard/profile" className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {accounts.length} accounts
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {goals.length} goals
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Navigation Sections */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          Navigation
                        </h3>
                        <div className="space-y-1">
                          {mainNavItems.map(item => (
                            <SheetClose asChild key={item.href}>
                              <NavLink {...item} isMobile />
                            </SheetClose>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          <div className="flex items-center gap-2">
                            <span>Tools</span>
                            <Sparkle className="h-3 w-3 text-primary/60" />
                          </div>
                        </h3>
                        <div className="space-y-1">
                          {toolsNavItems.map(item => (
                            <SheetClose asChild key={item.href}>
                              <NavLink {...item} isMobile />
                            </SheetClose>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                          <div className="flex items-center gap-2">
                            <span>AI Features</span>
                            <Brain className="h-3 w-3 text-fuchsia-500" />
                          </div>
                        </h3>
                        <div className="space-y-1">
                          {aiNavItems.map(item => (
                            <SheetClose asChild key={item.href}>
                              <NavLink {...item} isMobile />
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t border-border/50 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      <span className="text-sm">Dark Mode</span>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                  </div>
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className="flex items-center gap-1">
              {mainNavItems.map(item => (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <NavLink {...item} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="group px-4 py-3 rounded-2xl hover:bg-accent/20 hover:scale-[1.02] transition-all duration-300"
                  >
                    <PieChart className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" />
                    <span className="font-semibold">Tools</span>
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 p-2 backdrop-blur-xl bg-background/95 border-border/50">
                  {toolsNavItems.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm">{item.label}</span>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Quick Stats */}
            <QuickStats />

            {/* Search */}
            <GlobalSearch />

            {/* Balance Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent/30"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                  >
                    {balanceVisible ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{balanceVisible ? 'Hide Balance' : 'Show Balance'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Theme Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent/30"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-full hover:bg-accent/30 transition-all duration-300"
                >
                  <NotificationBadge count={unreadCount} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 backdrop-blur-xl bg-background/95 border-border/50">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-primary to-accent">
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
                <ScrollArea className="max-h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notification: Notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/30",
                          !notification.read && "bg-gradient-to-r from-primary/5 via-primary/2 to-transparent"
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            notification.type === 'success' && "bg-emerald-500/20 text-emerald-600",
                            notification.type === 'warning' && "bg-amber-500/20 text-amber-600",
                            notification.type === 'info' && "bg-blue-500/20 text-blue-600",
                            notification.type === 'error' && "bg-red-500/20 text-red-600",
                          )}>
                            {notification.icon || <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground/70">
                                {formatDistanceToNow(notification.date, { addSuffix: true })}
                              </span>
                              {notification.action && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.action?.();
                                  }}
                                >
                                  {notification.actionLabel || 'View'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
                <div className="p-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/notifications">View all notifications</Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full hover:scale-105 transition-all duration-300 group"
                >
                  <motion.div
                    initial={false}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <Avatar className="h-9 w-9 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {isPro && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-purple-600 p-0.5 shadow-lg">
                        <Crown className="h-full w-full text-white" />
                      </div>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 p-0 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl"
                sideOffset={8}
              >
                <ScrollArea className="max-h-[calc(100vh-100px)]">
                  {/* User Header */}
                  <div className="p-6 bg-gradient-to-br from-background via-background to-accent/5 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                          <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xl font-bold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        {isPro && (
                          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-purple-600 rounded-full p-1 shadow-lg">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{userName}</h3>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            className={cn(
                              "text-xs font-bold",
                              isPro 
                                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0" 
                                : "bg-accent/20 text-muted-foreground"
                            )}
                          >
                            {isPro ? 'PRO MEMBER' : 'FREE PLAN'}
                          </Badge>
                          <span className="text-xs text-muted-foreground/70">
                            {format(today, 'MMM d')}
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
                        { label: "Accounts", value: accounts.length, color: "text-emerald-500" },
                        { label: "Goals", value: goals.length, color: "text-purple-500" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-2 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <DropdownMenuGroup>
                      <Link href="/dashboard/profile">
                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer">
                          <User className="h-4 w-4" />
                          <div className="flex-1">
                            <span className="font-medium">Profile</span>
                            <p className="text-xs text-muted-foreground">Personal information</p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                      
                      <Link href="/dashboard/settings">
                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          <div className="flex-1">
                            <span className="font-medium">Settings</span>
                            <p className="text-xs text-muted-foreground">Preferences & security</p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                      
                      <Link href="/dashboard/billing">
                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <div className="flex-1">
                            <span className="font-medium">Billing</span>
                            <p className="text-xs text-muted-foreground">Subscription & plans</p>
                          </div>
                          {isPro && (
                            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs">
                              Pro
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Upgrade Section */}
                    {!isPro && (
                      <>
                        <div className="p-3 m-2">
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-purple-600">
                                <Rocket className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm">Upgrade to Pro</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Get AI insights, premium features, and more
                                </p>
                                <Button 
                                  size="sm" 
                                  className="mt-3 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                                  asChild
                                >
                                  <Link href="/dashboard/upgrade">
                                    <Sparkles className="h-3 w-3 mr-2" />
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
                    <div className="p-2 space-y-1">
                      {[
                        { icon: HelpCircle, label: "Help & Support", href: "/help" },
                        { icon: Shield, label: "Privacy & Security", href: "/privacy" },
                        { icon: Gift, label: "Refer a Friend", href: "/refer" },
                      ].map((item, i) => (
                        <Link key={i} href={item.href}>
                          <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 cursor-pointer">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </div>

                    <DropdownMenuSeparator />

                    {/* Sign Out */}
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border/50 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        WealthFlow v2.1.0
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {format(today, 'h:mm a')}
                      </Badge>
                    </div>
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}