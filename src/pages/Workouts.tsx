import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { WORKOUT_PLANS } from '../data/workoutPlans';
import type { WorkoutPlan } from '../types/workout';
import { Dumbbell, Compass, MapPin, Play, ChevronRight, X, Sparkles } from 'lucide-react';

export const Workouts: React.FC = () => {
  const navigate = useNavigate();
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  const [activeTab, setActiveTab] = useState<'free' | 'plans'>('free');
  
  // Free Mode parameters
  const [selectedType, setSelectedType] = useState<'treadmill' | 'bike' | 'gps'>('treadmill');
  const [goalType, setGoalType] = useState<'none' | 'time' | 'distance' | 'calories'>('none');
  const [goalValue, setGoalValue] = useState<number>(30); // 30 mins, 5 km, 300 kcal

  // Plan Details drawer modal
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const handleStartFreeWorkout = () => {
    // Save custom goals in store or direct navigate. Since the userStore/workoutStore holds active session,
    // we start workout and pass optional metrics.
    startWorkout(selectedType);
    
    // Pass goals via navigate state
    navigate(`/workout-active/${selectedType}`, {
      state: {
        goalType,
        goalValue: goalType === 'none' ? 0 : goalValue
      }
    });
  };

  const handleStartPlanWorkout = (plan: WorkoutPlan) => {
    startWorkout(plan.type, plan.id);
    setSelectedPlan(null);
    navigate(`/workout-active/${plan.type}`);
  };

  // Quick values helper based on goal type
  const handleSetGoalType = (type: typeof goalType) => {
    setGoalType(type);
    if (type === 'time') setGoalValue(30); // 30 minutes
    if (type === 'distance') setGoalValue(5); // 5 kilometers
    if (type === 'calories') setGoalValue(300); // 300 kcal
  };

  const getDifficultyColor = (diff: WorkoutPlan['difficulty']) => {
    switch (diff) {
      case 'beginner': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'intermediate': return 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30';
      case 'advanced': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
  };

  const getPlanTypeIcon = (type: WorkoutPlan['type']) => {
    switch (type) {
      case 'treadmill': return Dumbbell;
      case 'bike': return Compass;
      case 'gps': return MapPin;
    }
  };

  return (
    <div className="flex flex-col gap-5 relative">
      
      {/* 1. Header Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Entrenamientos</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Comienza un entrenamiento libre o elige un plan guiado de intervalos.</p>
      </div>

      {/* 2. Flat Tab Toggle Buttons (Duolingo Style) */}
      <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('free')}
          className={`flex-1 rounded-xl py-2 text-center text-xs font-black transition-all ${
            activeTab === 'free'
              ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
              : 'text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          MODO LIBRE
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 rounded-xl py-2 text-center text-xs font-black transition-all ${
            activeTab === 'plans'
              ? 'bg-white text-brand-primary shadow dark:bg-slate-800 dark:text-brand-primaryDark'
              : 'text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          PLANES GUIADOS
        </button>
      </div>

      {/* TAB CONTENT: FREE MODE */}
      {activeTab === 'free' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* A. Activity Selector Card */}
          <section className="card-game flex flex-col gap-3">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">1. Elige tu Actividad</h2>
            
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'treadmill', label: 'Caminadora', icon: Dumbbell, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400' },
                { id: 'bike', label: 'Bicicleta', icon: Compass, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400' },
                { id: 'gps', label: 'GPS Exterior', icon: MapPin, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedType(item.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-97 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5 dark:border-brand-primaryDark dark:bg-brand-primaryDark/5'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-1.5 ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* B. Goal Selector Card */}
          <section className="card-game flex flex-col gap-3">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">2. Configura tu Objetivo</h2>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Libre' },
                { id: 'time', label: 'Tiempo' },
                { id: 'distance', label: 'Distancia' },
                { id: 'calories', label: 'Calorías' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSetGoalType(item.id as any)}
                  className={`rounded-xl py-2.5 text-center text-[10px] font-bold border transition-all ${
                    goalType === item.id
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-black dark:border-brand-primaryDark dark:bg-brand-primaryDark/5'
                      : 'border-slate-250 bg-white text-slate-500 dark:border-slate-850 dark:bg-slate-900/30 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Slider to adjust objective amount (if not 'none') */}
            {goalType !== 'none' && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-4.5 dark:bg-slate-900/55 border border-slate-100 dark:border-slate-800/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-450 uppercase">Cantidad Objetivo</span>
                  <span className="text-sm font-extrabold text-brand-primary dark:text-brand-primaryDark">
                    {goalType === 'time' && `${goalValue} Minutos ⏱️`}
                    {goalType === 'distance' && `${goalValue} Kilómetros 👟`}
                    {goalType === 'calories' && `${goalValue} Kcal 🔥`}
                  </span>
                </div>
                
                <input
                  type="range"
                  min={goalType === 'time' ? '5' : goalType === 'distance' ? '1' : '50'}
                  max={goalType === 'time' ? '180' : goalType === 'distance' ? '42' : '1500'}
                  step={goalType === 'time' ? '5' : goalType === 'distance' ? '0.5' : '50'}
                  value={goalValue}
                  onChange={(e) => setGoalValue(Number(e.target.value))}
                  className="w-full accent-brand-primary dark:accent-brand-primaryDark"
                />
              </div>
            )}
          </section>

          {/* C. CTA Start workout */}
          <div className="w-full flex justify-center py-1.5">
            <button
              onClick={handleStartFreeWorkout}
              className="btn-game-primary w-full py-4 text-sm font-black flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>INICIAR SESIÓN LIBRE</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GUIDED PLANS */}
      {activeTab === 'plans' && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          {WORKOUT_PLANS.map((plan) => {
            const Icon = getPlanTypeIcon(plan.type);
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="card-game flex items-center justify-between cursor-pointer border-2 hover:border-slate-350 dark:hover:border-slate-700 transition-all active:scale-99"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-brand-primary dark:text-brand-primaryDark">
                    <Icon className="h-5.5 w-5.5 stroke-[2.3]" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full w-max font-bold mb-1 uppercase ${getDifficultyColor(plan.difficulty)}`}>
                      {plan.difficulty === 'beginner' ? 'PRINCIPIANTE' : plan.difficulty === 'intermediate' ? 'INTERMEDIO' : 'AVANZADO'}
                    </span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-250 leading-tight">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">
                      ⏱️ {plan.steps.reduce((acc, c) => acc + (c.minuteEnd - c.minuteStart), 0)} min • 📆 {plan.durationDays} días
                    </span>
                  </div>
                </div>

                <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 dark:bg-slate-800/50">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PLAN DETAILS DRAWER MODAL */}
      {selectedPlan && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPlan(null)} />
          
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] border-t-4 border-brand-primary bg-white p-6 shadow-2xl dark:border-brand-primaryDark dark:bg-slate-950 max-h-[85vh] overflow-y-auto w-full max-w-md mx-auto animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[9px] border px-2 py-0.5 rounded-full w-max font-black mb-1 uppercase ${getDifficultyColor(selectedPlan.difficulty)}`}>
                  {selectedPlan.difficulty}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                  {selectedPlan.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800"
                aria-label="Cerrar detalles"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              {selectedPlan.description}
            </p>

            {/* Plan Info Boxes */}
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Duración Total</span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  ⏱️ {selectedPlan.steps.reduce((acc, c) => acc + (c.minuteEnd - c.minuteStart), 0)} Minutos
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Objetivo del Plan</span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  🏆 Completa {selectedPlan.durationDays} Días
                </p>
              </div>
            </div>

            {/* Steps Timeline Breakdown */}
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5">Cronograma de Intervalos</h4>
            <div className="flex flex-col gap-3.5 border-l-4 border-indigo-100 dark:border-slate-800 pl-4 mb-6">
              {selectedPlan.steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col">
                  {/* Circle indicator */}
                  <span className="absolute -left-[22px] top-0.5 h-3 w-3 rounded-full bg-brand-primary dark:bg-brand-primaryDark border-2 border-white dark:border-slate-950" />
                  
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                      {step.label}
                    </span>
                    <span className="text-[10px] font-black text-brand-secondary dark:text-brand-secondaryDark">
                      {step.minuteStart} - {step.minuteEnd} Min
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">
                    {selectedPlan.type === 'treadmill' && `Velocidad sugerida: ${step.targetSpeed} km/h • Inclinación: ${step.targetIncline}%`}
                    {selectedPlan.type === 'bike' && `Velocidad: ${step.targetSpeed} km/h • Cadencia RPM: ${step.targetCadence}`}
                    {selectedPlan.type === 'gps' && `Velocidad objetivo: ${step.targetSpeed} km/h`}
                  </span>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <button
              onClick={() => handleStartPlanWorkout(selectedPlan)}
              className="btn-game-primary w-full py-3.5 text-sm font-black flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>EMPEZAR PLAN AHORA</span>
            </button>

          </div>
        </>
      )}

    </div>
  );
};
