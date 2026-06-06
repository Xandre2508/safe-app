import { initializeApp } from 'firebase/app';
// Trocamos o 'getAuth' por estas duas novas funções:
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Importamos a memória do telemóvel
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBK0_WQzLvfL_7NfAqeay25WSgGeQtBmls",
  authDomain: "safe-app-23898.firebaseapp.com",
  projectId: "safe-app-23898",
  storageBucket: "safe-app-23898.firebasestorage.app",
  messagingSenderId: "634227333912",
  appId: "1:634227333912:web:0e4810a3acca21fa99dc6d",
  measurementId: "G-K4GKMK1H8R"
};

const app = initializeApp(firebaseConfig);

// Inicializamos a Autenticação dizendo-lhe para guardar o Login na memória do telemóvel
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);