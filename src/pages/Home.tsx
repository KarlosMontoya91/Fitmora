import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useAvatarStore } from '../store/avatarStore';
import { AvatarVisual } from '../components/avatar/AvatarVisual';
import { Flame, Compass, Dumbbell, MapPin, Award, ChevronRight, Play } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const history = useWorkoutStore((state) => state.history);
  const avatarConfig = useAvatarStore((state) => state.config);

  if (!profile) return null;

  // Calculate today's stats from history
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkouts = history.filter((w) => w.date.startsWith(todayStr));
  
  const todayKm = todayWorkouts.reduce((acc, curr) => acc + curr.distance, 0);
  const todayMin = Math.round(todayWorkouts.reduce((acc, curr) => acc + curr.duration, 0) / 60);
  const todayKcal = todayWorkouts.reduce((acc, curr) => acc + curr.calories, 0);

  // Time-aware greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return '¡Buenos días';
    if (hours < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Gamified XP bar values
  const currentXP = profile.experience;
  // Calculate relative XP for this specific level (e.g. if level 2 and total XP is 1200, relative XP is 200/2000)
  // Our userStore formula is: total XP increases, level requirement is level * 1000.
  // Let's find the current level base XP
  let prevLevelsXP = 0;
  for (let i = 1; i < profile.userLevel; i++) {
    prevLevelsXP += i * 1000;
  }
  const relativeXP = currentXP - prevLevelsXP;
  const relativeXPRequired = profile.userLevel * 1000;
  const xpPercent = Math.min(100, Math.max(0, (relativeXP / relativeXPRequired) * 100));

  // Motivator based on favorite activity
  const getFavoriteMotivator = () => {
    switch (profile.favoriteWorkout) {
      case 'treadmill': return '¿Listo para conquistar la caminadora hoy? 👟';
      case 'bike': return '¡A pedalear con toda la intensidad hoy! 🚴‍♂️';
      case 'gps': return 'El aire libre te espera para sumar kilómetros. 🗺️';
      default: return '¡Hoy es un gran día para mover el cuerpo! ⚡';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Header Greeting & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">
            {getGreeting()}, <span className="text-brand-primary dark:text-brand-primaryDark">{profile.name}</span>!
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-bold">
            {getFavoriteMotivator()}
          </p>
        </div>
        
        {/* Flame status indicator badge */}
        {profile.streak > 0 ? (
          <div className="flex items-center gap-1 rounded-2xl bg-orange-100 border border-orange-200 px-3 py-1 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/30 animate-pulse-slow">
            <Flame className="h-4.5 w-4.5 fill-current" />
            <span className="text-xs font-black">RACHA X{profile.streak}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 border border-slate-200 px-3 py-1 text-slate-400 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800">
            <Flame className="h-4.5 w-4.5" />
            <span className="text-xs font-black">SIN RACHA</span>
          </div>
        )}
      </div>

      {/* 2. Gamified Level XP Progression Bar */}
      <section className="card-game p-4.5 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-slate-900 dark:to-indigo-950 border-0 shadow-lg text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 font-black text-xs text-white">
              Lvl
            </div>
            <span className="text-sm font-extrabold">Nivel {profile.userLevel}</span>
          </div>
          <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full select-none text-slate-100">
            {Math.round(relativeXP)} / {relativeXPRequired} XP
          </span>
        </div>
        
        {/* Progress level track */}
        <div className="h-3.5 w-full bg-white/25 rounded-full p-0.5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        
        <p className="text-[10px] text-indigo-100 mt-2 font-bold select-none text-right">
          ¡Faltan {Math.round(relativeXPRequired - relativeXP)} XP para subir al Nivel {profile.userLevel + 1}! 🏆
        </p>
      </section>

      {/* 3. Daily Summary Panel */}
      <section className="card-game flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Mi Progreso de Hoy</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {/* KM */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100/30 dark:border-slate-800/30">
            <span className="text-xl font-black text-brand-primary dark:text-brand-primaryDark">{todayKm.toFixed(2)}</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">KILÓMETROS</span>
          </div>
          {/* MIN */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50/50 dark:bg-slate-800/40 border border-cyan-100/30 dark:border-slate-800/30">
            <span className="text-xl font-black text-brand-secondary dark:text-brand-secondaryDark">{todayMin}</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">MINUTOS</span>
          </div>
          {/* KCAL */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50/50 dark:bg-slate-800/40 border border-orange-100/30 dark:border-slate-800/30">
            <span className="text-xl font-black text-brand-energy dark:text-brand-energyDark">{todayKcal}</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">CALORÍAS</span>
          </div>
        </div>
      </section>

      {/* 4. Main Avatar CTA Card */}
      <section className="card-game flex items-center justify-between p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <AvatarVisual config={avatarConfig} size={80} animate={true} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 tracking-wider">TU AVATAR</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{profile.name}</span>
            <span className="text-[10px] text-brand-secondary dark:text-brand-secondaryDark font-extrabold mt-0.5">
              💰 {profile.coins} monedas
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/avatar')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-350 hover:bg-slate-100 transition-colors active:scale-95 border-2 border-slate-150 dark:border-slate-800"
          aria-label="Ir a personalizar avatar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* Coach Mora Motivational Widget */}
      <section className="card-game p-4 flex gap-4 items-center bg-amber-50/50 dark:bg-slate-900/50 border border-amber-200/40 dark:border-slate-800/40 animate-fadeIn select-none">
        <img 
          src="/mascot.jpg" 
          alt="Coach Mora" 
          className="w-16 h-16 object-cover rounded-2xl border-2 border-brand-primary bg-white shadow shrink-0"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-black text-brand-primary dark:text-brand-primaryDark tracking-wider">CONSEJO DEL COACH MORA</span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
            {todayKm > 0 
              ? `¡Excelente trabajo recorriendo ${todayKm.toFixed(1)} km hoy! Sigue así para cuidar tu salud y ganar más monedas.`
              : '¿Hoy es día de caminadora, rodillo o exterior? Conecta tus sensores Bluetooth o enciende el GPS y ganemos experiencia juntos.'
            }
          </p>
        </div>
      </section>

      {/* 5. Giant Primary CTA Workout Button */}
      <div className="w-full flex justify-center py-1">
        <button
          onClick={() => navigate('/workouts')}
          className="btn-game-primary w-full py-4 text-lg font-black flex items-center justify-center gap-3 tracking-wider"
        >
          <Play className="h-5 w-5 fill-current animate-pulse text-white" />
          <span>¡INICIAR ENTRENAMIENTO!</span>
        </button>
      </div>

      {/* 6. Quick Workout Access Shortcuts */}
      <section className="flex flex-col gap-3.5">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Accesos Rápidos</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Treadmill */}
          <button
            onClick={() => navigate('/workout-active/treadmill')}
            className="flex items-center gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-left transition-all active:scale-97 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Caminadora</span>
              <span className="text-[9px] text-slate-400">Smart Band</span>
            </div>
          </button>

          {/* Bike */}
          <button
            onClick={() => navigate('/workout-active/bike')}
            className="flex items-center gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-left transition-all active:scale-97 group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Bicicleta</span>
              <span className="text-[9px] text-slate-400">Cadencia RPM</span>
            </div>
          </button>

          {/* Outdoor GPS */}
          <button
            onClick={() => navigate('/workout-active/gps')}
            className="flex items-center gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-left transition-all active:scale-97 group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">GPS Exterior</span>
              <span className="text-[9px] text-slate-400">Al aire libre</span>
            </div>
          </button>

          {/* Achievements */}
          <button
            onClick={() => navigate('/avatar?tab=rewards')}
            className="flex items-center gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-left transition-all active:scale-97 group"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Logros</span>
              <span className="text-[9px] text-slate-400">Skins & Medallas</span>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};
