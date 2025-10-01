
export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  userId?: string;
};

export type Budget = {
  id:string;
  category: string;
  amount: number;
  spent?: number;
  userId?: string;
};

export type ChartData = {
  month: string;
  income: number;
  expense: number;
};

export type CategoryData = {
  category: string;
  value: number;
  fill: string;
};

export type Account = {
    id: string;
    type: string;
    provider: string;
    balance: number;
    userId?: string;
}

export type UserData = {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    currency?: string;
    isPro?: boolean;
    notifications?: {
        weeklySummary?: boolean;
        budgetAlerts?: boolean;
        pushNotifications?: {
            unusualTransactions?: boolean;
            lowBalance?: boolean;
            goalMilestones?: boolean;
        }
    },
    roundUpForClimate?: boolean;
    ecoPoints?: number;
    completedChallenges?: { [date: string]: boolean };
}

export type Investment = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  userId?: string;
};

export type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    userId?: string;
}

export type RecurringTransaction = {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    userId?: string;
    suggestion?: string;
}

export type NewsArticle = {
    title: string;
    description: string;
    url: string;
    source: {
        name: string;
    };
    publishedAt: string;
}

export type Footprint = {
    category: string;
    co2: number;
}

export type Subscription = {
    id: string;
    name: string;
    monthlyCost: number;
    category: string;
    suggestion?: string;
}

export type SubscriptionInsight = {
    id: string;
    name: string;
    monthlyCost: number;
    category: string;
    suggestion: string;
}

export type Asset = {
    name: string;
    value: number;
    type: 'Cash' | 'Investment';
}

export type Liability = {
    name: string;
    value: number;
    type: 'Credit Card' | 'Loan';
}

export type BenchmarkData = {
    category: string;
    userSpending: number;
    averageSpending: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
}
    
