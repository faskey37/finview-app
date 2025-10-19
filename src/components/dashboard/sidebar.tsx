
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  HelpCircle,
  TrendingUp,
  Target,
  Flag,
  BarChart3,
  PieChart,
  Users,
  Leaf,
  Activity,
  Calculator,
  ShieldCheck,
  BrainCircuit,
  Newspaper,
  User,
  CreditCard,
  Repeat,
} from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/dashboard/investments", icon: TrendingUp, label: "Investments" },
  { href: "/dashboard/recurring", icon: Repeat, label: "Recurring" },
  { href: "/dashboard/subscriptions", icon: CreditCard, label: "Subscriptions" },
];

const analyticsNavItems = [
    { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
    { href: "/dashboard/goals", icon: Flag, label: "Goals" },
    { href: "/dashboard/net-worth", icon: PieChart, label: "Net Worth" },
    { href: "/dashboard/community", icon: Users, label: "Community" },
];

const toolsNavItems = [
    { href: "/dashboard/assistant", icon: BrainCircuit, label: "Assistant"},
    { href: "/dashboard/score", icon: Activity, label: "Health Score" },
    { href: "/dashboard/eco", icon: Leaf, label: "Impact Hub" },
    { href: "/dashboard/bill-negotiation", icon: ShieldCheck, label: "Bill Negotiator", isPro: true},
    { href: "/dashboard/calculators", icon: Calculator, label: "Calculators" },
    { href: "/dashboard/news", icon: Newspaper, label: "News" },
]

const personalNavItems = [
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/dashboard/help", icon: HelpCircle, label: "Help Center" },
]

export function DashboardSidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { isPro } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const renderNavSection = (title: string, items: any[]) => (
    <>
        <p className={cn("px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 mt-6", isCollapsed && "text-center")}>{title}</p>
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {items.map((item) => {
            if (item.isPro && !isPro) return null;
            return (
             <Tooltip key={item.label} delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-foreground hover:bg-muted",
                        pathname === item.href && "bg-muted text-foreground font-semibold",
                        isCollapsed && "justify-center"
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                    </Link>
                </TooltipTrigger>
                 {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
            </Tooltip>
          )})}
        </nav>
    </>
  );

  const navContent = (
    <TooltipProvider>
      <div className={cn(
          "flex h-16 items-center justify-between border-b", 
          isCollapsed ? "justify-center px-2" : "px-4 lg:px-6"
      )}>
        <Logo isCollapsed={isCollapsed} />
        {!isMobile && (
             <Button 
                variant="ghost" 
                size="icon" 
                className={cn("rounded-full data-[state=open]:bg-muted", isCollapsed && "hidden")}
                onClick={toggleSidebar}
            >
                <span className="sr-only">Toggle sidebar</span>
            </Button>
        )}
      </div>

       <div className={cn("p-4", isCollapsed && "p-2")}>
            <div className="relative">
                <Input placeholder="Search..." className={cn("pr-8", isCollapsed && "hidden")} />
                 <kbd className={cn("pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex", isCollapsed && "hidden")}>
                    <span className="text-xs">⌘</span>S
                </kbd>
            </div>
        </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        {renderNavSection("Menu", mainNavItems)}
        {renderNavSection("Analysis", analyticsNavItems)}
        {renderNavSection("Tools", toolsNavItems)}
        {renderNavSection("Personal", personalNavItems)}
      </div>
    </TooltipProvider>
  );

  if (isMobile) {
    return <div className="flex h-full flex-col">{navContent}</div>;
  }

  return (
    <aside className={cn(
        "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block transition-all duration-300 ease-in-out border-r",
        isCollapsed ? "w-20" : "w-64"
    )}>
       <div className="flex h-full max-h-screen flex-col gap-2 bg-card">
        {navContent}
      </div>
    </aside>
  );
}
