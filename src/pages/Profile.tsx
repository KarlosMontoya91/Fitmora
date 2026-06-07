import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import type { FitnessGoal, FavoriteWorkout, PhysicalLevel } from '../types/user';
import { 
  CheckCircle2, 
  Scale, 
  Trophy, 
  CircleDollarSign, 
  Award, 
  Lock, 
  Sparkles, 
  MapPin, 
  Flame,
  Coins,
  HelpCircle
} from 'lucide-react';
import { LevelInfoModal } from '../components/piggy/LevelInfoModal';
import confetti from 'canvas-confetti';

export const Profile: React.FC = () => {
  const { profile, updateProfile, addWeightRecord } = useUserStore();
  const { history } = useWorkoutStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || 25);
  const [height, setHeight] = useState(profile?.height || 170);
  const [level, setLevel] = useState<PhysicalLevel>(profile?.level || 'beginner');
  const [goal, setGoal] = useState<FitnessGoal>(profile?.goal || 'active');
  const [favWorkout, setFavWorkout] = useState<FavoriteWorkout>(profile?.favoriteWorkout || 'mixed');

  // Weight log form state
  const [weightInput, setWeightInput] = useState('');
  const [showWeightSuccess, setShowWeightSuccess] = useState(false);

  if (!profile) return null;

  // Calculate distance-based levels (1 level per 5 km)
  const totalDistance = history.reduce((acc, session) => acc + session.distance, 0);
  const calculatedLevel = Math.floor(totalDistance / 5) + 1;
  const distanceInCurrentLevel = totalDistance % 5;
  const progressPercentage = (distanceInCurrentLevel / 5) * 100;
  const kmRemaining = 5 - distanceInCurrentLevel;

  // Evolution assets helper
  const getPiggyImage = (lvl: number) => {
    if (lvl <= 10) return `${import.meta.env.BASE_URL}piggi_up1.png`;
    if (lvl <= 20) return `${import.meta.env.BASE_URL}piggi_up2.png`;
    if (lvl <= 30) return `${import.meta.env.BASE_URL}piggi_up3.png`;
    if (lvl <= 40) return `${import.meta.env.BASE_URL}piggi_up4.png`;
    return `${import.meta.env.BASE_URL}piggi_up5.jpg`;
  };

  const getEvolutionName = (lvl: number) => {
    if (lvl <= 10) return "Cochinito Nivel 1 (Pequeño y Sucio)";
    if (lvl <= 20) return "Cochinito Nivel 2 (Entrenador)";
    if (lvl <= 30) return "Cochinito Nivel 3 (Poderoso / En Forma)";
    if (lvl <= 40) return "Cochinito Nivel 4 (Súper Guerrero)";
    return "Cochinito Nivel 5 (Leyenda / Campeón)";
  };

  const getMotivationMessage = (lvl: number) => {
    if (lvl <= 10) return "¡Mantenlo en marcha! Tu piggy está pequeño y sucio. ¡Entrena más para verlo crecer y evolucionar! 🐷✨";
    if (lvl <= 20) return "¡Eso es! Tu piggy ahora entrena duro y lleva su banda protectora. ¡Sigue acumulando kilómetros! 🏃‍♂️💨";
    if (lvl <= 30) return "¡Impresionante! Tu piggy ha ganado una condición física increíble. ¡No pares ahora! 🏋️‍♂️🔥";
    if (lvl <= 40) return "¡Fuerza pura! Tu piggy tiene una musculatura envidiable y chaleco táctico. ¡Casi en la cima! ⚡🛡️";
    return "¡Eres un atleta supremo! Tu piggy ha alcanzado su evolución final. ¡Sigue entrenando para dominar Fitmora! 🏆👑";
  };

  // Sync level automatically in the store if out of sync
  React.useEffect(() => {
    if (profile.userLevel !== calculatedLevel) {
      updateProfile({ userLevel: calculatedLevel });
    }
  }, [profile.userLevel, calculatedLevel, updateProfile]);

  const handleSaveChanges = () => {
    if (name.trim()) {
      updateProfile({
        name: name.trim(),
        age: Number(age),
        height: Number(height),
        level,
        goal,
        favoriteWorkout: favWorkout,
      });
      setIsEditing(false);
      
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.7 }
      });
    }
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(weightInput);
    if (val > 20 && val < 250) {
      addWeightRecord(val);
      setWeightInput('');
      setShowWeightSuccess(true);
      setTimeout(() => setShowWeightSuccess(false), 3000);
      
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
    }
  };

  const getGoalLabel = (g: FitnessGoal) => {
    switch (g) {
      case 'weight-loss': return 'Bajar de Peso 🔥';
      case 'endurance': return 'Mejorar Resistencia 🏃‍♂️';
      case 'speed': return 'Correr más Rápido ⚡';
      case 'active': return 'Caminar más / Activo 👟';
      case 'health': return 'Entrenar por Salud ❤️';
    }
  };

  // Mock store items marked as "Próximamente"
  const mockShopItems = [
    { id: 1, name: 'Gorra Deportiva Fitmora', type: 'Accesorio', cost: 150, icon: '🧢' },
    { id: 2, name: 'Lentes Deportivos Speed', type: 'Accesorio', cost: 250, icon: '🕶️' },
    { id: 3, name: 'Atuendo Pro Fitmora', type: 'Ropa', cost: 350, icon: '👕' },
    { id: 4, name: 'Piggy Dorado Brillante', type: 'Evolución Especial', cost: 1200, icon: '🐷' },
    { id: 5, name: 'Fondo de Gimnasio Retro', type: 'Fondo', cost: 500, icon: '🌆' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-4">
      
      {/* 1. Header Profile details */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Ficha de Progreso</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Administra tu evolución, consulta tu nivel y registra tu historial físico.</p>
      </div>

      {/* 2. MAIN GAMIFIED AVATAR & LEVEL PROGRESS CARD */}
      <section className="card-game flex flex-col gap-4.5 relative overflow-hidden bg-gradient-to-br from-indigo-50/20 via-white to-white dark:from-slate-900/10 dark:via-slate-900 dark:to-slate-900 border-2">
        {/* Coins indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900/30 rounded-2xl px-3 py-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] tracking-wide select-none">
          <Coins className="h-4 w-4 fill-current animate-pulse text-amber-500" />
          <span>{profile.coins} MONEDAS</span>
        </div>

        {/* Mascot Center Area */}
        <div className="flex flex-col items-center mt-5">
          <div className="relative group">
            {/* Glowing ring under mascot */}
            <div className="absolute inset-0 rounded-full blur-xl bg-brand-primary/20 dark:bg-brand-primaryDark/10 scale-110" />
            <img
              src={getPiggyImage(calculatedLevel)}
              alt="Mascota Fitmora Evolution"
              className="w-36 h-36 object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-2xl relative z-10 animate-bounce-slow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}mascot.jpg`;
              }}
            />
            {/* Level badge circle */}
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-brand-primary to-indigo-650 font-black text-white h-11 w-11 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 text-sm shadow-md z-20">
              {calculatedLevel}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{profile.name}</h2>
            <span className="text-xs text-brand-primary dark:text-brand-primaryDark font-black uppercase tracking-wider block mt-0.5">
              {getEvolutionName(calculatedLevel)}
            </span>
          </div>
        </div>

        {/* Leveling Bar tracker */}
        <div className="flex flex-col gap-1.5 mt-2 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/40">
          <div className="flex justify-between items-center text-[9px] font-black text-slate-400 tracking-wider uppercase">
            <span className="flex items-center gap-1">
              Progreso de Nivel
              <button 
                type="button" 
                onClick={() => setIsInfoOpen(true)}
                className="text-slate-400 hover:text-brand-primary dark:hover:text-brand-primaryDark transition-colors"
                aria-label="Información del sistema de niveles"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            </span>
            <span className="text-indigo-650 dark:text-indigo-400">{distanceInCurrentLevel.toFixed(2)} / 5.00 km</span>
          </div>
          
          {/* Bar track */}
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Motivation tooltip */}
          <div className="flex items-start gap-2 mt-2 text-xs font-bold text-slate-600 dark:text-slate-350">
            <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {getMotivationMessage(calculatedLevel)}
            </p>
          </div>
        </div>

        {/* Quick statistics dashboard row */}
        <div className="grid grid-cols-3 gap-2.5 mt-1 select-none">
          {/* KM */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/30 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850">
            <MapPin className="h-4.5 w-4.5 text-indigo-500 mb-1" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">KM TOTALES</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-150 mt-1">{totalDistance.toFixed(2)}</span>
          </div>
          
          {/* XP */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-50/30 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850">
            <Trophy className="h-4.5 w-4.5 text-cyan-500 mb-1" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">XP OBTENIDO</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-150 mt-1">{profile.experience} XP</span>
          </div>

          {/* STREAK */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50/30 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850">
            <Flame className="h-4.5 w-4.5 text-orange-500 mb-1" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">DÍAS RACHA</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-150 mt-1">{profile.streak}</span>
          </div>
        </div>
      </section>

      {/* 3. VIRTUAL ACCESSORIES AND APPAREL SHOP (MOCK - COMING SOON) */}
      <section className="card-game flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Evolución y Atuendos</h2>
          <span className="text-[9px] font-black bg-brand-primary/10 text-brand-primary dark:bg-brand-primaryDark/10 dark:text-brand-primaryDark px-2 py-0.5 rounded-md">TIENDA</span>
        </div>

        <p className="text-xs font-bold text-slate-455 dark:text-slate-500 leading-relaxed -mt-1">
          Próximamente podrás vestir a tu cochinito, equiparle gorras, lentes, vestimenta y desbloquear skins especiales con las monedas ganadas en tus entrenamientos.
        </p>

        <div className="flex flex-col gap-2">
          {mockShopItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 opacity-70 hover:opacity-100 transition-all select-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-normal" role="img" aria-label={item.name}>{item.icon}</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-[9px] font-extrabold text-slate-455 uppercase mt-0.5">{item.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>Próximamente</span>
                </span>
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-xl shrink-0">
                  💰 {item.cost} mon.
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HEALTH PHYSICAL RECORD */}
      <section className="card-game flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Mi Perfil Físico</h2>
          <button
            onClick={() => {
              if (isEditing) handleSaveChanges();
              else setIsEditing(true);
            }}
            className="text-xs font-black text-brand-primary dark:text-brand-primaryDark hover:underline"
          >
            {isEditing ? 'GUARDAR' : 'EDITAR'}
          </button>
        </div>

        {isEditing ? (
          /* EDIT MODE FORM */
          <div className="flex flex-col gap-4.5 animate-fadeIn">
            {/* Nickname */}
            <div className="flex flex-col">
              <label htmlFor="edit-name" className="text-[10px] font-black text-slate-400 mb-1">APODO / APODO DE JUEGO</label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
              />
            </div>

            {/* Age & Height */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="edit-age" className="text-[10px] font-black text-slate-400 mb-1">EDAD (AÑOS)</label>
                <input
                  id="edit-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="edit-height" className="text-[10px] font-black text-slate-400 mb-1">ESTATURA (CM)</label>
                <input
                  id="edit-height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
                />
              </div>
            </div>

            {/* Fitness Level */}
            <div className="flex flex-col">
              <label htmlFor="edit-level" className="text-[10px] font-black text-slate-400 mb-1">NIVEL DE CONDICIÓN FÍSICA</label>
              <select
                id="edit-level"
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
              >
                <option value="beginner">Principiante (Inicio)</option>
                <option value="intermediate">Intermedio (Regular)</option>
                <option value="advanced">Avanzado (Intenso)</option>
              </select>
            </div>

            {/* Main Goal */}
            <div className="flex flex-col">
              <label htmlFor="edit-goal" className="text-[10px] font-black text-slate-400 mb-1">META U OBJETIVO PRINCIPAL</label>
              <select
                id="edit-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
              >
                <option value="weight-loss">Quemar Grasa / Bajar de peso</option>
                <option value="endurance">Aumentar Resistencia Aeróbica</option>
                <option value="speed">Entrenar Velocidad en Pista</option>
                <option value="active">Caminar más / Vida Activa</option>
                <option value="health">Mejorar Salud Cardiovascular</option>
              </select>
            </div>

            {/* Fav activity */}
            <div className="flex flex-col">
              <label htmlFor="edit-fav" className="text-[10px] font-black text-slate-400 mb-1">ENTRENAMIENTO PREFERIDO</label>
              <select
                id="edit-fav"
                value={favWorkout}
                onChange={(e) => setFavWorkout(e.target.value as any)}
                className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
              >
                <option value="treadmill">Caminadora en Interiores</option>
                <option value="bike">Bicicleta Fija / Rodillo</option>
                <option value="gps">GPS Exterior (Al Aire Libre)</option>
                <option value="mixed">Mixto (Combinado)</option>
              </select>
            </div>
          </div>
        ) : (
          /* READ-ONLY DISPLAY */
          <div className="flex flex-col gap-3.5 animate-fadeIn text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
                <span className="text-[9px] font-black text-slate-455 uppercase leading-none">EDAD</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{profile.age} años</span>
              </div>
              <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
                <span className="text-[9px] font-black text-slate-455 uppercase leading-none">ESTATURA</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{profile.height} cm</span>
              </div>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-455 uppercase leading-none">NIVEL FÍSICO</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1 uppercase">
                {profile.level === 'beginner' ? 'PRINCIPIANTE' : profile.level === 'intermediate' ? 'INTERMEDIO' : 'AVANZADO'}
              </span>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-455 uppercase leading-none">META CLAVE</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                {getGoalLabel(profile.goal)}
              </span>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-455 uppercase leading-none">ACTIVIDAD PREFERIDA</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                {profile.favoriteWorkout === 'treadmill' ? '🏃‍♂️ Caminadora en Interior'
                  : profile.favoriteWorkout === 'bike' ? '🚴‍♂️ Bicicleta Fija'
                  : profile.favoriteWorkout === 'gps' ? '🗺️ Exterior con GPS'
                  : '🔄 Entrenamiento Mixto'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE WEIGHT LOGGER */}
      <section className="card-game flex flex-col gap-4">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Registrar Peso de Hoy</h2>
        
        <form onSubmit={handleAddWeight} className="flex gap-3">
          <label htmlFor="weight-logger" className="sr-only">Registrar peso en kilogramos</label>
          <input
            id="weight-logger"
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Ej. 68.5 kg"
            required
            className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            className="btn-game-primary py-2 px-5 text-xs font-black flex items-center gap-1"
            style={{ boxShadow: 'none' }}
          >
            <Scale className="h-4.5 w-4.5" />
            <span>LOG</span>
          </button>
        </form>

        {showWeightSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 p-2.5 text-xs font-bold border border-emerald-200/50">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>¡Peso registrado! Tu expediente de salud ha sido actualizado en vivo.</span>
          </div>
        )}
      </section>

      {/* 6. HISTORICAL WEIGHT LOG TABLE */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Historial de Registros</h2>
        
        <div className="card-game p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 dark:bg-slate-900/50 dark:border-slate-850">
              <tr>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">FECHA REGISTRO</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-right">PESO (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-750 dark:text-slate-300">
              {profile.weightHistory.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-400">Sin historial registrado</td>
                </tr>
              ) : (
                [...profile.weightHistory].reverse().map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-3.5 font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-extrabold text-right text-slate-800 dark:text-slate-200">
                      {record.weight.toFixed(1)} kg
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Leveling explain modal */}
      <LevelInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
};
