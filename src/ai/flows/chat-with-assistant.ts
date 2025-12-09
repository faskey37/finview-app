// /ai/flows/chat-with-assistant.ts
'use client';

import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useBudgets } from "@/hooks/use-budgets";
import { useInvestments } from "@/hooks/use-investments";
import { useGoals } from "@/hooks/use-goals";

// Predefined responses for common queries
const PREDEFINED_RESPONSES: Record<string, string> = {
  'hi': 'Hello! I\'m your financial assistant. How can I help you today?',
  'hello': 'Hi there! What financial questions can I help you with?',
  'hey': 'Hey! Ready to optimize your finances?',
  'thanks': 'You\'re welcome! Happy to help.',
  'thank you': 'Glad I could assist!',
  'bye': 'Goodbye! Feel free to return with any financial questions.',
  'goodbye': 'See you next time!',
  'how are you': 'I\'m functioning well, thank you! Ready to help with your financial goals.',
};

export function useAIAssistant() {
  const { user } = useAuth();
  const { data: transactionsData = [], isLoading: transactionsLoading } = useTransactions();
  const { data: accountsData = [], isLoading: accountsLoading } = useAccounts();
  const { data: budgetsData = [], isLoading: budgetsLoading } = useBudgets();
  const { data: investmentsData, isLoading: investmentsLoading } = useInvestments();
  const { data: goalsData = [], isLoading: goalsLoading } = useGoals();

  const chat = async (query: string): Promise<string> => {
    try {
      // Validate input
      if (!query?.trim()) {
        return 'Please ask a question about your finances.';
      }

      const cleanQuery = query.trim().toLowerCase();

      // Check for predefined responses
      if (PREDEFINED_RESPONSES[cleanQuery]) {
        return PREDEFINED_RESPONSES[cleanQuery];
      }

      // Check if user is authenticated
      if (!user) {
        return 'Please sign in to get personalized financial advice. You can still ask general finance questions!';
      }

      // Check if data is still loading
      if (transactionsLoading || accountsLoading || budgetsLoading || investmentsLoading || goalsLoading) {
        return 'I\'m still loading your financial data. Please wait a moment and try again.';
      }

      // Debug log to see what data we have
      console.log('Transactions data:', transactionsData.length);
      console.log('Accounts data:', accountsData.length);
      console.log('Budgets data:', budgetsData.length);
      console.log('Goals data:', goalsData.length);

      // Prepare user financial data
      const userData = prepareUserFinancialData(
        user,
        transactionsData,
        accountsData,
        budgetsData,
        investmentsData,
        goalsData
      );

      // Generate response based on query and user data
      return generateResponse(cleanQuery, userData);

    } catch (error) {
      console.error('AI Assistant Error:', error);
      return 'I\'m experiencing technical difficulties. Please try again in a moment.';
    }
  };

  return {
    chat,
    isAvailable: !!user,
    isLoading: transactionsLoading || accountsLoading || budgetsLoading || investmentsLoading || goalsLoading
  };
}

