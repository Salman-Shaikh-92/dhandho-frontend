'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Workflow, Gauge, Sparkles, LogOut, Loader2, 
  BarChart3, BrainCircuit, Zap, TrendingUp, Globe, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseClient';
import useFirebaseAuth from '@/components/useFirebaseAuth';

function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-surface/50 p-8 transition-all hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:border-amber-500/40 hover:bg-surface backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500 transition-transform duration-500 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
      </div>
    </motion.div>
  );
}

const INTEGRATIONS = ["Zapier", "Make.com", "HubSpot", "Salesforce", "Stripe", "Slack", "Shopify", "Notion", "Airtable"];

export default function LandingPage() {
  const { user, signOut, signInWithGoogle, loading } = useFirebaseAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push('/chat');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] overflow-hidden selection:bg-accent selection:text-white">
        {/* Dynamic Background Mesh (Synced with Chat Brand) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center bg-[#050505]">
        {/* Animated Glowing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-amber-500/20 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-0 w-[40vw] h-[40vw] bg-orange-600/20 rounded-full blur-[120px]"
        />
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-8">
        
        {/* Navigation */}
        <div className="sticky top-4 z-50 mx-auto w-full max-w-7xl mb-12">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-3 px-5 rounded-full backdrop-blur-xl bg-black/40 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:bg-black/60">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-black shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/20">
                <img src="/logo.jfif" alt="Dhandho AI" className="h-full w-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-amber-500">Dhandho AI</p>
                <h1 className="text-lg font-bold text-white tracking-tight">Automation Consulting</h1>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {loading ? (
                <div className="flex h-10 items-center justify-center px-5">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                </div>
              ) : user ? (
                <>
                  <Link
                    href="/chat"
                    className="group relative flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 overflow-hidden border border-amber-400"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative flex items-center gap-2">
                      Enter Workspace
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/5 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/chat"
                    className="group relative flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 overflow-hidden border border-amber-400"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative flex items-center gap-2">
                      Start Free Audit
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <button
                    onClick={signInWithGoogle}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                  >
                    Sign In
                  </button>
                </>
              )}
            </motion.div>
          </header>
        </div>

        {/* Hero Section */}
        <section className="mt-8 flex flex-col items-center text-center lg:mt-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-orange-500/10 via-white/10 to-green-600/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            The Future of Operations
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="max-w-5xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[5.5rem] lg:leading-[1.05]"
          >
            Scale your business with <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-green-600 drop-shadow-sm">intelligent automation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl font-medium"
          >
            Dhandho AI replaces manual chaos with streamlined, AI-driven workflows. Uncover your biggest bottlenecks and get a tailored roadmap to maximize ROI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col gap-5 items-center justify-center w-full"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>
              <Link
                href="/chat"
                className="relative flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-black transition-transform duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                Analyze My Operations
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <button
              onClick={signInWithGoogle}
              className="flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-bold text-gray-300 backdrop-blur-sm transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              View Client Login
            </button>
          </motion.div>
        </section>

        {/* Infinite Scrolling Integrations Banner */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 border-y border-white/5 bg-white/[0.01] py-12 backdrop-blur-md overflow-hidden relative"
        >
          {/* Fade overlays for smooth scrolling edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
          
          <div className="mx-auto text-center mb-8">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gray-500">Connecting your favorite ecosystems</p>
          </div>
          
          <div className="relative flex overflow-x-hidden">
            <motion.div 
              className="flex whitespace-nowrap gap-16 px-8 items-center"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
              {[...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS].map((item, i) => (
                <span key={i} className="text-2xl font-black tracking-tighter text-white/20 hover:text-white/60 transition-colors duration-300 cursor-default">
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* How it Works Section */}
        <section className="mt-32 sm:mt-48 relative z-20">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              From chaos to clarity in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-white to-green-600 drop-shadow-sm">3 steps.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 font-medium">Our process is designed to be frictionless so you see results instantly.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative mx-auto max-w-6xl">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-orange-500/50 via-white/50 to-green-600/50 z-0" />
            
            {[
              { num: 1, title: "Discover & Chat", desc: "Simply describe your daily bottlenecks to Dhandho AI. We analyze your workflows in real-time to find inefficiencies.", colorClass: "bg-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)]" },
              { num: 2, title: "Custom Blueprint", desc: "Get a tailored automation architecture connecting your exact tools, complete with projected time savings and ROI.", colorClass: "bg-white text-blue-900 shadow-[0_10px_30px_rgba(255,255,255,0.3)]" },
              { num: 3, title: "Execute & Scale", desc: "Implement the roadmap and watch your business run on autopilot, freeing you to focus entirely on revenue growth.", colorClass: "bg-green-600 text-white shadow-[0_10px_30px_rgba(22,163,74,0.4)]" }
            ].map((step, idx) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ delay: idx * 0.2, duration: 0.6, type: "spring" }}
                className="relative z-10 rounded-[2.5rem] border border-white/5 bg-[#111111]/80 p-10 shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-colors"
              >
                <div className={`absolute -top-8 left-10 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-300 ${step.colorClass}`}>
                  {step.num}
                </div>
                <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="mt-40 sm:mt-48 relative z-20">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Engineered for absolute efficiency.
            </h2>
            <p className="mt-6 text-lg text-gray-400 font-medium">Everything you need to step out of the daily grind and focus on growth.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={BrainCircuit}
              title="AI Process Mapping"
              description="We instantly diagnose inefficiencies across your sales, marketing, and operations to pinpoint exactly where you're losing time."
              delay={0.1}
            />
            <FeatureCard 
              icon={Workflow}
              title="Custom Architecture"
              description="Receive a bespoke automation blueprint connecting your favorite SaaS tools (Zapier, Make, CRM) without writing a single line of code."
              delay={0.2}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Predictive ROI"
              description="Stop guessing. Every recommendation comes with a clear breakdown of hours saved and projected revenue impact."
              delay={0.3}
            />
            <FeatureCard 
              icon={Zap}
              title="Rapid Implementation"
              description="Deploy solutions in days, not months. Our frameworks are built for founders who need immediate results."
              delay={0.4}
            />
            <FeatureCard 
              icon={Globe}
              title="Scalable Infrastructure"
              description="Build systems that won't break when you double your team. Your workflows scale securely as your business grows."
              delay={0.5}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Enterprise Security"
              description="Your operational data is heavily protected. We use bank-level encryption and secure auth to keep your strategy private."
              delay={0.6}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-40 mb-24 relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[3rem] border border-accent/30 bg-[#111111] px-8 py-24 text-center shadow-[0_0_80px_rgba(var(--accent-rgb),0.1)] sm:px-16"
          >
            {/* Grain overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[100px]" />
            
            <h2 className="relative z-10 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Ready to automate your growth?
            </h2>
            <p className="relative z-10 mx-auto mt-8 max-w-2xl text-xl text-gray-400 font-medium">
              Join top founders who have reclaimed thousands of hours. Start your free AI consultation right now.
            </p>
            <div className="relative z-10 mt-12 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-accent to-purple-600 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition duration-500"></div>
                <Link
                  href="/chat"
                  className="relative flex h-16 items-center justify-center gap-2 rounded-full bg-black px-10 text-lg font-bold text-white transition-transform duration-300 group-hover:scale-[1.02]"
                >
                  Start Your Consultation
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 py-12 text-center relative z-20">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-lg shadow-lg">
                <img src="/logo.jfif" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-sm font-black tracking-widest text-white">DHANDHO AI</span>
            </div>
            <p className="text-sm font-medium text-gray-500">
              © {new Date().getFullYear()} Dhandho AI. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-bold tracking-wide text-gray-500">
              <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl"
            >
              <h3 className="mb-2 text-lg font-semibold text-white">Sign out of Dhandho AI?</h3>
              <p className="mb-6 text-sm text-gray-400">You will need to sign back in to access your secure consultation history.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowLogoutModal(false);
                    await signOut();
                    window.location.href = '/';
                  }}
                  className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
