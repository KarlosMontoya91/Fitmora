import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutSession, WorkoutType, WorkoutPlan, WorkoutStep } from '../types/workout';
import { calculateCaloriesPerSecond } from '../utils/calories';
import { useUserStore } from './userStore';
import { WORKOUT_PLANS } from '../data/workoutPlans';
import { bleService } from '../utils/bluetooth';

interface ActiveWorkoutState {
  id: string;
  type: WorkoutType;
  duration: number; // in seconds
  distance: number; // in km
  calories: number; // in kcal
  currentSpeed: number; // in km/h
  maxSpeed: number;
  currentIncline: number; // in %
  currentCadence: number; // in RPM (for bike)
  heartRate: number; // in bpm
  route: { lat: number; lng: number }[];
  planId?: string;
  planName?: string;
  currentStepIndex: number;
  timeRemainingInStep: number;
  autoControlSpeed: boolean; // Simulates automatic treadmill speed adjustment from the app
}

interface WorkoutStore {
  activeWorkout: ActiveWorkoutState | null;
  isPaused: boolean;
  history: WorkoutSession[];
  
  // Devices & Sensors Simulation
  bluetoothConnected: boolean;
  bluetoothSearching: boolean;
  gpsSignal: 'searching' | 'weak' | 'strong' | 'none';
  
  // Actions
  startWorkout: (type: WorkoutType, planId?: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  tick: () => void;
  finishWorkout: () => WorkoutSession | null;
  discardWorkout: () => void;
  
  // Controls
  changeSpeed: (speed: number) => void;
  changeIncline: (incline: number) => void;
  changeCadence: (cadence: number) => void;
  toggleAutoControl: () => void;
  
  // Sensors Simulation Actions
  startBluetoothSearch: () => void;
  disconnectBluetooth: () => void;
  setGpsSignal: (signal: 'searching' | 'weak' | 'strong' | 'none') => void;
  addRoutePoint: (lat: number, lng: number) => void;
}

const INITIAL_GPS_START = { lat: 19.4326, lng: -99.1332 }; // Central Mexico City coordinates for simulator

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      isPaused: false,
      history: [],
      
      bluetoothConnected: false,
      bluetoothSearching: false,
      gpsSignal: 'none',

      startWorkout: (type, planId) => {
        const plans = WORKOUT_PLANS;
        const plan = planId ? plans.find(p => p.id === planId) : undefined;
        
        let initialSpeed = 0;
        let initialIncline = 0;
        let initialCadence = 0;
        let initialTimeInStep = 0;

        if (plan && plan.steps.length > 0) {
          const firstStep = plan.steps[0];
          initialSpeed = firstStep.targetSpeed;
          initialIncline = firstStep.targetIncline || 0;
          initialCadence = firstStep.targetCadence || 0;
          initialTimeInStep = (firstStep.minuteEnd - firstStep.minuteStart) * 60;
        } else {
          // Free mode defaults
          initialSpeed = type === 'treadmill' || type === 'gps' ? 4.0 : 15.0; // km/h
          initialIncline = 0;
          initialCadence = type === 'bike' ? 70 : 0;
        }

        set({
          activeWorkout: {
            id: Math.random().toString(36).substring(2, 9),
            type,
            duration: 0,
            distance: 0,
            calories: 0,
            currentSpeed: initialSpeed,
            maxSpeed: initialSpeed,
            currentIncline: initialIncline,
            currentCadence: initialCadence,
            heartRate: type === 'free' ? 80 : 100, // active starting heart rate
            route: type === 'gps' ? [INITIAL_GPS_START] : [],
            planId,
            planName: plan ? plan.name : undefined,
            currentStepIndex: 0,
            timeRemainingInStep: initialTimeInStep,
            autoControlSpeed: true,
          },
          isPaused: false,
          gpsSignal: type === 'gps' ? 'searching' : 'none',
        });

        // Trigger simulated GPS signal search
        if (type === 'gps') {
          setTimeout(() => {
            if (get().activeWorkout?.type === 'gps') {
              set({ gpsSignal: 'strong' });
            }
          }, 3000);
        }
      },

      pauseWorkout: () => {
        set({ isPaused: true });
      },

      resumeWorkout: () => {
        set({ isPaused: false });
      },

