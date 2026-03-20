import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  CollectionReference,
  QuerySnapshot,
  serverTimestamp,
} from "firebase/firestore";
import JSZip from "jszip";
import { db, auth } from "../lib/firebase";

// Export the types so they can be imported elsewhere
export interface ExportProgress {
  stage:
    | "idle"
    | "preparing"
    | "fetching"
    | "processing"
    | "compressing"
    | "complete"
    | "error";
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
  summary: {
    totalAccounts: number;
    totalTransactions: number;
    totalBalance: number;
    lastSync: string;
  };
}

/**
 * Safely fetch a collection with orderBy fallback
 */
const getSnapshot = async (
  collectionRef: CollectionReference,
  collectionName: string,
): Promise<QuerySnapshot> => {
  try {
    debugger;
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    console.log(`✅ [${collectionName}] ordered query: ${snapshot.size} docs`);
    return snapshot;
  } catch (orderError) {
    console.warn(
      `⚠️ orderBy failed for ${collectionName}, fetching unordered:`,
      orderError,
    );
    const snapshot = await getDocs(collectionRef);
    console.log(
      `✅ [${collectionName}] unordered query: ${snapshot.size} docs`,
    );
    return snapshot;
  }
};

/**
 * Export user data to a ZIP file
 */
export const exportUserData = async (
  onProgress?: (progress: ExportProgress) => void,
): Promise<ExportResult> => {
  const user = auth.currentUser;
  console.log("🔍 Export Debug - Current user:", user?.uid);
  console.log("🔍 Current user:", user?.uid);
  console.log("🔍 Auth app name:", auth.app.name);
  console.log("🔍 DB app name:", db.app.name);
  console.log("🔍 DB project ID:", db.app.options.projectId);
  if (!user) throw new Error("User not authenticated");

  const updateProgress = (
    stage: ExportProgress["stage"],
    progress: number,
    total: number,
    currentItem: string = "",
  ) => {
    if (onProgress) onProgress({ stage, progress, total, currentItem });
  };

  updateProgress("preparing", 0, 0, "");

  try {
    const collectionNames = [
      "accounts",
      "transactions",
      "budgets",
      "goals",
      "investments",
      "recurring",
    ];

    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      userId: user.uid,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      profile: {},
      accounts: [],
      transactions: [],
      budgets: [],
      goals: [],
      investments: [],
      recurringTransactions: [],
      summary: {
        totalAccounts: 0,
        totalTransactions: 0,
        totalBalance: 0,
        lastSync: new Date().toISOString(),
      },
    };

    updateProgress(
      "fetching",
      0,
      collectionNames.length + 1,
      "Fetching profile",
    );
    try {
      const profileSnap = await getDoc(doc(db, "users", user.uid));
      if (profileSnap.exists()) {
        exportData.profile = profileSnap.data();
        console.log("✅ Profile found");
      } else {
        console.warn("⚠️ No profile document at users/" + user.uid);
      }
    } catch (error) {
      console.warn("⚠️ Could not fetch profile:", error);
    }

    let totalItems = 0;
    const collectionStats: Record<string, number> = {};

    for (let i = 0; i < collectionNames.length; i++) {
      const collectionName = collectionNames[i];
      updateProgress(
        "fetching",
        i + 1,
        collectionNames.length + 1,
        `Fetching ${collectionName}`,
      );

      try {
        // ✅ FIX 2: Log the exact path being queried so you can verify
        // it matches your actual Firestore structure
        const path = `users/${user.uid}/${collectionName}`;
        console.log(`🔍 Querying Firestore path: ${path}`);

        const collectionRef = collection(db, "users", user.uid, collectionName);
        const snapshot = await getSnapshot(collectionRef, collectionName);

        // ✅ FIX 3: Log snapshot.empty and snapshot.size explicitly —
        // if empty:true here your Firestore rules are blocking the read
        // or the path is wrong
        console.log(
          `📄 [${collectionName}] empty: ${snapshot.empty} | size: ${snapshot.size}`,
        );

        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (items.length > 0) {
          console.log(`📄 [${collectionName}] sample doc:`, items[0]);
        }

        switch (collectionName) {
          case "accounts":
            exportData.accounts = items;
            collectionStats.accounts = items.length;
            totalItems += items.length;
            break;
          case "transactions":
            exportData.transactions = items;
            collectionStats.transactions = items.length;
            totalItems += items.length;
            break;
          case "budgets":
            exportData.budgets = items;
            collectionStats.budgets = items.length;
            totalItems += items.length;
            break;
          case "goals":
            exportData.goals = items;
            collectionStats.goals = items.length;
            totalItems += items.length;
            break;
          case "investments":
            exportData.investments = items;
            collectionStats.investments = items.length;
            totalItems += items.length;
            break;
          case "recurring":
            exportData.recurringTransactions = items;
            collectionStats.recurring = items.length;
            totalItems += items.length;
            break;
        }
      } catch (error) {
        console.error(`❌ Error fetching ${collectionName}:`, error);
      }
    }

    updateProgress(
      "processing",
      collectionNames.length,
      collectionNames.length + 1,
      "Building summary",
    );
    exportData.summary = {
      totalAccounts: exportData.accounts.length,
      totalTransactions: exportData.transactions.length,
      totalBalance: exportData.accounts.reduce(
        (sum, acc) => sum + (acc.balance || 0),
        0,
      ),
      lastSync: new Date().toISOString(),
    };

    console.log("📊 Final export totals:", {
      profile: Object.keys(exportData.profile).length > 0,
      ...collectionStats,
      total: totalItems,
    });

    // ✅ FIX 4: Original condition was buggy — `!exportData.profile` is never
    // true because profile is initialized as `{}` (truthy). Check key length instead.
    if (totalItems === 0 && Object.keys(exportData.profile).length === 0) {
      throw new Error(
        "No data found to export. Make sure you have transactions, accounts, or other data in your account.",
      );
    }

    updateProgress("compressing", 0, 1, "Creating archive");
    const zip = new JSZip();

    zip.file("export.json", JSON.stringify(exportData, null, 2));

    if (Object.keys(exportData.profile).length > 0)
      zip.file("profile.json", JSON.stringify(exportData.profile, null, 2));
    if (exportData.accounts.length > 0)
      zip.file("accounts.json", JSON.stringify(exportData.accounts, null, 2));
    if (exportData.transactions.length > 0)
      zip.file(
        "transactions.json",
        JSON.stringify(exportData.transactions, null, 2),
      );
    if (exportData.budgets.length > 0)
      zip.file("budgets.json", JSON.stringify(exportData.budgets, null, 2));
    if (exportData.goals.length > 0)
      zip.file("goals.json", JSON.stringify(exportData.goals, null, 2));
    if (exportData.investments.length > 0)
      zip.file(
        "investments.json",
        JSON.stringify(exportData.investments, null, 2),
      );
    if (exportData.recurringTransactions.length > 0)
      zip.file(
        "recurring.json",
        JSON.stringify(exportData.recurringTransactions, null, 2),
      );

    zip.file("summary.json", JSON.stringify(exportData.summary, null, 2));
    zip.file("README.txt", generateReadme(exportData));

    updateProgress("compressing", 1, 1, "Finalizing");
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    console.log("✅ ZIP generation complete, size:", blob.size, "bytes");
    const filename = `ecovest-backup-${auth.currentUser?.uid || "unknown"}-${user.uid.slice(0, 8)}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.zip`;
    console.log("✅ ZIP created, size:", blob.size, "bytes");

    updateProgress("complete", 1, 1, "Export complete");

    return {
      blob,
      filename,
      stats: { totalItems, collections: collectionStats },
    };
  } catch (error) {
    console.error("❌ Export error:", error);
    updateProgress(
      "error",
      0,
      0,
      error instanceof Error ? error.message : "Export failed",
    );
    throw error;
  }
};

