from sqlalchemy.orm import Session
from api.models import SensorReading
from api.schemas import SensorPayload


# ─────────────────────────────────────────────
# RISK LEVEL THRESHOLDS
# Must match Section 5.3 of the integration spec
# and dataset_factory.compute_labels() weights
# ─────────────────────────────────────────────
def _risk_level(score: float) -> str:
    if score < 0.10: return "SAFE"
    if score < 0.25: return "LOW"
    if score < 0.45: return "MEDIUM"
    if score < 0.65: return "HIGH"
    return "CRITICAL"


# ─────────────────────────────────────────────
# CREATE READING
# ─────────────────────────────────────────────
def create_sensor_reading(db: Session, payload: SensorPayload) -> SensorReading:
    m     = payload.metadata
    s     = payload.sensors
    infra = payload.infrastructure
    t     = payload.time_features
    la    = payload.local_assessment

    # ── ML Inference ──────────────────────────
    # Uses predict_stream (single source of truth).
    # Failure NEVER blocks data ingestion — reading
    # is stored with null ML fields if inference fails.
    try:
        from ml.predict_stream import predict
        from services.feature_builder import build_features

        feature_df = build_features(payload.model_dump())
        ml_output  = predict(feature_df)

        potability            = ml_output["potability"]
        potability_confidence = ml_output["potability_confidence"]
        failure_risk_score    = ml_output["failure_risk_score"]
        risk_lvl              = ml_output["risk_level"]

    except RuntimeError as e:
        # Models not trained yet
        print(f"⚠️  Models not ready: {e}")
        potability = potability_confidence = failure_risk_score = risk_lvl = None

    except Exception as e:
        print(f"⚠️  ML inference failed: {e} — storing reading without prediction")
        potability = potability_confidence = failure_risk_score = risk_lvl = None

    # ── Map payload → DB columns ──────────────
    flags = la.flags

    reading = SensorReading(
        # Metadata
        hardware_id   = m.hardware_id,
        firmware_v    = m.firmware_v,
        timestamp     = m.timestamp,
        reading_index = m.reading_index,

        # Scenario
        scenario         = m.scenario,
        scenario_encoded = m.scenario_encoded,

        # Sensors (PascalCase payload → snake_case model)
        turbidity        = s.Turbidity,
        ph               = s.pH,
        conductivity     = s.Conductivity,
        organic_carbon   = s.Organic_Carbon,
        orp              = s.ORP,
        dissolved_oxygen = s.Dissolved_Oxygen,
        temperature      = s.Temperature,
        flow_rate        = s.Flow_Rate,
        pressure         = s.Pressure,
        sensor_fault     = s.Sensor_Fault,

        # Infrastructure snapshot at time of reading
        # Stored here so historical ML predictions are reproducible
        infrastructure_age             = infra.Infrastructure_Age,
        distance_to_treatment_plant    = infra.Distance_to_TreatmentPlant,
        population_density             = infra.Population_Density,
        population_impacted            = infra.Population_Impacted,
        repair_team_availability       = infra.Repair_Team_Availability,
        local_authority_responsiveness = infra.Local_Authority_Responsiveness,
        priority_level                 = infra.Priority_Level,
        lat                            = infra.lat,
        lon                            = infra.lon,

        # Time features
        timestamp_year  = t.timestamp_year,
        timestamp_month = t.timestamp_month,
        timestamp_day   = t.timestamp_day,
        timestamp_hour  = t.timestamp_hour,
        weekday         = t.weekday,

        # ML results (null if inference failed)
        potability            = potability,
        potability_confidence = potability_confidence,
        failure_risk_score    = failure_risk_score,
        risk_level            = risk_lvl,

        # Local pre-assessment flags (computed on-node, no ML needed)
        flag_count             = la.flag_count,
        flag_high_turbidity    = int(flags.get("high_turbidity",    False)),
        flag_low_ph            = int(flags.get("low_pH",            False)),
        flag_high_ph           = int(flags.get("high_pH",           False)),
        flag_low_orp           = int(flags.get("low_ORP",           False)),
        flag_low_do            = int(flags.get("low_DO",            False)),
        flag_high_conductivity = int(flags.get("high_conductivity", False)),
        flag_high_org_carbon   = int(flags.get("high_org_carbon",   False)),
        flag_low_pressure      = int(flags.get("low_pressure",      False)),
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


# ─────────────────────────────────────────────
# READ OPERATIONS
# ─────────────────────────────────────────────
def get_all_readings(db: Session, limit: int = 100, offset: int = 0):
    return (
        db.query(SensorReading)
        .order_by(SensorReading.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_reading_by_id(db: Session, reading_id: int):
    return db.query(SensorReading).filter(SensorReading.id == reading_id).first()


def get_readings_by_hardware(
    db: Session,
    hardware_id: str,
    limit: int = 100,
    offset: int = 0,
):
    return (
        db.query(SensorReading)
        .filter(SensorReading.hardware_id == hardware_id)
        .order_by(SensorReading.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_latest_reading(db: Session, hardware_id: str):
    return (
        db.query(SensorReading)
        .filter(SensorReading.hardware_id == hardware_id)
        .order_by(SensorReading.id.desc())
        .first()
    )


def get_high_risk_readings(db: Session, min_risk: float = 0.45, limit: int = 50):
    """Return readings at MEDIUM risk or above, newest first."""
    return (
        db.query(SensorReading)
        .filter(SensorReading.failure_risk_score >= min_risk)
        .order_by(SensorReading.failure_risk_score.desc())
        .limit(limit)
        .all()
    )