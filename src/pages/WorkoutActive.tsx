import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { useUserStore } from '../store/userStore';
import { useRewardStore } from '../store/rewardStore';
import { WORKOUT_PLANS } from '../data/workoutPlans';
import { Dumbbell, Compass, MapPin, Play, Pause, Square, Bluetooth, BluetoothSearching, Wifi, Volume2, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorkoutActive: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Stores
  const {
    activeWorkout,
    isPaused,
    bluetoothConnected,
    bluetoothSearching,
    gpsSignal,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    tick,
    finishWorkout,
    discardWorkout,
    changeSpeed,
    changeIncline,
    changeCadence,
    startBluetoothSearch,
    disconnectBluetooth,
  } = useWorkoutStore();

  const { profile } = useUserStore();
  const { checkAchievements } = useRewardStore();

  // Route state custom objectives
  const goalType = location.state?.goalType || 'none';
  const goalValue = location.state?.goalValue || 0;

  // Local active timers
  const timerRef = useRef<any | null>(null);
  const motivatorTimerRef = useRef<any | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [motivatorMessage, setMotivatorMessage] = useState('¡A darle con todo hoy! ⚡');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Motivational messages
  const MOTIVATORS = [
    '¡Vas excelente, mantén el ritmo! 💪',
    'Tu esfuerzo está rindiendo frutos. 🌟',
    'Respira profundo y mantén una postura firme. 🧘‍♂️',
    '¡La racha sigue viva, no te detengas! 🔥',
    'Cada paso cuenta para tu meta. 📈',
    'Estás quemando calorías y ganando salud. ❤️',
    '¡Haciendo que tu avatar se sienta orgulloso! 🎮',
    '¡Increíble trabajo! ¡Sigue sumando! 👟',
  ];

  // Initialize workout if not already started
  useEffect(() => {
    if (!activeWorkout) {
      // Start free workout of specified type
      startWorkout((type as any) || 'free');
    }

    // Set interval ticker (ticks every 1 second)
    timerRef.current = setInterval(() => {
      tick();
    }, 1000);

    // Rotate motivational comments every 20 seconds
    motivatorTimerRef.current = setInterval(() => {
      const idx = Math.floor(Math.random() * MOTIVATORS.length);
      setMotivatorMessage(MOTIVATORS[idx]);
    }, 20000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (motivatorTimerRef.current) clearInterval(motivatorTimerRef.current);
    };
  }, [type, activeWorkout]);

  // Handle active map drawer for GPS mode
  useEffect(() => {
    if (activeWorkout?.type === 'gps' && canvasRef.current && activeWorkout.route.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Backdrop
      ctx.strokeStyle = theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw route path
      ctx.strokeStyle = '#22D3EE'; // brand secondary dark cyan
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const routePoints = activeWorkout.route;
      const startPoint = routePoints[0];

      ctx.beginPath();
      routePoints.forEach((point, idx) => {
        // Map GPS differences to canvas pixels relative to start coordinates
        const x = canvas.width / 2 + (point.lng - startPoint.lng) * 90000;
        const y = canvas.height / 2 - (point.lat - startPoint.lat) * 90000;
        
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw current marker
      if (routePoints.length > 0) {
        const lastPoint = routePoints[routePoints.length - 1];
        const lastX = canvas.width / 2 + (lastPoint.lng - startPoint.lng) * 90000;
        const lastY = canvas.height / 2 - (lastPoint.lat - startPoint.lat) * 90000;

        ctx.fillStyle = '#4F46E5'; // primary indigo
        ctx.beginPath();
        ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    }
  }, [activeWorkout?.route, activeWorkout?.type]);

  if (!activeWorkout || !profile) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="text-slate-450 dark:text-slate-500">Iniciando entrenamiento... ⚡</div>
      </div>
    );
  }

  const theme = useUserStore.getState().theme;

  // Format stopwatch time (mm:ss or hh:mm:ss)
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  // Handle workout finalization
  const handleFinish = () => {
    // 1. Finish store action
    const session = finishWorkout();
    if (session) {
      // 2. Check achievements
      // We gather overall values
      const workoutCount = useWorkoutStore.getState().history.length;
      const totalDistance = useWorkoutStore.getState().history.reduce((acc, c) => acc + c.distance, 0);
      const streakDays = profile.streak;

      const { unlockedList } = checkAchievements({
        totalDistance,
        weeklyDistance: totalDistance, // simplified
        streakDays,
        workoutCount,
        completedPlansCount: session.planId ? 1 : 0,
        latestWorkoutType: session.type,
      });

      // 3. Trigger celebration confetti explosion
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.5 }
      });

      // 4. Redirect to victory summary screen
      navigate('/progress', {
        state: {
          sessionSummary: session,
          unlockedList,
        }
      });
    }
  };

  const handleDiscard = () => {
    discardWorkout();
    navigate('/workouts');
  };

  // Guided plans helper
  const plan = activeWorkout.planId ? WORKOUT_PLANS.find(p => p.id === activeWorkout.planId) : null;
  const currentStep = plan ? plan.steps[activeWorkout.currentStepIndex] : null;

  // Effort zone (Heart rate)
  const getEffortZone = (hr: number) => {
    if (hr < 100) return { name: 'Recuperación', color: 'text-slate-400 dark:text-slate-500' };
    if (hr < 130) return { name: 'Quema Grasa', color: 'text-emerald-500 dark:text-emerald-400' };
    if (hr < 150) return { name: 'Aeróbico', color: 'text-cyan-500 dark:text-cyan-400' };
    if (hr < 170) return { name: 'Anaeróbico', color: 'text-orange-500 dark:text-orange-400' };
    return { name: 'Esfuerzo Máximo', color: 'text-rose-500 dark:text-rose-400 animate-pulse' };
  };

  const zone = getEffortZone(activeWorkout.heartRate);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white p-4 justify-between select-none relative">
      
      {/* 1. TOP STATUS PANEL */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {activeWorkout.type === 'treadmill' && <Dumbbell className="h-5 w-5 text-indigo-400" />}
          {activeWorkout.type === 'bike' && <Compass className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />}
          {activeWorkout.type === 'gps' && <MapPin className="h-5 w-5 text-emerald-400" />}
          
          <span className="text-xs font-black uppercase tracking-wider text-slate-350">
            {activeWorkout.planName ? `Plan: ${activeWorkout.planName}` : 'MODO LIBRE'}
          </span>
        </div>

        {/* Dynamic connection indicator */}
        <div className="flex items-center gap-2">
          {activeWorkout.type === 'gps' ? (
            <div className="flex items-center gap-1 rounded-full bg-emerald-950/40 px-2.5 py-0.5 border border-emerald-900/30 text-emerald-400">
              <Wifi className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">GPS: {gpsSignal === 'strong' ? 'ÓPTIMO' : 'BUSCANDO'}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (bluetoothConnected) disconnectBluetooth();
                else startBluetoothSearch();
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 border transition-all text-[10px] font-bold active:scale-95 ${
                bluetoothConnected
                  ? 'bg-indigo-950/40 border-indigo-900/30 text-indigo-400'
                  : bluetoothSearching
                  ? 'bg-amber-950/40 border-amber-900/30 text-amber-400 animate-pulse'
                  : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-400'
              }`}
            >
              {bluetoothSearching ? (
                <>
                  <BluetoothSearching className="h-3 w-3 animate-spin" />
                  <span>ESCANEAR...</span>
                </>
              ) : (
                <>
                  <Bluetooth className={`h-3 w-3 ${bluetoothConnected ? 'fill-current' : ''}`} />
                  <span>{bluetoothConnected ? 'CONECTADO' : 'CONECTAR'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. CHRONOMETER PANEL (Giant) */}
      <div className="flex flex-col items-center justify-center my-2 text-center select-none">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">TIEMPO TRANSCURRIDO</span>
        <h2 className="text-5xl font-black text-white tracking-widest tabular-nums leading-none">
          {formatTime(activeWorkout.duration)}
        </h2>
        
        {/* Heart Rate Display */}
        <div className="flex items-center gap-1.5 mt-2.5 rounded-full bg-slate-800/50 px-3 py-1 text-slate-300 select-none">
          <Heart className="h-4.5 w-4.5 fill-red-500 text-red-500 animate-pulse" />
          <span className="text-xs font-black tabular-nums">{activeWorkout.heartRate} BPM</span>
          <span className={`text-[10px] font-extrabold ${zone.color} ml-1.5 border-l border-slate-700 pl-1.5`}>
            {zone.name}
          </span>
        </div>
      </div>

      {/* 3. SIMULATOR OR MAP CONTAINER */}
      <div className="flex-1 min-h-[170px] max-h-[220px] rounded-3xl bg-slate-950 overflow-hidden relative border border-slate-850 p-3">
        {activeWorkout.type === 'gps' ? (
          <>
            {/* Outdoor GPS route live drawing canvas */}
            <canvas ref={canvasRef} width="400" height="200" className="w-full h-full rounded-2xl bg-slate-950" />
            <div className="absolute bottom-4 left-4 rounded-xl bg-slate-900/80 px-2 py-1 text-[9px] font-bold text-slate-400 border border-slate-800 backdrop-blur-sm">
              🛰️ RUTA TRAZADA EN VIVO
            </div>
          </>
        ) : (
          /* Indoor device simulators graphics */
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500">DISPOSITIVO VINCULADO</span>
                <span className="text-xs font-black text-slate-350">
                  {bluetoothConnected
                    ? activeWorkout.type === 'treadmill' ? '🏃‍♂️ Caminadora Smart-X8' : '🚴‍♂️ Rodillo Smart Bici'
                    : '⚠️ NINGUNO (MODO ASISTIDO MANUAL)'}
                </span>
              </div>
              {bluetoothConnected && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>

            {/* Sim visual details */}
            <div className="flex items-center justify-center my-3 relative h-20 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
              <div className="flex items-center gap-6 z-10">
                {activeWorkout.type === 'treadmill' ? (
                  <>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">INCLINACIÓN</span>
                      <span className="text-xl font-black text-indigo-400 tabular-nums">{activeWorkout.currentIncline}%</span>
                    </div>
                    {/* Animated running block */}
                    <div className="h-10.5 w-10.5 rounded-xl bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center animate-bounce">
                      <Dumbbell className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">AUTOMÁTICO</span>
                      <span className="text-xs font-black text-emerald-400">{activeWorkout.autoControlSpeed ? 'ON' : 'OFF'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">CADENCIA RPM</span>
                      <span className="text-xl font-black text-cyan-400 tabular-nums">{activeWorkout.currentCadence}</span>
                    </div>
                    {/* Animated cycling block */}
                    <div className="h-10.5 w-10.5 rounded-xl bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center animate-spin" style={{ animationDuration: `${60 / (activeWorkout.currentCadence || 60)}s` }}>
                      <Compass className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">POTENCIA</span>
                      <span className="text-xs font-black text-cyan-400">
                        {Math.round(activeWorkout.currentCadence * 1.8)}W
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-500 text-center leading-none">
              {bluetoothConnected 
                ? 'El dispositivo está enviando datos al panel mediante Web Bluetooth API.'
                : 'Usa los controles inferiores para cambiar de velocidad/inclinación manualmente.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. INTERVAL INSTRUCTIONS OR METRICS PANEL */}
      {plan && currentStep ? (
        <div className="rounded-2xl bg-slate-800/40 p-3 border border-indigo-950/20 my-2 select-none">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black text-brand-primaryDark uppercase">PLAN DE INTERVALO ACTUAL</span>
            <span className="text-[10px] font-black text-indigo-400">Sig. paso en: {formatTime(activeWorkout.timeRemainingInStep)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-200">{currentStep.label}</span>
              <span className="text-[9px] text-slate-400 mt-0.5">
                {activeWorkout.type === 'treadmill' && `Sugerencia: Cambiar velocidad a ${currentStep.targetSpeed} km/h`}
                {activeWorkout.type === 'bike' && `Sugerencia: Elevar cadencia a ${currentStep.targetCadence} RPM`}
              </span>
            </div>
            
            {/* Direction Instruction */}
            {!bluetoothConnected && (
              <div className="rounded-lg bg-orange-950/40 border border-orange-900/30 px-2 py-0.5 text-[9px] font-black text-orange-400 animate-pulse">
                {activeWorkout.type === 'treadmill' && activeWorkout.currentSpeed !== currentStep.targetSpeed
                  ? activeWorkout.currentSpeed < currentStep.targetSpeed ? 'SUBE VELOCIDAD' : 'BAJA VELOCIDAD'
                  : 'RITMO ESTABLE'}
                {activeWorkout.type === 'bike' && activeWorkout.currentCadence !== (currentStep.targetCadence || 0)
                  ? activeWorkout.currentCadence < (currentStep.targetCadence || 0) ? 'PEDALEA MÁS RÁPIDO' : 'PEDALEA MÁS SUAVE'
                  : 'RITMO ESTABLE'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Free objective metrics info */
        goalType !== 'none' && (
          <div className="rounded-2xl bg-slate-800/40 p-3 border border-slate-800/40 my-2 text-center select-none">
            <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase block mb-1">PROGRESO DEL OBJETIVO</span>
            <div className="flex justify-between items-center text-xs font-black text-slate-300 px-3">
              <span>0%</span>
              <span className="text-indigo-400 animate-pulse">
                {goalType === 'time' && `Completados ${Math.round((activeWorkout.duration/60))}/${goalValue} min`}
                {goalType === 'distance' && `Recorridos ${activeWorkout.distance.toFixed(2)}/${goalValue} km`}
                {goalType === 'calories' && `Quemadas ${Math.round(activeWorkout.calories)}/${goalValue} kcal`}
              </span>
              <span>100%</span>
            </div>
            {/* Tiny progress bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full mt-2 overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0,
                    goalType === 'time' ? (activeWorkout.duration / (goalValue * 60)) * 100
                    : goalType === 'distance' ? (activeWorkout.distance / goalValue) * 100
                    : (activeWorkout.calories / goalValue) * 100
                  ))}%`
                }}
              />
            </div>
          </div>
        )
      )}

      {/* 5. GAUGE METRICS GRID */}
      <div className="grid grid-cols-3 gap-2.5 my-1 text-center select-none">
        {/* DISTANCE */}
        <div className="rounded-2xl bg-slate-850 p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 font-extrabold block">DISTANCIA</span>
          <span className="text-lg font-black text-white tabular-nums leading-none block my-0.5">{activeWorkout.distance.toFixed(2)}</span>
          <span className="text-[9px] text-slate-500 font-black">KM</span>
        </div>
        
        {/* CURRENT SPEED */}
        <div className="rounded-2xl bg-slate-850 p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 font-extrabold block">VELOCIDAD</span>
          <span className="text-lg font-black text-white tabular-nums leading-none block my-0.5">{activeWorkout.currentSpeed}</span>
          <span className="text-[9px] text-slate-500 font-black">KM/H</span>
        </div>

        {/* CALORIES OR CADENCE */}
        <div className="rounded-2xl bg-slate-850 p-2.5 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 font-extrabold block">
            {activeWorkout.type === 'bike' ? 'CADENCIA' : 'CALORÍAS'}
          </span>
          <span className="text-lg font-black text-white tabular-nums leading-none block my-0.5">
            {activeWorkout.type === 'bike' ? activeWorkout.currentCadence : Math.round(activeWorkout.calories)}
          </span>
          <span className="text-[9px] text-slate-500 font-black">
            {activeWorkout.type === 'bike' ? 'RPM' : 'KCAL'}
          </span>
        </div>
      </div>

      {/* 6. COGNITIVE/MOTIVATION WIDGET */}
      <div className="flex items-center gap-3.5 rounded-2xl bg-slate-950/50 px-3.5 py-3 border border-indigo-950/40 my-1 select-none text-left">
        <img 
          src="/mascot.jpg" 
          alt="Coach Mora" 
          className="w-10 h-10 object-cover rounded-xl border border-brand-primary bg-slate-900 shrink-0"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] font-black text-brand-primary dark:text-brand-primaryDark tracking-wider leading-none">COACH MORA</span>
          <span className="text-xs font-extrabold text-slate-350 leading-tight">{motivatorMessage}</span>
        </div>
      </div>

      {/* 7. MANUAL ADJUSTMENT SLIDERS (only visible if Bluetooth not connected) */}
      {!bluetoothConnected && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 my-1 flex flex-col gap-2 select-none">
          {activeWorkout.type === 'bike' ? (
            /* Bike Cadence adjustment */
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[9px] font-black text-slate-450 uppercase">Pedaleo Manual (Cadencia RPM)</span>
                <span className="text-xs font-black text-cyan-400">{activeWorkout.currentCadence} RPM</span>
              </div>
              <input
                type="range"
                min="30"
                max="140"
                value={activeWorkout.currentCadence}
                onChange={(e) => changeCadence(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          ) : (
            /* Treadmill Speed/Incline adjustment */
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] font-black text-slate-450 uppercase">Velocidad</span>
                  <span className="text-xs font-black text-indigo-400">{activeWorkout.currentSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="18"
                  step="0.5"
                  value={activeWorkout.currentSpeed}
                  onChange={(e) => changeSpeed(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] font-black text-slate-450 uppercase">Inclinación</span>
                  <span className="text-xs font-black text-indigo-400">{activeWorkout.currentIncline}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={activeWorkout.currentIncline}
                  onChange={(e) => changeIncline(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. CONTROLS BAR */}
      <div className="flex justify-between items-center gap-3.5 border-t border-slate-800 pt-3.5 mt-1">
        {/* Exit/Discard workout */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 active:scale-95 transition-all"
          aria-label="Descartar entrenamiento"
        >
          <Square className="h-5 w-5" />
        </button>

        {/* Pause/Resume toggler */}
        {isPaused ? (
          <button
            onClick={resumeWorkout}
            className="flex-1 btn-game-secondary py-3 text-sm font-black flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>REANUDAR ENTRENAMIENTO</span>
          </button>
        ) : (
          <button
            onClick={pauseWorkout}
            className="flex-1 btn-game-outline border-slate-750 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 text-sm font-black flex items-center justify-center gap-2"
            style={{ boxShadow: 'none' }}
          >
            <Pause className="h-5 w-5 fill-current" />
            <span>PAUSAR SESIÓN</span>
          </button>
        )}

        {/* Complete workout button */}
        <button
          onClick={handleFinish}
          className="btn-game-primary py-3 px-6 text-sm font-black flex items-center justify-center gap-1.5 shrink-0"
        >
          <Sparkles className="h-5 w-5" />
          <span>FINALIZAR</span>
        </button>
      </div>

      {/* DISCARD/EXIT CONFIRMATION DRAWER PANEL */}
      {showExitConfirm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] border-t-4 border-brand-error bg-slate-900 p-6 shadow-2xl w-full max-w-md mx-auto animate-slideUp text-white">
            <div className="flex items-center gap-3 mb-3 text-red-500">
              <ShieldAlert className="h-8 w-8 stroke-[2.5]" />
              <h3 className="text-base font-black">¿Descartar entrenamiento?</h3>
            </div>
            
            <p className="text-xs text-slate-450 leading-relaxed mb-6">
              ¿Estás seguro de que quieres abandonar tu entrenamiento actual? Todo el progreso acumulado en esta sesión se perderá y no se registrará en tu historial de salud ni sumará puntos de racha.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 btn-game-outline border-slate-800 bg-slate-850 text-slate-250 py-3 font-black text-center text-xs"
                style={{ boxShadow: 'none' }}
              >
                SEGUIR ENTRENANDO
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 btn-game-danger py-3 font-black text-center text-xs"
              >
                SÍ, DESCARTAR TODO
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
