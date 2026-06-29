'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlEeI1zLDZViKB1KWBPXQmGZKem7PT8_g" || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = missingKeys.length === 0;
export const firebaseConfigMissingKeys = missingKeys;

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export function getFirebaseAuth() {
  return auth;
}

export function getGoogleProvider() {
  return googleProvider;
}

// Firebase SDK v10 changed RecaptchaVerifier constructor to (auth, containerId, options)
export function createRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined' || !auth) return null;

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically.
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    },
  });

  verifier.render().catch(() => {});
  window.recaptchaVerifier = verifier;
  return verifier;
}

export { auth, db };
