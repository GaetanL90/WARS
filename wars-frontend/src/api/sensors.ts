/**
 * Sensors API Service
 * API endpoint wrappers for sensor-related operations
 * Falls back to mock data when backend is not available
 */

import api from './axios';
import type { Sensor, SensorActivity, SensorReading, SensorCategory } from '../types/Sensor';
import {
  getSensors as getMockSensors,
  getSensorActivities as getMockSensorActivities,
  seedMockSensors,
  startSensorSimulation,
} from '../utils/mockSensorData';

/**
 * Get all sensors
 * Uses mock data for simulation (backend not yet available)
 * @param filters - Optional filters for category and location
 * @returns Promise that resolves with an array of sensors
 */
export const getAllSensors = async (filters?: {
  category?: SensorCategory;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}): Promise<Sensor[]> => {
  // Use mock data directly for simulation
  seedMockSensors();
  startSensorSimulation();
  
  let sensors = getMockSensors();
  
  // Apply filters
  if (filters?.category) {
    sensors = sensors.filter(s => s.category === filters.category);
  }
  if (filters?.province) {
    sensors = sensors.filter(s => s.province === filters.province);
  }
  if (filters?.district) {
    sensors = sensors.filter(s => s.district === filters.district);
  }
  if (filters?.sector) {
    sensors = sensors.filter(s => s.sector === filters.sector);
  }
  if (filters?.cell) {
    sensors = sensors.filter(s => s.cell === filters.cell);
  }
  if (filters?.village) {
    sensors = sensors.filter(s => s.village === filters.village);
  }
  
  return sensors;
};

/**
 * Get a single sensor by ID
 * Uses mock data for simulation (backend not yet available)
 * @param id - The ID of the sensor to retrieve
 * @returns Promise that resolves with the sensor
 */
export const getSensor = async (id: string): Promise<Sensor> => {
  // Use mock data directly for simulation
  seedMockSensors();
  const sensors = getMockSensors();
  const sensor = sensors.find(s => s.id === id);
  if (!sensor) {
    throw new Error('Sensor not found');
  }
  return sensor;
};

/**
 * Get real-time sensor activities
 * Uses mock data for simulation (backend not yet available)
 * @param filters - Optional filters for category and location
 * @param limit - Maximum number of activities to return (default: 100)
 * @returns Promise that resolves with an array of sensor activities
 */
export const getSensorActivities = async (
  filters?: {
    category?: SensorCategory;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    sensorId?: string;
  },
  limit: number = 100
): Promise<SensorActivity[]> => {
  // Use mock data directly for simulation
  seedMockSensors();
  startSensorSimulation();
  
  let activities = getMockSensorActivities();
  
  // Apply filters
  if (filters?.category) {
    activities = activities.filter(a => a.category === filters.category);
  }
  if (filters?.sensorId) {
    activities = activities.filter(a => a.sensorId === filters.sensorId);
  }
  // Location filters - parse location string
  if (filters?.province || filters?.district || filters?.sector || filters?.cell || filters?.village) {
    activities = activities.filter(a => {
      const parts = a.location.split(',').map(p => p.trim());
      if (filters?.village && parts[0] !== filters.village) return false;
      if (filters?.cell && parts[1] !== filters.cell) return false;
      if (filters?.sector && parts[2] !== filters.sector) return false;
      if (filters?.district && parts[3] !== filters.district) return false;
      if (filters?.province && parts[4] !== filters.province) return false;
      return true;
    });
  }
  
  // Sort by timestamp (newest first)
  activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // If filtering by sensorId, return all matching activities (don't limit)
  // Otherwise, apply limit
  if (filters?.sensorId) {
    return activities; // Return all activities for the selected sensor
  }
  
  return activities.slice(0, limit);
};

/**
 * Get sensor readings for a specific sensor
 * @param sensorId - The ID of the sensor
 * @param startDate - Optional start date for readings (ISO string)
 * @param endDate - Optional end date for readings (ISO string)
 * @param limit - Maximum number of readings to return (default: 100)
 * @returns Promise that resolves with an array of sensor readings
 */
export const getSensorReadings = async (
  sensorId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100
): Promise<SensorReading[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString();
  const response = await api.get<SensorReading[]>(
    `/sensors/${sensorId}/readings/?${queryString}`
  );
  return response.data;
};

// Track last timestamp per subscription
const subscriptionTimestamps = new Map<symbol, number>();

/**
 * Subscribe to real-time sensor updates via WebSocket or polling
 * Uses polling with mock data when backend is not available
 * @param sensorIds - Array of sensor IDs to subscribe to (empty = all sensors)
 * @param onUpdate - Callback function for receiving updates
 * @returns Function to unsubscribe
 */
export const subscribeToSensorUpdates = (
  sensorIds: string[] = [],
  onUpdate: (activity: SensorActivity) => void
): (() => void) => {
  // Start mock simulation if not already running
  startSensorSimulation();
  
  // Create unique ID for this subscription
  const subscriptionId = Symbol('sensor-subscription');
  subscriptionTimestamps.set(subscriptionId, Date.now());
  
  // Poll for new activities every 3 seconds (simulating real-time)
  const pollInterval = setInterval(async () => {
    try {
      const activities = await getSensorActivities(
        sensorIds.length > 0 ? { sensorId: sensorIds[0] } : undefined,
        5 // Get latest 5 activities to check for new ones
      );
      
      if (activities.length > 0) {
        const lastTimestamp = subscriptionTimestamps.get(subscriptionId) || 0;
        
        // Find activities newer than last timestamp
        const newActivities = activities.filter(a => {
          const activityTime = new Date(a.timestamp).getTime();
          return activityTime > lastTimestamp;
        });
        
        // Update timestamp and call onUpdate for each new activity
        newActivities.forEach(activity => {
          const activityTime = new Date(activity.timestamp).getTime();
          subscriptionTimestamps.set(subscriptionId, activityTime);
          onUpdate(activity);
        });
      }
    } catch (error) {
      // Silently handle errors
    }
  }, 3000); // Poll every 3 seconds
  
  // Return unsubscribe function
  return () => {
    clearInterval(pollInterval);
    subscriptionTimestamps.delete(subscriptionId);
  };
};

