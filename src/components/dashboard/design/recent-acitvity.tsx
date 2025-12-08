"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";

function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function RecentActivity() {
  const activities = [
    { 
      name: "Guy Hawkins", 
      company: "Baker Hughes", 
      amount: "$6,223.07",
      avatarColor: "bg-blue-500"
    },
    { 
      name: "Ralph Edwards", 
      company: "Emerge Education", 
      amount: "$1,451.76",
      avatarColor: "bg-emerald-500"
    },
    { 
      name: "Brooklyn Simmons", 
      company: "FieldCore", 
      amount: "$12,677.42",
      avatarColor: "bg-violet-500"
    },
    { 
      name: "Eleanor Pena", 
      company: "HSEC Services", 
      amount: "$4,032,903.92",
      avatarColor: "bg-rose-500"
    },
    { 
      name: "Robert Fox", 
      company: "Pixaera", 
      amount: "$20,026.28",
      avatarColor: "bg-amber-500"
    },
  ];

  return (
    <ModernCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-gray-500">Latest financial transactions</p>
        </div>
        <Badge className="bg-gray-800 text-gray-300">Today</Badge>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.avatarColor}`}>
                <span className="text-white font-semibold">
                  {activity.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">{activity.name}</p>
                <p className="text-sm text-gray-500">{activity.company}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{activity.amount}</p>
              <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                Completed
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total Revenue</span>
          <span className="text-xl font-bold">$164,857.49</span>
        </div>
      </div>
    </ModernCard>
  );
}
