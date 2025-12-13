
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import type { Budget } from '@/lib/types';

const getBudgetsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'budgets');
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
        const docRef = doc(getBudgetsCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete budget");
    }
};
