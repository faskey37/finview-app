// services/types.ts
export interface ExportData {
  version: string;
  exportDate: string;
  userId: string;
  appVersion: string;
  
  profile: any;
  accounts: any[];
  transactions: any[];
  budgets: any[];
  goals: any[];
  investments: any[];
  recurringTransactions: any[];
  files: any[];
  
  summary: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalance: number;
    lastSync: string;
  };
}

export interface ExportProgress {
  stage: 'idle' | 'preparing' | 'fetching' | 'processing' | 'compressing' | 'complete' | 'error';
  progress: number;
  total: number;
  currentItem: string;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  stats: {
    totalItems: number;
    collections: Record<string, number>;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    imported: Record<string, number>;
    skipped: Record<string, number>;
    conflicts?: any[];
  };
}
