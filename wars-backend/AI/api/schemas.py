from pydantic import BaseModel, Field
from typing import Optional


class SensorPayload(BaseModel):
    """
    Full structured payload from a WARS sensor node.
    Matches sensor_simulator.py output exactly.
    """

    class Metadata(BaseModel):
        hardware_id:      str
        firmware_v:       str
        timestamp:        str
        reading_index:    int
        scenario:         str
        scenario_encoded: int

    class Sensors(BaseModel):
        Turbidity:        float
        pH:               float
        Conductivity:     float
        Organic_Carbon:   float
        ORP:              float
        Dissolved_Oxygen: float
        Temperature:      float
        Flow_Rate:        float
        Pressure:         float
        Sensor_Fault:     int   = Field(ge=0, le=1)

    class Infrastructure(BaseModel):
        Infrastructure_Age:             int
        Distance_to_TreatmentPlant:     float
        Population_Density:             int
        Population_Impacted:            int
        Repair_Team_Availability:       int   = Field(ge=0, le=5)
        Local_Authority_Responsiveness: float = Field(ge=0.0, le=1.0)
        Priority_Level:                 int   = Field(ge=1, le=5)
        lat:                            float
        lon:                            float

    class TimeFeatures(BaseModel):
        timestamp_year:  int
        timestamp_month: int
        timestamp_day:   int
        timestamp_hour:  int
        weekday:         int

    class LocalAssessment(BaseModel):
        local_potable: bool
        flag_count:    int
        sensor_fault:  bool
        flags: dict

    metadata:          Metadata
    sensors:           Sensors
    infrastructure:    Infrastructure
    time_features:     TimeFeatures
    local_assessment:  LocalAssessment


class SensorReadingOut(BaseModel):
    """Response schema returned after a reading is stored."""
    id:                    int
    hardware_id:           str
    timestamp:             str
    scenario:              Optional[str]
    turbidity:             float
    ph:                    float
    conductivity:          float
    organic_carbon:        float
    orp:                   float
    dissolved_oxygen:      float
    temperature:           float
    flow_rate:             float
    pressure:              float
    sensor_fault:          int
    potability:            Optional[int]
    potability_confidence: Optional[float]
    failure_risk_score:    Optional[float]
    risk_level:            Optional[str]
    flag_count:            Optional[int]

    class Config:
        from_attributes = True