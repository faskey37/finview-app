import { Account, Budget, Goal, Investment, RecurringTransaction, Transaction } from "./types";

// This defines the structure of exported user data
export interface ExportData {
  // Metadata
  version: string;           // Schema version for future compatibility
  exportDate: string;         // ISO timestamp
  userId: string;             // Original user ID (for reference)
  appVersion: string;         // Your app version
  
  // User Profile
  profile: {
    displayName: string;
    email: string;
    photoURL?: string;
    currency: string;
    isPro: boolean;
    createdAt: string;
    settings: {
      notifications: any;
      roundUpForClimate: boolean;
      ecoPoints: number;
    };
  };
  
  // Financial Data (Collections)
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  recurringTransactions: RecurringTransaction[];
  
  // File References (for Cloudflare R2)
  files: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;       // Original storage path
    downloadUrl?: string;     // Temporary URL (optional)
    metadata: any;
  }>;
  
  // Summary (for quick overview)
  summary: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalance: number;
    lastSync: string;
  };
}