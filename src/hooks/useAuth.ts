import React, { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const unsubscribeDoc = onSnapshot(userDocRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                setUser(docSnapshot.data() as User);
              } else {
                // User is authenticated but profile document doesn't exist yet (e.g. just registered)
                setUser(null);
              }
              setLoading(false);
            }, (error) => {
              console.error("Firestore snapshot error:", error);
              setLoading(false);
            });
            return () => unsubscribeDoc();
          } catch (e) {
             console.error("Error setting up user profile listener:", e);
             setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth State Change Error:", error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, userProfile: user, loading } },
    children
  );
};

export const useAuth = () => useContext(AuthContext);