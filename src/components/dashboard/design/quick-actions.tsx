
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  setAddDialogOpen: (open: boolean) => void;
  setGoalDialogOpen: (open: boolean) => void;
}

export function QuickActions({ setAddDialogOpen, setGoalDialogOpen }: QuickActionsProps) {
  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto py-4 border-gray-700 hover:bg-gray-800/50" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
        <Button variant="outline" className="h-auto py-4 border-gray-700 hover:bg-gray-800/50" onClick={() => setGoalDialogOpen(true)}>
          <Target className="h-4 w-4 mr-2" />
          Set Goal
        </Button>
        <Button variant="outline" className="h-auto py-4 border-gray-700 hover:bg-gray-800/50" asChild>
          <Link href="/dashboard/reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 border-gray-700 hover:bg-gray-800/50" asChild>
          <Link href="/dashboard/assistant">
            <Zap className="h-4 w-4 mr-2" />
            AI Assistant
          </Link>
        </Button>
      </CardContent>
    