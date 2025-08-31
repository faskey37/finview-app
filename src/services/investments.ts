
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, orderBy } from 'firebase/firestore';
import type { Investment } from '@/lib/types';

const getInvestmentsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'investments');
}

// Add a new investment
export const addInvestment = async (investment: Omit<Investment, 'id'>) => {
  try {
    const docRef = await addDoc(getInvestmentsCollection(), investment);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add investment");
  }
};

// Get real-time updates on investments
export const getInvestments = (callback: (investments: Investment[]) => void) => {
  if (!auth.currentUser) {
      callback([]);
      return () => {};
  }
  const investmentsCollection = getInvestmentsCollection();
  const q = query(investmentsCollection, orderBy('purchaseDate', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const investments: Investment[] = [];
    querySnapshot.forEach((doc) => {
      investments.push({ id: doc.id, ...doc.data() } as Investment);
    });
    callback(investments);
  }, (error) => {
    console.error("Error fetching investments:", error);
  });

  return unsubscribe;
};

// Delete an investment
export const deleteInvestment = async (id: string) => {
    try {
        const docRef = doc(getInvestmentsCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete investment");
    }
};
