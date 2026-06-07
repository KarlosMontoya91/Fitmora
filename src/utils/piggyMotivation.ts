export const getPiggyMotivationMessage = (profile: any, history: any[]) => {
  const totalDistance = history.reduce((acc, curr) => acc + curr.distance, 0);
  const currentLevel = Math.floor(totalDistance / 5) + 1;
  const distanceInCurrentLevel = totalDistance % 5;
  const kmRemaining = 5 - distanceInCurrentLevel;

  // 1. If no workouts yet (0 km)
  if (history.length === 0 || totalDistance === 0) {
    return "¡Hola! Soy tu cochinito Fitmora. 🐷 ¡Veo que aún no hemos entrenado! Vamos a la sección de 'Entrenar' para iniciar nuestra primera sesión juntos. ¡Estoy listo para correr! 👟🔥";
  }

  // 2. If close to level up (less than 1 km remaining)
  if (kmRemaining <= 1.0) {
    const meters = Math.round(kmRemaining * 1000);
    return `¡Oye, mira! Faltan solo ${meters} metros para subir al Nivel ${currentLevel + 1} y hacerme más fuerte. ¡Hagamos una caminadora o rodada corta para lograrlo hoy! 🐷⚡`;
  }

  // 3. If they just finished a workout (within the last 2 hours)
  if (history.length > 0) {
    const lastWorkout = history[0];
    const timeSinceLastWorkout = Date.now() - new Date(lastWorkout.date).getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    if (timeSinceLastWorkout < twoHours) {
      return `¡Qué gran entrenamiento! Sumamos ${lastWorkout.distance.toFixed(2)} km a nuestra meta. ¡Me siento con más energía! Sigue así y pronto desbloquearemos recompensas. 🐷🏆`;
    }
  }

  // 4. If they have a high active streak
  if (profile.streak >= 3) {
    return `¡Impresionante! Llevamos una racha de ${profile.streak} días activos. ¡Mantengamos el fuego encendido hoy para que no se apague! 🔥🐷`;
  }

  // 5. If they haven't logged weight in a while (e.g. no weight records or last one is > 7 days ago)
  if (profile.weightHistory && profile.weightHistory.length > 0) {
    const lastWeight = profile.weightHistory[profile.weightHistory.length - 1];
    const daysSinceWeight = (Date.now() - new Date(lastWeight.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceWeight > 7) {
      return "Oye, ha pasado más de una semana desde tu último registro de peso. ⚖️ ¡Actualízalo en tu perfil para que podamos medir nuestro avance físico real! 🐷";
    }
  }

  // 6. Generic motivational messages based on evolution phase
  if (currentLevel <= 10) {
    return `Estamos en la Etapa 1. Estoy un poco pequeño y sucio con lodo, pero cada kilómetro que corremos me ayuda a crecer. ¡Vamos a entrenar! 🐷💦`;
  } else if (currentLevel <= 20) {
    return `¡Llegamos a la Etapa 2! Ya tengo mi banda deportiva verde en la cabeza. ¡Estamos pedaleando y corriendo con fuerza! 🏃‍♂️💨`;
  } else if (currentLevel <= 30) {
    return `¡Etapa 3 activa! Mira estos músculos, ¡hacer ejercicio da resultados! Sigue adelante para evolucionar a mi siguiente fase. 🏋️‍♂️🐷`;
  } else if (currentLevel <= 40) {
    return `¡Etapa 4 alcanzada! Con mi chaleco de entrenamiento y esta fuerza, no le temo a ninguna rutina. ¡Hagamos unos kilómetros hoy! ⚡🐷`;
  } else {
    return `¡Etapa 5, nivel supremo! Soy el Cochinito Guerrero Campeón. ¡Gracias por llevarme hasta aquí! Vamos por más récords personales. 🏆👑`;
  }
};
