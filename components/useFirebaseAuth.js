'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  auth,
  getGoogleProvider,
  createRecaptchaVerifier,
  isFirebaseConfigured,
} from '@/firebase/firebaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneSent, setPhoneSent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase configuration is missing. Add your Firebase keys to .env.local and restart the development server.'
      );
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase is not configured. Add your Firebase keys to .env.local and restart the dev server.'
      );
      return;
    }

    setAuthError('');
    setActionLoading(true);
    try {
      await signInWithPopup(auth, getGoogleProvider());
    } catch (error) {
      setAuthError(error?.message || 'Unable to sign in with Google.');
    } finally {
      setActionLoading(false);
    }
  };

  const sendPhoneCode = async (phoneNumber) => {
    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase is not configured. Add your Firebase keys to .env.local and restart the dev server.'
      );
      return;
    }

    setAuthError('');
    setActionLoading(true);
    try {
      if (!phoneNumber.trim()) {
        throw new Error('Please enter a valid phone number.');
      }
      const verifier = createRecaptchaVerifier('recaptcha-container');
      if (!verifier) {
        throw new Error('reCAPTCHA verifier could not be initialized.');
      }
      const result = await signInWithPhoneNumber(auth, phoneNumber.trim(), verifier);
      setConfirmationResult(result);
      setPhoneSent(true);
    } catch (error) {
      setAuthError(error?.message || 'Unable to send verification code.');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyPhoneCode = async (otp) => {
    setAuthError('');
    setActionLoading(true);
    try {
      if (!confirmationResult) {
        throw new Error('Verification session not found. Please restart phone login.');
      }
      await confirmationResult.confirm(otp.trim());
    } catch (error) {
      setAuthError(error?.message || 'Unable to verify code.');
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      actionLoading,
      phone,
      setPhone,
      code,
      setCode,
      phoneSent,
      configMissing,
      signInWithGoogle,
      sendPhoneCode,
      verifyPhoneCode,
      signOut,
    }),
    [user, loading, authError, actionLoading, phone, code, phoneSent, confirmationResult, configMissing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within AuthProvider');
  }
  return context;
}
