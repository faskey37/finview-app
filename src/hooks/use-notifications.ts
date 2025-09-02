
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useBudgets } from '@/hooks/use-budgets';
import { useTransactions } from '@/hooks/use-transactions';
import { useGoals } from '@/hooks/use-goals';
import { useAccounts } from './use-accounts';

// Define thresholds
const BUDGET_ALERT_THRESHOLD = 0.9; // 90%
const LOW_BALANCE_THRESHOLD = 100;

export interface Notification {
    id: string;
    title: string;
    description: string;
    date: Date;
    read: boolean;
}

export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
    markAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}


export function useRealtimeNotifications() {
    const { addNotification } = useNotifications();
    const { budgets, loading: budgetsLoading } = useBudgets();
    const { transactions, loading: transactionsLoading } = useTransactions();
    const { goals, loading: goalsLoading } = useGoals();
    const { accounts, loading: accountsLoading } = useAccounts();

    // Use refs to track which notifications have already been shown to avoid duplicates
    const notifiedBudgets = useRef<Set<string>>(new Set());
    const notifiedGoals = useRef<Set<string>>(new Set());
    const notifiedAccounts = useRef<Set<string>>(new Set());

    const loading = budgetsLoading || transactionsLoading || goalsLoading || accountsLoading;

    useEffect(() => {
        if (loading) return;

        // 1. Budget Alerts
        budgets.forEach(budget => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);
            
            const spentRatio = spent / budget.amount;
            const budgetId = `budget-${budget.id}`;

            if (spentRatio >= BUDGET_ALERT_THRESHOLD && !notifiedBudgets.current.has(budgetId)) {
                addNotification({
                    title: "Budget Alert",
                    description: `You've spent over 90% of your '${budget.category}' budget.`,
                });
                notifiedBudgets.current.add(budgetId);
            }
        });

        // 2. Goal Milestones
        goals.forEach(goal => {
            const progress = goal.currentAmount / goal.targetAmount;
            const goalId = `goal-${goal.id}`;

            if (progress >= 1 && !notifiedGoals.current.has(goalId)) {
                addNotification({
                    title: "Goal Achieved! 🎉",
                    description: `Congratulations! You've reached your savings goal for '${goal.name}'.`,
                });
                notifiedGoals.current.add(goalId);
            }
        });

        // 3. Low Balance Warnings
        accounts.forEach(account => {
             const accountId = `account-${account.id}`;
            if (account.type !== 'Credit Card' && account.balance < LOW_BALANCE_THRESHOLD && !notifiedAccounts.current.has(accountId)) {
                addNotification({
                    title: "Low Balance Warning",
                    description: `Your '${account.provider}' account balance is below $100.`,
                });
                notifiedAccounts.current.add(accountId);
            }
        })

    }, [budgets, transactions, goals, accounts, loading, addNotification]);
}
