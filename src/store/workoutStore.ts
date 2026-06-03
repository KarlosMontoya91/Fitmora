import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutSession, WorkoutType, WorkoutPlan, WorkoutStep, WorkoutSplit } from '../types/workout';
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
  
  // Physics & wall-clock sync engine
  lastTickTime: number; // absolute timestamp of the last tick
  splits: WorkoutSplit[];
  currentSegmentDuration: number; // time spent in current speed/incline segment
  currentSegmentDistance: number; // distance covered in current segment
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
  startTimer: () => void;
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

// Helper to integrate elapsed metrics based on delta time
const integrateWorkoutMetrics = (
  active: ActiveWorkoutState,
  isPaused: boolean,
  now: number,
  weight: number
) => {
  if (isPaused || active.currentSpeed <= 0) {
    return {
      duration: active.duration,
      distance: active.distance,
      calories: active.calories,
      currentSegmentDuration: active.currentSegmentDuration,
      currentSegmentDistance: active.currentSegmentDistance,
      lastTickTime: now,
    };
  }

  const deltaSec = (now - active.lastTickTime) / 1000;
  if (deltaSec <= 0) {
    return {
      duration: active.duration,
      distance: active.distance,
      calories: active.calories,
      currentSegmentDuration: active.currentSegmentDuration,
      currentSegmentDistance: active.currentSegmentDistance,
      lastTickTime: now,
    };
  }

  // 1. Time duration
  const nextDuration = active.duration + deltaSec;

  // 2. Calories
  const calorieBurnPerSec = calculateCaloriesPerSecond(
    active.type,
    active.currentSpeed,
    weight,
    active.currentIncline
  );
  const nextCalories = active.calories + (calorieBurnPerSec * deltaSec);

  // 3. Distance (Speed in km/h -> km/s)
  const distancePerSec = active.currentSpeed / 3600;
  const deltaDistance = distancePerSec * deltaSec;
  const nextDistance = active.distance + deltaDistance;

  // 4. Current Segment/Split accumulation
  const nextSegmentDuration = active.currentSegmentDuration + deltaSec;
  const nextSegmentDistance = active.currentSegmentDistance + deltaDistance;

  return {
    duration: nextDuration,
    distance: nextDistance,
    calories: nextCalories,
    currentSegmentDuration: nextSegmentDuration,
    currentSegmentDistance: nextSegmentDistance,
    lastTickTime: now,
  };
};

