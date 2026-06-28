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
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/chat"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your Automation Report
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isLive
                ? `Based on your consultation — recommended stack: ${recommendedTool || 'custom solution'}.`
                : 'Based on your consultation, here is the projected impact of the recommended automations.'}
            </p>
          </div>

          <button
            id="download-report-btn"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark sm:self-start"
          >
            <Download className="h-4 w-4" />
            Download / Print Report
          </button>
        </div>

        {/* Live indicator */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Showing your live consultation results
          </motion.div>
        )}

        {/* Metric cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Recommended tools */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white">Recommended Tools</h2>
          <p className="mt-1 text-sm text-gray-400">
            A tailored stack of automations matched to the bottlenecks you described.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 text-center">
          <h3 className="text-base font-semibold text-white">Ready to implement?</h3>
          <p className="mt-2 text-sm text-gray-400">
            Go back to the chat to refine your plan, or start a new consultation for a different workflow.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Continue in Chat
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-accent hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
