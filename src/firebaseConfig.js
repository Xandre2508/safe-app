import { initializeApp, getApps, getApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth, getAuth, inMemoryPersistence, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBK0_WQzLvfL_7NfAqeay25WSgGeQtBmls",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "safe-app-23898.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "safe-app-23898",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "safe-app-23898.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "634227333912",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:634227333912:web:0e4810a3acca21fa99dc6d",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K4GKMK1H8R"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

/**
 * Cria uma conta para socorrista/operador a partir do painel de administração
 * utilizando uma instância secundária do Firebase para evitar que a sessão do Admin seja terminada.
 */
export async function createStaffAccount(email, password) {
  const secondaryAppName = 'SecondaryAdminStaffCreationApp';
  let secondaryApp = getApps().find(a => a.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }

  let secondaryAuth;
  try {
    secondaryAuth = initializeAuth(secondaryApp, {
      persistence: inMemoryPersistence
    });
  } catch {
    secondaryAuth = getAuth(secondaryApp);
  }

  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await signOut(secondaryAuth);
  return userCredential.user;
}

export default app;
