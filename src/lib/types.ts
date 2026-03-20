import type { LucideIcon } from "lucide-react";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: string;
  createdAt: string | number | Date;
  accountName: string;
  userId?: string;
  accountId?: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  spent?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
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
  name: string;
  type: string;
  provider: string;
  balance: number;
  institution?: string;
  lastUpdated?: string;
  apr?: number;
  dueDate?: string;
  minimumPayment?: number;
  userId?: string;
  accountNumber?: string;
  color?: string;
  balanceHistory?: Array<{
    date: string;
    balance: number;
  }>;
};

export type UserData = {
  bio: string;
  country: string;
  city: string;
  age: any;
  occupation: string;
  phone: string;
  incomeRange: string;
  experienceLevel: string;
  hasEmergencyFund: boolean;
  monthlySavings: any;
  financialGoals: any[];
  anonymousDataSharing: boolean;
  emailVerified: any;
  preferredCurrency: string;
  accounts: any;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: string;
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
  
  // Nested subscription object for PRO plan (app subscription)
  proSubscription?: ProSubscriptionInfo;
};

// Rename this to avoid conflict with the existing Subscription type
export type ProSubscriptionInfo = {
  plan: 'monthly' | 'yearly';
  amount: number;           // Amount in INR
  startDate: string;        // ISO date string
  endDate: string;          // ISO date string
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  autoRenew: boolean;
  paymentMethod?: string;
  cancelledAt?: string;
  paymentId?: string;
  nextBillingDate?: string;
};

export type Investment = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  returns?: number;
  performance?: number;
  userId?: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  userId?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  status?: 'active' | 'completed' | 'in-progress';
};

export type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'quarterly';
  startDate: string;
  nextBillingDate?: string;
  autoRenew?: boolean;
  notes?: string;
  isActive: boolean;
  userId?: string;
  suggestion?: string;
};

export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
};

export type Footprint = {
  category: string;
  co2: number;
};

// This is for tracking user's external subscriptions (Netflix, Spotify, etc.)
export type Subscription = {
  id: string;
  name: string;
  monthlyCost: number;
  category: string;
  frequency?: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  nextBillingDate?: string;
  autoRenew?: boolean;
  notes?: string;
  suggestion?: string;
};

export type SubscriptionInsight = {
  id: string;
  name: string;
  monthlyCost: number;
  category: string;
  suggestion: string;
};

export type Asset = {
  id: string;
  name: string;
  value: number;
  type: 'Cash' | 'Investment' | 'Property';
  accountType?: string;
  institution?: string;
  lastUpdated?: string;
  returns?: number;
  performance?: number;
  purchaseDate?: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  propertyType?: string;
};

export type Liability = {
  id: string;
  name: string;
  value: number;
  type: 'Credit Card' | 'Loan';
  apr?: number;
  dueDate?: string;
  minimumPayment?: number;
  institution?: string;
};

export type BenchmarkData = {
  category: string;
  userSpending: number;
  averageSpending: number;
};

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: 'success' | 'warning' | 'info' | 'error';
  icon?: React.ElementType;
  action?: () => void;
  actionLabel?: string;
}

// New Property Type
export type Property = {
  id: string;
  name: string;
  propertyType: 'residential' | 'commercial' | 'land' | 'rental' | 'vacation';
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  purchasePrice?: number;
  estimatedValue?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  purchaseDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Dashboard Stats Type
export type DashboardStats = {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  savingsRate: number;
  activeBudgets: number;
  activeGoals: number;
  totalInvestments: number;
  netWorth: number;
};

// Filter Options
export type DateRange = 'today' | 'week' | 'month' | 'year' | 'all';
export type TransactionFilter = {
  dateRange?: DateRange;
  categories?: string[];
  types?: ('income' | 'expense')[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
};

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Currency Types
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'HKD';

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate?: number; // Exchange rate relative to USD
};

// Chart Types
export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: LucideIcon;
  };
};

// AI Insight Types
export type AIInsight = {
  id: string;
  title: string;
  description: string;
  type: 'saving' | 'investment' | 'budget' | 'alert' | 'tip';
  impact?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  actionLabel?: string;
  actionLink?: string;
  createdAt: Date;
};

// Export Types
export type ExportFormat = 'csv' | 'json' | 'pdf';
export type ExportData = {
  transactions?: Transaction[];
  budgets?: Budget[];
  goals?: Goal[];
  investments?: Investment[];
  properties?: Property[];
  dateRange?: DateRange;
  includeMetadata?: boolean;
};