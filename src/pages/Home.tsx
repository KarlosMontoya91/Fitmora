import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { PiggySpeechBubble } from '../components/piggy/PiggySpeechBubble';
import { Flame, Compass, Dumbbell, MapPin, Award, ChevronRight, Play, Coins } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const history = useWorkoutStore((state) => state.history);

  const getPiggyImage = (lvl: number) => {
    if (lvl <= 10) return `${import.meta.env.BASE_URL}piggi_up1.png`;
    if (lvl <= 20) return `${import.meta.env.BASE_URL}piggi_up2.png`;
    if (lvl <= 30) return `${import.meta.env.BASE_URL}piggi_up3.png`;
    if (lvl <= 40) return `${import.meta.env.BASE_URL}piggi_up4.png`;
    return `${import.meta.env.BASE_URL}piggi_up5.jpg`;
  };

  const getStageTitle = (lvl: number) => {
    if (lvl <= 10) return "Etapa 1: Bebé";
    if (lvl <= 20) return "Etapa 2: Entrenador";
    if (lvl <= 30) return "Etapa 3: Fit";
    if (lvl <= 40) return "Etapa 4: Guerrero";
    return "Etapa 5: Campeón";
  };

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

  // Calculate distance-based level stats (1 level per 5 km)
  const totalDistance = history.reduce((acc, curr) => acc + curr.distance, 0);
  const currentLevel = Math.floor(totalDistance / 5) + 1;
  const distanceInCurrentLevel = totalDistance % 5;
  const progressPercentage = (distanceInCurrentLevel / 5) * 100;
  const kmRemaining = 5 - distanceInCurrentLevel;

  const { updateProfile } = useUserStore();
  React.useEffect(() => {
    if (profile.userLevel !== currentLevel) {
      updateProfile({ userLevel: currentLevel });
    }
  }, [profile.userLevel, currentLevel, updateProfile]);

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
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 border border-slate-200 px-3 py-1 text-slate-400 dark:bg-slate-900 dark:text-slate-650 dark:border-slate-800">
            <Flame className="h-4.5 w-4.5" />
            <span className="text-xs font-black">SIN RACHA</span>
          </div>
        )}
      </div>

      {/* 2. Gamified Level Kilometer Progression Bar */}
      <section className="card-game p-4.5 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-slate-900 dark:to-indigo-950 border-0 shadow-lg text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 font-black text-xs text-white">
              Lvl
            </div>
            <span className="text-sm font-extrabold">Nivel {currentLevel}</span>
          </div>
          <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full select-none text-slate-100">
            {distanceInCurrentLevel.toFixed(2)} / 5.00 km
          </span>
        </div>
        
        {/* Progress level track */}
        <div className="h-3.5 w-full bg-white/25 rounded-full p-0.5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-[10px] text-indigo-100 mt-2 font-bold select-none text-right">
          ¡Faltan {kmRemaining.toFixed(2)} km para subir al Nivel {currentLevel + 1}! 🏆
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

      {/* 4. Main Mascot / Character CTA Card */}
      <section className="card-game flex items-center justify-between p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full blur-md bg-brand-primary/10 scale-105" />
            <img 
              src={getPiggyImage(currentLevel)} 
              alt="Cochinito Mascota" 
              className="w-16 h-16 object-cover rounded-full border-2 border-brand-primary bg-white relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}mascot.jpg`;
              }}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-slate-400 tracking-wider">MI PERSONAJE</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase leading-tight">{profile.name}</span>
            <span className="text-[10px] text-brand-primary dark:text-brand-primaryDark font-extrabold mt-0.5">
              {getStageTitle(currentLevel)}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/avatar')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-350 hover:bg-slate-100 transition-colors active:scale-95 border-2 border-slate-150 dark:border-slate-800"
          aria-label="Ver progreso del personaje"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* 5. Piggy Speech Bubble (Coach speech bubble) */}
      <PiggySpeechBubble />

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
