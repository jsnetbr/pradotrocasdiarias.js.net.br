import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  type?: 'default' | 'variance' | 'insight';
  children?: React.ReactNode;
  delay?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, type = 'default', children, delay = 0 }) => {
  const isPositive = type === 'variance' && parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.')) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-6 flex flex-col h-full overflow-hidden relative"
    >
      <header className="mb-4">
        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">{title}</h3>
      </header>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-2xl md:text-3xl font-bold ${
          type === 'variance' ? (isPositive ? 'text-green-400' : 'text-red-400') : 'text-white'
        }`}>
          {value}
        </span>
        {type === 'default' && (
           <ArrowUpRight className="w-5 h-5 text-indigo-400" />
        )}
      </div>

      {subtitle && (
        <p className="text-white/40 text-xs font-medium">
          {subtitle}
        </p>
      )}

      {children}
    </motion.div>
  );
};