      tick: () => {
        const { activeWorkout, isPaused, bluetoothConnected } = get();
        if (!activeWorkout || isPaused) return;

        // Auto-pause timer if Bluetooth connected and speed is 0
        if (bluetoothConnected && activeWorkout.currentSpeed <= 0) {
          // Treadmill is physically stopped, wait for motor to turn
          return;
        }

        const userStore = useUserStore.getState();
        const weight = userStore.profile?.weight || 70; // fallback to 70kg

        // 1. Time ticks
        const nextDuration = activeWorkout.duration + 1;

        // 2. Calories tick
        const calorieBurnPerSec = calculateCaloriesPerSecond(
          activeWorkout.type,
          activeWorkout.currentSpeed,
          weight,
          activeWorkout.currentIncline
        );
        const nextCalories = activeWorkout.calories + calorieBurnPerSec;

        // 3. Distance tick (Speed is in km/h, distance increases by km per second)
        const distancePerSec = activeWorkout.currentSpeed / 3600;
        const nextDistance = activeWorkout.distance + distancePerSec;

        // 4. Max speed tracking
        const nextMaxSpeed = Math.max(activeWorkout.maxSpeed, activeWorkout.currentSpeed);

        // 5. Heart rate simulation (rises/falls slightly based on speed)
        let nextHeartRate = activeWorkout.heartRate;
        const targetHeartRate = 70 + (activeWorkout.currentSpeed * 8) + (activeWorkout.currentIncline * 4);
        if (nextHeartRate < targetHeartRate - 2) {
          nextHeartRate += 1;
        } else if (nextHeartRate > targetHeartRate + 2) {
          nextHeartRate -= 1;
        }

        // 6. GPS path simulation
        let nextRoute = [...activeWorkout.route];
        if (activeWorkout.type === 'gps' && nextRoute.length > 0 && nextDuration % 4 === 0) {
          // Add minor walking step simulation coordinates
          const lastPoint = nextRoute[nextRoute.length - 1];
          const latDiff = (Math.random() - 0.5) * 0.00015 * (activeWorkout.currentSpeed / 4);
          const lngDiff = (Math.random() - 0.5) * 0.00015 * (activeWorkout.currentSpeed / 4);
          nextRoute.push({
            lat: lastPoint.lat + latDiff,
            lng: lastPoint.lng + lngDiff
          });
        }

        // 7. Plan intervals progression
        let nextStepIndex = activeWorkout.currentStepIndex;
        let nextTimeRemaining = activeWorkout.timeRemainingInStep - 1;
        let nextSpeed = activeWorkout.currentSpeed;
        let nextIncline = activeWorkout.currentIncline;
        let nextCadence = activeWorkout.currentCadence;

        if (activeWorkout.planId) {
          const plan = WORKOUT_PLANS.find(p => p.id === activeWorkout.planId);
          if (plan) {
            if (nextTimeRemaining <= 0) {
              // Move to next step
              const nextStepIdx = activeWorkout.currentStepIndex + 1;
              if (nextStepIdx < plan.steps.length) {
                const nextStep = plan.steps[nextStepIdx];
                nextStepIndex = nextStepIdx;
                nextTimeRemaining = (nextStep.minuteEnd - nextStep.minuteStart) * 60;
                
                // If autoControlSpeed is enabled, adjust device automatically
                if (activeWorkout.autoControlSpeed) {
                  nextSpeed = nextStep.targetSpeed;
                  nextIncline = nextStep.targetIncline || 0;
                  nextCadence = nextStep.targetCadence || 0;

                  // Write speed/incline to physical BLE device if connected!
                  if (bluetoothConnected) {
                    bleService.setMachineSpeed(nextSpeed);
                    bleService.setMachineIncline(nextIncline);
                  }
                }
              } else {
                // Plan steps exhausted, workout complete!
                nextTimeRemaining = 0;
              }
            }
          }
        }

        set({
          activeWorkout: {
            ...activeWorkout,
            duration: nextDuration,
            distance: nextDistance,
            calories: nextCalories,
            maxSpeed: nextMaxSpeed,
            heartRate: nextHeartRate,
            route: nextRoute,
            currentStepIndex: nextStepIndex,
            timeRemainingInStep: nextTimeRemaining,
            currentSpeed: nextSpeed,
            currentIncline: nextIncline,
            currentCadence: nextCadence,
          }
        });
      },