/**
 * Import user data from a ZIP file
 */
export const importUserData = async (file: File): Promise<ImportResult> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    console.log("📥 Starting import:", file.name, "size:", file.size);

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log("📂 ZIP files:", Object.keys(zip.files));

    const stats = {
      imported: {
        accounts: 0,
        transactions: 0,
        budgets: 0,
        goals: 0,
        investments: 0,
        recurring: 0,
        profile: 0,
      },
      skipped: {
        accounts: 0,
        transactions: 0,
        budgets: 0,
        goals: 0,
        investments: 0,
        recurring: 0,
        profile: 0,
      },
    };

    const collectionFiles = [
      { name: "accounts", fileName: "accounts.json" },
      { name: "transactions", fileName: "transactions.json" },
      { name: "budgets", fileName: "budgets.json" },
      { name: "goals", fileName: "goals.json" },
      { name: "investments", fileName: "investments.json" },
      { name: "recurring", fileName: "recurring.json" },
      { name: "profile", fileName: "profile.json" },
    ];

    let foundAnyFile = false;

    for (const { name, fileName } of collectionFiles) {
      const fileInZip = zip.file(fileName);
      if (!fileInZip) continue;

      foundAnyFile = true;
      try {
        const data = JSON.parse(await fileInZip.async("string"));

        if (name === "profile") {
          if (data && Object.keys(data).length > 0) {
            try {
              await setDoc(
                doc(db, "users", user.uid),
                {
                  ...data,
                  importedAt: new Date().toISOString(),
                  lastImport: new Date().toISOString(),
                },
                { merge: true },
              );
              stats.imported.profile++;
            } catch (err) {
              console.error("❌ Error importing profile:", err);
              stats.skipped.profile++;
            }
          }
        } else if (Array.isArray(data) && data.length > 0) {
          for (const item of data) {
            try {
              const { id, ...itemData } = item;
              await setDoc(doc(collection(db, "users", user.uid, name)), {
                ...itemData,
                importedAt: new Date().toISOString(),
                originalId: id || "unknown",
              });
              stats.imported[name as keyof typeof stats.imported]++;
            } catch (err) {
              stats.skipped[name as keyof typeof stats.skipped]++;
            }
          }
          console.log(
            `✅ Imported ${stats.imported[name as keyof typeof stats.imported]} ${name}`,
          );
        }
      } catch (err) {
        console.error(`❌ Error reading ${fileName}:`, err);
      }
    }

    // Fallback to export.json
    if (!foundAnyFile) {
      const exportFile = zip.file("export.json");
      if (exportFile) {
        const exportData = JSON.parse(await exportFile.async("string"));
        const map: [string, any[]][] = [
          ["accounts", exportData.accounts ?? []],
          ["transactions", exportData.transactions ?? []],
          ["budgets", exportData.budgets ?? []],
          ["goals", exportData.goals ?? []],
          ["investments", exportData.investments ?? []],
          ["recurring", exportData.recurringTransactions ?? []],
        ];
        for (const [name, items] of map) {
          for (const item of items) {
            try {
              const { id, ...itemData } = item;
              await setDoc(doc(collection(db, "users", user.uid, name)), {
                ...itemData,
                importedAt: new Date().toISOString(),
                originalId: id || "unknown",
              });
              stats.imported[name as keyof typeof stats.imported]++;
            } catch {
              stats.skipped[name as keyof typeof stats.skipped]++;
            }
          }
        }
        if (exportData.profile && Object.keys(exportData.profile).length > 0) {
          try {
            await setDoc(
              doc(db, "users", user.uid),
              {
                ...exportData.profile,
                importedAt: new Date().toISOString(),
                lastImport: new Date().toISOString(),
              },
              { merge: true },
            );
            stats.imported.profile++;
          } catch {
            stats.skipped.profile++;
          }
        }
      }
    }

    const totalImported = Object.values(stats.imported).reduce(
      (a, b) => a + b,
      0,
    );
    const totalSkipped = Object.values(stats.skipped).reduce(
      (a, b) => a + b,
      0,
    );

    if (totalImported === 0) {
      return {
        success: false,
        message: "No data found in the backup file.",
        stats,
      };
    }

    return {
      success: true,
      message: `Successfully imported ${totalImported} items.${totalSkipped > 0 ? ` Skipped ${totalSkipped}.` : ""}`,
      stats,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import data",
    };
  }
};

/**
 * Delete all user data (for account deletion)
 */
export const deleteAllUserData = async (userId: string): Promise<void> => {
  const db = getFirestore();
  try {
    const collectionNames = [
      "accounts",
      "transactions",
      "budgets",
      "goals",
      "investments",
      "recurring",
    ];

    for (const name of collectionNames) {
      const snapshot = await getDocs(collection(db, "users", userId, name));
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      console.log(`🗑️ Deleted ${snapshot.size} docs from ${name}`);
    }

    await deleteDoc(doc(db, "users", userId));
    console.log("✅ User profile deleted");
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};

/**
 * Generate README for export ZIP
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
  recurring: data.recurringTransactions.length,
})
  .map(([name, count]) => `- ${name}: ${count}`)
  .join("\n")}

HOW TO IMPORT
-------------
1. Log into your EcoVest account
2. Go to Settings → Data tab
3. Click "Import Data" and select this ZIP file

SUPPORT
-------
For questions: support@ecovest.app
© ${new Date().getFullYear()} EcoVest. All rights reserved.
`;
}
