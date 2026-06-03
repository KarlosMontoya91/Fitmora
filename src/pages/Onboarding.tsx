import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAvatarStore } from '../store/avatarStore';
import { useRewardStore } from '../store/rewardStore';
import { AvatarVisual } from '../components/avatar/AvatarVisual';
import type { SkinTone, HairStyle, HairColor } from '../types/avatar';
import { ChevronRight, ChevronLeft, Check, Sparkles, MapPin, Bluetooth, Bell } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const onboardUser = useUserStore((state) => state.onboardUser);
  const { config, updateConfig } = useAvatarStore();
  const { addNotification } = useRewardStore();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender] = useState<'male' | 'female' | 'other' | 'none'>('none');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<'weight-loss' | 'endurance' | 'speed' | 'active' | 'health'>('active');
  const [favoriteWorkout, setFavoriteWorkout] = useState<'treadmill' | 'bike' | 'gps' | 'mixed'>('mixed');
  
  // Permissions states
  const [gpsPermission, setGpsPermission] = useState(false);
  const [btPermission, setBtPermission] = useState(false);
  const [notifPermission, setNotifPermission] = useState(false);

  // Avatar initial selectors
  const skinTones: { id: SkinTone; label: string; hex: string }[] = [
    { id: 'fair', label: 'Claro', hex: '#FFDBAC' },
    { id: 'peach', label: 'Durazno', hex: '#F1C27D' },
    { id: 'olive', label: 'Oliva', hex: '#E0AC69' },
    { id: 'bronze', label: 'Bronce', hex: '#C68642' },
    { id: 'dark', label: 'Oscuro', hex: '#8D5524' },
  ];

  const hairStyles: { id: HairStyle; label: string }[] = [
    { id: 'short', label: 'Corto' },
    { id: 'long', label: 'Largo' },
    { id: 'spiky', label: 'Spiky' },
    { id: 'curly', label: 'Rizado' },
    { id: 'ponytail', label: 'Coleta' },
    { id: 'bald', label: 'Rapado' },
  ];

  const hairColors: { id: HairColor; label: string; hex: string }[] = [
    { id: 'black', label: 'Negro', hex: '#111827' },
    { id: 'brown', label: 'Marrón', hex: '#5C3A21' },
    { id: 'blonde', label: 'Rubio', hex: '#F59E0B' },
    { id: 'red', label: 'Rojo', hex: '#DC2626' },
    { id: 'silver', label: 'Plata', hex: '#9CA3AF' },
  ];

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Onboarding complete
      onboardUser({
        name: name.trim(),
        age,
        weight,
        height,
        gender,
        level,
        goal,
        favoriteWorkout,
        permissions: {
          gps: gpsPermission,
          bluetooth: btPermission,
          notifications: notifPermission,
        },
      });

      addNotification(
        '🚀 ¡Perfil creado con éxito!',
        `¡Bienvenido ${name}! Tu cuenta está activa y tienes 100 monedas de regalo. ¡A entrenar!`,
        'system'
      );

      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Progress percentage
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-[500px] h-full flex-col bg-white p-6 dark:bg-slate-900 transition-colors">
      
      {/* Top Progress bar */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition-all dark:bg-slate-800 dark:text-slate-400"
            aria-label="Regresar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        
        {/* Flat Duolingo-style Progress Bar */}
        <div className="h-4.5 flex-1 rounded-full bg-slate-150 dark:bg-slate-800 p-0.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <span className="text-xs font-black text-brand-primary dark:text-brand-primaryDark select-none">
          {step}/{totalSteps}
        </span>
      </div>

      {/* Slide Viewport */}
      <div className="flex-1 flex flex-col justify-center">
        
        {/* STEP 1: Welcome & Nickname */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            <img 
              src={`${import.meta.env.BASE_URL}mascot.jpg`} 
              alt="Coach Mora de Fitmora" 
              className="w-32 h-32 object-cover rounded-3xl border-4 border-slate-200 bg-slate-50 shadow-lg mb-6 dark:border-slate-800 dark:bg-slate-950 animate-bounce-slow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              ¡Hola! Te damos la bienvenida a <span className="text-brand-primary dark:text-brand-primaryDark">Fitmora</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              Soy el <span className="font-extrabold text-brand-primary dark:text-brand-primaryDark">Coach Mora</span>, tu guía en este viaje fitness gamificado. ¿Cómo deberíamos llamarte?
            </p>

            <div className="w-full max-w-xs">
              <label htmlFor="nickname" className="sr-only">Nombre o apodo</label>
              <input
                id="nickname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu apodo..."
                autoFocus
                required
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-center text-lg font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
              />
              {!name.trim() && (
                <span className="text-[10px] text-brand-error mt-2 block font-bold">Por favor ingresa un nombre para continuar</span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Physical Metrics */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 text-center">Cuéntanos sobre ti</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center leading-tight">
              Tus datos se usan para estimar calorías quemadas con mayor precisión.
            </p>

            <div className="flex flex-col gap-5 w-full max-w-xs">
              {/* Age */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="age-input" className="text-xs font-black text-slate-600 dark:text-slate-350">EDAD (AÑOS)</label>
                  <span className="text-sm font-extrabold text-brand-primary dark:text-brand-primaryDark">{age}</span>
                </div>
                <input
                  id="age-input"
                  type="range"
                  min="12"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-brand-primary dark:accent-brand-primaryDark"
                />
              </div>

              {/* Weight */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="weight-input" className="text-xs font-black text-slate-600 dark:text-slate-350">PESO (KG)</label>
                  <span className="text-sm font-extrabold text-brand-primary dark:text-brand-primaryDark">{weight} kg</span>
                </div>
                <input
                  id="weight-input"
                  type="range"
                  min="30"
                  max="160"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-brand-primary dark:accent-brand-primaryDark"
                />
              </div>

              {/* Height */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="height-input" className="text-xs font-black text-slate-600 dark:text-slate-350">ESTATURA (CM)</label>
                  <span className="text-sm font-extrabold text-brand-primary dark:text-brand-primaryDark">{height} cm</span>
                </div>
                <input
                  id="height-input"
                  type="range"
                  min="100"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-brand-primary dark:accent-brand-primaryDark"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Physical Level */}
        {step === 3 && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">¿Cuál es tu nivel físico actual?</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center">Adaptaremos las recomendaciones a tu condición.</p>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              {[
                { id: 'beginner', title: 'Principiante', desc: 'Hago poco ejercicio o voy empezando.' },
                { id: 'intermediate', title: 'Intermedio', desc: 'Hago ejercicio 2 o 3 veces por semana.' },
                { id: 'advanced', title: 'Avanzado', desc: 'Entreno intensamente casi todos los días.' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLevel(item.id as any)}
                  className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                    level === item.id
                      ? 'border-brand-primary bg-brand-primary/5 dark:border-brand-primaryDark dark:bg-brand-primaryDark/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.title}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Goals */}
        {step === 4 && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">¿Cuál es tu objetivo principal?</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center">Te ayudaremos a mantener el enfoque.</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
              {[
                { id: 'weight-loss', title: 'Bajar peso', icon: '🔥' },
                { id: 'endurance', title: 'Resistencia', icon: '🏃‍♂️' },
                { id: 'speed', title: 'Correr veloz', icon: '⚡' },
                { id: 'active', title: 'Caminar más', icon: '👟' },
                { id: 'health', title: 'Salud general', icon: '❤️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGoal(item.id as any)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all ${
                    goal === item.id
                      ? 'border-brand-primary bg-brand-primary/5 dark:border-brand-primaryDark dark:bg-brand-primaryDark/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Favourite Workout */}
        {step === 5 && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">¿Cómo te gusta entrenar?</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center">Configura tus preferencias favoritas.</p>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              {[
                { id: 'treadmill', title: 'Caminadora en Interior', icon: '👟' },
                { id: 'bike', title: 'Bicicleta Fija / Rodillo', icon: '🚴‍♂️' },
                { id: 'gps', title: 'Exterior (GPS Teléfono)', icon: '🗺️' },
                { id: 'mixed', title: 'Entrenamiento Mixto', icon: '🔄' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFavoriteWorkout(item.id as any)}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-3.5 text-left transition-all ${
                    favoriteWorkout === item.id
                      ? 'border-brand-primary bg-brand-primary/5 dark:border-brand-primaryDark dark:bg-brand-primaryDark/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Character Avatar Initial Customization */}
        {step === 6 && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">Diseña tu Avatar inicial</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-center">¡Elige tu apariencia de juego!</p>

            {/* Avatar Preview */}
            <div className="mb-6 relative">
              <AvatarVisual config={config} size={110} animate={true} />
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-secondary text-white border-2 border-white dark:border-slate-900 shadow">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            {/* Character styling controls */}
            <div className="w-full max-w-xs flex flex-col gap-3">
              {/* Skin tones */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">COLOR DE PIEL</span>
                <div className="flex gap-2.5 justify-center">
                  {skinTones.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateConfig({ skinTone: s.id })}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        config.skinTone === s.id ? 'border-brand-primary scale-110' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: s.hex }}
                      aria-label={`Piel ${s.label}`}
                    />
                  ))}
                </div>
              </div>

              {/* Hair styles */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">TIPO DE CABELLO</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {hairStyles.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => updateConfig({ hairStyle: h.id })}
                      className={`rounded-xl px-2.5 py-1 text-xs font-bold border transition-all ${
                        config.hairStyle === h.id
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                          : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair colors */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">COLOR DE CABELLO</span>
                <div className="flex gap-2.5 justify-center">
                  {hairColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateConfig({ hairColor: c.id })}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        config.hairColor === c.id ? 'border-brand-primary scale-110' : 'border-slate-200'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={`Cabello ${c.label}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Sensors Permissions */}
        {step === 7 && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">Permisos de Sensores</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 text-center max-w-xs leading-tight">
              Fitmora necesita estos permisos para conectarse a caminadoras y registrar rutas GPS.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* GPS Location */}
              <button
                onClick={() => setGpsPermission(!gpsPermission)}
                className={`flex items-center justify-between rounded-2xl border-2 p-3.5 text-left transition-all ${
                  gpsPermission ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${gpsPermission ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600'}`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ubicación GPS</span>
                    <span className="text-[10px] text-slate-400">Para entrenamientos exteriores</span>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${gpsPermission ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-300'}`}>
                  {gpsPermission && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>

              {/* Bluetooth */}
              <button
                onClick={() => setBtPermission(!btPermission)}
                className={`flex items-center justify-between rounded-2xl border-2 p-3.5 text-left transition-all ${
                  btPermission ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${btPermission ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600'}`}>
                    <Bluetooth className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Bluetooth Smart</span>
                    <span className="text-[10px] text-slate-400">Para caminadoras y sensores</span>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${btPermission ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-300'}`}>
                  {btPermission && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotifPermission(!notifPermission)}
                className={`flex items-center justify-between rounded-2xl border-2 p-3.5 text-left transition-all ${
                  notifPermission ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${notifPermission ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recordatorios de Racha</span>
                    <span className="text-[10px] text-slate-400">Mantén viva tu racha diaria</span>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${notifPermission ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-300'}`}>
                  {notifPermission && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: All Ready Success Screen */}
        {step === 8 && (
          <div className="flex flex-col items-center text-center">
            <img 
              src={`${import.meta.env.BASE_URL}mascot.jpg`} 
              alt="Coach Mora celebrando" 
              className="w-24 h-24 object-cover rounded-2xl border-2 border-brand-primary bg-slate-50 shadow-md mb-4 dark:bg-slate-950 animate-bounce-slow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Todo listo, {name}!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              ¡Tu perfil ha sido configurado con éxito! He cargado tu cartera virtual con <span className="text-amber-500 font-extrabold">100 Monedas 💰</span> para que las uses en el personalizador del avatar.
            </p>

            <div className="relative w-28 h-28 mb-8">
              <AvatarVisual config={config} size={110} animate={true} />
              <div className="absolute top-0 right-0 animate-pulse bg-emerald-500 text-white rounded-full p-1.5 border-2 border-white shadow">
                <Check className="h-5 w-5 stroke-[3.5]" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[240px] leading-tight">
              Presiona continuar para acceder al Panel y realizar tu primer entrenamiento.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Button Panel */}
      <div className="mt-8 flex justify-center w-full">
        <button
          onClick={handleNext}
          disabled={step === 1 && !name.trim()}
          className={`btn-game-primary w-full max-w-xs flex items-center justify-center gap-2 ${
            step === 1 && !name.trim() ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <span>{step === totalSteps ? '¡EMPEZAR AHORA!' : 'CONTINUAR'}</span>
          <ChevronRight className="h-5 w-5 stroke-[3]" />
        </button>
      </div>

    </div>
  );
};