      finishWorkout: () => {
        const { activeWorkout, bluetoothConnected } = get();
        if (!activeWorkout) return null;

        // Stop the physical treadmill motor if connected!
        if (bluetoothConnected) {
          bleService.stopMachine(false);
        }

        const userStore = useUserStore.getState();

        // Calculate XP and Coins
        const xpEarned = Math.round((activeWorkout.distance * 100) + (activeWorkout.duration / 6) + 50);
        const coinsEarned = Math.round((activeWorkout.distance * 10) + (activeWorkout.duration / 20) + 15);

        const newSession: WorkoutSession = {
          id: activeWorkout.id,
          type: activeWorkout.type,
          date: new Date().toISOString(),
          duration: activeWorkout.duration,
          distance: Number(activeWorkout.distance.toFixed(2)),
          calories: Math.round(activeWorkout.calories),
          avgSpeed: Number((activeWorkout.distance / (activeWorkout.duration / 3600) || activeWorkout.currentSpeed).toFixed(1)),
          maxSpeed: Number(activeWorkout.maxSpeed.toFixed(1)),
          avgCadence: activeWorkout.type === 'bike' ? activeWorkout.currentCadence : undefined,
          route: activeWorkout.type === 'gps' ? activeWorkout.route : undefined,
          completed: true,
          planId: activeWorkout.planId,
          planName: activeWorkout.planName,
          xpEarned,
          coinsEarned,
        };

        // Save to store history
        set((state) => ({
          history: [newSession, ...state.history],
          activeWorkout: null,
          isPaused: false,
        }));

        // Award resources to user profile
        userStore.addCoins(coinsEarned);
        userStore.addXP(xpEarned);
        userStore.incrementStreak();

        return newSession;
      },

      discardWorkout: () => {
        const { bluetoothConnected } = get();
        if (bluetoothConnected) {
          bleService.stopMachine(false);
        }
        set({
          activeWorkout: null,
          isPaused: false,
          gpsSignal: 'none',
        });
      },

      changeSpeed: (speed) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const clampedSpeed = Math.max(0.5, Math.min(speed, 22)); // Max 22km/h
          const roundedSpeed = Number(clampedSpeed.toFixed(1));

          // Write to physical BLE device if connected!
          if (state.bluetoothConnected) {
            bleService.setMachineSpeed(roundedSpeed);
          }

          return {
            activeWorkout: {
              ...state.activeWorkout,
              currentSpeed: roundedSpeed,
            },
          };
        });
      },

      changeIncline: (incline) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const clampedIncline = Math.max(0, Math.min(incline, 15)); // Max 15% incline
          const roundedIncline = Number(clampedIncline.toFixed(1));

          // Write to physical BLE device if connected!
          if (state.bluetoothConnected) {
            bleService.setMachineIncline(roundedIncline);
          }

          return {
            activeWorkout: {
              ...state.activeWorkout,
              currentIncline: roundedIncline,
            },
          };
        });
      },

      changeCadence: (cadence) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const clampedCadence = Math.max(20, Math.min(cadence, 150)); // RPM range 20-150
          return {
            activeWorkout: {
              ...state.activeWorkout,
              currentCadence: Math.round(clampedCadence),
              // Approximate speed based on cadence (e.g. cadence 80 RPM -> ~24 km/h)
              currentSpeed: Number((clampedCadence * 0.3).toFixed(1)),
            },
          };
        });
      },

      toggleAutoControl: () => {
        set((state) => {
          if (!state.activeWorkout) return {};
          return {
            activeWorkout: {
              ...state.activeWorkout,
              autoControlSpeed: !state.activeWorkout.autoControlSpeed,
            },
          };
        });
      },

      startBluetoothSearch: async () => {
        set({ bluetoothSearching: true });
        try {
          const deviceName = await bleService.requestDevice((data) => {
            const active = get().activeWorkout;
            if (active) {
              set({
                activeWorkout: {
                  ...active,
                  currentSpeed: data.speed !== undefined ? data.speed : active.currentSpeed,
                  currentIncline: data.incline !== undefined ? data.incline : active.currentIncline,
                  currentCadence: data.cadence !== undefined ? data.cadence : active.currentCadence,
                  heartRate: data.heartRate !== undefined ? data.heartRate : active.heartRate,
                  distance: data.distance !== undefined ? data.distance : active.distance,
                }
              });
            }
          });

          set({
            bluetoothConnected: true,
            bluetoothSearching: false,
          });
          console.log(`Conectado a dispositivo BLE: ${deviceName}`);
        } catch (err: any) {
          console.error('Error al conectar dispositivo Bluetooth:', err);
          set({
            bluetoothConnected: false,
            bluetoothSearching: false,
          });
          alert('Conexión Bluetooth no completada: ' + (err.message || 'Escaneo cancelado o dispositivo no soportado.'));
        }
      },

      disconnectBluetooth: () => {
        bleService.disconnect();
        set({ bluetoothConnected: false });
      },

      setGpsSignal: (signal) => {
        set({ gpsSignal: signal });
      },

      addRoutePoint: (lat, lng) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          return {
            activeWorkout: {
              ...state.activeWorkout,
              route: [...state.activeWorkout.route, { lat, lng }],
            },
          };
        });
      }
    }),
    {
      name: 'trainier-workout-store',
      partialize: (state) => ({ history: state.history }), // Only persist workout history, not active session!
    }
  )
);
