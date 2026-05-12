from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from api.database.db import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id           = Column(Integer, primary_key=True, index=True)
    hardware_id  = Column(String, index=True, nullable=False)
    firmware_v   = Column(String, nullable=True)
    timestamp    = Column(String, nullable=False)
    reading_index = Column(Integer, nullable=True)
    created_at   = Column(DateTime, server_default=func.now())

    # ── Scenario ────────────────────────────────
    scenario         = Column(String,  nullable=True)
    scenario_encoded = Column(Integer, nullable=True)

    # ── Water quality sensors ────────────────────
    turbidity        = Column(Float, nullable=False)
    ph               = Column(Float, nullable=False)
    conductivity     = Column(Float, nullable=False)
    organic_carbon   = Column(Float, nullable=False)
    orp              = Column(Float, nullable=False)
    dissolved_oxygen = Column(Float, nullable=False)
    temperature      = Column(Float, nullable=False)

    # ── Hydraulic sensors ────────────────────────
    flow_rate = Column(Float, nullable=False)
    pressure  = Column(Float, nullable=False)

    # ── Operational ──────────────────────────────
    sensor_fault = Column(Integer, nullable=False, default=0)

    # ── Infrastructure (snapshot at time of reading) ─
    infrastructure_age             = Column(Integer, nullable=True)
    distance_to_treatment_plant    = Column(Float,   nullable=True)
    population_density             = Column(Integer, nullable=True)
    population_impacted            = Column(Integer, nullable=True)
    repair_team_availability       = Column(Integer, nullable=True)
    local_authority_responsiveness = Column(Float,   nullable=True)
    priority_level                 = Column(Integer, nullable=True)
    lat                            = Column(Float,   nullable=True)
    lon                            = Column(Float,   nullable=True)

    # ── Time features ────────────────────────────
    timestamp_year  = Column(Integer, nullable=True)
    timestamp_month = Column(Integer, nullable=True)
    timestamp_day   = Column(Integer, nullable=True)
    timestamp_hour  = Column(Integer, nullable=True)
    weekday         = Column(Integer, nullable=True)

    # ── ML inference results ─────────────────────
    potability             = Column(Integer, nullable=True)   # 0 or 1
    potability_confidence  = Column(Float,   nullable=True)   # 0.0 – 1.0
    failure_risk_score     = Column(Float,   nullable=True)   # 0.0 – 1.0
    risk_level             = Column(String,  nullable=True)   # SAFE/LOW/MEDIUM/HIGH/CRITICAL

    # ── Local pre-assessment flags ───────────────
    flag_count        = Column(Integer, nullable=True)
    flag_high_turbidity    = Column(Integer, nullable=True)
    flag_low_ph            = Column(Integer, nullable=True)
    flag_high_ph           = Column(Integer, nullable=True)
    flag_low_orp           = Column(Integer, nullable=True)
    flag_low_do            = Column(Integer, nullable=True)
    flag_high_conductivity = Column(Integer, nullable=True)
    flag_high_org_carbon   = Column(Integer, nullable=True)
    flag_low_pressure      = Column(Integer, nullable=True)