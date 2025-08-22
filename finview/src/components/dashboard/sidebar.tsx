

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Settings,
  BadgeDollarSign,
  Target
} from "lucide-react";

import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/dashboard/budgets", icon: Target, label: "Budgets" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar({ isMobile = false }) {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <Logo />
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-muted text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-lg border p-4 text-center">
            <BadgeDollarSign className="h-10 w-10 mb-4 inline-block text-accent" />
            <h3 className="font-bold">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-2">
                Unlock all features and get unlimited access to our support team.
            </p>
            <Button size="sm" className="w-full mt-4 bg-accent hover:bg-accent/90">
                Upgrade
            </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return <div className="flex h-full flex-col">{navContent}</div>;
  }

  return (
    <aside className="hidden border-r bg-card md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {navContent}
      </div>
    </aside>
  );
}
