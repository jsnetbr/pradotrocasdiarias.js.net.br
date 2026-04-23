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
      className="glass rounded-2xl p-3 flex flex-col h-full overflow-hidden relative"
    >
      <header className="mb-1">
        <h3 className="text-white/60 text-[10px] font-medium uppercase tracking-wider">{title}</h3>
      </header>
      
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-lg md:text-xl font-bold ${
          type === 'variance' ? (isPositive ? 'text-green-400' : 'text-red-400') : 'text-white'
        }`}>
          {value}
        </span>
        {type === 'default' && (
           <ArrowUpRight className="w-3 h-3 text-indigo-400" />
        )}
      </div>

      {subtitle && (
        <p className="text-white/40 text-[9px] font-medium leading-tight mt-0.5">
          {subtitle}
        </p>
      )}

      {children && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </motion.div>
  );
};
