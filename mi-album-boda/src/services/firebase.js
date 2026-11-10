// src/services/firebase.js
// ============================================================================
// Inicialización de Firebase (SDK v10 modular).
// SOLO usamos Firestore y Storage: todo funciona en el Plan Spark (gratuito)
// sin Cloud Functions.
//
// IMPORTANTE: Las credenciales provienen de "Proyecto > Configuración >
// Tus apps > Web app" de la consola de Firebase. Para no exponer secretos
// reales en GitHub, se leen desde variables de entorno de Vite (.env.local).
// Crea un archivo `.env.local` (ya está en .gitignore) con estas claves:
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   etc.
// ============================================================================
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración leída de .env; los valores de respaldo son SOLO demostrativos.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyDEMO-REEMPLAZA-EN-TU-.env.local',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'mi-album-boda.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'mi-album-boda',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'mi-album-boda.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:000000000000:web:abcdef123456',
};

// Validación temprana: si falta configuración, avisamos en consola sin romper la UI.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('REEMPLAZA')) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Usando credenciales de demostración. ' +
      'Crea un archivo .env.local con tus claves reales de Firebase.'
  );
}

// Inicialización única de la app y servicios modulares.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
