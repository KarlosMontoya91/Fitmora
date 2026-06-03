import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 1500); // 1.5 seconds presentation

    return () => clearTimeout(timer);
  }, [isOnboarded, navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-6 relative overflow-hidden select-none">
      
      {/* Background soft glowing orb */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-primary/10 blur-[100px] -top-10 -left-10" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-secondary/10 blur-[100px] -bottom-10 -right-10" />

      {/* Main presentation content */}
      <div className="flex flex-col items-center text-center z-10 animate-fadeIn">
        
        {/* Mascot container with glowing ring */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-3xl bg-brand-primary/20 blur-md group-hover:blur-lg transition-all" />
          <img
            src="/mascot.jpg"
            alt="Fitmora Mascot"
            className="w-36 h-36 object-cover rounded-3xl border-4 border-slate-800 bg-slate-950 shadow-2xl relative z-10"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent mb-2.5">
          Fitmora
        </h1>

        {/* Catching slogan */}
        <p className="text-sm font-bold text-slate-400 max-w-[250px] leading-relaxed tracking-wide">
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
