'use client';

import { motion } from 'framer-motion';

// Metric card used for "Monthly Hours Saved", "Monthly Cost Savings",
// and "Estimated ROI (%)" at the top of the report dashboard.
export function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </motion.div>
  );
}

// Card for each recommended automation tool in the grid below the metrics.
export function ToolCard({ icon: Icon, name, description, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4.5 w-4.5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-gray-500">{category}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </motion.div>
  );
}
