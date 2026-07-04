'use client';

import { motion } from 'framer-motion';

// Metric card used for "Monthly Hours Saved", "Monthly Cost Savings",
// and "Estimated ROI (%)" at the top of the report dashboard.
export function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:border-amber-500/30 overflow-hidden relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent to-amber-500/0 group-hover:to-amber-500/5 transition-all duration-500" />
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 ${accent.replace('bg-', 'bg-').replace('-600', '-500/20 text-').replace('text-bg-', 'text-')} border border-white/10`}>
          <Icon className="h-5 w-5" style={{ color: accent.includes('blue') ? '#3b82f6' : accent.includes('emerald') ? '#10b981' : '#8b5cf6' }} />
        </div>
      </div>
      <p className="relative z-10 mt-6 text-4xl font-black tracking-tight text-white">{value}</p>
    </motion.div>
  );
}

// Card for each recommended automation tool in the grid below the metrics.
export function ToolCard({ icon: Icon, name, description, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:border-amber-500/30 overflow-hidden relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-br from-transparent to-amber-500/0 group-hover:to-amber-500/5 transition-all duration-500" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 transition-transform group-hover:scale-110 group-hover:bg-amber-500/20">
          <Icon className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{name}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{category}</p>
        </div>
      </div>
      <p className="relative z-10 text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors mt-2">{description}</p>
    </motion.div>
  );
}