// Helper to transition the current active split to the lists
const transitionSplit = (active: ActiveWorkoutState): WorkoutSplit[] => {
  if (active.currentSegmentDuration > 0 || active.currentSegmentDistance > 0) {
    const newSplit: WorkoutSplit = {
      speed: active.currentSpeed,
      incline: active.currentIncline,
      duration: Number(active.currentSegmentDuration.toFixed(1)),
      distance: Number(active.currentSegmentDistance.toFixed(3)),
    };
    return [...active.splits, newSplit];
  }
  return active.splits;
};

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

        const now = Date.now();
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
            lastTickTime: now,
            splits: [],
            currentSegmentDuration: 0,
            currentSegmentDistance: 0,
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

      startTimer: () => {
        set((state) => {
          if (!state.activeWorkout) return {};
          return {
            activeWorkout: {
              ...state.activeWorkout,
              lastTickTime: Date.now(),
              currentSegmentDuration: 0,
              currentSegmentDistance: 0,
            }
          };
        });
      },

      pauseWorkout: () => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const now = Date.now();
          const userStore = useUserStore.getState();
          const weight = userStore.profile?.weight || 70;
          
          // Integrate pending metrics before pausing
          const integrated = integrateWorkoutMetrics(state.activeWorkout, false, now, weight);
          const nextSplits = transitionSplit({ ...state.activeWorkout, ...integrated });

          return {
            isPaused: true,
            activeWorkout: {
              ...state.activeWorkout,
              ...integrated,
              splits: nextSplits,
              currentSegmentDuration: 0,
              currentSegmentDistance: 0,
              lastTickTime: now,
            }
          };
        });
      },

      resumeWorkout: () => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const now = Date.now();
          return {
            isPaused: false,
            activeWorkout: {
              ...state.activeWorkout,
              lastTickTime: now,
              currentSegmentDuration: 0,
              currentSegmentDistance: 0,
            }
          };
        });
      },

      tick: () => {
        const { activeWorkout, isPaused, bluetoothConnected } = get();
        if (!activeWorkout || isPaused) return;

        const now = Date.now();
        const userStore = useUserStore.getState();
        const weight = userStore.profile?.weight || 70;

        // If speed is 0, the workout is auto-paused/stopped.
        // We tick the lastTickTime so we keep up to date with wall clock, but do not increment duration.
        if (activeWorkout.currentSpeed <= 0) {
          set({
            activeWorkout: {
              ...activeWorkout,
              lastTickTime: now,
            }
          });
          return;
        }

        // Integrate time, distance, and calories using deltaSec
        const integrated = integrateWorkoutMetrics(activeWorkout, false, now, weight);

        // Max speed tracking
        const nextMaxSpeed = Math.max(activeWorkout.maxSpeed, activeWorkout.currentSpeed);

        // Heart rate simulation (rises/falls slightly based on speed and incline)
        const deltaSec = (now - activeWorkout.lastTickTime) / 1000;
        let nextHeartRate = activeWorkout.heartRate;
        const targetHeartRate = 70 + (activeWorkout.currentSpeed * 8) + (activeWorkout.currentIncline * 4);
        if (nextHeartRate < targetHeartRate - 2) {
          nextHeartRate += 1 * deltaSec;
        } else if (nextHeartRate > targetHeartRate + 2) {
          nextHeartRate -= 1 * deltaSec;
        }

        // GPS path simulation (every 4 seconds)
        let nextRoute = [...activeWorkout.route];
        if (activeWorkout.type === 'gps' && nextRoute.length > 0 && Math.floor(integrated.duration) % 4 === 0 && Math.floor(activeWorkout.duration) % 4 !== 0) {
          const lastPoint = nextRoute[nextRoute.length - 1];
          const latDiff = (Math.random() - 0.5) * 0.00015 * (activeWorkout.currentSpeed / 4);
          const lngDiff = (Math.random() - 0.5) * 0.00015 * (activeWorkout.currentSpeed / 4);
          nextRoute.push({
            lat: lastPoint.lat + latDiff,
            lng: lastPoint.lng + lngDiff
          });
        }

        // Plan intervals progression
        let nextStepIndex = activeWorkout.currentStepIndex;
        let nextTimeRemaining = activeWorkout.timeRemainingInStep - deltaSec;
        let nextSpeed = activeWorkout.currentSpeed;
        let nextIncline = activeWorkout.currentIncline;
        let nextCadence = activeWorkout.currentCadence;
        let finalSplits = activeWorkout.splits;
        let finalSegDuration = integrated.currentSegmentDuration;
        let finalSegDistance = integrated.currentSegmentDistance;

        if (activeWorkout.planId) {
          const plan = WORKOUT_PLANS.find(p => p.id === activeWorkout.planId);
          if (plan) {
            if (nextTimeRemaining <= 0) {
              const nextStepIdx = activeWorkout.currentStepIndex + 1;
              if (nextStepIdx < plan.steps.length) {
                const nextStep = plan.steps[nextStepIdx];
                nextStepIndex = nextStepIdx;
                nextTimeRemaining = (nextStep.minuteEnd - nextStep.minuteStart) * 60;
                
                if (activeWorkout.autoControlSpeed) {
                  // Transition the old segment split
                  const withIntegrated = { ...activeWorkout, ...integrated };
                  finalSplits = transitionSplit(withIntegrated);
                  finalSegDuration = 0;
                  finalSegDistance = 0;

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
                nextTimeRemaining = 0;
              }
            }
          }
        }

        set({
          activeWorkout: {
            ...activeWorkout,
            ...integrated,
            splits: finalSplits,
            currentSegmentDuration: finalSegDuration,
            currentSegmentDistance: finalSegDistance,
            maxSpeed: nextMaxSpeed,
            heartRate: Math.round(nextHeartRate),
            route: nextRoute,
            currentStepIndex: nextStepIndex,
            timeRemainingInStep: Math.max(0, nextTimeRemaining),
            currentSpeed: nextSpeed,
            currentIncline: nextIncline,
            currentCadence: nextCadence,
            lastTickTime: now,
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

        const now = Date.now();
        const userStore = useUserStore.getState();
        const weight = userStore.profile?.weight || 70;

        // Integrate any pending metrics up to now
        const integrated = integrateWorkoutMetrics(activeWorkout, false, now, weight);
        const finalSplits = transitionSplit({ ...activeWorkout, ...integrated });

        // Calculate XP and Coins
        const finalDistance = Number(integrated.distance.toFixed(2));
        const finalDuration = Math.round(integrated.duration);
        const xpEarned = Math.round((finalDistance * 100) + (finalDuration / 6) + 50);
        const coinsEarned = Math.round((finalDistance * 10) + (finalDuration / 20) + 15);

        const newSession: WorkoutSession = {
          id: activeWorkout.id,
          type: activeWorkout.type,
          date: new Date().toISOString(),
          duration: finalDuration,
          distance: finalDistance,
          calories: Math.round(integrated.calories),
          avgSpeed: Number((finalDistance / (finalDuration / 3600) || activeWorkout.currentSpeed).toFixed(1)),
          maxSpeed: Number(activeWorkout.maxSpeed.toFixed(1)),
          avgCadence: activeWorkout.type === 'bike' ? activeWorkout.currentCadence : undefined,
          route: activeWorkout.type === 'gps' ? activeWorkout.route : undefined,
          completed: true,
          planId: activeWorkout.planId,
          planName: activeWorkout.planName,
          xpEarned,
          coinsEarned,
          splits: finalSplits,
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
          const clampedSpeed = Math.max(0, Math.min(speed, 22)); // Max 22km/h (allow 0 to pause)
          const roundedSpeed = Number(clampedSpeed.toFixed(1));

          // Write to physical BLE device if connected!
          if (state.bluetoothConnected) {
            bleService.setMachineSpeed(roundedSpeed);
          }

          const now = Date.now();
          const userStore = useUserStore.getState();
          const weight = userStore.profile?.weight || 70;

          // Integrate pending metrics with the OLD speed
          const integrated = integrateWorkoutMetrics(state.activeWorkout, state.isPaused, now, weight);
          
          let finalSplits = state.activeWorkout.splits;
          let finalSegDuration = integrated.currentSegmentDuration;
          let finalSegDistance = integrated.currentSegmentDistance;

          if (roundedSpeed !== state.activeWorkout.currentSpeed) {
            finalSplits = transitionSplit({ ...state.activeWorkout, ...integrated });
            finalSegDuration = 0;
            finalSegDistance = 0;
          }

          return {
            activeWorkout: {
              ...state.activeWorkout,
              ...integrated,
              splits: finalSplits,
              currentSegmentDuration: finalSegDuration,
              currentSegmentDistance: finalSegDistance,
              currentSpeed: roundedSpeed,
              maxSpeed: Math.max(state.activeWorkout.maxSpeed, roundedSpeed),
              lastTickTime: now,
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

          const now = Date.now();
          const userStore = useUserStore.getState();
          const weight = userStore.profile?.weight || 70;

          // Integrate pending metrics with the OLD incline
          const integrated = integrateWorkoutMetrics(state.activeWorkout, state.isPaused, now, weight);
          
          let finalSplits = state.activeWorkout.splits;
          let finalSegDuration = integrated.currentSegmentDuration;
          let finalSegDistance = integrated.currentSegmentDistance;

          if (roundedIncline !== state.activeWorkout.currentIncline) {
            finalSplits = transitionSplit({ ...state.activeWorkout, ...integrated });
            finalSegDuration = 0;
            finalSegDistance = 0;
          }

          return {
            activeWorkout: {
              ...state.activeWorkout,
              ...integrated,
              splits: finalSplits,
              currentSegmentDuration: finalSegDuration,
              currentSegmentDistance: finalSegDistance,
              currentIncline: roundedIncline,
              lastTickTime: now,
            },
          };
        });
      },

      changeCadence: (cadence) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          const clampedCadence = Math.max(20, Math.min(cadence, 150)); // RPM range 20-150
          const roundedCadence = Math.round(clampedCadence);
          const newSpeed = Number((roundedCadence * 0.3).toFixed(1));

          const now = Date.now();
          const userStore = useUserStore.getState();
          const weight = userStore.profile?.weight || 70;

          // Integrate pending metrics with the OLD speed
          const integrated = integrateWorkoutMetrics(state.activeWorkout, state.isPaused, now, weight);

          let finalSplits = state.activeWorkout.splits;
          let finalSegDuration = integrated.currentSegmentDuration;
          let finalSegDistance = integrated.currentSegmentDistance;

          if (newSpeed !== state.activeWorkout.currentSpeed) {
            finalSplits = transitionSplit({ ...state.activeWorkout, ...integrated });
            finalSegDuration = 0;
            finalSegDistance = 0;
          }

          return {
            activeWorkout: {
              ...state.activeWorkout,
              ...integrated,
              splits: finalSplits,
              currentSegmentDuration: finalSegDuration,
              currentSegmentDistance: finalSegDistance,
              currentCadence: roundedCadence,
              currentSpeed: newSpeed,
              maxSpeed: Math.max(state.activeWorkout.maxSpeed, newSpeed),
              lastTickTime: now,
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
              const now = Date.now();
              const userStore = useUserStore.getState();
              const weight = userStore.profile?.weight || 70;
              
              // Integrate metrics with the OLD speed/incline first
              const integrated = integrateWorkoutMetrics(active, get().isPaused, now, weight);

              const nextSpeed = data.speed !== undefined ? data.speed : active.currentSpeed;
              const nextIncline = data.incline !== undefined ? data.incline : active.currentIncline;
              const nextCadence = data.cadence !== undefined ? data.cadence : active.currentCadence;
              const nextHeartRate = data.heartRate !== undefined ? data.heartRate : active.heartRate;
              
              // Use device distance if provided, otherwise use integrated distance
              const nextDistance = data.distance !== undefined ? data.distance : integrated.distance;

              let finalSplits = active.splits;
              let finalSegDuration = integrated.currentSegmentDuration;
              let finalSegDistance = integrated.currentSegmentDistance;

              if (nextSpeed !== active.currentSpeed || nextIncline !== active.currentIncline) {
                finalSplits = transitionSplit({ ...active, ...integrated });
                finalSegDuration = 0;
                finalSegDistance = 0;
              }

              set({
                activeWorkout: {
                  ...active,
                  ...integrated,
                  splits: finalSplits,
                  currentSegmentDuration: finalSegDuration,
                  currentSegmentDistance: finalSegDistance,
                  currentSpeed: nextSpeed,
                  currentIncline: nextIncline,
                  currentCadence: nextCadence,
                  heartRate: nextHeartRate,
                  distance: nextDistance,
                  maxSpeed: Math.max(active.maxSpeed, nextSpeed),
                  lastTickTime: now,
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
      name: 'fitmora-workout-store',
      partialize: (state) => ({ history: state.history }), // Only persist workout history, not active session!
    }
  )
);
