
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
  Search,
  ChevronsLeft,
  LogOut,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltips";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth, signOutUser } from "@/hooks/use-auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { SheetClose } from "@/components/ui/sheet";

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
    { href: "/dashboard/score", icon: Activity, label: "Health Score", isPro: true },
    { href: "/dashboard/eco", icon: Leaf, label: "Impact Hub" },
    { href: "/dashboard/bill-negotiation", icon: ShieldCheck, label: "Bill Negotiator", isPro: true},
    { href: "/dashboard/calculators", icon: Calculator, label: "Calculators" },
    { href: "/dashboard/news", icon: Newspaper, label: "News" },
]

const personalNavItems = [
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/dashboard/upgrade", icon: Sparkles, label: "Upgrade", isProFeature: true },
]

export function DashboardSidebar({ isMobile = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, isPro } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, label, isProFeature }: { href: string, icon: React.ElementType, label: string, isProFeature?: boolean }) => {
    const linkContent = (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-foreground hover:bg-muted",
          pathname === href && "bg-muted text-foreground font-semibold",
          isCollapsed && !isMobile && "justify-center"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className={cn("truncate", isCollapsed && !isMobile && "sr-only")}>{label}</span>
        {isProFeature && (
          <Badge variant="success" className="ml-auto bg-accent/20 text-accent border-accent/30">
            Pro
          </Badge>
        )}
      </Link>
    );

    const tooltipContent = isCollapsed && !isMobile ? <p>{label}</p> : null;

    if (isMobile) {
      return <SheetClose asChild>{linkContent}</SheetClose>;
    }
    
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          {tooltipContent && <TooltipContent side="right">{tooltipContent}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  };


  const renderNavSection = (title: string, items: any[]) => (
    <>
        {!isCollapsed && !isMobile && <p className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 mt-6">{title}</p>}
        {isMobile && title && <p className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 mt-6">{title}</p>}
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {items.map((item) => {
             if (item.isPro && !isPro) return null;
             const isProFeature = item.isProFeature && !isPro;
            
            return (
              <NavLink 
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isProFeature={isProFeature}
              />
          )})}
        </nav>
    </>
  );

  const navContent = (
    <>
      <div className={cn(
          "flex h-16 items-center border-b", 
          isCollapsed && !isMobile ? "justify-center px-2" : "justify-between px-4 lg:px-6"
      )}>
        <Logo isCollapsed={isCollapsed && !isMobile} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        {renderNavSection("Menu", mainNavItems)}
        {renderNavSection("Analysis", analyticsNavItems)}
        {renderNavSection("Tools", toolsNavItems)}
      </div>

       <div className="mt-auto p-4 border-t">
         {renderNavSection("", personalNavItems)}
         <div className="px-2 lg:px-4 mt-4">
             <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className={cn(isCollapsed && !isMobile && "sr-only")}>Logout</span>
             </Button>
         </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
        <div className="flex h-full flex-col bg-card">
            {navContent}
        </div>
    );
  }

  return (
    <aside className={cn(
        "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col transition-all duration-300 ease-in-out border-r bg-card",
        isCollapsed ? "w-20" : "w-64"
    )}>
        {navContent}
    </aside>
  );
}
