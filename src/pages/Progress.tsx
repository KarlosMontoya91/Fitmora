import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import type { WorkoutSession } from '../types/workout';
import type { Achievement } from '../types/reward';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Award, Trophy, Dumbbell, Compass, MapPin, CheckCircle2, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Progress: React.FC = () => {
  const location = useLocation();

  // Stores
  const { history } = useWorkoutStore();
  const { profile, theme } = useUserStore();

  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  
  // Post-workout state
  const [sessionSummary, setSessionSummary] = useState<WorkoutSession | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  useEffect(() => {
    // Check if redirected from a finished workout session
    if (location.state?.sessionSummary) {
      setSessionSummary(location.state.sessionSummary);
      setUnlockedBadges(location.state.unlockedList || []);
      
      // Clear navigation state to prevent re-triggering victory on refresh
      window.history.replaceState({}, document.title);
      
      // Fire double confetti!
      confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      }, 400);
    }
  }, [location]);

  if (!profile) return null;

  // Format active workout stopwatch time (hh:mm:ss)
  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 
      ? `${h}h ${m}m` 
      : `${m} min ${s}s`;
  };

  // Convert speed to pace min/km
  const getPace = (speedKmh: number) => {
    if (speedKmh <= 0.5) return '--:--';
    const paceMin = 60 / speedKmh;
    const mins = Math.floor(paceMin);
    const secs = Math.round((paceMin - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Prepare chart data based on filter
  const getChartData = () => {
    // Return mock data for clean demo, combined with actual history if present!
    const data: any[] = [];
    const today = new Date();

    if (filter === 'week') {
      const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        // Find workouts in history
        const dayWorkouts = history.filter(w => w.date.startsWith(dayStr));
        const distance = dayWorkouts.reduce((acc, curr) => acc + curr.distance, 0);
        const calories = dayWorkouts.reduce((acc, curr) => acc + curr.calories, 0);

        data.push({
          name: weekdays[d.getDay()],
          distancia: Number((distance || (i === 4 ? 4.2 : i === 2 ? 3.5 : 0)).toFixed(1)),
          calorias: calories || (i === 4 ? 220 : i === 2 ? 180 : 0),
        });
      }
    } else if (filter === 'month') {
      for (let i = 29; i >= 0; i -= 3) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        // Find workouts in history
        const dayWorkouts = history.filter(w => w.date.startsWith(dayStr));
        const distance = dayWorkouts.reduce((acc, curr) => acc + curr.distance, 0);
        const calories = dayWorkouts.reduce((acc, curr) => acc + curr.calories, 0);

        data.push({
          name: `${d.getDate()}/${d.getMonth()+1}`,
          distancia: Number((distance || (i % 9 === 0 ? 5.2 : i % 6 === 0 ? 2.0 : 0)).toFixed(1)),
          calorias: calories || (i % 9 === 0 ? 300 : i % 6 === 0 ? 120 : 0),
        });
      }
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(today.getMonth() - i);
        const monthIndex = d.getMonth();
        
        // Match history
        const monthWorkouts = history.filter(w => new Date(w.date).getMonth() === monthIndex);
        const distance = monthWorkouts.reduce((acc, curr) => acc + curr.distance, 0);
        const calories = monthWorkouts.reduce((acc, curr) => acc + curr.calories, 0);

        data.push({
          name: months[monthIndex],
          distancia: Number((distance || (i === 3 ? 15.0 : i === 2 ? 22.0 : i === 1 ? 12.5 : 0)).toFixed(1)),
          calorias: calories || (i === 3 ? 800 : i === 2 ? 1200 : i === 1 ? 700 : 0),
        });
      }
    }
    return data;
  };

  const chartData = getChartData();

  // Aggregate stats totals for cards
  const totalDistance = history.reduce((acc, cur) => acc + cur.distance, 0);
  const totalWorkouts = history.length;
  const totalCalories = history.reduce((acc, cur) => acc + cur.calories, 0);

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* 1. Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Progreso</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Visualiza tus estadísticas acumuladas y tu historial médico.</p>
      </div>

      {/* 2. Global stats overview counters */}
      <section className="grid grid-cols-3 gap-3">
        <div className="card-game p-3.5 text-center">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 tracking-wider block">KILÓMETROS</span>
          <span className="text-xl font-black text-brand-primary dark:text-brand-primaryDark mt-1 block">
            {totalDistance.toFixed(1)}
          </span>
          <span className="text-[9px] text-slate-405 mt-0.5 block font-bold">TOTALES</span>
        </div>
        <div className="card-game p-3.5 text-center">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 tracking-wider block">SESIONES</span>
          <span className="text-xl font-black text-brand-secondary dark:text-brand-secondaryDark mt-1 block">
            {totalWorkouts}
          </span>
          <span className="text-[9px] text-slate-405 mt-0.5 block font-bold">COMPLETADAS</span>
        </div>
        <div className="card-game p-3.5 text-center">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 tracking-wider block">CALORÍAS</span>
          <span className="text-xl font-black text-brand-energy dark:text-brand-energyDark mt-1 block">
            {Math.round(totalCalories)}
          </span>
          <span className="text-[9px] text-slate-405 mt-0.5 block font-bold font-black">KCAL</span>
        </div>
      </section>

      {/* 3. Recharts Graphical Trends */}
      <section className="card-game flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Tendencia de Actividad</h2>
          
          {/* Chart selector filters */}
          <div className="flex gap-1.5 rounded-xl bg-slate-50 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {(['week', 'month', 'year'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition-all uppercase ${
                  filter === opt
                    ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opt === 'week' ? 'Sem' : opt === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
              <YAxis stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                  borderRadius: '12px',
                  color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                  fontSize: '11px',
                  fontFamily: 'Outfit, sans-serif'
                }}
              />
              <Area type="monotone" dataKey="distancia" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDist)" name="Distancia (km)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Weight Tracking History Card */}
      <section className="card-game flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Control de Peso</h2>
          <span className="text-[10px] text-brand-secondary dark:text-brand-secondaryDark font-extrabold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Meta: {profile.weight - 5} kg
          </span>
        </div>

        {/* Current Weight Display */}
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
          <div className="flex flex-col flex-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{profile.weight} kg</span>
            <span className="text-[9px] font-black text-slate-400 tracking-wider">PESO ACTUAL REGISTRADO</span>
          </div>
          
          {/* Simple historical line */}
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex flex-col items-end">
            <span>IMC: {((profile.weight / Math.pow(profile.height/100, 2)).toFixed(1))}</span>
            <span className="text-[9px] text-slate-400 mt-0.5">ESTADO: SALUDABLE</span>
          </div>
        </div>
      </section>

      {/* 5. Historical Sessions Lists */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Historial de Sesiones</h2>
        
        {history.length === 0 ? (
          <div className="card-game py-8 text-center text-xs text-slate-400 dark:text-slate-650">
            Aún no has completado entrenamientos. ¡Inicia uno para ver tu historial! 👟
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((sess) => (
              <div 
                key={sess.id}
                className="card-game p-3.5 flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-white/70 backdrop-blur-sm dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    sess.type === 'treadmill' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                    : sess.type === 'bike' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  }`}>
                    {sess.type === 'treadmill' && <Dumbbell className="h-4.5 w-4.5" />}
                    {sess.type === 'bike' && <Compass className="h-4.5 w-4.5" />}
                    {sess.type === 'gps' && <MapPin className="h-4.5 w-4.5" />}
                    {sess.type === 'free' && <Dumbbell className="h-4.5 w-4.5" />}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                      {sess.planName || (sess.type === 'treadmill' ? 'Caminadora Libre' : sess.type === 'bike' ? 'Bici Libre' : 'GPS Libre')}
                    </span>
                    <span className="text-[9px] text-slate-450 font-bold mt-0.5 uppercase">
                      📆 {new Date(sess.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • ⏱️ {Math.round(sess.duration / 60)} min
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-center">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">
                    +{sess.distance.toFixed(1)} km
                  </span>
                  <span className="text-[9px] font-extrabold text-brand-secondary dark:text-brand-secondaryDark mt-1">
                    💰 +{sess.coinsEarned} • 🏆 +{sess.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. POST-WORKOUT VICTORY DRAWER OVERLAY (CONFETTI AND REWARDS CELEBRATION) */}
      {sessionSummary && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" onClick={() => setSessionSummary(null)} />
          
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] border-t-4 border-emerald-500 bg-white p-6 shadow-2xl dark:border-brand-successDark dark:bg-slate-950 max-h-[90vh] overflow-y-auto w-full max-w-md mx-auto animate-slideUp text-center">
            
            {/* Celebration Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3 animate-bounce">
              <Trophy className="h-7 w-7 stroke-[2.3]" />
            </div>

            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              ¡Entrenamiento Completado! 🎉🏆
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] mx-auto leading-tight">
              ¡Increíble esfuerzo! Completaste tu sesión y tus estadísticas han sido guardadas.
            </p>

            {/* Victory metrics layout */}
            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="rounded-2xl bg-slate-50 p-3.5 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-450 font-bold block uppercase leading-none">Distancia Recorrida</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                  {sessionSummary.distance} km
                </p>
                <span className="text-[9px] text-slate-400">PASOS Y TRACCIÓN</span>
              </div>
              
              <div className="rounded-2xl bg-slate-50 p-3.5 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-450 font-bold block uppercase leading-none">Tiempo Entrenado</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                  {formatDuration(sessionSummary.duration)}
                </p>
                <span className="text-[9px] text-slate-400">CRONÓMETRO</span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-450 font-bold block uppercase leading-none">Calorías Estimadas</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                  {sessionSummary.calories} kcal
                </p>
                <span className="text-[9px] text-slate-400">MET QUEMADOS</span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-450 font-bold block uppercase leading-none">Ritmo Promedio</span>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                  {getPace(sessionSummary.avgSpeed)} /km
                </p>
                <span className="text-[9px] text-slate-400">TIEMPO POR KM</span>
              </div>
            </div>

            {/* Virtual Currency and XP awards layout */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border-2 border-emerald-500/20 p-4.5 text-center flex items-center justify-around mb-5">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-450 uppercase">Monedas Ganadas</span>
                <span className="text-lg font-black text-amber-500 flex items-center gap-1 mt-1">
                  💰 +{sessionSummary.coinsEarned}
                </span>
              </div>
              <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-450 uppercase">Experiencia Recibida</span>
                <span className="text-lg font-black text-indigo-500 flex items-center gap-1 mt-1">
                  🏆 +{sessionSummary.xpEarned} XP
                </span>
              </div>
            </div>

            {/* Unlocked Badges list (if any) */}
            {unlockedBadges.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2.5">🏆 ¡LOGROS DESBLOQUEADOS EN ESTA SESIÓN!</h4>
                <div className="flex flex-col gap-2">
                  {unlockedBadges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-left dark:bg-amber-950/20 dark:border-amber-900/30"
                    >
                      <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-amber-800 dark:text-amber-400">{badge.title}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{badge.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acknowledge Button */}
            <button
              onClick={() => setSessionSummary(null)}
              className="btn-game-primary w-full py-3.5 text-sm font-black flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>CERRAR Y VER ANÁLISIS DE PROGRESO</span>
            </button>

          </div>
        </>
      )}

    </div>
  );
};
