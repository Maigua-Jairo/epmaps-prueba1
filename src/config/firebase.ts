/**
 * Conexion con Firebase para Android y ios.
 * Los valores reales se inyectan desde .env.local con EXPO_PUBLIC_*.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const firebaseConfigurado = Object.values(firebaseConfig).every((valor) => String(valor).trim().length > 0);

function crearAuth(): Auth | null {
  if (!firebaseConfigurado) {
    console.warn(
      'Firebase no está configurado todavía. Agrega las variables EXPO_PUBLIC_FIREBASE_* antes de usar autenticación.'
    );
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = crearAuth();

if (auth) {
  auth.languageCode = 'es';
}

export const firebaseReady = !!auth;