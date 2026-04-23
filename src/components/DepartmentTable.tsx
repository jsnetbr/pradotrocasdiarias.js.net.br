import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { DepartmentData } from '../types';

interface DepartmentTableProps {
  data: DepartmentData[];
  onUpdate: (id: string, updates: Partial<DepartmentData>) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({ data, onUpdate }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  const handleInputChange = (id: string, field: keyof DepartmentData, value: string) => {
    // Remove dots (thousand separators) and replace comma with dot (decimal separator)
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const numValue = parseFloat(normalized) || 0;
    onUpdate(id, { [field]: numValue });
  };

  return (
    <div className="glass rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-white font-semibold">Detalhes por Departamento</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase font-medium">
              <th className="px-6 py-4">Setor</th>
              <th className="px-6 py-4 text-right">Realizado</th>
              <th className="px-6 py-4 text-right">Meta</th>
              <th className="px-6 py-4 text-right">Diferença</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item, index) => {
              const diff = item.realizado - item.meta;
              const isPositive = diff > 0;
              // status > 0 means we are ABOVE the limit (Bad for Trocas)
              const isAboveMeta = item.status > 0;
              const isBelowMeta = item.status < 0;

              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-white/80">{item.setor}</td>
                  <td className="px-6 py-4 text-sm text-right tabular-nums group/cell">
                    <div className="relative inline-block">
                      <input
                        key={`${item.id}-realizado-${item.realizado}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={item.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        onBlur={(e) => handleInputChange(item.id, 'realizado', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="bg-transparent border-b border-transparent hover:border-white/10 focus:border-cyan-400 outline-none text-right text-white/60 focus:text-white w-28 px-1 py-0.5 transition-all"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right tabular-nums group/cell">
                    <div className="relative inline-block">
                      <input
                        key={`${item.id}-meta-${item.meta}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={item.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        onBlur={(e) => handleInputChange(item.id, 'meta', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="bg-transparent border-b border-transparent hover:border-white/10 focus:border-cyan-400 outline-none text-right text-white/60 focus:text-white w-28 px-1 py-0.5 transition-all"
                      />
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm text-right tabular-nums font-medium`}>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
                      isPositive ? 'bg-red-400/20 text-red-300' : 'bg-green-400/20 text-green-300'
                    }`}>
                      {formatCurrency(Math.abs(diff))}
                      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex flex-col items-end gap-1 min-w-[100px]`}>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold tabular-nums ${
                         isAboveMeta ? 'bg-red-400/20 text-red-300' : 
                         isBelowMeta ? 'bg-green-400/20 text-green-300' : 
                         'bg-white/10 text-white/40'
                      }`}>
                        {formatPercentage(Math.abs(item.status))}
                        {isAboveMeta ? <ArrowUp className="w-3 h-3" /> : isBelowMeta ? <ArrowDown className="w-3 h-3" /> : null}
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        isAboveMeta ? 'text-red-400/60' : isBelowMeta ? 'text-green-400/60' : 'text-white/20'
                      }`}>
                        {isAboveMeta ? 'acima' : isBelowMeta ? 'abaixo' : 'meta'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
