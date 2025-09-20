
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  BadgeDollarSign,
  Target,
  TrendingUp,
  Repeat,
  Goal,
  Calculator,
  Newspaper,
  Leaf,
  Activity,
  Users,
  ShieldCheck,
  PiggyBank,
  BrainCircuit
} from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/assistant", icon: BrainCircuit, label: "AI Assistant", isPro: true },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/dashboard/net-worth", icon: PiggyBank, label: "Net Worth" },
  { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
  { href: "/dashboard/subscriptions", icon: Repeat, label: "Subscriptions" },
  { href: "/dashboard/investments", icon: TrendingUp, label: "Investments" },
  { href: "/dashboard/goals", icon: Goal, label: "Goals" },
  { href: "/dashboard/score", icon: Activity, label: "Score" },
  { href: "/dashboard/eco", icon: Leaf, label: "Eco-Tracker" },
  { href: "/dashboard/community", icon: Users, label: "Community" },
  { href: "/dashboard/news", icon: Newspaper, label: "News" },
  { href: "/dashboard/calculators", icon: Calculator, label: "Calculators" },
];

const secondaryNavItems = [
    { href: "/dashboard/bill-negotiation", icon: ShieldCheck, label: "Bill Negotiation", isPro: true },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function DashboardSidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { isPro } = useAuth();
  const { isCollapsed } = useSidebar();

  const navContent = (
    <TooltipProvider>
      <div className={cn(
          "flex h-16 items-center", 
          isCollapsed ? "justify-center px-2" : "px-4 lg:px-6"
      )}>
        <Logo isCollapsed={isCollapsed} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2 py-4">
          {navItems.map((item) => {
            if (item.isPro && !isPro) return null;
            return (
             <Tooltip key={item.label} delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === item.href && "bg-muted text-primary",
                        isCollapsed && "justify-center"
                    )}
                    >
                    <item.icon className="h-4 w-4" />
                    <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                     {item.isPro && (
                            <span className={cn("ml-auto text-xs font-semibold text-primary", isCollapsed && "sr-only")}>Pro</span>
                        )}
                    </Link>
                </TooltipTrigger>
                 {isCollapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
            </Tooltip>
          )})}
        </nav>
        <div className="my-4 px-4">
            <hr className="border-border" />
        </div>
         <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2">
            {secondaryNavItems.map((item) => {
              if (item.isPro && !isPro) return null;
              return (
                <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary",
                            isCollapsed && "justify-center"
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                         {item.isPro && (
                            <span className={cn("ml-auto text-xs font-semibold text-primary", isCollapsed && "sr-only")}>Pro</span>
                        )}
                        </Link>
                    </TooltipTrigger>
                     {isCollapsed && (
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    )}
                </Tooltip>
            )})}
        </nav>
      </div>
       {!isCollapsed && (
         <div className="mt-auto p-4">
            {!isPro && (
            <div className={cn("rounded-lg border p-4 text-center")}>
                <div>
                    <BadgeDollarSign className="h-10 w-10 mb-4 inline-block text-accent" />
                    <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Unlock AI features and get unlimited access to our support team.
                    </p>
                    <Button size="sm" className="w-full mt-4 bg-accent hover:bg-accent/90" asChild>
                        <Link href="/dashboard/upgrade">Upgrade</Link>
                    </Button>
                </div>
            </div>
            )}
        </div>
       )}
    </TooltipProvider>
  );

  if (isMobile) {
    return <div className="flex h-full flex-col">{navContent}</div>;
  }

  return (
    <aside className={cn(
        "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
    )}>
       <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-card">
        {navContent}
      </div>
    </aside>
  );
}
