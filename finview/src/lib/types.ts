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
    notifications?: {
        weeklySummary?: boolean;
        budgetAlerts?: boolean;
    }
}
