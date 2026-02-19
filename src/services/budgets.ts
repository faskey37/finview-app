import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import type { Budget } from '@/lib/types';

const getBudgetsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'budgets');
}

const getBudgetDocRef = (budgetId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return doc(db, 'users', userId, 'budgets', budgetId);
}

// Add a new budget
export const addBudget = async (budget: Omit<Budget, 'id'>) => {
  try {
    const docRef = await addDoc(getBudgetsCollection(), budget);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add budget");
  }
};

// Update an existing budget
export const updateBudget = async (id: string, budget: Partial<Omit<Budget, 'id'>>) => {
  try {
    const docRef = getBudgetDocRef(id);
    await updateDoc(docRef, budget);
    return id;
  } catch (e) {
    console.error("Error updating document: ", e);
    throw new Error("Failed to update budget");
  }
};

// Get real-time updates on budgets
export const getBudgets = (callback: (budgets: Budget[]) => void) => {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const budgetsCollection = getBudgetsCollection();
  const q = query(budgetsCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const budgets: Budget[] = [];
    querySnapshot.forEach((doc) => {
      budgets.push({ id: doc.id, ...doc.data() } as Budget);
    });
    callback(budgets);
  }, (error) => {
    console.error("Error fetching budgets:", error);
  });

  return unsubscribe;
};

// Delete a budget
export const deleteBudget = async (id: string) => {
    try {
        const docRef = getBudgetDocRef(id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete budget");
    }
};

// Get all budgets (one-time fetch, not real-time)
export const getAllBudgets = async () => {
  try {
    const querySnapshot = await getDocs(getBudgetsCollection());
    const budgets: Budget[] = [];
    querySnapshot.forEach((doc) => {
      budgets.push({ id: doc.id, ...doc.data() } as Budget);
    });
    return budgets;
  } catch (e) {
    console.error("Error fetching budgets: ", e);
    throw new Error("Failed to fetch budgets");
  }
};