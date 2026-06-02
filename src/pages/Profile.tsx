import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import type { FitnessGoal, FavoriteWorkout, PhysicalLevel } from '../types/user';
import { CheckCircle2, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Profile: React.FC = () => {
  const { profile, updateProfile, addWeightRecord } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Header Profile details */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Ficha de Salud</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Consulta tu expediente físico y administra tu registro de peso.</p>
      </div>

      {/* 2. MAIN INFO / EDIT WIDGET */}
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
                <span className="text-[9px] font-black text-slate-450 uppercase leading-none">EDAD</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{profile.age} años</span>
              </div>
              <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
                <span className="text-[9px] font-black text-slate-450 uppercase leading-none">ESTATURA</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{profile.height} cm</span>
              </div>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-450 uppercase leading-none">NIVEL FÍSICO</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1 uppercase">
                {profile.level === 'beginner' ? 'PRINCIPIANTE' : profile.level === 'intermediate' ? 'INTERMEDIO' : 'AVANZADO'}
              </span>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-450 uppercase leading-none">META CLAVE</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                {getGoalLabel(profile.goal)}
              </span>
            </div>

            <div className="flex flex-col bg-slate-50 p-3 rounded-2xl dark:bg-slate-950/20">
              <span className="text-[9px] font-black text-slate-450 uppercase leading-none">ACTIVIDAD PREFERIDA</span>
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

      {/* 3. INTERACTIVE WEIGHT LOGGER */}
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

      {/* 4. HISTORICAL WEIGHT LOG TABLE */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Historial de Registros</h2>
        
        <div className="card-game p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800">
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

    </div>
  );
};
