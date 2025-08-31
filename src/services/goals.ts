
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Goal } from '@/lib/types';

const getGoalsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'goals');
}

export const addGoal = async (goal: Omit<Goal, 'id'>) => {
  try {
    const docRef = await addDoc(getGoalsCollection(), goal);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add goal");
  }
};

export const getGoals = (callback: (goals: Goal[]) => void) => {
  if (!auth.currentUser) {
      callback([]);
      return () => {};
  }
  const goalsCollection = getGoalsCollection();
  const q = query(goalsCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const goals: Goal[] = [];
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() } as Goal);
    });
    callback(goals);
  }, (error) => {
    console.error("Error fetching goals:", error);
  });

  return unsubscribe;
};

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
        const docRef = doc(getGoalsCollection(), id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update goal");
    }
}

export const deleteGoal = async (id: string) => {
    try {
        const docRef = doc(getGoalsCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete goal");
    }
};
