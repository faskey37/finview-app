"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}


export function InvoiceOverview() {
  const invoiceData = [
    { month: 'Jan 2022', paid: 63.2, overdue: 26, open: 26.2 },
    { month: 'Feb 2022', paid: 24.2, overdue: 26.5, open: 42.2 },
    { month: 'Mar 2022', paid: 24.5, overdue: 26.3, open: 74.3 },
    { month: 'Apr 2022', paid: 84.2, overdue: 56.6, open: 44.5 },
  ];

  const summary = {
    paid: "44.0K",
    overdue: "44.5K",
    open: "4K"
  };

  return (
    <ModernCard className="col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Invoice Overview</h3>
          <p className="text-sm text-gray-500">Monthly invoice performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm">Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Open</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Paid Invoices</span>
            <Badge className="bg-emerald-500/20 text-emerald-500 border-0">This month</Badge>
          </div>
          <p className="text-3xl font-bold">{summary.paid}</p>
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <span className="text-emerald-500">12% increase</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Overdue Invoices</span>
            <Badge className="bg-rose-500/20 text-rose-500 border-0">Requires attention</Badge>
          </div>
          <p className="text-3xl font-bold">{summary.overdue}</p>
          <div className="flex items-center gap-2 text-sm">
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
            <span className="text-rose-500">8% decrease</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Open Invoices</span>
            <Badge className="bg-blue-500/20 text-blue-500 border-0">Pending</Badge>
          </div>
          <p className="text-3xl font-bold">{summary.open}</p>
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
            <span className="text-blue-500">5% increase</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={invoiceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value: number) => `${value}K`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Area type="monotone" dataKey="paid" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
            <Area type="monotone" dataKey="overdue" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
            <Area type="monotone" dataKey="open" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ModernCard>
  );
}
