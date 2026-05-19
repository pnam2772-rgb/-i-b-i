import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBHHaIeUWjoZ8SkKWhdiynbAuIuYfUBTVg',
  authDomain: 'cai-fap.firebaseapp.com',
  projectId: 'cai-fap',
  storageBucket: 'cai-fap.firebasestorage.app',
  messagingSenderId: '1033189152435',
  appId: '1:1033189152435:web:512bf584d50170949442c6',
};

export const isFirebaseConfigured = true;

const app = isFirebaseConfigured
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
