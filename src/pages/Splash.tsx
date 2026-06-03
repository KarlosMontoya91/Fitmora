import React, { useEffect } from 'react';
import { useUserStore } from '../store/userStore';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const theme = useUserStore((state) => state.theme);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500); // 1.5 seconds presentation

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen w-full flex-col items-center justify-center p-6 relative overflow-hidden select-none transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white' 
        : 'bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-50 text-slate-900'
    }`}>
      
      {/* Background soft glowing orbs */}
      <div className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] -top-10 -left-10 transition-colors duration-500 ${
        isDark ? 'bg-brand-primary/10' : 'bg-indigo-500/5'
      }`} />
      <div className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] -bottom-10 -right-10 transition-colors duration-500 ${
        isDark ? 'bg-brand-secondary/10' : 'bg-cyan-500/5'
      }`} />

      {/* Main presentation content */}
      <div className="flex flex-col items-center text-center z-10 animate-fadeIn">
        
        {/* Mascot container with glowing ring */}
        <div className="relative mb-6 group">
          <div className={`absolute inset-0 rounded-3xl blur-md group-hover:blur-lg transition-all ${
            isDark ? 'bg-brand-primary/20' : 'bg-indigo-500/10'
          }`} />
          <img
            src={`${import.meta.env.BASE_URL}mascot.jpg`}
            alt="Fitmora Mascot"
            className={`w-36 h-36 object-cover rounded-3xl border-4 shadow-2xl relative z-10 ${
              isDark ? 'border-slate-800 bg-slate-950' : 'border-white bg-white'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Brand name */}
        <h1 className={`text-4xl font-black tracking-tight mb-2.5 ${
          isDark 
            ? 'bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent'
        }`}>
          Fitmora
        </h1>

        {/* Catching slogan */}
        <p className={`text-sm font-bold max-w-[250px] leading-relaxed tracking-wide ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Tu guía en tu nueva meta ⚡
        </p>

      </div>

      {/* Subtle loader dot animation */}
      <div className="absolute bottom-12 flex gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

    </div>
  );
};

