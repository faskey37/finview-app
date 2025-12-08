
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Goal } from '@/lib/types';

export const addGoal = async (goal: Omit<Goal, 'id'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in. Cannot add goal.");
  try {
    const goalsCollection = collection(db, 'users', userId, 'goals');
    const docRef = await addDoc(goalsCollection, goal);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add goal");
  }
};

export const getGoals = (callback: (goals: Goal[]) => void, errorCallback: (error: Error) => void) => {
  const user = auth.currentUser;
  if (!user) {
      callback([]);
      return () => {};
  }
  const goalsCollection = collection(db, 'users', user.uid, 'goals');
  const q = query(goalsCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const goals: Goal[] = [];
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() } as Goal);
    });
    callback(goals);
  }, (error) => {
    console.error("Error fetching goals:", error);
    errorCallback(error);
  });

  return unsubscribe;
};

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in. Cannot update goal.");
    try {
        const docRef = doc(db, 'users', userId, 'goals', id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update goal");
    }
}

export const deleteGoal = async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in. Cannot delete goal.");
    try {
        const docRef = doc(db, 'users', userId, 'goals', id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete goal");
    }
};
