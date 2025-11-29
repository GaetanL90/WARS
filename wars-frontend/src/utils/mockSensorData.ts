/**
 * Mock Sensor Data Storage Utility
 * Stores sensors and sensor activities in localStorage for simulation
 */

import type { Sensor, SensorActivity } from '../types/Sensor';
import { SensorCategory, SensorStatus } from '../types/Sensor';
import { getProvinces, getDistricts, getSectors } from './locationData';

const SENSORS_STORAGE_KEY = 'wars_mock_sensors';
const SENSOR_ACTIVITIES_STORAGE_KEY = 'wars_mock_sensor_activities';

/**
 * Get all sensors from localStorage
 */
export const getSensors = (): Sensor[] => {
  try {
    const stored = localStorage.getItem(SENSORS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sensors from localStorage:', error);
    return [];
  }
};

/**
 * Get sensor activities from localStorage
 */
export const getSensorActivities = (): SensorActivity[] => {
  try {
    const stored = localStorage.getItem(SENSOR_ACTIVITIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sensor activities from localStorage:', error);
    return [];
  }
};

/**
 * Save a sensor activity
 */
export const saveSensorActivity = (activity: Omit<SensorActivity, 'id' | 'timestamp'> | SensorActivity): SensorActivity => {
  const activities = getSensorActivities();
  
  // If activity already has id and timestamp, use them (for historical data)
  const newActivity: SensorActivity = {
    ...activity,
    id: (activity as SensorActivity).id || crypto.randomUUID(),
    timestamp: (activity as SensorActivity).timestamp || new Date().toISOString(),
  };

  activities.unshift(newActivity); // Add to beginning
  
  // Keep only last 5000 activities (increased to handle many sensors)
  // This allows ~68 activities per sensor for 73 sensors
  if (activities.length > 5000) {
    activities.splice(5000);
  }

  try {
    localStorage.setItem(SENSOR_ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving sensor activity to localStorage:', error);
    throw new Error('Failed to save sensor activity');
  }

  return newActivity;
};

/**
 * Seed mock sensors if none exist
 */
export const seedMockSensors = (): void => {
  const existing = getSensors();
  // Always regenerate sensors to ensure IDs match (in case structure changed)
  // But only if we don't have sensors or if sensor count is very different
  if (existing.length > 0) {
    // Check if sensor structure is still valid by checking a sample
    const sample = existing[0];
    if (sample && sample.id && sample.category && sample.location) {
      return; // Sensors look valid, keep them
    }
  }
  
  // Clear old sensors if they exist but are invalid
  if (existing.length > 0) {
    try {
      localStorage.removeItem(SENSORS_STORAGE_KEY);
      // Also clear activities since sensor IDs will change
      localStorage.removeItem(SENSOR_ACTIVITIES_STORAGE_KEY);
      console.log('Cleared old sensors and activities due to structure change');
    } catch (error) {
      console.error('Error clearing old sensors:', error);
    }
  }

  const provinces = getProvinces();
  const sensors: Sensor[] = [];

  // Create sensors for each province
  provinces.forEach((province, provinceIndex) => {
    const districts = getDistricts(province);
    
    districts.forEach((district, districtIndex) => {
      const sectors = getSectors(province, district);
      
      // Create 2-3 sensors per district
      const numSensors = 2 + (districtIndex % 2);
      
      for (let i = 0; i < numSensors; i++) {
        const sector = sectors[i % sectors.length] || sectors[0];
        // Default to pipe failure (leakage sensors) - 70% leakage, 30% water hygiene
        const category = (provinceIndex + districtIndex + i) % 10 < 7
          ? SensorCategory.PIPE_FAILURE 
          : SensorCategory.WATER_HYGIENE;
        
        const sensor: Sensor = {
          id: `sensor-${provinceIndex}-${districtIndex}-${i}`,
          name: `${category === SensorCategory.PIPE_FAILURE ? 'Pipe Monitor' : 'Water Quality'} ${district} ${i + 1}`,
          category,
          location: `Village ${i + 1}, Cell ${i + 1}, ${sector}, ${district}, ${province}`,
          province,
          district,
          sector,
          status: SensorStatus.ACTIVE,
          isActive: true,
          description: `Sensor monitoring ${category === SensorCategory.WATER_HYGIENE ? 'water quality and potability' : 'pipe integrity and leaks'}`,
          installationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        sensors.push(sensor);
      }
    });
  });

  try {
    localStorage.setItem(SENSORS_STORAGE_KEY, JSON.stringify(sensors));
  } catch (error) {
    console.error('Error seeding mock sensors:', error);
  }
};

/**
 * Generate random sensor activity
 */
export const generateRandomActivity = (sensor: Sensor): SensorActivity => {
  const eventTypes: SensorActivity['eventType'][] = ['reading', 'alert', 'status_change'];
  const severities: SensorActivity['severity'][] = ['info', 'warning', 'critical'];
  
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const severity = eventType === 'alert' 
    ? severities[Math.floor(Math.random() * severities.length)]
    : 'info';

  let message = '';
  let value: number | undefined;
  let unit: string | undefined;

  if (sensor.category === SensorCategory.WATER_HYGIENE) {
    if (eventType === 'reading') {
      value = 6.5 + Math.random() * 1.5; // pH between 6.5-8.0
      unit = 'pH';
      message = `Water pH reading: ${value.toFixed(2)}`;
    } else if (eventType === 'alert') {
      value = severity === 'critical' ? 5.0 + Math.random() : 7.5 + Math.random() * 0.5;
      unit = 'pH';
      message = severity === 'critical' 
        ? `Critical: Water pH out of safe range (${value.toFixed(2)})`
        : `Warning: Water pH approaching limits (${value.toFixed(2)})`;
    } else {
      message = 'Sensor status updated';
    }
  } else {
    // PIPE_FAILURE
    if (eventType === 'reading') {
      value = Math.random() * 10; // Flow rate 0-10 L/min
      unit = 'L/min';
      message = `Flow rate: ${value.toFixed(2)} L/min`;
    } else if (eventType === 'alert') {
      value = severity === 'critical' ? 0 : 0.1 + Math.random() * 0.5;
      unit = 'L/min';
      message = severity === 'critical'
        ? `Critical: Possible pipe leak detected (${value.toFixed(2)} L/min)`
        : `Warning: Unusual flow pattern detected (${value.toFixed(2)} L/min)`;
    } else {
      message = 'Sensor status updated';
    }
  }

  return {
    id: crypto.randomUUID(),
    sensorId: sensor.id,
    sensorName: sensor.name,
    category: sensor.category,
    location: sensor.location,
    eventType,
    message,
    value,
    unit,
    severity,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Start simulating sensor activities
 * Generates random activities periodically
 */
let simulationInterval: ReturnType<typeof setInterval> | null = null;

export const startSensorSimulation = (): void => {
  if (simulationInterval) return; // Already running

  // Seed sensors if needed
  seedMockSensors();
  
  // Check if we have activities with values, if not, regenerate
  const allExistingActivities = getSensorActivities();
  const activitiesWithValues = allExistingActivities.filter(a => 
    a.value !== undefined && 
    a.unit !== undefined && 
    a.value !== null && 
    a.unit !== null
  );
  
  // Check if activities match current sensors
  const allSensors = getSensors();
  if (allSensors.length === 0) return; // No sensors to generate activities for
  
  const sensorIds = new Set(allSensors.map(s => s.id));
  const activitiesMatchingSensors = activitiesWithValues.filter(a => sensorIds.has(a.sensorId));
  
  // Check if each sensor has at least some activities
  const sensorsWithActivities = new Set(activitiesMatchingSensors.map(a => a.sensorId));
  const sensorsWithoutActivities = allSensors.filter(s => !sensorsWithActivities.has(s.id));
  
  // If we have sensors without activities, or very few matching activities, regenerate
  const shouldRegenerate = sensorsWithoutActivities.length > 0 || activitiesMatchingSensors.length < allSensors.length * 2;
  
  if (shouldRegenerate) {
    // Clear old activities to start fresh
    try {
      localStorage.removeItem(SENSOR_ACTIVITIES_STORAGE_KEY);
      console.log(`Cleared old activities. Regenerating for ${allSensors.length} sensors...`);
    } catch (error) {
      console.error('Error clearing old activities:', error);
    }
  } else {
    // All sensors have activities, don't regenerate
    console.log('Sensors already have activities, skipping regeneration');
    return;
  }

  // Generate initial activities with timestamps throughout today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  
  // Generate activities for all sensors (we just cleared, so regenerate everything)
  console.log(`Generating activities for ${allSensors.length} sensors...`);
  let totalGenerated = 0;
  
  // Batch save activities to avoid localStorage limit issues
  const activitiesToSave: SensorActivity[] = [];
  
  allSensors.forEach((sensor, sensorIndex) => {
    
    // Generate activities at 30-minute intervals from 00:00 to now
    // This ensures we have data points throughout the day for the lifeline
    const totalMinutes = Math.floor((now.getTime() - today.getTime()) / (60 * 1000));
    const intervals30Min = Math.floor(totalMinutes / 30); // Number of 30-minute intervals
    const numActivities = Math.max(1, intervals30Min); // At least 1, but ideally one per 30-min interval
    
    let activitiesForThisSensor = 0;
    
    for (let i = 0; i < numActivities; i++) {
      // Always create 'reading' type activities with values for lifeline view
      let value: number;
      let unit: string;
      let message: string;
      
      if (sensor.category === SensorCategory.WATER_HYGIENE) {
        value = 6.5 + Math.random() * 1.5; // pH between 6.5-8.0
        unit = 'pH';
        message = `Water pH reading: ${value.toFixed(2)}`;
      } else {
        // PIPE_FAILURE
        value = Math.random() * 10; // Flow rate 0-10 L/min
        unit = 'L/min';
        message = `Flow rate: ${value.toFixed(2)} L/min`;
      }
      
      // Distribute timestamps at 30-minute intervals from 00:00 to now
      const minutesFromStart = i * 30;
      const activityTime = new Date(today);
      activityTime.setMinutes(minutesFromStart, Math.floor(Math.random() * 30), 0); // Add some randomness within the 30-min window
      
      // Make sure it's not in the future
      if (activityTime > now) {
        // If it's in the future, set to a random time in the past 30 minutes
        const past30Min = new Date(now);
        past30Min.setMinutes(past30Min.getMinutes() - Math.floor(Math.random() * 30), Math.floor(Math.random() * 60), 0);
        activityTime.setTime(past30Min.getTime());
      }
      // Make sure it's not before today
      if (activityTime < today) activityTime.setTime(today.getTime());
      
      // Create activity with reading type and value
      const activity: SensorActivity = {
        id: crypto.randomUUID(),
        sensorId: sensor.id, // Ensure this matches exactly
        sensorName: sensor.name,
        category: sensor.category,
        location: sensor.location,
        eventType: 'reading',
        message,
        value,
        unit,
        severity: 'info',
        timestamp: activityTime.toISOString(),
      };
      
      // Verify sensorId before saving
      if (activity.sensorId !== sensor.id) {
        console.error(`Sensor ID mismatch in activity generation! Expected ${sensor.id}, got ${activity.sensorId}`);
      }
      
      // Add to batch instead of saving immediately
      activitiesToSave.push(activity);
      activitiesForThisSensor++;
      totalGenerated++;
    }
    
    if (sensorIndex < 5 || activitiesForThisSensor === 0) {
      console.log(`Generated ${activitiesForThisSensor} activities for sensor ${sensor.id} (${sensor.name})`);
    }
  });
  
  // Batch save all activities at once (after generating for all sensors)
  if (activitiesToSave.length > 0) {
    const existingActivities = getSensorActivities();
    const allActivities = [...activitiesToSave, ...existingActivities];
    
    // Keep only last 5000 activities (sorted by timestamp, newest first)
    allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const activitiesToKeep = allActivities.slice(0, 5000);
    
    try {
      localStorage.setItem(SENSOR_ACTIVITIES_STORAGE_KEY, JSON.stringify(activitiesToKeep));
      console.log(`Batch saved ${activitiesToSave.length} new activities. Total in storage: ${activitiesToKeep.length}`);
    } catch (error) {
      console.error('Error batch saving activities:', error);
    }
  }
  
  console.log(`Total activities generated: ${totalGenerated} for ${allSensors.length} sensors`);
  
  // Verify activities were saved
  const savedActivities = getSensorActivities();
  const uniqueSensorIds = new Set(savedActivities.map(a => a.sensorId));
  console.log(`Saved activities contain ${savedActivities.length} total activities for ${uniqueSensorIds.size} unique sensors`);
  if (savedActivities.length > 0) {
    console.log(`Sample sensor IDs in saved activities:`, Array.from(uniqueSensorIds).slice(0, 10));
  }

  // Generate new activities every 10-20 seconds (less frequent for better performance)
  simulationInterval = setInterval(() => {
    const sensorsForUpdate = getSensors();
    if (sensorsForUpdate.length === 0) return;

    // Only generate 1-2 new activities at a time
    const numActivities = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numActivities; i++) {
      const randomSensor = sensorsForUpdate[Math.floor(Math.random() * sensorsForUpdate.length)];
      // Always generate reading type with value
      const activity = generateRandomActivity(randomSensor);
      // Ensure it has a value
      if (!activity.value) {
        if (randomSensor.category === SensorCategory.WATER_HYGIENE) {
          activity.value = 6.5 + Math.random() * 1.5;
          activity.unit = 'pH';
        } else {
          activity.value = Math.random() * 10;
          activity.unit = 'L/min';
        }
        activity.eventType = 'reading';
      }
      saveSensorActivity(activity);
    }
  }, 10000 + Math.random() * 10000); // 10-20 seconds
};

/**
 * Stop sensor simulation
 */
export const stopSensorSimulation = (): void => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

