/**
 * Sensor Category
 */
export const SensorCategory = {
  WATER_HYGIENE: 'water_hygiene', // Potability sensors
  PIPE_FAILURE: 'pipe_failure', // Leaking, pipe damage sensors
} as const;

export type SensorCategory = typeof SensorCategory[keyof typeof SensorCategory];

/**
 * Sensor Status
 */
export const SensorStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
} as const;

export type SensorStatus = typeof SensorStatus[keyof typeof SensorStatus];

/**
 * Sensor Reading Interface
 * Represents a single reading from a sensor
 */
export interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  unit: string; // e.g., 'ppm', 'L/min', 'pH'
  timestamp: string; // ISO date string
  status: 'normal' | 'warning' | 'critical';
  metadata?: Record<string, any>; // Additional sensor-specific data
}

/**
 * Sensor Interface
 * Represents an IoT sensor in the system
 */
export interface Sensor {
  id: string;
  name: string;
  category: SensorCategory;
  location: string; // Full location string (Village, Cell, Sector, District, Province)
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  status: SensorStatus;
  lastReading?: SensorReading;
  lastReadingTime?: string; // ISO date string
  isActive: boolean;
  description?: string;
  installationDate?: string; // ISO date string
  metadata?: Record<string, any>; // Additional sensor configuration
}

/**
 * Sensor Activity Interface
 * Represents real-time sensor activity/event
 */
export interface SensorActivity {
  id: string;
  sensorId: string;
  sensorName: string;
  category: SensorCategory;
  location: string;
  eventType: 'reading' | 'alert' | 'status_change' | 'maintenance';
  message: string;
  value?: number;
  unit?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string; // ISO date string
}

