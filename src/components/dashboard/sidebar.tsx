
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
  Leaf
} from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
  { href: "/dashboard/investments", icon: TrendingUp, label: "Investments" },
  { href: "/dashboard/recurring", icon: Repeat, label: "Recurring" },
  { href: "/dashboard/goals", icon: Goal, label: "Goals" },
  { href: "/dashboard/eco", icon: Leaf, label: "Eco-Tracker" },
  { href: "/dashboard/news", icon: Newspaper, label: "News" },
  { href: "/dashboard/calculators", icon: Calculator, label: "Calculators" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const navContent = (
    <TooltipProvider>
      <div className={cn("flex h-16 items-center px-4 lg:px-6", isCollapsed ? "justify-center" : "")}>
        <Logo isCollapsed={isCollapsed} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2 py-4">
          {navItems.map((item) => (
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
                    </Link>
                </TooltipTrigger>
                 {isCollapsed && (
                    <TooltipContent side="right">
                        {item.label}
                    </TooltipContent>
                 )}
            </Tooltip>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className={cn("rounded-lg border p-4 text-center", isCollapsed && "p-2")}>
            <div className={cn(isCollapsed && "hidden")}>
                <BadgeDollarSign className="h-10 w-10 mb-4 inline-block text-accent" />
                <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Unlock all features and get unlimited access to our support team.
                </p>
                <Button size="sm" className="w-full mt-4 bg-accent hover:bg-accent/90">
                    Upgrade
                </Button>
            </div>
            {isCollapsed && (
                 <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button size="icon" className="w-full bg-accent hover:bg-accent/90">
                           <BadgeDollarSign />
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent side="right">
                        Upgrade to Pro
                     </TooltipContent>
                </Tooltip>
            )}
        </div>
      </div>
    </TooltipProvider>
  );

  if (isMobile) {
    return <div className="flex h-full flex-col">{navContent}</div>;
  }

  return (
    <aside className={cn(
        "hidden md:block transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
    )}>
       <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-card">
        {navContent}
      </div>
    </aside>
  );
}
