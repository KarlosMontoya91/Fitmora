import type { WorkoutType } from '../types/workout';

/**
 * Calculates MET (Metabolic Equivalent of Task) for various speeds and workout types.
 */
export const getMET = (type: WorkoutType, speedKmh: number, inclinePercent: number = 0): number => {
  if (type === 'bike') {
    // Stationary biking METs based on speed / intensity
    if (speedKmh < 15) return 3.5; // very light
    if (speedKmh < 20) return 5.5; // light
    if (speedKmh < 25) return 7.0; // moderate
    if (speedKmh < 30) return 8.5; // vigorous
    return 12.0; // competitive / very high
  }

  // Treadmill or GPS Outdoor walking / running
  if (speedKmh <= 0) return 1.0; // Resting

  // Incline effect increases intensity
  const inclineFactor = inclinePercent > 0 ? inclinePercent * 0.4 : 0;

  if (speedKmh < 4.0) {
    return 2.0 + inclineFactor; // slow walk
  } else if (speedKmh < 6.0) {
    return 3.5 + inclineFactor; // brisk walk
  } else if (speedKmh < 8.0) {
    return 5.0 + inclineFactor; // power walk / slow trot
  } else if (speedKmh < 10.0) {
    return 8.0 + inclineFactor * 1.5; // jogging
  } else if (speedKmh < 12.0) {
    return 10.0 + inclineFactor * 1.5; // running moderate
  } else if (speedKmh < 14.0) {
    return 11.5 + inclineFactor * 1.5; // running fast
  }
  return 13.0 + inclineFactor * 1.5; // running sprinting
};

/**
 * Estimates calories burned in 1 second.
 * Formula: Calories/min = MET * 3.5 * Weight (kg) / 200
 * Calories/sec = (MET * 3.5 * Weight / 200) / 60
 */
export const calculateCaloriesPerSecond = (
  type: WorkoutType,
  speedKmh: number,
  weightKg: number,
  inclinePercent: number = 0
): number => {
  const met = getMET(type, speedKmh, inclinePercent);
  const caloriesPerMinute = (met * 3.5 * weightKg) / 200;
  return caloriesPerMinute / 60;
};
