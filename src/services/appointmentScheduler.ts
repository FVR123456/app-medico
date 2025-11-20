/**
 * Servicio para manejo de horarios de citas
 * 
 * Reglas de negocio:
 * - Lunes a Viernes: 18:00 - 21:00 (aprobación automática)
 * - Sábado y Domingo: 10:00 - 20:00 (requiere aprobación del doctor)
 * - Intervalos de 30 minutos
 */

export interface TimeSlot {
  time: string;
  available: boolean;
  requiresApproval: boolean;
}

export interface ScheduleConfig {
  startHour: number;
  endHour: number;
  requiresApproval: boolean;
}

/**
 * Obtiene la configuración de horario según el día de la semana
 */
export const getScheduleConfig = (date: string): ScheduleConfig => {
  const selectedDate = new Date(date + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

  // Fin de semana (Sábado y Domingo)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      startHour: 10,
      endHour: 20,
      requiresApproval: true
    };
  }

  // Lunes a Viernes
  return {
    startHour: 18,
    endHour: 21,
    requiresApproval: false
  };
};

/**
 * Verifica si una fecha es fin de semana
 */
export const isWeekend = (date: string): boolean => {
  const selectedDate = new Date(date + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Genera slots de tiempo disponibles para una fecha
 */
export const generateTimeSlots = (date: string): string[] => {
  const config = getScheduleConfig(date);
  const slots: string[] = [];

  for (let hour = config.startHour; hour < config.endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return slots;
};

/**
 * Valida si un horario es válido para una fecha específica
 */
export const isValidTimeSlot = (date: string, time: string): boolean => {
  const config = getScheduleConfig(date);
  const [hours, minutes] = time.split(':').map(Number);

  if (minutes !== 0 && minutes !== 30) {
    return false;
  }

  return hours >= config.startHour && hours < config.endHour;
};

/**
 * Obtiene el nombre del día de la semana
 */
export const getDayName = (date: string | undefined | null): string => {
  if (!date) return '';
  
  try {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const selectedDate = new Date(date + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) return '';
    
    return days[selectedDate.getDay()];
  } catch {
    return '';
  }
};

/**
 * Formatea la fecha para mostrar
 */
export const formatDate = (date: string | undefined | null): string => {
  if (!date) return '--/--/----';
  
  try {
    const selectedDate = new Date(date + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) return date;
    
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return date;
  }
};

/**
 * Formatea el horario para mostrar (formato 12 horas)
 */
export const formatTime = (time: string | undefined | null): string => {
  if (!time) return '--:--';
  
  const parts = time.split(':');
  if (parts.length < 2) return time;
  
  const [hours, minutes] = parts.map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Valida si una fecha y hora son futuras
 */
export const isFutureDateTime = (date: string, time: string): boolean => {
  const appointmentDateTime = new Date(`${date}T${time}`);
  return appointmentDateTime > new Date();
};

/**
 * Obtiene mensaje informativo sobre el horario
 */
export const getScheduleInfo = (date: string): string => {
  const config = getScheduleConfig(date);
  const dayName = getDayName(date);
  
  if (config.requiresApproval) {
    return `${dayName}: ${formatTime(`${config.startHour}:00`)} - ${formatTime(`${config.endHour}:00`)} (Requiere aprobación del doctor)`;
  }
  
  return `${dayName}: ${formatTime(`${config.startHour}:00`)} - ${formatTime(`${config.endHour}:00`)} (Aprobación automática)`;
};
