'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, PanelLeftClose, PanelLeft, MessageSquare, MoreVertical, Edit2, Trash2, Settings, LogOut, Moon, Bell, Shield, Crown, UserCircle, ShieldAlert } from 'lucide-react';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  searchTerm,
  onSearchChange,
  onRenameSession,
  onDeleteSession,
  user,
  onLogoutClick,
  onSettingsClick,
}) {
  const router = useRouter();
  const { signOut } = useFirebaseAuth();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [avatar, setAvatar] = useState('');
  
  const menuRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    // Live sync the avatar from Firestore
    const db = getFirestore();
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setAvatar(docSnap.data().avatar || user.photoURL || '');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
        setConfirmDeleteId(null);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
    setConfirmDeleteId(null);
  };

  const handleRenameSubmit = (sessionId) => {
    if (editTitle.trim() && editTitle !== sessions.find(s => s.id === sessionId)?.title) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, sessionId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(sessionId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex h-full flex-shrink-0 flex-col overflow-hidden border-r border-border bg-surface"
          >
            <div className="flex w-[280px] flex-col h-full">
              <div className="flex items-center justify-between px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/30 overflow-hidden">
                    <img 
                      src="/logo.jfif" 
                      alt="Dhandho AI Logo" 
                      className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-50"
                    />
                    <span className="relative z-10 text-white font-black text-xs tracking-wider">DA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black tracking-widest text-white uppercase leading-none">
                      Dhandho
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.25em] text-amber-500 uppercase mt-0.5">
                      Automation
                    </span>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  aria-label="Collapse sidebar"
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-base hover:text-white"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              <div className="px-3">
                <button
                  onClick={onNewChat}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 text-sm font-semibold text-amber-500 transition-all hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                >
                  <Plus className="h-4 w-4 text-amber-600 group-hover:text-amber-400 transition-colors" />
                  New Chat
                </button>
              </div>

              <div className="px-3 pt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500/50" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full rounded-lg border border-border bg-base py-2 pl-9 pr-3 text-sm text-white placeholder-amber-500/50 outline-none transition-colors focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
                <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Recent
                </p>
                <ul className="space-y-1">
                  {filteredSessions.length === 0 && (
                    <li className="px-1 py-2 text-sm text-gray-500">No chats found.</li>
                  )}
                  {filteredSessions.map((session) => (
                    <li key={session.id} className="relative group">
                      {editingId === session.id ? (
                        <div className="flex w-full items-center gap-2 rounded-lg bg-base px-3 py-2 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                          <MessageSquare className="h-4 w-4 flex-shrink-0 text-amber-500" />
                          <input
                            autoFocus
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, session.id)}
                            onBlur={() => handleRenameSubmit(session.id)}
                            className="w-full bg-transparent text-sm text-white outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectSession(session.id)}
                          className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                            session.id === activeSessionId
                              ? 'bg-base text-white border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
                              : 'text-gray-400 border border-transparent hover:bg-base hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <MessageSquare className={`h-4 w-4 flex-shrink-0 transition-colors ${session.id === activeSessionId ? 'text-amber-500' : 'text-gray-500 group-hover:text-amber-500/50'}`} />
                            <span className="truncate">{session.title}</span>
                          </div>
                          
                          <div 
                            className={`flex items-center ${session.id === activeSessionId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === session.id ? null : session.id);
                                setConfirmDeleteId(null);
                              }}
                              className="p-1 rounded-md hover:text-amber-400 hover:bg-surface text-gray-400 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            <AnimatePresence>
                              {menuOpenId === session.id && (
                                <motion.div
                                  ref={menuRef}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute right-8 top-8 z-40 w-32 rounded-lg border border-amber-500/20 bg-surface p-1 shadow-2xl"
                                >
                                  <button
                                    onClick={(e) => startRename(session, e)}
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Rename
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMenuOpenId(null);
                                      setSessionToDelete(session);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-0.5 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Profile & Settings at the bottom */}
              <div className="border-t border-border bg-surface/50 p-3 flex flex-col gap-1 relative">

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      ref={settingsRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-16 left-3 right-3 z-40 mb-2 rounded-xl border border-white/10 bg-[#1A1A1A] p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
                    >
                      <div className="mb-1.5 p-0.5">
                        <button 
                          onClick={() => {
                            setSettingsOpen(false);
                            if (onSettingsClick) onSettingsClick('subscription');
                          }}
                          className="group flex w-full items-center justify-between gap-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 p-3 shadow-[0_4px_15px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer border border-amber-400/30"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-[11px] font-black text-black uppercase tracking-wider leading-tight">Free Plan</span>
                            <span className="text-[10px] font-medium text-white/90 mt-0.5">Upgrade for full access</span>
                          </div>
                          <Crown className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSettingsOpen(false);
                          if (onSettingsClick) onSettingsClick();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <div className="my-1.5 h-px bg-white/10" />
                      <button 
                        onClick={() => {
                          setSettingsOpen(false);
                          if (onLogoutClick) onLogoutClick();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {user && (
                  <button 
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5 mt-1 text-left border border-transparent hover:border-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-inner text-sm font-black text-black overflow-hidden border border-amber-500/20">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-sm font-bold text-gray-200">
                        {user.displayName || 'User Account'}
                      </span>
                      <span className="truncate text-xs font-medium text-gray-500">
                        {user.email || 'Authenticated'}
                      </span>
                    </div>
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#111] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Trash2 className="h-32 w-32 text-red-500" />
              </div>
              
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4 border border-red-500/20">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-white relative z-10">Delete Conversation?</h3>
              <p className="mb-6 text-sm text-gray-400 relative z-10">
                Are you sure you want to completely delete <span className="text-amber-500 font-bold">"{sessionToDelete.title}"</span>? This action cannot be undone and will be permanently removed.
              </p>
              
              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSession(sessionToDelete.id);
                    setSessionToDelete(null);
                  }}
                  className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
