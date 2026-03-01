import { getFirestore, collection, getDocs, query, orderBy, writeBatch, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, listAll, getMetadata, deleteObject } from 'firebase/storage';
import JSZip from 'jszip';

// Export the types so they can be imported elsewhere
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

interface ExportData {
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

/**
 * Export user data to a ZIP file
 */
export const exportUserData = async (
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> => {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const updateProgress = (stage: ExportProgress['stage'], progress: number, total: number, currentItem: string = '') => {
    if (onProgress) {
      onProgress({ stage, progress, total, currentItem });
    }
  };

  updateProgress('preparing', 0, 0);

  try {
    console.log('Starting export process for user:', user.uid);
    
    // Collections to export
    const collections = [
      'accounts',
      'transactions',
      'budgets',
      'goals',
      'investments',
      'recurring'
    ];

    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId: user.uid,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      profile: {},
      accounts: [],
      transactions: [],
      budgets: [],
      goals: [],
      investments: [],
      recurringTransactions: [],
      files: [],
      summary: {
        totalAccounts: 0,
        totalTransactions: 0,
        totalBalance: 0,
        lastSync: new Date().toISOString()
      }
    };

    // Get user profile
    updateProgress('fetching', 0, collections.length + 1, 'Fetching profile');
    const userDoc = await getDocs(collection(db, 'users'));
    const userProfile = userDoc.docs.find(doc => doc.id === user.uid);
    if (userProfile) {
      exportData.profile = userProfile.data();
    }

    // Fetch each collection
    let totalItems = 0;
    const collectionStats: Record<string, number> = {};

    for (let i = 0; i < collections.length; i++) {
      const collectionName = collections[i];
      updateProgress('fetching', i + 1, collections.length + 1, `Fetching ${collectionName}`);

      try {
        const collectionRef = collection(db, 'users', user.uid, collectionName);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`Found ${items.length} ${collectionName}`);

        // Map to the correct property name
        switch (collectionName) {
          case 'accounts':
            exportData.accounts = items;
            collectionStats.accounts = items.length;
            totalItems += items.length;
            break;
          case 'transactions':
            exportData.transactions = items;
            collectionStats.transactions = items.length;
            totalItems += items.length;
            break;
          case 'budgets':
            exportData.budgets = items;
            collectionStats.budgets = items.length;
            totalItems += items.length;
            break;
          case 'goals':
            exportData.goals = items;
            collectionStats.goals = items.length;
            totalItems += items.length;
            break;
          case 'investments':
            exportData.investments = items;
            collectionStats.investments = items.length;
            totalItems += items.length;
            break;
          case 'recurring':
            exportData.recurringTransactions = items;
            collectionStats.recurring = items.length;
            totalItems += items.length;
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        // Continue with other collections even if one fails
      }
    }

    // Get files from storage
    updateProgress('processing', collections.length + 1, collections.length + 1, 'Processing file references');
    try {
      const filesRef = ref(storage, `users/${user.uid}`);
      const fileList = await listAll(filesRef);
      
      const files = await Promise.all(
        fileList.items.map(async (item) => {
          const metadata = await getMetadata(item);
          return {
            fileName: item.name,
            fileType: metadata.contentType || 'application/octet-stream',
            fileSize: metadata.size,
            storageKey: item.fullPath,
            metadata
          };
        })
      );
      exportData.files = files;
    } catch (error) {
      console.warn('Error fetching files from storage:', error);
      exportData.files = [];
    }
    
    // Calculate summary
    exportData.summary = {
      totalAccounts: exportData.accounts.length,
      totalTransactions: exportData.transactions.length,
      totalBalance: exportData.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
      lastSync: new Date().toISOString()
    };

    console.log('Export data collected:', {
      accounts: exportData.accounts.length,
      transactions: exportData.transactions.length,
      budgets: exportData.budgets.length,
      goals: exportData.goals.length,
      investments: exportData.investments.length,
      recurring: exportData.recurringTransactions.length
    });

    if (totalItems === 0) {
      throw new Error('No data found to export. Make sure you have transactions, accounts, or other data in your account.');
    }

    // Create ZIP file
    updateProgress('compressing', 0, 1, 'Creating archive');
    const zip = new JSZip();

    // Add main data file
    zip.file('export.json', JSON.stringify(exportData, null, 2));

    // Add individual collection files
    if (exportData.profile && Object.keys(exportData.profile).length > 0) {
      zip.file('profile.json', JSON.stringify(exportData.profile, null, 2));
    }
    zip.file('accounts.json', JSON.stringify(exportData.accounts, null, 2));
    zip.file('transactions.json', JSON.stringify(exportData.transactions, null, 2));
    zip.file('budgets.json', JSON.stringify(exportData.budgets, null, 2));
    zip.file('goals.json', JSON.stringify(exportData.goals, null, 2));
    zip.file('investments.json', JSON.stringify(exportData.investments, null, 2));
    zip.file('recurring.json', JSON.stringify(exportData.recurringTransactions, null, 2));
    zip.file('summary.json', JSON.stringify(exportData.summary, null, 2));

    // Add README
    zip.file('README.txt', generateReadme(exportData));

    // Generate ZIP blob
    updateProgress('compressing', 1, 1, 'Finalizing');
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const filename = `ecovest-backup-${user.uid.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.zip`;

    updateProgress('complete', 1, 1, 'Export complete');

    return {
      blob,
      filename,
      stats: {
        totalItems,
        collections: collectionStats
      }
    };

  } catch (error) {
    console.error('Export error:', error);
    updateProgress('error', 0, 0, error instanceof Error ? error.message : 'Export failed');
    throw error;
  }
};

/**
 * Import user data from a ZIP file
 */
export const importUserData = async (file: File): Promise<ImportResult> => {
  const auth = getAuth();
  const db = getFirestore();
  
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    console.log('Starting import process for file:', file.name, 'size:', file.size);
    
    // Read file as array buffer for better compatibility
    const arrayBuffer = await file.arrayBuffer();
    console.log('File read as array buffer, size:', arrayBuffer.byteLength);
    
    // Load ZIP from array buffer
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log('ZIP loaded, files:', Object.keys(zip.files));

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
      },
      skipped: {
        accounts: 0,
        transactions: 0,
        budgets: 0,
        goals: 0,
        investments: 0,
        recurring: 0,
        profile: 0
      }
    };

    // Check for individual collection files first
    const collectionFiles = [
      { name: 'accounts', fileName: 'accounts.json' },
      { name: 'transactions', fileName: 'transactions.json' },
      { name: 'budgets', fileName: 'budgets.json' },
      { name: 'goals', fileName: 'goals.json' },
      { name: 'investments', fileName: 'investments.json' },
      { name: 'recurring', fileName: 'recurring.json' },
      { name: 'profile', fileName: 'profile.json' }
    ];

    let foundAnyFile = false;

    // Check each collection file
    for (const { name, fileName } of collectionFiles) {
      const fileInZip = zip.file(fileName);
      if (fileInZip) {
        foundAnyFile = true;
        console.log(`Found ${fileName}, reading...`);
        try {
          const content = await fileInZip.async('string');
          const data = JSON.parse(content);
          
          if (name === 'profile') {
            // Handle profile as object, not array
            if (data && Object.keys(data).length > 0) {
              console.log(`Importing profile data...`);
              try {
                const profileRef = doc(db, 'users', user.uid);
                await setDoc(profileRef, {
                  ...data,
                  importedAt: new Date().toISOString(),
                  lastImport: new Date().toISOString()
                }, { merge: true });
                stats.imported.profile++;
                console.log('Profile imported successfully');
              } catch (err) {
                console.error('Error importing profile:', err);
                stats.skipped.profile++;
              }
            }
          } else if (Array.isArray(data) && data.length > 0) {
            console.log(`Importing ${data.length} ${name}...`);
            for (const item of data) {
              try {
                const { id, ...itemData } = item;
                const collectionRef = collection(db, 'users', user.uid, name);
                const docRef = doc(collectionRef);
                await setDoc(docRef, {
                  ...itemData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported[name as keyof typeof stats.imported]++;
              } catch (err) {
                console.error(`Error importing ${name} item:`, err);
                stats.skipped[name as keyof typeof stats.skipped]++;
              }
            }
          } else {
            console.log(`${fileName} is empty`);
          }
        } catch (err) {
          console.error(`Error reading/parsing ${fileName}:`, err);
        }
      }
    }

    // If no individual files found, try reading from export.json
    if (!foundAnyFile) {
      console.log('No individual files found, trying export.json...');
      const exportFile = zip.file('export.json');
      if (exportFile) {
        try {
          const exportContent = await exportFile.async('string');
          const exportData = JSON.parse(exportContent);
          
          console.log('Export data found:', {
            accounts: exportData.accounts?.length || 0,
            transactions: exportData.transactions?.length || 0,
            budgets: exportData.budgets?.length || 0,
            goals: exportData.goals?.length || 0,
            investments: exportData.investments?.length || 0,
            recurring: exportData.recurringTransactions?.length || 0
          });

          // Import accounts
          if (exportData.accounts && exportData.accounts.length > 0) {
            console.log(`Importing ${exportData.accounts.length} accounts from export.json...`);
            for (const account of exportData.accounts) {
              try {
                const { id, ...accountData } = account;
                const accountRef = doc(collection(db, 'users', user.uid, 'accounts'));
                await setDoc(accountRef, {
                  ...accountData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.accounts++;
              } catch (err) {
                console.error('Error importing account:', err);
                stats.skipped.accounts++;
              }
            }
          }

          // Import transactions
          if (exportData.transactions && exportData.transactions.length > 0) {
            console.log(`Importing ${exportData.transactions.length} transactions from export.json...`);
            for (const transaction of exportData.transactions) {
              try {
                const { id, ...transactionData } = transaction;
                const transactionRef = doc(collection(db, 'users', user.uid, 'transactions'));
                await setDoc(transactionRef, {
                  ...transactionData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.transactions++;
              } catch (err) {
                console.error('Error importing transaction:', err);
                stats.skipped.transactions++;
              }
            }
          }

          // Import budgets
          if (exportData.budgets && exportData.budgets.length > 0) {
            console.log(`Importing ${exportData.budgets.length} budgets from export.json...`);
            for (const budget of exportData.budgets) {
              try {
                const { id, ...budgetData } = budget;
                const budgetRef = doc(collection(db, 'users', user.uid, 'budgets'));
                await setDoc(budgetRef, {
                  ...budgetData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.budgets++;
              } catch (err) {
                console.error('Error importing budget:', err);
                stats.skipped.budgets++;
              }
            }
          }

          // Import goals
          if (exportData.goals && exportData.goals.length > 0) {
            console.log(`Importing ${exportData.goals.length} goals from export.json...`);
            for (const goal of exportData.goals) {
              try {
                const { id, ...goalData } = goal;
                const goalRef = doc(collection(db, 'users', user.uid, 'goals'));
                await setDoc(goalRef, {
                  ...goalData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.goals++;
              } catch (err) {
                console.error('Error importing goal:', err);
                stats.skipped.goals++;
              }
            }
          }

          // Import investments
          if (exportData.investments && exportData.investments.length > 0) {
            console.log(`Importing ${exportData.investments.length} investments from export.json...`);
            for (const investment of exportData.investments) {
              try {
                const { id, ...investmentData } = investment;
                const investmentRef = doc(collection(db, 'users', user.uid, 'investments'));
                await setDoc(investmentRef, {
                  ...investmentData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.investments++;
              } catch (err) {
                console.error('Error importing investment:', err);
                stats.skipped.investments++;
              }
            }
          }

          // Import recurring transactions
          if (exportData.recurringTransactions && exportData.recurringTransactions.length > 0) {
            console.log(`Importing ${exportData.recurringTransactions.length} recurring from export.json...`);
            for (const recurring of exportData.recurringTransactions) {
              try {
                const { id, ...recurringData } = recurring;
                const recurringRef = doc(collection(db, 'users', user.uid, 'recurring'));
                await setDoc(recurringRef, {
                  ...recurringData,
                  importedAt: new Date().toISOString(),
                  originalId: id || 'unknown'
                });
                stats.imported.recurring++;
              } catch (err) {
                console.error('Error importing recurring:', err);
                stats.skipped.recurring++;
              }
            }
          }

          // Import profile
          if (exportData.profile && Object.keys(exportData.profile).length > 0) {
            console.log('Importing profile from export.json...');
            try {
              const profileRef = doc(db, 'users', user.uid);
              await setDoc(profileRef, {
                ...exportData.profile,
                importedAt: new Date().toISOString(),
                lastImport: new Date().toISOString()
              }, { merge: true });
              stats.imported.profile++;
            } catch (err) {
              console.error('Error importing profile:', err);
              stats.skipped.profile++;
            }
          }
        } catch (err) {
          console.error('Error reading/parsing export.json:', err);
        }
      } else {
        console.log('No export.json found in zip');
      }
    }

    const totalImported = Object.values(stats.imported).reduce((a, b) => a + b, 0);
    const totalSkipped = Object.values(stats.skipped).reduce((a, b) => a + b, 0);
    
    console.log('Import completed:', { 
      totalImported, 
      totalSkipped, 
      imported: stats.imported,
      skipped: stats.skipped 
    });

    if (totalImported === 0) {
      return {
        success: false,
        message: 'No data found in the backup file. Please check the file and try again.',
        stats
      };
    }

    return {
      success: true,
      message: `Successfully imported ${totalImported} items. ${totalSkipped > 0 ? `Skipped ${totalSkipped} items.` : ''}`,
      stats
    };

  } catch (error) {
    console.error('Import error details:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import data'
    };
  }
};

/**
 * Delete all user data (for account deletion)
 */
export const deleteAllUserData = async (userId: string): Promise<void> => {
  const db = getFirestore();
  const storage = getStorage();

  try {
    const collections = [
      'accounts',
      'transactions',
      'budgets',
      'goals',
      'investments',
      'recurring'
    ];

    // Delete Firestore collections
    for (const collectionName of collections) {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete user profile
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // Delete files from storage
    const storageRef = ref(storage, `users/${userId}`);
    try {
      const fileList = await listAll(storageRef);
      const deletePromises = fileList.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('Error deleting storage files:', error);
    }

  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

/**
 * Generate a README file for the export
 */
function generateReadme(data: ExportData): string {
  return `
ECOVEST DATA EXPORT
===================
Export Date: ${new Date(data.exportDate).toLocaleString()}
Version: ${data.version}
App Version: ${data.appVersion}
User ID: ${data.userId}

SUMMARY
-------
- Accounts: ${data.summary.totalAccounts}
- Transactions: ${data.summary.totalTransactions}
- Total Balance: ${data.summary.totalBalance}
- Last Sync: ${new Date(data.summary.lastSync).toLocaleString()}

COLLECTIONS INCLUDED
--------------------
${Object.entries({
  accounts: data.accounts.length,
  transactions: data.transactions.length,
  budgets: data.budgets.length,
  goals: data.goals.length,
  investments: data.investments.length,
  recurring: data.recurringTransactions.length
}).map(([name, count]) => `- ${name}: ${count}`).join('\n')}

FILES INCLUDED
--------------
- export.json: Complete data export
- profile.json: User profile information
- accounts.json: All bank accounts and balances
- transactions.json: Complete transaction history
- budgets.json: Budget settings and limits
- goals.json: Financial goals and progress
- investments.json: Investment portfolios
- recurring.json: Recurring transactions
- summary.json: Quick summary statistics

HOW TO IMPORT
-------------
1. Create a new account or log into your existing EcoVest account
2. Go to Settings → Data tab
3. Click "Import Data" and select this ZIP file
4. Your data will be restored automatically

SUPPORT
-------
For questions or issues, contact: support@ecovest.app

© ${new Date().getFullYear()} EcoVest. All rights reserved.
`;
}