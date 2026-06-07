import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { getPiggyMotivationMessage } from '../../utils/piggyMotivation';

export const PiggySpeechBubble: React.FC = () => {
  const profile = useUserStore((state) => state.profile);
  const { history } = useWorkoutStore();

  if (!profile) return null;

  const totalDistance = history.reduce((acc, curr) => acc + curr.distance, 0);
  const currentLevel = Math.floor(totalDistance / 5) + 1;

  const getPiggyImage = (lvl: number) => {
    if (lvl <= 10) return `${import.meta.env.BASE_URL}piggi_up1.png`;
    if (lvl <= 20) return `${import.meta.env.BASE_URL}piggi_up2.png`;
    if (lvl <= 30) return `${import.meta.env.BASE_URL}piggi_up3.png`;
    if (lvl <= 40) return `${import.meta.env.BASE_URL}piggi_up4.png`;
    return `${import.meta.env.BASE_URL}piggi_up5.jpg`;
  };

  const message = getPiggyMotivationMessage(profile, history);

  return (
    <div className="flex gap-4 items-center bg-indigo-50/40 dark:bg-slate-900/40 p-4.5 rounded-3xl border-2 border-indigo-100/20 dark:border-slate-800/60 select-none animate-fadeIn">
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-2xl blur-md bg-brand-primary/15 dark:bg-brand-primaryDark/5 scale-105" />
        <img 
          src={getPiggyImage(currentLevel)} 
          alt="Coach Cochinito" 
          className="w-16 h-16 object-cover rounded-2xl border-2 border-brand-primary bg-white z-10 relative"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}mascot.jpg`;
          }}
        />
      </div>
      <div className="relative flex-1 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-850 text-left">
        <span className="text-[9px] font-black text-brand-primary dark:text-brand-primaryDark tracking-wider uppercase block mb-1">
          Cochinito Fitmora
        </span>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
          {message}
        </p>
        {/* Triangle pointer */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white dark:border-r-slate-950" />
        {/* Double border pointer effect */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-100 dark:border-r-slate-850 -z-10" />
      </div>
    </div>
  );
};
