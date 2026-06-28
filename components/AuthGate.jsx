'use client';

import useFirebaseAuth from '@/components/useFirebaseAuth';
import LoginCard from '@/components/LoginCard';
import { Loader2 } from 'lucide-react';

export default function AuthGate({ children }) {
  const { user, loading, authError, actionLoading, configMissing } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4 py-10 text-center">
        <div className="rounded-3xl border border-border bg-surface px-8 py-10 shadow-xl">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-gray-400">Verifying your authentication status...</p>
        </div>
      </div>
    );
  }

  if (configMissing) {
    return (
      <div className="min-h-screen bg-base px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-2xl text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-accent">Firebase setup required</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Firebase configuration is missing
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-sm text-gray-400">
              Add your Firebase client values to <code className="rounded bg-slate-900 px-2 py-1 text-sm text-white">.env.local</code>
              and restart the dev server.
            </p>
            <div className="mt-6 rounded-3xl border border-border bg-base p-5 text-left text-sm text-gray-200">
              <p className="font-semibold text-white">Required environment variables:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-300">
                <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
              </ul>
            </div>
            {authError ? (
              <p className="mt-6 text-sm text-red-400">{authError}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-2xl">
            <div className="mb-6 flex flex-col gap-3 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-accent">Authentication Required</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Sign in to continue to Dhandho AI Chat
              </h1>
              <p className="max-w-2xl mx-auto text-sm text-gray-400">
                Use Google or phone login to secure your consultation, protect your session history,
                and access your business insights from anywhere.
              </p>
            </div>
            <LoginCard />
          </div>
        </div>
      </div>
    );
  }

  return children({ user });
}
