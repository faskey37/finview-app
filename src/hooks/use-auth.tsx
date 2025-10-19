
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
    deleteUser,
    verifyPasswordResetCode,
    confirmPasswordReset,
    updateEmail,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    PhoneAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    linkWithPhoneNumber,
    updatePhoneNumber
} from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, writeBatch, onSnapshot } from 'firebase/firestore';
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

// Helper to initialize reCAPTCHA
const getRecaptchaVerifier = (containerId: string) => {
    // Check if a verifier has already been created for this containerId to avoid re-rendering
    if (typeof window !== 'undefined' && (window as any).recaptchaVerifiers && (window as any).recaptchaVerifiers[containerId]) {
        const verifier = (window as any).recaptchaVerifiers[containerId];
        const container = document.getElementById(containerId);
         // If the container is empty, it needs to be re-rendered.
        if (container && container.innerHTML === '') {
            verifier.render();
        }
        return verifier;
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber to continue.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });

    if (typeof window !== 'undefined') {
        if (!(window as any).recaptchaVerifiers) {
            (window as any).recaptchaVerifiers = {};
        }
        (window as any).recaptchaVerifiers[containerId] = recaptchaVerifier;
    }
    return recaptchaVerifier;
}


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const isPro = userData?.isPro || false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);
                const userDocRef = doc(db, "users", user.uid);
                
                // Use onSnapshot for real-time updates of user data
                const unsubUserData = onSnapshot(userDocRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data() as UserData);
                    } else {
                        // This handles new sign-ups (Google, Phone, or Email)
                        const newUser: UserData = {
                            uid: user.uid,
                            email: user.email || '',
                            displayName: user.displayName || 'New User',
                            photoURL: user.photoURL || '',
                            currency: "USD",
                            isPro: false, 
                            roundUpForClimate: false,
                            ecoPoints: 0,
                            completedChallenges: {},
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
                    setLoading(false);
                });
                return () => unsubUserData();
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
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
        // The onAuthStateChanged listener will handle the user state update
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

// --- Email/Password ---
export const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    // The onAuthStateChanged listener in AuthProvider handles creating the user doc.
    return userCredential.user;
}

export const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

// --- Google Sign-In ---
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // The onAuthStateChanged listener will handle user data creation if it's a new user.
    return result;
}

// --- Phone Sign-In ---
export const sendPhoneNumberVerification = (phoneNumber: string) => {
    const appVerifier = getRecaptchaVerifier('recaptcha-container');
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    const result = await confirmationResult.confirm(otp);
    // onAuthStateChanged will handle the rest.
    return result.user;
}

// --- Phone Number Linking ---
export const linkPhoneNumber = (phoneNumber: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    const appVerifier = getRecaptchaVerifier('recaptcha-container-profile');
    return linkWithPhoneNumber(user, phoneNumber, appVerifier);
};

export const verifyOtpForLinking = async (confirmationResult: ConfirmationResult, otp: string) => {
    return confirmationResult.confirm(otp);
};


// --- Account Management ---
export const signOutUser = async () => {
    return signOut(auth);
}

export const sendPasswordReset = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
}

export const reauthenticate = async (email: string, password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
};

export const updateUserEmail = async (newEmail: string, password: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("No user is currently signed in.");
    
    try {
        await reauthenticate(user.email, password);
        await updateEmail(user, newEmail);
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { email: newEmail }, { merge: true });
    } catch(error: any) {
        console.error("Error updating email:", error);
         if (error.code === 'auth/wrong-password') {
            throw new Error("The password you entered is incorrect.");
        } else if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email address is already in use by another account.");
        } else if (error.code === 'auth/operation-not-allowed') {
            throw new Error("Email updates are not enabled. Please contact support.");
        }
        throw new Error("Failed to update email. Please try again.");
    }
}

export const deleteUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in.');

  try {
    const userDocRef = doc(db, 'users', user.uid);

    // Delete subcollections
    const collectionsToDelete = [
      'transactions',
      'accounts',
      'budgets',
      'goals',
      'investments',
      'recurring',
    ];
    for (const subcollection of collectionsToDelete) {
      const subcollectionRef = collection(db, 'users', user.uid, subcollection);
      const querySnapshot = await getDocs(subcollectionRef);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete the user document itself
    await deleteDoc(userDocRef);

    // Finally, delete the user from Firebase Auth
    await deleteUser(user);
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error(
        'This is a sensitive operation. Please log in again before deleting your account.'
      );
    }
    throw new Error('An error occurred while deleting the account.');
  }
};

export const verifyResetCode = async (code: string) => {
    return verifyPasswordResetCode(auth, code);
};

export const resetPassword = async (code: string, newPassword: string) => {
    return confirmPasswordReset(auth, code, newPassword);
};
