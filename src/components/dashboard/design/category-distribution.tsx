"use client";
import React from 'react';
import { Progress } from "@/components/ui/progress";

function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}


export function CategoryDistribution() {
  const categories = [
    { name: "Developments", value: 8, color: "bg-blue-500" },
    { name: "Investments", value: 4, color: "bg-emerald-500" },
    { name: "Build & Hold", value: 32, color: "bg-violet-500" },
    { name: "Residential", value: 21, color: "bg-amber-500" },
    { name: "Commercial", value: 57, color: "bg-rose-500" },
    { name: "Industrial", value: 45.42, color: "bg-cyan-500" },
  ];

  return (
    <ModernCard>
      <h3 className="text-lg font-semibold mb-6">Category Distribution</h3>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <span className="text-sm">{category.name}</span>
              </div>
              <span className="font-medium">{category.value}%</span>
            </div>
            <Progress 
              value={category.value} 
              className="h-2 bg-gray-800"
              indicatorClassName={category.color}
            />
          </div>
        ))}
      </div>
    </ModernCard>
  );
}
