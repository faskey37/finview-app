
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    User,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser
} from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { UserData } from '@/lib/types';


interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    isPro: boolean;
    updateUserData: (data: Partial<UserData>) => Promise<void>;
    updateAuthUserProfile: (profile: { displayName?: string, photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, isPro: false, updateUserData: async () => {}, updateAuthUserProfile: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const isPro = userData?.isPro || false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                 const isDefaultPro = true; // Make all users pro by default for local dev

                if (docSnap.exists()) {
                    const existingData = docSnap.data() as UserData;
                     if (isDefaultPro && !existingData.isPro) {
                        await setDoc(userDocRef, { isPro: true }, { merge: true });
                        setUserData({ ...existingData, isPro: true });
                    } else {
                        setUserData(existingData);
                    }
                } else {
                     const newUser: UserData = {
                        uid: user.uid,
                        email: user.email || '',
                        displayName: user.displayName || 'New User',
                        currency: "USD",
                        isPro: isDefaultPro, 
                        roundUpForClimate: false,
                        notifications: {
                            weeklySummary: false,
                            budgetAlerts: true,
                            pushNotifications: {
                                unusualTransactions: true,
                                lowBalance: true,
                                goalMilestones: true,
                            }
                        }
                    };
                     await setDoc(userDocRef, newUser);
                     setUserData(newUser);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUserData = async (data: Partial<UserData>) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, data, { merge: true });
        setUserData(prevData => ({ ...prevData, ...data } as UserData));
    };

    const updateAuthUserProfile = async (profile: { displayName?: string, photoURL?: string }) => {
        if (!auth.currentUser) throw new Error("No user logged in to update.");
        await updateProfile(auth.currentUser, profile);
        setUser({ ...auth.currentUser } as User); 
        if(profile.displayName) {
             await updateUserData({ displayName: profile.displayName });
        }
         if (profile.photoURL) {
            await updateUserData({ photoURL: profile.photoURL });
        }
    }

    return (
        <AuthContext.Provider value={{ user, userData, loading, isPro, updateUserData, updateAuthUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
}

export const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    
    // The onAuthStateChanged listener in AuthProvider will handle creating the user doc.
    // This removes the duplicate logic.
    
    return user;
}

export const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const signOutUser = async () => {
    return signOut(auth);
}

export const sendPasswordReset = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
}

export const reauthenticate = async (email: string, password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
};

export const deleteUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    try {
        const userDocRef = doc(db, 'users', user.uid);
        
        const collectionsToDelete = ['transactions', 'accounts', 'budgets', 'goals', 'investments', 'recurring'];
        for (const subcollection of collectionsToDelete) {
            const subcollectionRef = collection(db, 'users', user.uid, subcollection);
            const querySnapshot = await getDocs(subcollectionRef);
            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        await deleteDoc(userDocRef);
        await deleteUser(user);

    } catch (error) {
        console.error("Error deleting user account:", error);
        if ((error as any).code === 'auth/requires-recent-login') {
             throw new Error("This is a sensitive operation. Please log in again before deleting your account.");
        }
        throw new Error("An error occurred while deleting the account.");
    }
};
