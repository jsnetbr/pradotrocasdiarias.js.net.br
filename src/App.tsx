import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AlertCircle, Calendar, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toBlob } from 'html-to-image';
import { KpiCard } from './components/KpiCard';
import { DepartmentTable } from './components/DepartmentTable';
import { departmentData as initialData } from './data';
import { db } from './lib/firebase';
import { collection, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { DepartmentData } from './types';

export default function App() {
  const { user, loading, signIn } = useAuth();
  const [data, setData] = useState<DepartmentData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setData([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const masterSectorsRef = collection(db, 'config', 'master_sectors', 'sectors');
    const dailySectorsRef = collection(db, 'reports', currentDate, 'sectors');

    let masterList: any[] = [];
    let dailyList: any[] = [];

    const handleSyncError = (error: unknown) => {
      console.error('Erro ao sincronizar:', error);
      setErrorMessage('Não foi possível carregar os dados. Confira sua conexão e as regras do Firebase.');
      setIsLoading(false);
    };

    const combineData = () => {
      const combined = initialData.map((base) => {
        const master = masterList.find((item) => item.id === base.id);
        const daily = dailyList.find((item) => item.id === base.id);

        const meta = master?.meta ?? base.meta;
        const realizado = daily?.realizado ?? 0;
        const status = meta > 0 ? ((realizado - meta) / meta) * 100 : 0;

        return {
          ...base,
          meta,
          realizado,
          status,
          updatedAt: daily?.updatedAt || master?.updatedAt || new Date().toISOString(),
        };
      });

      setData(combined);
      setIsLoading(false);
    };

    const unsubMaster = onSnapshot(
      masterSectorsRef,
      (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          initialData.forEach((item) => {
            const docRef = doc(masterSectorsRef, item.id);
            batch.set(docRef, { id: item.id, setor: item.setor, meta: item.meta });
          });
          batch.commit().catch(handleSyncError);
          return;
        }

        masterList = snapshot.docs.map((item) => item.data());
        combineData();
      },
      handleSyncError,
    );

    const unsubDaily = onSnapshot(
      dailySectorsRef,
      (snapshot) => {
        dailyList = snapshot.docs.map((item) => item.data());
        combineData();
      },
      handleSyncError,
    );

    return () => {
      unsubMaster();
      unsubDaily();
    };
  }, [currentDate, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-6 shadow-lg shadow-cyan-500/20 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso ao Relatório</h1>
          <p className="text-white/60 mb-8 text-sm">Faça login para continuar</p>
          <button
            onClick={signIn}
            className="w-full bg-white hover:bg-white/90 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleUpdate = async (id: string, updates: Partial<DepartmentData>) => {
    try {
      setErrorMessage(null);

      if (updates.meta !== undefined) {
        const masterDocRef = doc(db, 'config', 'master_sectors', 'sectors', id);
        await setDoc(masterDocRef, { meta: updates.meta }, { merge: true });
      }

      if (updates.realizado !== undefined) {
        const dailyDocRef = doc(db, 'reports', currentDate, 'sectors', id);
        await setDoc(
          dailyDocRef,
          {
            id,
            realizado: updates.realizado,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }

      triggerToast('Dados sincronizados!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrorMessage('Não foi possível salvar. Confira sua conexão e tente de novo.');
      triggerToast('Erro ao salvar.');
    }
  };

  const handleShareScreenshot = async () => {
    if (!captureRef.current) return;

    setIsLoading(true);
    triggerToast('Gerando imagem...');

    const node = captureRef.current;
    const scrollableElements = node.querySelectorAll('.overflow-x-auto') as NodeListOf<HTMLElement>;

    try {
      scrollableElements.forEach((element) => {
        element.style.overflow = 'visible';
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const blob = await toBlob(node, {
        backgroundColor: '#020617',
        pixelRatio: 2,
        width: node.scrollWidth,
        height: node.scrollHeight,
        filter: (element) => !element.classList?.contains('no-capture'),
        style: {
          margin: '0',
        },
      });

      if (!blob) {
        triggerToast('Erro ao gerar imagem.');
        return;
      }

      const file = new File([blob], `relatorio_trocas_${currentDate}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Relatório Diário de Trocas',
            text: `Relatório do dia ${currentDate}`,
          });
          triggerToast('Compartilhado com sucesso!');
        } catch (error) {
          console.log('Compartilhamento cancelado', error);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_trocas_${currentDate}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        triggerToast('Imagem salva para enviar pelo WhatsApp!');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Erro ao capturar tela.');
    } finally {
      scrollableElements.forEach((element) => {
        element.style.overflow = '';
      });
      setIsLoading(false);
    }
  };

  const totalRealized = data.reduce((acc, curr) => acc + curr.realizado, 0);
  const totalGoal = data.reduce((acc, curr) => acc + curr.meta, 0);
  const totalVariance = totalRealized - totalGoal;
  const variancePercentage = totalGoal > 0 ? (totalVariance / totalGoal) * 100 : 0;

  return (
    <div ref={captureRef} className="min-h-screen p-1 sm:p-2 max-w-[1200px] mx-auto space-y-2 md:space-y-4 text-white relative bg-slate-950">
      <div className="bg-blur" />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-full flex items-center gap-2 border-white/20 shadow-2xl no-capture"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium">{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 relative z-10 px-1 pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
            Relatório de Trocas Diário
          </h1>
          {isLoading && (
            <div className="flex items-center gap-1 mt-0.5 text-[9px] md:text-[10px] text-cyan-400 no-capture">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sincronizando...
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 no-capture">
          <div className="glass rounded px-2 py-1 flex items-center gap-1.5 shadow-sm border-white/10 group cursor-pointer hover:bg-white/15 transition-colors relative">
            <Calendar className="w-3 h-3 text-white/60 group-hover:text-white transition-colors pointer-events-none" />
            <input
              type="date"
              value={currentDate}
              onChange={(event) => setCurrentDate(event.target.value)}
              className="bg-transparent border-none text-[10px] md:text-xs font-medium text-white/80 focus:ring-0 w-[90px] md:w-[100px] cursor-pointer outline-none [color-scheme:dark]"
            />
          </div>

          <button
            onClick={handleShareScreenshot}
            disabled={isLoading}
            className="bg-[#25D366] hover:bg-[#20b858] text-white rounded px-2.5 py-1 text-[10px] md:text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95 border border-white/20 backdrop-blur-md disabled:opacity-50"
          >
            <Camera className="w-3 h-3" />
            Capturar
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="mx-1 relative z-10 no-capture glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-red-200 border-red-400/30">
          <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative z-10 px-1">
        <KpiCard title="Total Realizado" value={formatCurrency(totalRealized)} delay={0.1} />
        <KpiCard title="Meta Total" value={formatCurrency(totalGoal)} delay={0.2} />
        <KpiCard
          title="Variação Total"
          value={formatCurrency(totalVariance)}
          subtitle={`${formatPercentage(Math.abs(variancePercentage))} ${totalVariance >= 0 ? 'acima' : 'abaixo'} da meta`}
          type="variance"
          delay={0.3}
        />
      </div>

      <div className="relative z-10">
        <DepartmentTable data={data} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
