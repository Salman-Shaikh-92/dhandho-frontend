'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, UserCircle, Moon, Bell, Shield, PanelLeft } from 'lucide-react';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import { db } from '@/firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

export default function TopNavbar({ sidebarOpen, onToggleSidebar, user, onLogoutClick, onSettingsClick }) {
  const { signOut } = useFirebaseAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const profileRef = useRef(null);

  // Close whichever dropdown is open when the user clicks outside of it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setAvatar(user.photoURL);
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().avatarBase64) {
            setAvatar(docSnap.data().avatarBase64);
          }
        } catch (e) {
          console.error("Failed to fetch topnav avatar", e);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const dropdownAnim = {
    initial: { opacity: 0, y: -6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.98 },
    transition: { duration: 0.15, ease: 'easeOut' },
  };

  // Derive initials for the avatar button
  const displayName = user?.displayName || user?.email || user?.phoneNumber || 'User';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'DA';

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-lg px-4 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/5 z-20 transition-all">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-surface hover:text-amber-500"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}
        <div className="text-sm font-bold tracking-[0.2em] text-amber-500/80 uppercase">
          Consultation
        </div>
      </div>

      <div className="flex items-center gap-2">


        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
            }}
            aria-label="User menu"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)] text-xs font-bold text-amber-500 transition-all hover:opacity-90 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] overflow-hidden"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                {...dropdownAnim}
                className="absolute right-0 top-12 z-30 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-xl"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.displayName || 'Account'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || user?.phoneNumber || ''}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    if (onSettingsClick) onSettingsClick('profile');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-base hover:text-white"
                >
                  <UserCircle className="h-4 w-4" />
                  My Account
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogoutClick) onLogoutClick();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-amber-500/80 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
