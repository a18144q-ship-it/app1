import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { store, AppState } from '../store';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            store.setState({
              consecutiveDays: data.consecutiveDays || 0,
              lastCompletionDate: data.lastCompletionDate || null,
              lazyTitle: data.lazyTitle || '懒狗',
              aiActiveTab: data.aiActiveTab || 'record'
            });
          } else {
            await setDoc(userRef, {
              consecutiveDays: 0,
              lastCompletionDate: null,
              lazyTitle: '懒狗',
              aiActiveTab: 'record'
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        store.resetState();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubTasks = onSnapshot(collection(db, `users/${user.uid}/tasks`), (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      store.setState({ tasks });
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/tasks`));

    const unsubFocus = onSnapshot(collection(db, `users/${user.uid}/focusSessions`), (snapshot) => {
      const focusSessions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      store.setState({ focusSessions });
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/focusSessions`));

    const unsubRecords = onSnapshot(collection(db, `users/${user.uid}/records`), (snapshot) => {
      const allRecords = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      const records = allRecords.filter(r => r.type === 'record' || !r.type);
      const summaries = allRecords.filter(r => r.type === 'summary');
      store.setState({ records, summaries });
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/records`));

    const unsubPrompts = onSnapshot(collection(db, `users/${user.uid}/prompts`), (snapshot) => {
      const prompts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      store.setState({ prompts });
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/prompts`));

    const unsubChores = onSnapshot(collection(db, `users/${user.uid}/chores`), (snapshot) => {
      const chores = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      store.setState({ chores });
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/chores`));

    return () => {
      unsubTasks();
      unsubFocus();
      unsubRecords();
      unsubPrompts();
      unsubChores();
    };
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signIn, signInWithEmail, signUpWithEmail, logOut }}>
      {children}
    </FirebaseContext.Provider>
  );
}
