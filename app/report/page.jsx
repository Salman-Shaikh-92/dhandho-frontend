'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Clock,
  PiggyBank,
  TrendingUp,
  Workflow,
  MessageSquareText,
  FileSpreadsheet,
  Mail,
} from 'lucide-react';
import { MetricCard, ToolCard } from '@/components/ReportCard';

// Default / fallback data used when no report has been generated yet.
const DEFAULT_METRICS = [
  { icon: Clock, label: 'Monthly Hours Saved', value: '142 hrs', accent: 'bg-blue-600' },
  { icon: PiggyBank, label: 'Monthly Cost Savings', value: '$4,260', accent: 'bg-emerald-600' },
  { icon: TrendingUp, label: 'Estimated ROI (%)', value: '318%', accent: 'bg-violet-600' },
];

const DEFAULT_TOOLS = [
  {
    icon: Workflow,
    name: 'Workflow Orchestrator',
    category: 'Process Automation',
    description:
      'Connects your order, inventory, and shipping tools so updates flow automatically without manual re-entry.',
  },
  {
    icon: MessageSquareText,
    name: 'AI Support Assistant',
    category: 'Customer Support',
    description:
      'Handles routine customer questions instantly and routes complex issues to your team with full context.',
  },
  {
    icon: FileSpreadsheet,
    name: 'Invoice Automation',
    category: 'Finance Operations',
    description:
      'Generates, sends, and tracks invoices automatically, with reminders for overdue payments.',
  },
  {
    icon: Mail,
    name: 'Lead Follow-up Sequencer',
    category: 'Sales & Marketing',
    description:
      'Sends personalised follow-up emails to new leads based on their behaviour, so none fall through the cracks.',
  },
];

// Icon pool — cycled when the AI recommends more tools than we have icons for.
const ICON_POOL = [Workflow, MessageSquareText, FileSpreadsheet, Mail];

export default function ReportPage() {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [isLive, setIsLive] = useState(false);
  const [recommendedTool, setRecommendedTool] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dhandho_report');
      if (!raw) return;

      const data = JSON.parse(raw);
      const roi = data.roi_metrics;

      if (roi) {
        setMetrics([
          {
            icon: Clock,
            label: 'Monthly Hours Saved',
            value: `${roi.hours_saved_monthly ?? '—'} hrs`,
            accent: 'bg-blue-600',
          },
          {
            icon: PiggyBank,
            label: 'Monthly Cost Savings',
            value: roi.cost_savings_monthly
              ? `$${Number(roi.cost_savings_monthly).toLocaleString()}`
              : '—',
            accent: 'bg-emerald-600',
          },
          {
            icon: TrendingUp,
            label: 'Estimated ROI (%)',
            value: roi.roi_percentage != null ? `${roi.roi_percentage}%` : '—',
            accent: 'bg-violet-600',
          },
        ]);
      }

      if (data.tool_recommendations?.length) {
        setTools(
          data.tool_recommendations.map((t, i) => ({
            icon: ICON_POOL[i % ICON_POOL.length],
            name: t.tool_name,
            category: 'Recommended Automation',
            description: t.description,
          }))
        );
      }

      if (data.recommended_tool) setRecommendedTool(data.recommended_tool);
      setIsLive(true);
    } catch {
      // Silently fall back to default data
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] overflow-hidden relative selection:bg-amber-500 selection:text-white">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[50vw] h-[50vw] bg-amber-500/20 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.15, 0.05], x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 relative z-10">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12 bg-[#111111]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
        >
          <div>
            <Link
              href="/chat"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white border border-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Audit
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Executive ROI Report
            </h1>
            <p className="mt-4 text-base font-medium text-gray-400 max-w-xl">
              {isLive
                ? `Based on your consultation, here is your custom architecture featuring ${recommendedTool || 'tailored solutions'}.`
                : 'Based on your consultation, here is the projected impact of the recommended automations.'}
            </p>
            {isLive && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Projection Active
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="group relative flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:self-end"
          >
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Download PDF
          </button>
        </motion.div>

        {/* Metric cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </div>

        {/* Recommended tools */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Workflow className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Recommended Architecture</h2>
              <p className="text-sm font-medium text-gray-400">A tailored stack of automations matched to your operational bottlenecks.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool, i) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </motion.div>

        {/* Enterprise CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-24 relative overflow-hidden rounded-[3rem] border border-amber-500/30 bg-[#111111] px-8 py-20 text-center shadow-[0_0_80px_rgba(245,158,11,0.15)] sm:px-16"
        >
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/20 blur-[100px]" />
          
          <h3 className="relative z-10 text-3xl font-black text-white sm:text-5xl">Execute this roadmap today.</h3>
          <p className="relative z-10 mx-auto mt-6 max-w-2xl text-lg font-medium text-gray-400">
            Stop losing thousands of dollars to manual inefficiencies. Our engineers can deploy this exact architecture into your business within days.
          </p>
          
          <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <Link
                href="/chat"
                className="relative flex h-14 items-center gap-2 rounded-full bg-amber-500 px-8 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.02]"
              >
                Schedule Implementation Call
              </Link>
            </div>
            <Link
              href="/"
              className="flex h-14 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