function prepareUserFinancialData(
  user: any,
  transactions: any[],
  accounts: any[],
  budgets: any[],
  investments: any,
  goals: any[]
) {
  try {
    if (!user) {
      return null;
    }

    // Debug the incoming data structure
    console.log('Raw transactions:', transactions);
    console.log('Raw accounts:', accounts);

    // Calculate total balance from accounts
    const totalBalance = accounts.reduce((sum: number, account: any) => {
      const balance = typeof account.balance === 'number' ? account.balance : 
                     account.currentBalance || account.amount || 0;
      return sum + balance;
    }, 0);

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions
      .filter((t: any) => {
        if (!t) return false;
        const date = t.date ? new Date(t.date) : 
                    t.createdAt ? new Date(t.createdAt) : new Date();
        return date >= thirtyDaysAgo;
      })
      .sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date) : 
                     a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.date ? new Date(b.date) : 
                     b.createdAt ? new Date(b.createdAt) : new Date();
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    // Calculate monthly income and expenses (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter((t: any) => {
      if (!t) return false;
      const date = t.date ? new Date(t.date) : 
                  t.createdAt ? new Date(t.createdAt) : new Date();
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter((t: any) => {
        if (!t) return false;
        const amount = t.amount || t.value || 0;
        return t.type === 'income' || t.category === 'income' || amount > 0;
      })
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount || t.value || 0), 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t: any) => {
        if (!t) return false;
        const amount = t.amount || t.value || 0;
        return t.type === 'expense' || t.category === 'expense' || amount < 0;
      })
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount || t.value || 0), 0);

    // Calculate top spending categories
    const categorySpending = new Map<string, number>();
    recentTransactions
      .filter((t: any) => {
        if (!t) return false;
        const amount = t.amount || t.value || 0;
        return t.type === 'expense' || t.category === 'expense' || amount < 0;
      })
      .forEach((t: any) => {
        const category = t.category || t.type || 'Uncategorized';
        const current = categorySpending.get(category) || 0;
        const amount = Math.abs(t.amount || t.value || 0);
        categorySpending.set(category, current + amount);
      });

    const totalSpending = Array.from(categorySpending.values()).reduce((a, b) => a + b, 0);
    const topSpendingCategories = Array.from(categorySpending.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Prepare budget status
    const budgetStatus = budgets.map((budget: any) => {
      const categoryTransactions = recentTransactions.filter(
        (t: any) => t.category === budget.category && 
        (t.type === 'expense' || (t.amount && t.amount < 0))
      );
      const spent = categoryTransactions.reduce(
        (sum: number, t: any) => sum + Math.abs(t.amount || 0), 0
      );
      
      let status: 'under' | 'over' | 'on-track' = 'on-track';
      const budgetAmount = budget.amount || budget.limit || 0;
      if (spent > budgetAmount * 1.1) status = 'over';
      else if (spent < budgetAmount * 0.9) status = 'under';

      return {
        category: budget.category || budget.name || 'Uncategorized',
        spent,
        budget: budgetAmount,
        status
      };
    });

    // Prepare investment data
    let investmentPortfolio = null;
    if (investments) {
      investmentPortfolio = {
        totalValue: investments.totalValue || investments.value || 0,
        allocation: investments.allocation || [],
        performance: investments.performance || { weekly: 0, monthly: 0, yearly: 0 }
      };
    }

    // Prepare savings goals
    const savingsGoals = goals.map((goal: any) => ({
      goal: goal.name || goal.title || 'Savings Goal',
      target: goal.targetAmount || goal.target || goal.amount || 0,
      current: goal.currentAmount || goal.current || goal.progress || 0,
      deadline: goal.targetDate ? new Date(goal.targetDate) : new Date()
    }));

    return {
      userId: user.id || user.uid,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      recentTransactions: recentTransactions.map((t: any) => ({
        description: t.description || t.name || t.title || 'Transaction',
        amount: t.amount || t.value || 0,
        date: t.date ? new Date(t.date) : t.createdAt ? new Date(t.createdAt) : new Date(),
        category: t.category || t.type || 'Uncategorized'
      })),
      topSpendingCategories,
      budgetStatus,
      investmentPortfolio,
      savingsGoals,
      hasData: transactions.length > 0 || accounts.length > 0
    };

  } catch (error) {
    console.error('Error preparing user financial data:', error);
    return null;
  }
}

