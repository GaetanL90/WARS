from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from api.database.db import SessionLocal
from api.schemas import SensorPayload, SensorReadingOut
from api.crud import (
    create_sensor_reading,
    get_all_readings,
    get_reading_by_id,
    get_readings_by_hardware,
    get_latest_reading,
    get_high_risk_readings,
)

router = APIRouter(prefix="/sensors", tags=["Sensors"])


# ─────────────────────────────────────────────
# DB DEPENDENCY
# ─────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────
# POST — Ingest reading
# ─────────────────────────────────────────────
@router.post(
    "/sensor",
    response_model=SensorReadingOut,
    summary="Ingest sensor reading",
    description=(
        "Accepts a full structured payload from a WARS sensor node. "
        "Stores all sensor values, infrastructure snapshot, time features, "
        "local flags, and ML prediction (potability + risk score) in one row."
    ),
)
def create_sensor(payload: SensorPayload, db: Session = Depends(get_db)):
    try:
        return create_sensor_reading(db, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET — All readings (paginated)
# ─────────────────────────────────────────────
@router.get(
    "/",
    response_model=list[SensorReadingOut],
    summary="List all readings",
    description="Returns all sensor readings newest first. Use limit/offset for pagination.",
)
def get_all(
    limit:  int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0,   ge=0),
    db: Session = Depends(get_db),
):
    return get_all_readings(db, limit=limit, offset=offset)


# ─────────────────────────────────────────────
# GET — Single reading by ID
# ─────────────────────────────────────────────
@router.get(
    "/{reading_id}",
    response_model=SensorReadingOut,
    summary="Get reading by ID",
)
def get_by_id(reading_id: int, db: Session = Depends(get_db)):
    reading = get_reading_by_id(db, reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail=f"Reading {reading_id} not found")
    return reading


# ─────────────────────────────────────────────
# GET — All readings for a specific node
# ─────────────────────────────────────────────
@router.get(
    "/node/{hardware_id}",
    response_model=list[SensorReadingOut],
    summary="Get readings by hardware node",
    description="Returns all readings from a specific WaterPoint sensor node.",
)
def get_by_hardware(
    hardware_id: str,
    limit:  int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0,   ge=0),
    db: Session = Depends(get_db),
):
    readings = get_readings_by_hardware(db, hardware_id, limit=limit, offset=offset)
    if not readings:
        raise HTTPException(
            status_code=404,
            detail=f"No readings found for node '{hardware_id}'"
        )
    return readings


# ─────────────────────────────────────────────
# GET — Latest reading for a specific node
# ─────────────────────────────────────────────
@router.get(
    "/node/{hardware_id}/latest",
    response_model=SensorReadingOut,
    summary="Get latest reading for a node",
    description=(
        "Returns the most recent reading + ML prediction for a WaterPoint. "
        "Intended for the frontend dashboard live status card."
    ),
)
def get_latest(hardware_id: str, db: Session = Depends(get_db)):
    reading = get_latest_reading(db, hardware_id)
    if not reading:
        raise HTTPException(
            status_code=404,
            detail=f"No readings found for node '{hardware_id}'"
        )
    return reading


# ─────────────────────────────────────────────
# GET — High risk readings
# ─────────────────────────────────────────────
@router.get(
    "/alerts/high-risk",
    response_model=list[SensorReadingOut],
    summary="Get high risk readings",
    description=(
        "Returns readings at MEDIUM risk or above (failure_risk_score >= min_risk), "
        "sorted by risk score descending. Used by the frontend alert feed."
    ),
)
def get_alerts(
    min_risk: float = Query(
        default=0.45,
        ge=0.0,
        le=1.0,
        description="Minimum risk score threshold. 0.45 = MEDIUM and above.",
    ),
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return get_high_risk_readings(db, min_risk=min_risk, limit=limit)