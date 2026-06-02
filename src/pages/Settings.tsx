import React from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useRewardStore } from '../store/rewardStore';
import { Moon, Sun, MapPin, Bluetooth, Bell, Trash2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Settings: React.FC = () => {
  const { profile, theme, setTheme, updateProfile, togglePermission, resetAllData } = useUserStore();
  const { clearNotifications, addNotification } = useRewardStore();
  const { discardWorkout } = useWorkoutStore();

  if (!profile) return null;

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 0) {
      updateProfile({ weight: value });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 0) {
      updateProfile({ height: value });
    }
  };

  const handleReset = () => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS tus datos? Esto incluye tu avatar, logros y todo el historial de entrenamientos.')) {
      discardWorkout();
      clearNotifications();
      resetAllData();
      window.location.reload();
    }
  };

  const triggerSecretConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 }
    });
    addNotification('🎉 ¡Estrella Secreta!', 'Descubriste el botón oculto en la configuración.', 'system');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Configuración</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Administra las preferencias y los sensores de tu dispositivo.</p>
      </div>

      {/* 1. Theme Configuration */}
      <section className="card-game flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">APARIENCIA</h2>
        
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Modo Oscuro</span>
            <span className="text-[10px] text-slate-400">Ahorra batería y reduce la fatiga visual.</span>
          </div>
          
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`relative flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
              theme === 'dark' ? 'bg-brand-primary' : 'bg-slate-200'
            }`}
            aria-label={theme === 'dark' ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all duration-300 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            >
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-brand-primary" fill="currentColor" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-slate-400" />
              )}
            </span>
          </button>
        </div>
      </section>

      {/* 2. Device Sensors Permissions */}
      <section className="card-game flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SENSORES Y PERMISOS</h2>
        
        <div className="flex flex-col gap-3">
          {/* GPS Location */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${profile.permissions.gps ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Ubicación GPS</span>
                <span className="text-[10px] text-slate-400">Registrar tus kilómetros en exteriores.</span>
              </div>
            </div>
            <button
              onClick={() => togglePermission('gps')}
              className={`h-5 w-9 rounded-full transition-all ${
                profile.permissions.gps ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-800'
              } relative`}
              aria-label="Permiso GPS"
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                profile.permissions.gps ? 'left-4.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Bluetooth Connection */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${profile.permissions.bluetooth ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
                <Bluetooth className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Bluetooth Smart</span>
                <span className="text-[10px] text-slate-400">Vincular con caminadoras inteligentes.</span>
              </div>
            </div>
            <button
              onClick={() => togglePermission('bluetooth')}
              className={`h-5 w-9 rounded-full transition-all ${
                profile.permissions.bluetooth ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-800'
              } relative`}
              aria-label="Permiso Bluetooth"
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                profile.permissions.bluetooth ? 'left-4.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${profile.permissions.notifications ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Recordatorios Diarios</span>
                <span className="text-[10px] text-slate-400">Recibir avisos para no perder tu racha.</span>
              </div>
            </div>
            <button
              onClick={() => togglePermission('notifications')}
              className={`h-5 w-9 rounded-full transition-all ${
                profile.permissions.notifications ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-800'
              } relative`}
              aria-label="Permiso Notificaciones"
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                profile.permissions.notifications ? 'left-4.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Physical Parameters Adjustment */}
      <section className="card-game flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DATOS FÍSICOS</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="weight-edit" className="text-xs font-black text-slate-400 dark:text-slate-500 mb-1">PESO (KG)</label>
            <input
              id="weight-edit"
              type="number"
              value={profile.weight}
              onChange={handleWeightChange}
              className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="height-edit" className="text-xs font-black text-slate-400 dark:text-slate-500 mb-1">ESTATURA (CM)</label>
            <input
              id="height-edit"
              type="number"
              value={profile.height}
              onChange={handleHeightChange}
              className="rounded-xl border-2 border-slate-150 bg-slate-50 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-brand-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-primaryDark"
            />
          </div>
        </div>
      </section>

      {/* 4. Extra Options & Testing tools */}
      <section className="card-game flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SOPORTE Y PRUEBAS</h2>
        
        <div className="flex flex-col gap-3">
          {/* Confetti button */}
          <button
            onClick={triggerSecretConfetti}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-left transition-all active:scale-98"
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Probar Celebración</span>
              <span className="text-[10px] text-slate-400">Detona una explosión de confeti en la UI.</span>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </button>

          {/* Reset App button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-3.5 rounded-xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3.5 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-red-600 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 transition-colors group-hover:bg-red-200">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black">Restablecer Aplicación</span>
              <span className="text-[10px] text-red-500">Elimina el perfil y reinicia el onboarding.</span>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};
