"use client";
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function NewRequestTrend() {
  const data = [
    { name: 'Jan', requests: 12.2 },
    { name: 'Feb', requests: 19.2 },
    { name: 'Mar', requests: 3.2 },
    { name: 'Apr', requests: 5.2 },
    { name: 'May', requests: 2.2 },
    { name: 'Jun', requests: 3.2 },
  ];

  return (
    <ModernCard className="col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">New Request Trend</h3>
          <p className="text-sm text-gray-500">Monthly request volume</p>
        </div>
        <Select defaultValue="6M">
          <SelectTrigger className="w-32 border-gray-700 bg-gray-800/50">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-900">
            <SelectItem value="1M">1 Month</SelectItem>
            <SelectItem value="3M">3 Months</SelectItem>
            <SelectItem value="6M">6 Months</SelectItem>
            <SelectItem value="1Y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}K`, 'Requests']}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#colorRequests)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ModernCard>
  );
}
