import { WorkoutPlan } from '../types/workout';

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'treadmill_beginner',
    name: 'Caminadora Principiante',
    description: 'Perfecto para empezar a moverte. Combina caminata suave con caminata activa.',
    type: 'treadmill',
    durationDays: 7,
    difficulty: 'beginner',
    steps: [
      { minuteStart: 0, minuteEnd: 3, targetSpeed: 4.0, targetIncline: 1.0, intensity: 'warmup', label: 'Calentamiento Suave' },
      { minuteStart: 3, minuteEnd: 8, targetSpeed: 5.2, targetIncline: 2.0, intensity: 'moderate', label: 'Caminata Activa' },
      { minuteStart: 8, minuteEnd: 11, targetSpeed: 4.5, targetIncline: 1.0, intensity: 'warmup', label: 'Recuperación Activa' },
      { minuteStart: 11, minuteEnd: 16, targetSpeed: 5.5, targetIncline: 2.5, intensity: 'moderate', label: 'Esfuerzo Moderado' },
      { minuteStart: 16, minuteEnd: 20, targetSpeed: 4.0, targetIncline: 1.0, intensity: 'cooldown', label: 'Enfriamiento y Estiramiento' }
    ]
  },
  {
    id: 'treadmill_weight_loss',
    name: 'Quema Grasa Express',
    description: 'Intervalos de caminata rápida y trote suave diseñados para maximizar calorías.',
    type: 'treadmill',
    durationDays: 15,
    difficulty: 'intermediate',
    steps: [
      { minuteStart: 0, minuteEnd: 3, targetSpeed: 4.5, targetIncline: 1.0, intensity: 'warmup', label: 'Entrando en Calor' },
      { minuteStart: 3, minuteEnd: 7, targetSpeed: 6.0, targetIncline: 2.0, intensity: 'moderate', label: 'Caminata Veloz' },
      { minuteStart: 7, minuteEnd: 10, targetSpeed: 8.0, targetIncline: 2.0, intensity: 'high', label: 'Trote Intenso' },
      { minuteStart: 10, minuteEnd: 13, targetSpeed: 5.0, targetIncline: 1.5, intensity: 'moderate', label: 'Recuperación Activa' },
      { minuteStart: 13, minuteEnd: 17, targetSpeed: 8.5, targetIncline: 2.0, intensity: 'high', label: 'Segundo Intervalo Trote' },
      { minuteStart: 17, minuteEnd: 20, targetSpeed: 4.0, targetIncline: 0.0, intensity: 'cooldown', label: 'Vuelta a la Calma' }
    ]
  },
  {
    id: 'treadmill_intervals',
    name: 'Resistencia Extrema H.I.I.T',
    description: 'Entrenamiento interválico de alta intensidad en caminadora para corredores avanzados.',
    type: 'treadmill',
    durationDays: 30,
    difficulty: 'advanced',
    steps: [
      { minuteStart: 0, minuteEnd: 4, targetSpeed: 5.0, targetIncline: 1.0, intensity: 'warmup', label: 'Calentamiento Dinámico' },
      { minuteStart: 4, minuteEnd: 6, targetSpeed: 10.0, targetIncline: 2.0, intensity: 'high', label: 'Sprint Máximo' },
      { minuteStart: 6, minuteEnd: 8, targetSpeed: 5.5, targetIncline: 1.0, intensity: 'moderate', label: 'Trote Suave' },
      { minuteStart: 8, minuteEnd: 10, targetSpeed: 10.5, targetIncline: 3.0, intensity: 'high', label: 'Sprint Pendiente' },
      { minuteStart: 10, minuteEnd: 12, targetSpeed: 5.5, targetIncline: 1.0, intensity: 'moderate', label: 'Trote Suave' },
      { minuteStart: 12, minuteEnd: 14, targetSpeed: 11.0, targetIncline: 2.0, intensity: 'high', label: 'Sprint Final' },
      { minuteStart: 14, minuteEnd: 17, targetSpeed: 5.0, targetIncline: 1.0, intensity: 'cooldown', label: 'Recuperación Progresiva' },
      { minuteStart: 17, minuteEnd: 20, targetSpeed: 4.0, targetIncline: 0.0, intensity: 'cooldown', label: 'Enfriamiento Completo' }
    ]
  },
  {
    id: 'bike_intervals',
    name: 'Sprints de Bicicleta',
    description: 'Intervalos de alta revolución por minuto (RPM) en bicicleta fija para ganar potencia.',
    type: 'bike',
    durationDays: 7,
    difficulty: 'intermediate',
    steps: [
      { minuteStart: 0, minuteEnd: 3, targetSpeed: 18, targetCadence: 65, intensity: 'warmup', label: 'Pedaleo Suave' },
      { minuteStart: 3, minuteEnd: 7, targetSpeed: 25, targetCadence: 80, intensity: 'moderate', label: 'Ritmo Constante' },
      { minuteStart: 7, minuteEnd: 9, targetSpeed: 35, targetCadence: 100, intensity: 'high', label: 'Sprint Cadencia Alta' },
      { minuteStart: 9, minuteEnd: 12, targetSpeed: 20, targetCadence: 70, intensity: 'moderate', label: 'Pedaleo de Recuperación' },
      { minuteStart: 12, minuteEnd: 14, targetSpeed: 38, targetCadence: 105, intensity: 'high', label: 'Sprint de Poder' },
      { minuteStart: 14, minuteEnd: 17, targetSpeed: 22, targetCadence: 75, intensity: 'moderate', label: 'Pedaleo de Recuperación' },
      { minuteStart: 17, minuteEnd: 20, targetSpeed: 15, targetCadence: 60, intensity: 'cooldown', label: 'Vuelta a la Calma' }
    ]
  },
  {
    id: 'bike_power_climb',
    name: 'Bicicleta: Escalada de Resistencia',
    description: 'Simula una subida de montaña exigente. Enfoque en fuerza física y respiración.',
    type: 'bike',
    durationDays: 15,
    difficulty: 'advanced',
    steps: [
      { minuteStart: 0, minuteEnd: 4, targetSpeed: 16, targetCadence: 70, intensity: 'warmup', label: 'Calentamiento Plano' },
      { minuteStart: 4, minuteEnd: 9, targetSpeed: 22, targetCadence: 60, intensity: 'moderate', label: 'Colina Ligera (Resistencia 6)' },
      { minuteStart: 9, minuteEnd: 14, targetSpeed: 26, targetCadence: 55, intensity: 'high', label: 'Cuesta Empinada (Resistencia 10)' },
      { minuteStart: 14, minuteEnd: 17, targetSpeed: 18, targetCadence: 80, intensity: 'moderate', label: 'Descenso Rápido' },
      { minuteStart: 17, minuteEnd: 20, targetSpeed: 12, targetCadence: 60, intensity: 'cooldown', label: 'Pedaleo Ligero' }
    ]
  },
  {
    id: 'gps_explorer',
    name: 'Explorador al Aire Libre',
    description: 'Entrenamiento guiado al aire libre. Registra tus rutas y mantén ritmos estables.',
    type: 'gps',
    durationDays: 15,
    difficulty: 'beginner',
    steps: [
      { minuteStart: 0, minuteEnd: 4, targetSpeed: 4.5, intensity: 'warmup', label: 'Caminata Preparativa' },
      { minuteStart: 4, minuteEnd: 14, targetSpeed: 6.0, intensity: 'moderate', label: 'Marcha Rápida GPS' },
      { minuteStart: 14, minuteEnd: 17, targetSpeed: 7.5, intensity: 'high', label: 'Trote Dinámico' },
      { minuteStart: 17, minuteEnd: 20, targetSpeed: 4.0, intensity: 'cooldown', label: 'Caminata de Retorno' }
    ],
    goalDistance: 3.0
  }
];
