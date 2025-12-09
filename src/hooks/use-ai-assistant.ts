// /hooks/use-ai-assistant.ts
'use client';

import { useAuth } from "./use-auth";
import { useTransactions } from "./use-transactions";
import { useAccounts } from "./use-accounts";
import { useBudgets } from "./use-budgets";
import { useInvestments } from "./use-investments";
import { useGoals } from "./use-goals";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

interface UserFinancialData {
  userId: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topSpendingCategories: Array<{ category: string; amount: number; percentage: number }>;
  recentTransactions: Array<{ description: string; amount: number; date: Date; category: string }>;
  budgetStatus: Array<{ category: string; spent: number; budget: number; status: 'under' | 'over' | 'on-track' }>;
  investmentPortfolio?: {
    totalValue: number;
    allocation: Array<{ type: string; percentage: number; value: number }>;
    performance: { weekly: number; monthly: number; yearly: number };
  };
  savingsGoals: Array<{ goal: string; target: number; current: number; deadline: Date }>;
  creditScore?: number;
}

// Predefined responses for common queries
const PREDEFINED_RESPONSES: Map<string, string> = new Map([
  ['hi', 'Hello! I\'m your financial assistant. How can I help you today?'],
  ['hello', 'Hi there! What financial questions can I help you with?'],
  ['hey', 'Hey! Ready to optimize your finances?'],
  ['thanks', 'You\'re welcome! Happy to help.'],
  ['thank you', 'Glad I could assist!'],
  ['bye', 'Goodbye! Feel free to return with any financial questions.'],
  ['goodbye', 'See you next time!'],
  ['how are you', 'I\'m functioning well, thank you! Ready to help with your financial goals.'],
]);

