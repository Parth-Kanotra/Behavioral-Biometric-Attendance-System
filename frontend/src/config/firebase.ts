import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bbas-8ae97",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bbas-8ae97.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8092);  // Changed to 8090
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);

    console.log('🔧 Connected to Firebase Emulators');
    console.log('   Auth: http://127.0.0.1:9099');
    console.log('   Firestore: http://127.0.0.1:8092');
    console.log('   Functions: http://127.0.0.1:5001');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

export default app;