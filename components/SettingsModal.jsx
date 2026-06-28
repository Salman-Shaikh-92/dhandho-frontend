'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Moon, Crown, Monitor, Shield, Zap, Check, Upload, Loader2 } from 'lucide-react';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import { auth, db } from '@/firebase/firebaseClient';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function SettingsModal({ isOpen, onClose, initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currency, setCurrency] = useState('USD');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useFirebaseAuth();

  const exchangeRates = {
    USD: { rate: 1, symbol: '$' },
    INR: { rate: 83.5, symbol: '₹' },
    EUR: { rate: 0.93, symbol: '€' },
    GBP: { rate: 0.79, symbol: '£' },
    CAD: { rate: 1.37, symbol: 'C$' },
    AUD: { rate: 1.50, symbol: 'A$' },
  };

  const getPrice = (usdPrice) => {
    if (usdPrice === 0) return 0;
    return Math.round(usdPrice * exchangeRates[currency].rate);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.displayName || '');
      // Fetch extended profile data from Firestore
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.companyName) setCompanyName(data.companyName);
            if (data.industry) setIndustry(data.industry);
            if (data.avatarBase64) setAvatarPreview(data.avatarBase64);
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      };
      fetchProfile();
    }
  }, [user, isOpen]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile (Name only to avoid photoURL length limits)
      await updateProfile(user, {
        displayName: fullName,
      });

      // 2. Update Firestore User Document (Company, Industry, and Base64 Avatar)
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: user.email,
        companyName,
        industry,
        avatarBase64: avatarPreview || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 3. Update Password if provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      alert("Profile updated successfully!");
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'subscription', label: 'Subscription', icon: Crown },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-5xl h-[650px] max-h-[90vh] rounded-[24px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/5 relative flex overflow-hidden"
      >
        {/* Left Sidebar for Tabs */}
        <div className="w-64 border-r border-white/5 bg-[#111] flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
          </div>
          <div className="flex-1 px-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
          
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col">
                    <h4 className="text-xl font-bold text-white">Profile Details</h4>
                    <p className="text-sm text-gray-400">Manage your personal information and company details.</p>
                  </div>

                  <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-3xl font-black text-black overflow-hidden group">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                      )}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                      >
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white">{user?.displayName || 'User Account'}</h4>
                      <p className="text-sm text-amber-500 mb-2">Administrator / Founder</p>
                      <div className="flex gap-3">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors border border-white/5"
                        >
                          Change Avatar
                        </button>
                        <button 
                          onClick={handleRemoveAvatar}
                          className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium rounded-lg transition-colors border border-red-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Email Address <span className="text-gray-500 text-xs ml-2">(Verified)</span></label>
                      <input 
                        type="text" 
                        disabled 
                        value={user?.email || ''} 
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Company Name</label>
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="e.g. Acme Corporation"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Industry</label>
                      <select 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#111]">Select your industry</option>
                        <option value="tech" className="bg-[#111]">Technology & Software</option>
                        <option value="ecommerce" className="bg-[#111]">E-Commerce & Retail</option>
                        <option value="healthcare" className="bg-[#111]">Healthcare</option>
                        <option value="finance" className="bg-[#111]">Finance & Real Estate</option>
                        <option value="other" className="bg-[#111]">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <h5 className="text-sm font-bold text-white mb-4">Security</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Leave blank if you don't want to change your password. Only applies to email/password accounts.</p>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                    <button 
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-white/10 bg-transparent text-sm font-medium text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-sm font-bold text-white shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Theme Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-500 bg-amber-500/10 p-4 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all">
                        <Moon className="h-6 w-6" />
                        <span className="text-sm font-bold">Dark Mode</span>
                      </button>
                      <button className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-gray-400 hover:border-white/20 hover:bg-white/10 transition-all opacity-50 cursor-not-allowed" title="Light mode is currently disabled">
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm font-bold">System Default</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Dhandho AI is optimized for Dark Mode.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                      <h4 className="text-xl font-bold text-white">Choose Your Plan</h4>
                      <p className="text-sm text-gray-400">Unlock the full power of Dhandho AI to automate your business.</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400 font-medium">Currency:</label>
                      <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 cursor-pointer outline-none"
                      >
                        {Object.keys(exchangeRates).map(code => (
                          <option key={code} value={code} className="bg-[#111] text-white">
                            {code} ({exchangeRates[code].symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Free Plan Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col relative overflow-hidden transition-all hover:border-white/20">
                      <div className="mb-5">
                        <div className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-3">
                          Current Plan
                        </div>
                        <h5 className="text-2xl font-black text-white">Free</h5>
                        <p className="text-sm text-gray-400 mt-1">{exchangeRates[currency].symbol}0 / forever</p>
                      </div>

                      <div className="flex-1 space-y-3.5 mb-8">
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span>Basic AI Consultations</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span>Standard Processing</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <X className="h-4 w-4 mt-0.5 opacity-50" />
                          <span className="opacity-50">Custom Blueprints</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <X className="h-4 w-4 mt-0.5 opacity-50" />
                          <span className="opacity-50">Admin Booking</span>
                        </div>
                      </div>

                      <button disabled className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed">
                        Active
                      </button>
                    </div>

                    {/* Pro Plan Card */}
                    <div className="rounded-2xl border border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-transparent p-6 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-400">
                      <div className="mb-5 relative z-10">
                        <h5 className="text-2xl font-black text-white text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white mt-8">Pro</h5>
                        <div className="flex items-end gap-1 mt-1">
                          <p className="text-2xl font-bold text-blue-400">{exchangeRates[currency].symbol}{getPrice(49)}</p>
                          <p className="text-sm text-gray-400 mb-1">/ month</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3.5 mb-8 relative z-10">
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span>Advanced AI Models</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span>Faster Processing</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span>Basic Automation</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <X className="h-4 w-4 mt-0.5 opacity-50" />
                          <span className="opacity-50">1-on-1 Calls</span>
                        </div>
                      </div>

                      <button onClick={() => alert("Redirecting to Stripe Pro Checkout...")} className="relative z-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)]">
                        Upgrade to Pro
                      </button>
                    </div>

                    {/* Enterprise Plan Card */}
                    <div className="rounded-2xl border border-amber-500 bg-gradient-to-b from-amber-500/10 to-transparent p-6 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.25)] hover:border-amber-400">
                      <div className="absolute -right-6 -top-6 opacity-20">
                        <Crown className="h-32 w-32 text-amber-500" />
                      </div>
                      
                      <div className="mb-5 relative z-10">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                          <Crown className="h-3 w-3" /> Best Value
                        </div>
                        <h5 className="text-2xl font-black text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100">Enterprise</h5>
                        <div className="flex items-end gap-1 mt-1">
                          <p className="text-2xl font-bold text-amber-500">{exchangeRates[currency].symbol}{getPrice(99)}</p>
                          <p className="text-sm text-gray-400 mb-1">/ month</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3.5 mb-8 relative z-10">
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>Everything in Pro</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>Instant Priority Queue</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>Custom Blueprints</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>1-on-1 Strategy Calls</span>
                        </div>
                      </div>

                      <button onClick={() => alert("Redirecting to Stripe Enterprise Checkout...")} className="relative z-10 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] hover:scale-[1.02]">
                        Get Enterprise
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
