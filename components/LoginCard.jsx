'use client';

import { useState } from 'react';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import { Smartphone, MessageCircle, Loader2, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginCard() {
  const {
    user,
    loading,
    authError,
    actionLoading,
    phone,
    setPhone,
    code,
    setCode,
    phoneSent,
    signInWithGoogle,
    sendPhoneCode,
    verifyPhoneCode,
  } = useFirebaseAuth();

  const [method, setMethod] = useState('choose'); // 'choose', 'phone'

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-border bg-surface shadow-2xl">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-accent" />
        <p className="text-sm font-medium text-gray-400">Verifying session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-20 pointer-events-none" />
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">Authenticated</p>
        <p className="mt-2 text-2xl font-bold text-white">
          {user.displayName || user.phoneNumber || user.email || 'Welcome Back'}
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Your session is fully secured. You can now access your customized consultation history.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-2xl">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      
      <div className="relative p-8 sm:p-10">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Secure Access</h2>
          <p className="mt-3 text-sm text-gray-400">
            Sign in to Dhandho AI to save your workflows and access premium insights.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {method === 'choose' ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-10 space-y-4"
            >
              <button
                onClick={signInWithGoogle}
                disabled={actionLoading}
                className="group flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <GoogleIcon />
                Continue with Google
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase text-gray-500">Or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={() => setMethod('phone')}
                disabled={actionLoading}
                className="group flex w-full items-center justify-center rounded-2xl border border-border bg-base px-4 py-4 text-sm font-semibold text-white transition-all hover:border-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Smartphone className="mr-2 h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                Continue with Phone
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mt-8 space-y-5"
            >
              <button 
                onClick={() => { setMethod('choose'); setPhone(''); setCode(''); }}
                className="flex items-center text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </button>
              
              {!phoneSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-2xl border border-border bg-base px-4 py-4 text-sm text-white outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <button
                    onClick={() => sendPhoneCode(phone)}
                    disabled={actionLoading || !phone.trim()}
                    className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-accent/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send verification code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                      Verification code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="w-full tracking-widest rounded-2xl border border-border bg-base px-4 py-4 text-center text-lg text-white outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <button
                    onClick={() => verifyPhoneCode(code)}
                    disabled={actionLoading || !code.trim()}
                    className="flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-accent/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Sign In'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {authError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
          >
            {authError}
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secured by Firebase Authentication.
          </p>
        </div>
      </div>
      
      <div id="recaptcha-container" className="h-0 w-0" />
    </div>
  );
}
