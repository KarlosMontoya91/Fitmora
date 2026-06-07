import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useRewardStore } from '../store/rewardStore';
import { PiggySpeechBubble } from '../components/piggy/PiggySpeechBubble';
import { LevelInfoModal } from '../components/piggy/LevelInfoModal';
import { 
  Trophy, 
  Coins, 
  Flame, 
  MapPin, 
  Lock, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Award,
  Goal,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Avatar: React.FC = () => {
  const profile = useUserStore((state) => state.profile);
  const { history } = useWorkoutStore();
  const { achievements } = useRewardStore();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'achievements'>('none');

  if (!profile) return null;

  // Calculate distance-based level stats (1 level per 5 km)
  const totalDistance = history.reduce((acc, curr) => acc + curr.distance, 0);
  const currentLevel = Math.floor(totalDistance / 5) + 1;
  const distanceInCurrentLevel = totalDistance % 5;
  const progressPercentage = (distanceInCurrentLevel / 5) * 100;
  const kmRemaining = 5 - distanceInCurrentLevel;

  // Evolution Stage
  const getPiggyImage = (lvl: number) => {
    if (lvl <= 10) return `${import.meta.env.BASE_URL}piggi_up1.png`;
    if (lvl <= 20) return `${import.meta.env.BASE_URL}piggi_up2.png`;
    if (lvl <= 30) return `${import.meta.env.BASE_URL}piggi_up3.png`;
    if (lvl <= 40) return `${import.meta.env.BASE_URL}piggi_up4.png`;
    return `${import.meta.env.BASE_URL}piggi_up5.jpg`;
  };

  const getStageTitle = (lvl: number) => {
    if (lvl <= 10) return "Etapa 1: Cochinito Pequeño y Sucio 🐷";
    if (lvl <= 20) return "Etapa 2: Cochinito Entrenador 🏃‍♂️";
    if (lvl <= 30) return "Etapa 3: Cochinito Fit Musculoso 🏋️‍♂️";
    if (lvl <= 40) return "Etapa 4: Cochinito Súper Guerrero ⚡";
    return "Etapa 5: Cochinito Campeón Supremo 🏆";
  };

  // Stats summaries
  const unlockedAchievementsCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="flex flex-col gap-5 pb-6">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">Mi Personaje</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-bold">
            Entrena para evolucionar a tu cochinito Fitmora.
          </p>
        </div>
        
        {/* Info button */}
        <button
          onClick={() => setIsInfoOpen(true)}
          className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-brand-primary dark:hover:text-brand-primaryDark transition-all active:scale-90 border-2 border-slate-100 dark:border-slate-800"
          aria-label="Ayuda e información sobre el sistema de niveles"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {/* 2. PIGGY SPEECH BUBBLE */}
      <PiggySpeechBubble />

      {/* 3. MASCOT SPOTLIGHT CARD */}
      <section className="card-game p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-slate-900 dark:to-indigo-950 border-0 shadow-xl text-white relative overflow-hidden flex flex-col items-center select-none">
        
        {/* Glowing background shapes */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl" />

        {/* Level tag top-left */}
        <div className="absolute top-4 left-4 bg-white/20 px-3 py-1 rounded-full text-xs font-black select-none tracking-wider">
          NIVEL {currentLevel}
        </div>

        {/* Coins count top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-black select-none tracking-wider">
          <Coins className="h-4 w-4 text-amber-300 fill-current animate-pulse" />
          <span>{profile.coins} Monedas</span>
        </div>

        {/* Cochinito Image with major visual protagonism */}
        <div className="relative mt-6 mb-4 group">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-110 animate-pulse-slow" />
          <img
            src={getPiggyImage(currentLevel)}
            alt="Tu personaje cochinito"
            className="w-44 h-44 md:w-52 md:h-52 object-cover rounded-full border-4 border-white shadow-2xl relative z-10 animate-bounce-slow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}mascot.jpg`;
            }}
          />
        </div>

        {/* Stage description text */}
        <div className="text-center z-10">
          <h2 className="text-base font-black uppercase tracking-wider">{profile.name}</h2>
          <p className="text-xs font-bold text-cyan-200 mt-1">
            {getStageTitle(currentLevel)}
          </p>
        </div>

        {/* Secondary stats overview bar */}
        <div className="w-full grid grid-cols-3 gap-2 border-t border-white/10 pt-4 mt-5 text-center">
          <div>
            <span className="text-[9px] font-black text-white/50 block tracking-widest leading-none">KM TOTALES</span>
            <span className="text-sm font-black mt-1 block leading-none">{totalDistance.toFixed(2)} km</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-white/50 block tracking-widest leading-none">RACHA</span>
            <span className="text-sm font-black mt-1 block leading-none flex items-center justify-center gap-0.5">
              <Flame className="h-4 w-4 text-orange-400 fill-current" />
              <span>{profile.streak} días</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] font-black text-white/50 block tracking-widest leading-none">EXPERIENCIA</span>
            <span className="text-sm font-black mt-1 block leading-none">{profile.experience} XP</span>
          </div>
        </div>

      </section>

      {/* 4. LEVEL PROGRESS TRACKER */}
      <section className="card-game flex flex-col gap-3.5">
        <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-slate-200">
          <span>Camino al Nivel {currentLevel + 1}</span>
          <span className="text-brand-primary dark:text-brand-primaryDark">{distanceInCurrentLevel.toFixed(2)} / 5.00 km</span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-750">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Meters remaining motivation */}
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center leading-relaxed mt-0.5">
          {kmRemaining > 0 ? (
            <>
              ¡Te faltan solo <span className="text-brand-primary dark:text-brand-primaryDark font-black">{kmRemaining.toFixed(2)} km</span> de entrenamiento para evolucionar! 🏆
            </>
          ) : (
            "¡Listo para evolucionar en tu siguiente sesión! 🚀"
          )}
        </p>
      </section>

      {/* 5. CHARACTER ACCESS HUB GRID */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Secciones del Personaje</h2>
        
        <div className="grid grid-cols-1 gap-3">
          
          {/* Achievements Trigger */}
          <button
            onClick={() => setActiveSection(activeSection === 'achievements' ? 'none' : 'achievements')}
            className={`flex items-center justify-between rounded-2xl border-2 p-4 transition-all text-left active:scale-[0.99] ${
              activeSection === 'achievements'
                ? 'border-brand-primary bg-indigo-50/20 dark:border-brand-primaryDark dark:bg-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <Award className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Logros del Personaje</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Tienes {unlockedAchievementsCount} de {achievements.length} logros desbloqueados</span>
              </div>
            </div>
            <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${activeSection === 'achievements' ? 'rotate-90' : ''}`} />
          </button>

          {/* Collapsed Achievements List */}
          {activeSection === 'achievements' && (
            <div className="flex flex-col gap-2.5 pl-2 border-l-2 border-slate-200 dark:border-slate-800 animate-fadeIn mt-1">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                    ach.isUnlocked 
                      ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/25 dark:bg-slate-900/10' 
                      : 'border-slate-100 bg-slate-50/30 dark:border-slate-850 dark:bg-slate-950/10 opacity-70'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                    ach.isUnlocked
                      ? 'bg-amber-400 text-white border-amber-500'
                      : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-500'
                  }`}>
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{ach.title}</span>
                      {ach.isUnlocked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-450 leading-snug mt-0.5">{ach.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shop Visual - MOCKED/PROXIMAMENTE */}
          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-950/10 opacity-70 select-none">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500 dark:bg-slate-900 dark:text-slate-500">
                <ShoppingBag className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Tienda de Atuendos</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Personalización con accesorios y skins</span>
              </div>
            </div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
              <Lock className="h-3 w-3 shrink-0" />
              <span>Próximamente</span>
            </span>
          </div>

          {/* Goals Visual - MOCKED/PROXIMAMENTE */}
          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-950/10 opacity-70 select-none">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-500 dark:bg-slate-900 dark:text-slate-500">
                <Goal className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Objetivos del Personaje</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Metas personalizadas para desbloquear multiplicadores</span>
              </div>
            </div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
              <Lock className="h-3 w-3 shrink-0" />
              <span>Próximamente</span>
            </span>
          </div>

        </div>
      </section>

      {/* Leveling explain modal */}
      <LevelInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

    </div>
  );
};
