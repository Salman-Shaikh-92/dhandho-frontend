'use client';

import { useState } from 'react';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import { Smartphone, Loader2, ShieldCheck, CheckCircle2, ChevronLeft, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3">
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F17]">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-emerald-500/70 tracking-widest uppercase">Securing session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F17] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Authenticated</p>
          <p className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {user?.displayName || user?.phoneNumber || user?.email || 'Welcome Back'}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            Your session is fully secured. Establishing secure connection to your enterprise workspace...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex w-full font-sans selection:bg-emerald-500/30">
      {/* Left Panel: Business Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-16 xl:p-24 overflow-hidden border-r border-slate-800/60 bg-gradient-to-br from-[#0B0F17] to-slate-950">
         {/* Decorative gradients */}
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0F17]/0 to-transparent pointer-events-none" />
         <div className="absolute -left-48 -top-48 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
         <div className="absolute -right-24 -bottom-24 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
         
         <div className="relative z-10 w-full max-w-xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Dhandho AI Enterprise</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                 Scale operations <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-sm">without limits.</span>
              </h1>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-md">
                Securely connect to your Dhandho AI workspace and unleash the power of intelligent, autonomous workflows.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-5"
            >
               {/* Stat Card 1 */}
               <div className="group p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                       <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">BUSINESS OPERATIONS</p>
                       <p className="text-white font-bold text-2xl tracking-tight">+40% Scaling Efficiency</p>
                    </div>
                  </div>
               </div>

               {/* Stat Card 2 */}
               <div className="group p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.05)]">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                       <Zap className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                       <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">WORKFLOW AUTOMATION</p>
                       <p className="text-white font-bold text-2xl tracking-tight">24/7 Intelligent Data Stream</p>
                    </div>
                  </div>
               </div>

               {/* Blockquote */}
               <div className="mt-8 pt-8 border-t border-slate-800/60">
                 <blockquote className="text-slate-400 italic font-medium leading-relaxed border-l-2 border-emerald-500/50 pl-4">
                   "The best way to predict the future of your business is to automate it."
                 </blockquote>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Right Panel: Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0B0F17] relative">
         <div className="w-full max-w-[26rem] relative z-10">
            
            {/* Central Auth Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[2.5rem] border border-slate-800/60 bg-slate-900/50 p-8 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              {/* Subtle inner top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              
              <div className="mb-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Secure Access</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed px-2">
                  Authenticate to access your enterprise dashboard and automation tools.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {method === 'choose' ? (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <button
                      onClick={signInWithGoogle}
                      disabled={actionLoading}
                      className="group relative flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden"
                    >
                      {actionLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
                        </div>
                      ) : null}
                      <GoogleIcon />
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-4 py-2 opacity-60">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-700" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Or</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-700" />
                    </div>

                    <button
                      onClick={() => setMethod('phone')}
                      disabled={actionLoading}
                      className="group flex w-full items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 px-4 py-4 text-sm font-bold text-white transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Smartphone className="mr-3 h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      Continue with Phone
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => { setMethod('choose'); setPhone(''); setCode(''); }}
                      className="group flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    
                    {!phoneSent ? (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full rounded-2xl border border-slate-700/50 bg-slate-950/50 px-5 py-4 text-sm font-medium text-white placeholder-slate-600 outline-none transition-all focus:border-emerald-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <button
                          onClick={() => sendPhoneCode(phone)}
                          disabled={actionLoading || !phone.trim()}
                          className="relative flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            'Send Verification Code'
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            className="w-full tracking-[0.5em] rounded-2xl border border-slate-700/50 bg-slate-950/50 px-5 py-4 text-center text-xl font-black text-white placeholder-slate-600 outline-none transition-all focus:border-emerald-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <button
                          onClick={() => verifyPhoneCode(code)}
                          disabled={actionLoading || !code.trim()}
                          className="relative flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            'Verify & Sign In'
                          )}
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
                  className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400"
                >
                  {authError}
                </motion.div>
              )}

              <div className="mt-8 text-center">
                <p className="text-[11px] font-medium tracking-wide text-slate-500">
                  Secured by Firebase Enterprise Authentication
                </p>
              </div>
            </motion.div>
         </div>
      </div>
      
      {/* Required for Firebase Recaptcha */}
      <div id="recaptcha-container" className="h-0 w-0 absolute" />
    </div>
  );
}