function generateResponse(query: string, userData: any): string {
  // If no user data or no data found
  if (!userData || !userData.hasData) {
    return 'I don\'t see any financial data in your accounts yet. Please add some transactions, accounts, or budgets to get personalized advice.';
  }

  // Check for specific questions
  if (query.includes('balance') || query.includes('money') || query.includes('account')) {
    return `I can see your total balance across all accounts is **$${userData.totalBalance.toFixed(2)}**. ` +
           `Your monthly income is **$${userData.monthlyIncome.toFixed(2)}** and expenses are **$${userData.monthlyExpenses.toFixed(2)}**. ` +
           `You have **${userData.recentTransactions.length} recent transactions** in the last 30 days.`;
  }

  if (query.includes('transaction')) {
    if (userData.recentTransactions.length > 0) {
      const recent = userData.recentTransactions.slice(0, 3);
      const transactionsList = recent.map((t: any, i: number) => 
        `${i+1}. ${t.description}: $${Math.abs(t.amount).toFixed(2)}`
      ).join('\n');
      
      return `Here are your recent transactions:\n\n${transactionsList}\n\nYou have ${userData.recentTransactions.length} total transactions in the last 30 days.`;
    } else {
      return 'You don\'t have any recent transactions in the last 30 days.';
    }
  }

  if (query.includes('spending') || query.includes('expense') || query.includes('category')) {
    if (userData.topSpendingCategories.length > 0) {
      const categories = userData.topSpendingCategories.map((c: any, i: number) => 
        `${i+1}. ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`
      ).join('\n');
      
      return `Your top spending categories are:\n\n${categories}\n\nTotal monthly expenses: **$${userData.monthlyExpenses.toFixed(2)}**`;
    } else {
      return `Your monthly expenses are **$${userData.monthlyExpenses.toFixed(2)}**. I don\'t see specific spending categories yet.`;
    }
  }

  if (query.includes('budget')) {
    if (userData.budgetStatus.length > 0) {
      const budgetSummary = userData.budgetStatus.map((b: any) => 
        `${b.category}: $${b.spent.toFixed(2)} of $${b.budget.toFixed(2)} (${b.status})`
      ).join('\n');
      
      return `Your budget status:\n\n${budgetSummary}`;
    } else {
      return 'You don\'t have any budgets set up yet. Would you like help creating a budget?';
    }
  }

  if (query.includes('investment') || query.includes('portfolio')) {
    if (userData.investmentPortfolio) {
      return `Your investment portfolio is worth **$${userData.investmentPortfolio.totalValue.toFixed(2)}**. ` +
             `Would you like a detailed analysis of your portfolio performance?`;
    } else {
      return 'You don\'t have any investments tracked yet. Would you like information about starting to invest?';
    }
  }

  if (query.includes('savings') || query.includes('goal')) {
    if (userData.savingsGoals.length > 0) {
      const goalsSummary = userData.savingsGoals.map((g: any, i: number) => 
        `${i+1}. ${g.goal}: $${g.current.toFixed(2)} of $${g.target.toFixed(2)} (${((g.current / g.target) * 100).toFixed(1)}%)`
      ).join('\n');
      
      return `Your savings goals:\n\n${goalsSummary}`;
    } else {
      return 'You don\'t have any savings goals set up yet. Would you like help setting financial goals?';
    }
  }

  if (query.includes('income')) {
    return `Your monthly income is **$${userData.monthlyIncome.toFixed(2)}**. ` +
           `Your expenses are **$${userData.monthlyExpenses.toFixed(2)}**, ` +
           `which means you\'re saving **$${(userData.monthlyIncome - userData.monthlyExpenses).toFixed(2)}** per month.`;
  }

  if (query.includes('overview') || query.includes('summary') || query.includes('how am i doing')) {
    return `Here\'s your financial overview:\n\n` +
           `• Total Balance: **$${userData.totalBalance.toFixed(2)}**\n` +
           `• Monthly Income: **$${userData.monthlyIncome.toFixed(2)}**\n` +
           `• Monthly Expenses: **$${userData.monthlyExpenses.toFixed(2)}**\n` +
           `• Monthly Savings: **$${(userData.monthlyIncome - userData.monthlyExpenses).toFixed(2)}**\n` +
           `• Recent Transactions: **${userData.recentTransactions.length}** in last 30 days\n` +
           `• Savings Rate: **${userData.monthlyIncome > 0 ? ((userData.monthlyIncome - userData.monthlyExpenses) / userData.monthlyIncome * 100).toFixed(1) : 0}%**`;
  }

  // Default response
  return `Based on your financial data:\n\n` +
         `• Total Balance: $${userData.totalBalance.toFixed(2)}\n` +
         `• Monthly Income: $${userData.monthlyIncome.toFixed(2)}\n` +
         `• Monthly Expenses: $${userData.monthlyExpenses.toFixed(2)}\n` +
         `• You have ${userData.recentTransactions.length} recent transactions.\n\n` +
         `What specific aspect of your finances would you like to discuss?`;
}

// Keep backward compatibility
export async function chatWithAssistant(query: string): Promise<string> {
  return 'Please use the useAIAssistant hook from your React component.';
}