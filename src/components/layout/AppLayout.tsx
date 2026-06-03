import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart2, Gamepad2, Settings, Bell, Flame, CircleDollarSign, Check } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useRewardStore } from '../../store/rewardStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { AnimatePresence, motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, theme, setTheme } = useUserStore();
  const { notifications, markAsRead, markAllAsRead } = useRewardStore();
  const { activeWorkout } = useWorkoutStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { name: 'Inicio', path: '/home', icon: Home },
    { name: 'Entrenar', path: '/workouts', icon: Dumbbell },
    { name: 'Progreso', path: '/progress', icon: BarChart2 },
    { name: 'Avatar', path: '/avatar', icon: Gamepad2 },
    { name: 'Ajustes', path: '/settings', icon: Settings },
  ];

  // If user is not onboarded, we don't render the layout with header/footer
  const isOnboardingPage =
    location.pathname === '/onboarding' || location.pathname === '/' || !profile;

  if (isOnboardingPage) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-0 md:p-4 transition-colors dark:bg-slate-950">
        <main className="w-full max-w-md h-dvh md:h-auto overflow-y-auto md:rounded-3xl border-0 md:border-2 border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          {children}
        </main>
      </div>
    );
  }

  // Active workout screen is full screen without standard header/footer
  const isWorkoutActive = location.pathname.includes('/workout-active');

  if (isWorkoutActive) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 transition-colors dark:bg-slate-950">
        <main className="w-full max-w-md h-dvh md:h-[840px] overflow-y-auto md:rounded-3xl border-0 md:border-2 border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50/40 via-slate-100/50 to-cyan-50/40 p-0 md:p-6 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Desktop App mockup framing container */}
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden border-0 bg-white shadow-none transition-all duration-300 md:h-[840px] md:rounded-[36px] md:border-8 md:border-slate-800 dark:bg-slate-950 md:dark:border-slate-800 md:shadow-2xl">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b-2 border-slate-100 bg-white/95 px-4 backdrop-blur-md dark:border-slate-900 dark:bg-slate-950/95">
          {/* Level Indicator */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 cursor-pointer group select-none"
            aria-label={`Ver perfil, nivel actual: ${profile.userLevel}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-violet-600 font-extrabold text-white shadow-sm transition-transform group-hover:scale-105">
              {profile.userLevel}
            </div>
            <div className="flex flex-col text-xs leading-none">
              <span className="font-bold text-slate-800 dark:text-slate-100 leading-tight">NIVEL</span>
              <span className="text-[10px] text-brand-lightTextSec dark:text-brand-darkTextSec">VER PERFIL</span>
            </div>
          </div>

          {/* Center Stats Indicators */}
          <div className="flex items-center gap-4">
            {/* Streak Active */}
            <div 
              className="flex items-center gap-1 rounded-xl bg-orange-50 px-2.5 py-1 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30"
              aria-label={`Racha de ${profile.streak} días activos`}
            >
              <Flame className={`h-5 w-5 fill-current ${profile.streak > 0 ? 'animate-pulse' : 'opacity-40'}`} />
              <span className="text-sm font-extrabold">{profile.streak}</span>
            </div>

            {/* Virtual Currency Coins */}
            <div 
              className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
              aria-label={`${profile.coins} monedas de Fitmora`}
            >
              <CircleDollarSign className="h-5 w-5 fill-current" />
              <span className="text-sm font-extrabold">{profile.coins}</span>
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Ver notificaciones"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-error text-[10px] font-extrabold text-white border-2 border-white dark:border-slate-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dynamic notifications drop panel */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 z-30 w-72 max-h-80 overflow-y-auto rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-xl dark:border-slate-900 dark:bg-slate-950"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-900">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">NOTIFICACIONES</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-extrabold text-brand-primary dark:text-brand-primaryDark hover:underline"
                        >
                          LEER TODO
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">Sin notificaciones pendientes</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              setShowNotifications(false);
                            }}
                            className={`flex flex-col gap-1 rounded-xl p-2 cursor-pointer transition-colors ${
                              notif.read
                                ? 'bg-slate-50/55 dark:bg-slate-900/30'
                                : 'bg-brand-primary/5 dark:bg-brand-primaryDark/5 border-l-4 border-brand-primary'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                              {notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Scrolling Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-4 dark:bg-slate-950">
          {children}
        </main>

        {/* Bottom Navigation */}
        <footer className="sticky bottom-0 z-20 h-20 w-full border-t-2 border-slate-100 bg-white/95 pb-2 pt-1 backdrop-blur-md dark:border-slate-900 dark:bg-slate-950/95">
          <nav className="flex h-full items-center justify-around px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1 transition-all w-16 active:scale-95 ${
                    isActive
                      ? 'text-brand-primary dark:text-brand-primaryDark font-bold scale-105'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400'
                  }`}
                  aria-label={item.name}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-6 w-6 stroke-[2.2] transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] tracking-wider leading-none">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </footer>

      </div>
    </div>
  );
};
