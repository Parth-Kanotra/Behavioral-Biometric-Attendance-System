import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'faculty';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userData?.displayName || 'User',
            role: userData?.role || 'student',
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string,
    role: 'student' | 'faculty' = 'student'
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      role,
      createdAt: new Date(),
    });

    return userCredential.user;
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
