"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function StateDistribution() {
  const states = [
    { name: "QLD", amount: "$18.6 M", value: 73, color: "bg-blue-500" },
    { name: "SA", amount: "$3.9 M", value: 15, color: "bg-emerald-500" },
    { name: "WA", amount: "$3.2 M", value: 12, color: "bg-violet-500" },
    { name: "VIC", amount: "$0 M", value: 0, color: "bg-gray-500" },
  ];

  return (
    <ModernCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Borrowers by State</h3>
        <Badge className="bg-gray-800 text-gray-300">Total: $25.5M</Badge>
      </div>
      <div className="space-y-3">
        {states.map((state, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">{state.name}</span>
              <span className="font-medium">{state.amount}</span>
            </div>
            <Progress 
              value={state.value} 
              className="h-2 bg-gray-800"
              indicatorClassName={state.color}
            />
          </div>
        ))}
      </div>
    </ModernCard>
  );
}
