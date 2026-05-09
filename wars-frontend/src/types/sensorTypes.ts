export type SensorType = 
  | "Turbidity" 
  | "pH Level" 
  | "Conductivity" 
  | "ORP" 
  | "Dissolved Oxygen" 
  | "Organic Carbon" 
  | "Flow Rate" 
  | "Water Pressure" 
  | "Temperature";

export interface Sensor {
  id: string;
  type: SensorType;
  value: number;
  unit: string;
  trend: number[];
  fault?: boolean;
}

export interface WaterPointConfig {
  location: {
    lat: number;
    lon: number;
  };
  infrastructureAge: number; // years
  distanceToPlant: number; // km
  populationDensity: number; // people/km2
  populationImpacted: number; // people
  priorityLevel: 1 | 2 | 3 | 4 | 5;
}

export interface WaterPointConditions {
  repairTeamAvailability: number; // 0-5
  localAuthorityResponsiveness: number; // 0-1
}

export interface WaterPoint {
  id: string;
  name: string;
  locationName: string;
  status: "online" | "offline" | "warning";
  sensors: Sensor[];
  config: WaterPointConfig;
  conditions: WaterPointConditions;
  hardwareId: string;
  installationDate: string;
  lastMaintenance: string;
  assignedSector: string;
}
