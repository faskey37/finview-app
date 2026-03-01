// lib/import-service.ts
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import JSZip from 'jszip';

interface ImportResult {
  success: boolean;
  message: string;
  stats?: any;
}

export class ImportService {
  private db = getFirestore();
  private auth = getAuth();
  
  async importUserData(file: File): Promise<ImportResult> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      // Load and parse ZIP file
      const zip = await JSZip.loadAsync(file);

      // Check if export.json exists
      const exportFile = zip.file('export.json');
      if (!exportFile) {
        throw new Error('Invalid backup file: missing export.json');
      }

      // Parse export data
      const exportContent = await exportFile.async('string');
      const exportData = JSON.parse(exportContent);

      // Validate required data
      if (!Array.isArray(exportData.accounts)) {
        throw new Error('Invalid backup: accounts data is missing or corrupted');
      }

      // Prepare import stats
      const stats = {
        imported: {
          accounts: 0,
          transactions: 0,
          budgets: 0,
          goals: 0,
          investments: 0,
          recurring: 0,
          profile: 0
        }
      };

      // Use batch writes for better performance
      const batch = writeBatch(this.db);

      // Import accounts
      for (const account of exportData.accounts || []) {
        const { id, ...accountData } = account;
        const accountRef = doc(collection(this.db, 'users', user.uid, 'accounts'));
        batch.set(accountRef, {
          ...accountData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.accounts++;
      }

      // Import transactions
      for (const transaction of exportData.transactions || []) {
        const { id, ...transactionData } = transaction;
        const transactionRef = doc(collection(this.db, 'users', user.uid, 'transactions'));
        batch.set(transactionRef, {
          ...transactionData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.transactions++;
      }

      // Import budgets
      for (const budget of exportData.budgets || []) {
        const { id, ...budgetData } = budget;
        const budgetRef = doc(collection(this.db, 'users', user.uid, 'budgets'));
        batch.set(budgetRef, {
          ...budgetData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.budgets++;
      }

      // Import goals
      for (const goal of exportData.goals || []) {
        const { id, ...goalData } = goal;
        const goalRef = doc(collection(this.db, 'users', user.uid, 'goals'));
        batch.set(goalRef, {
          ...goalData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.goals++;
      }

      // Import investments
      for (const investment of exportData.investments || []) {
        const { id, ...investmentData } = investment;
        const investmentRef = doc(collection(this.db, 'users', user.uid, 'investments'));
        batch.set(investmentRef, {
          ...investmentData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.investments++;
      }

      // Import recurring transactions
      for (const recurring of exportData.recurringTransactions || []) {
        const { id, ...recurringData } = recurring;
        const recurringRef = doc(collection(this.db, 'users', user.uid, 'recurring'));
        batch.set(recurringRef, {
          ...recurringData,
          importedAt: new Date().toISOString(),
          originalId: id
        });
        stats.imported.recurring++;
      }

      // Import profile (update existing)
      if (exportData.profile) {
        const profileRef = doc(this.db, 'users', user.uid);
        batch.set(profileRef, {
          ...exportData.profile,
          importedAt: new Date().toISOString(),
          lastImport: new Date().toISOString()
        }, { merge: true });
        stats.imported.profile++;
      }

      // Commit all writes
      await batch.commit();

      return {
        success: true,
        message: `Successfully imported ${Object.values(stats.imported).reduce((a, b) => a + b, 0)} items.`,
        stats
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import data'
      };
    }
  }
}