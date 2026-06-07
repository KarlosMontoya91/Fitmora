import React from 'react';
import { X, HelpCircle, Trophy, Sparkles, Coins, HelpCircle as InfoIcon } from 'lucide-react';

interface LevelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[420px] rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-brand-primary dark:text-brand-primaryDark">
            <InfoIcon className="h-5 w-5" />
            <h3 className="text-base font-black uppercase tracking-wider">Sistema de Niveles</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 text-xs font-bold leading-relaxed text-slate-650 dark:text-slate-300">
          
          {/* Rule 1 */}
          <div className="flex gap-3">
            <span className="text-lg shrink-0 select-none">🏃‍♂️</span>
            <div>
              <p className="font-black text-slate-850 dark:text-slate-100">5 km = 1 Nivel</p>
              <p className="text-[11px] text-slate-450 mt-0.5">Subes un nivel por cada 5 kilómetros reales recorridos en la app. Los niveles aumentan de uno en uno.</p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3">
            <span className="text-lg shrink-0 select-none">🐷</span>
            <div>
              <p className="font-black text-slate-850 dark:text-slate-100">Evolución cada 10 niveles</p>
              <p className="text-[11px] text-slate-450 mt-0.5">El aspecto físico del cochinito cambia de etapa visual según tu nivel acumulado:</p>
              
              {/* Stages List */}
              <div className="mt-2 grid grid-cols-1 gap-1.5 pl-2 border-l-2 border-indigo-100 dark:border-slate-800 text-[10px]">
                <div>• <span className="font-extrabold">Etapa 1 (Niveles 1-10):</span> Pequeño y sucio</div>
                <div>• <span className="font-extrabold">Etapa 2 (Niveles 11-20):</span> Con banda deportiva</div>
                <div>• <span className="font-extrabold">Etapa 3 (Niveles 21-30):</span> Musculoso fit</div>
                <div>• <span className="font-extrabold">Etapa 4 (Niveles 31-40):</span> Súper guerrero</div>
                <div>• <span className="font-extrabold">Etapa 5 (Niveles 41+):</span> Campeón militar</div>
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3">
            <span className="text-lg shrink-0 select-none">💰</span>
            <div>
              <p className="font-black text-slate-850 dark:text-slate-100">Gana Monedas de Fitmora</p>
              <p className="text-[11px] text-slate-450 mt-0.5">Cada sesión de entrenamiento completada te otorga monedas virtuales en función de la distancia y el tiempo.</p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3">
            <span className="text-lg shrink-0 select-none">🛍️</span>
            <div>
              <p className="font-black text-slate-850 dark:text-slate-100">Tienda y Personalización</p>
              <p className="text-[11px] text-slate-450 mt-0.5 text-brand-primary dark:text-brand-primaryDark">Próximamente podrás gastar tus monedas para comprar accesorios, ropas y nuevos avatares para tu personaje.</p>
            </div>
          </div>

        </div>

        {/* Footer Button */}
        <div className="mt-6">
          <button 
            onClick={onClose}
            className="btn-game-primary w-full py-3 text-xs font-black shadow-md"
            style={{ boxShadow: 'none' }}
          >
            ¡ENTENDIDO!
          </button>
        </div>

      </div>
    </>
  );
};