class AIAssistantService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  }

  private prepareUserFinancialData(
    user: any,
    transactions: any[],
    accounts: any[],
    budgets: any[],
    investments: any,
    goals: any[]
  ): UserFinancialData | null {
    try {
      if (!user?.id) {
        return null;
      }

      // Calculate total balance
      const totalBalance = accounts.reduce((sum: number, account: any) => 
        sum + (account.balance || 0), 0
      );

      // Get transactions from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = transactions
        .filter((t: any) => {
          const date = t.date ? new Date(t.date) : new Date();
          return date >= thirtyDaysAgo;
        })
        .sort((a: any, b: any) => {
          const dateA = a.date ? new Date(a.date) : new Date();
          const dateB = b.date ? new Date(b.date) : new Date();
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10);

      // Calculate monthly income and expenses
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = transactions.filter((t: any) => {
        const date = t.date ? new Date(t.date) : new Date();
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTransactions
        .filter((t: any) => t.type === 'income' || (t.amount && t.amount > 0))
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      const monthlyExpenses = monthlyTransactions
        .filter((t: any) => t.type === 'expense' || (t.amount && t.amount < 0))
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      // Calculate top spending categories
      const categorySpending = new Map<string, number>();
      recentTransactions
        .filter((t: any) => t.amount && t.amount < 0)
        .forEach((t: any) => {
          const category = t.category || 'Uncategorized';
          const current = categorySpending.get(category) || 0;
          categorySpending.set(category, current + Math.abs(t.amount || 0));
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

      // Calculate budget status
      const budgetStatus = budgets.map((budget: any) => {
        const categoryTransactions = recentTransactions.filter(
          (t: any) => t.category === budget.category && t.amount && t.amount < 0
        );
        const spent = categoryTransactions.reduce(
          (sum: number, t: any) => sum + Math.abs(t.amount || 0), 0
        );
        
        let status: 'under' | 'over' | 'on-track' = 'on-track';
        if (spent > (budget.amount || 0) * 1.1) status = 'over';
        else if (spent < (budget.amount || 0) * 0.9) status = 'under';

        return {
          category: budget.category || 'Uncategorized',
          spent,
          budget: budget.amount || 0,
          status
        };
      });

      // Investment portfolio data
      let investmentPortfolio;
      if (investments) {
        investmentPortfolio = {
          totalValue: investments.totalValue || 0,
          allocation: investments.allocation || [],
          performance: investments.performance || { weekly: 0, monthly: 0, yearly: 0 }
        };
      }

      // Savings goals
      const formattedSavingsGoals = goals.map((goal: any) => ({
        goal: goal.name || goal.title || 'Savings Goal',
        target: goal.targetAmount || goal.target || 0,
        current: goal.currentAmount || goal.current || 0,
        deadline: goal.targetDate ? new Date(goal.targetDate) : new Date()
      }));

      return {
        userId: user.id,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        topSpendingCategories,
        recentTransactions: recentTransactions.map((t: any) => ({
          description: t.description || t.name || 'Transaction',
          amount: t.amount || 0,
          date: t.date ? new Date(t.date) : new Date(),
          category: t.category || 'Uncategorized'
        })),
        budgetStatus,
        investmentPortfolio,
        savingsGoals: formattedSavingsGoals,
        creditScore: user.creditScore || undefined
      };

    } catch (error) {
      console.error('Error preparing user financial data:', error);
      return null;
    }
  }

  private async callOpenRouterAPI(messages: any[], maxTokens: number = 300): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Financial Intelligence Assistant',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.choices[0]?.message?.content || 'I couldn\'t generate a response. Please try again.';

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private buildSystemPrompt(userData: UserFinancialData | null): string {
    const hasData = userData !== null;
    
    let dataSummary = '';
    if (hasData && userData) {
      dataSummary = `
USER FINANCIAL CONTEXT:
- Total Balance: $${userData.totalBalance.toFixed(2)}
- Monthly Income: $${userData.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${userData.monthlyExpenses.toFixed(2)}
- Savings Rate: ${userData.monthlyIncome > 0 ? ((userData.monthlyIncome - userData.monthlyExpenses) / userData.monthlyIncome * 100).toFixed(1) : 0}%
- Top Spending Categories: ${userData.topSpendingCategories.map(c => `${c.category} (${c.percentage.toFixed(1)}%)`).join(', ')}
- Recent Transactions: ${userData.recentTransactions.slice(0, 3).map(t => `${t.description}: $${Math.abs(t.amount).toFixed(2)}`).join(', ')}
${userData.budgetStatus.length > 0 ? `- Budget Status: ${userData.budgetStatus.map(b => `${b.category}: ${b.status}`).join(', ')}` : ''}
${userData.savingsGoals.length > 0 ? `- Savings Goals: ${userData.savingsGoals.map(g => `${g.goal}: $${g.current.toFixed(2)} of $${g.target.toFixed(2)}`).join(', ')}` : ''}
${userData.investmentPortfolio ? `- Investment Portfolio: $${userData.investmentPortfolio.totalValue.toFixed(2)}` : ''}
${userData.creditScore ? `- Credit Score: ${userData.creditScore}` : ''}
`;
    }

    return `You are an expert financial assistant. Provide accurate, personalized financial advice based on user data.

CORE PRINCIPLES:
1. BE PERSONALIZED - Reference user's actual financial data when available
2. BE SPECIFIC - Answer the exact question asked with concrete numbers
3. BE CONCISE - 2-4 sentences maximum (50-150 words)
4. BE ACTIONABLE - Provide practical next steps
5. BE EDUCATIONAL - Explain financial concepts when helpful

DATA ACCESS RULES:
${hasData ? 
  `- You HAVE ACCESS to user's real financial data
- Use specific numbers from their actual financial situation
- Compare their performance to general financial best practices
- Identify areas for improvement based on their actual spending/saving patterns` : 
  `- You DO NOT have access to user's personal financial data
- If asked about specific accounts/balances: "I don't have access to your personal financial data. Please check your dashboard for account-specific information."`}

RESPONSE GUIDELINES:
- When user data is available, reference specific numbers (balances, spending, goals)
- Provide tailored recommendations based on their financial situation
- Suggest concrete actions they can take today
- Use empathetic language when discussing financial challenges
- Celebrate their financial successes when relevant

${hasData ? dataSummary : ''}`;
  }

  public async chat(
    query: string,
    user: any,
    transactions: any[],
    accounts: any[],
    budgets: any[],
    investments: any,
    goals: any[]
  ): Promise<string> {
    try {
      // Validate input
      if (!query?.trim()) {
        return 'Please ask a question about your finances.';
      }

      const cleanQuery = query.trim();

      // Check for predefined responses
      const predefinedResponse = PREDEFINED_RESPONSES.get(cleanQuery.toLowerCase());
      if (predefinedResponse) {
        return predefinedResponse;
      }

      // Prepare user financial data
      const userData = this.prepareUserFinancialData(
        user,
        transactions,
        accounts,
        budgets,
        investments,
        goals
      );

      // If no user data (not authenticated), provide a helpful response
      if (!userData) {
        return 'To get personalized financial advice, please sign in. You can still ask general finance questions!';
      }

      // Prepare context for AI
      const systemPrompt = this.buildSystemPrompt(userData);

      // Call AI API for tailored response
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: cleanQuery
        }
      ];

      const response = await this.callOpenRouterAPI(messages);
      return this.formatResponse(response);

    } catch (error) {
      console.error('AI Assistant Error:', error);
      return this.handleError(error);
    }
  }

  private formatResponse(response: string): string {
    // Clean up response formatting while preserving important structure
    return response
      .trim()
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple newlines
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private handleError(error: any): string {
    if (error.name === 'AbortError') {
      return 'Request timeout. Please try again.';
    }

    if (error.message.includes('API key') || error.message.includes('401')) {
      return 'Service configuration issue. Please try again later.';
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return 'Service is busy. Please wait a moment and try again.';
    }

    if (error.message.includes('network')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    return 'I\'m experiencing technical difficulties. Please try again in a moment.';
  }
}

// Custom hook that uses React hooks properly
export function useAIAssistant() {
  const { user } = useAuth();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: budgets = [] } = useBudgets();
  const { data: investments } = useInvestments();
  const { data: goals = [] } = useGoals();

  const assistant = new AIAssistantService();

  const chat = async (query: string): Promise<string> => {
    if (!user) {
      return 'Please sign in to use the financial assistant.';
    }

    return assistant.chat(
      query,
      user,
      transactions,
      accounts,
      budgets,
      investments,
      goals
    );
  };

  return {
    chat,
    isAvailable: !!user
  };
}