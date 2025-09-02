
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
    photoURL: string;
    roundUpForClimate: boolean;
    isPro: any;
    uid: string;
    email: string;
    displayName: string;
    currency?: string;
    notifications?: {
        pushNotifications: any;
        pushNotifications: any;
        weeklySummary?: boolean;
        budgetAlerts?: boolean;
    }
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
