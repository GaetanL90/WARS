import pandas as pd
import numpy as np
from typing import Optional


# ─────────────────────────────────────────────
# V4 DATASET SCHEMA
# ─────────────────────────────────────────────
REQUIRED_COLUMNS: list[str] = [
    # Infrastructure
    "Infrastructure_Age",
    "Distance_to_TreatmentPlant",
    "Population_Density",
    "Population_Impacted",
    "Repair_Team_Availability",
    "Local_Authority_Responsiveness",
    "Priority_Level",
    "lat",
    "lon",

    # Scenario
    "Scenario",

    # Water quality sensors
    "Turbidity",
    "pH",
    "Conductivity",
    "Organic_Carbon",
    "ORP",
    "Dissolved_Oxygen",
    "Temperature",

    # Hydraulic sensors
    "Flow_Rate",
    "Pressure",

    # Operational
    "Sensor_Fault",

    # Time
    "timestamp_year",
    "timestamp_month",
    "timestamp_day",
    "timestamp_hour",
    "weekday",

    # Targets
    "Failure_Risk_Score",
    "Potability",
]

# Physical bounds for sensor sanity checks
# Format: column -> (min, max)  — None means unbounded on that side
SENSOR_BOUNDS: dict[str, tuple[Optional[float], Optional[float]]] = {
    "Turbidity":        (0,    None),
    "pH":               (2.0,  12.0),
    "Conductivity":     (0,    None),
    "Organic_Carbon":   (0,    None),
    "Dissolved_Oxygen": (0,    14.0),
    "Flow_Rate":        (0,    None),
    "Pressure":         (0,    None),
    "Temperature":      (0,    45.0),
    "Sensor_Fault":     (0,    1),
    "Failure_Risk_Score": (0,  1),
    "Potability":       (0,    1),
    "lat":              (-1.9, -1.5),
    "lon":              (29.5, 30.2),
}

VALID_SCENARIOS: set[str] = {
    "normal",
    "heavy_rain",
    "pipe_leak",
    "chemical_contamination",
    "drought",
}


def validate_dataframe(df: pd.DataFrame, strict: bool = False) -> pd.DataFrame:
    """
    Validate and clean a WARS v4 sensor dataset.

    Parameters
    ----------
    df     : Raw dataframe loaded from CSV.
    strict : If True, raise on out-of-bound sensor readings instead of clipping.

    Returns
    -------
    Cleaned dataframe ready for feature engineering and training.
    """
    print("\n📊 INITIAL SHAPE:", df.shape)

    # ── 1. Required columns ──────────────────
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"❌ Missing required columns ({len(missing)}): {missing}\n"
            f"   Present columns: {df.columns.tolist()}"
        )
    print(f"✅ All {len(REQUIRED_COLUMNS)} required columns present")

    # ── 2. Unexpected extra columns (warn only) ──
    extra = [c for c in df.columns if c not in REQUIRED_COLUMNS]
    if extra:
        print(f"⚠️  Extra columns not in schema (will be kept): {extra}")

    # ── 3. Dtypes — Scenario must be string ──
    if not pd.api.types.is_object_dtype(df["Scenario"]):
        df["Scenario"] = df["Scenario"].astype(str)

    # ── 4. Valid scenario values ─────────────
    bad_scenarios = ~df["Scenario"].isin(VALID_SCENARIOS)
    if bad_scenarios.any():
        bad_vals = df.loc[bad_scenarios, "Scenario"].unique().tolist()
        raise ValueError(
            f"❌ Invalid Scenario values found: {bad_vals}\n"
            f"   Expected one of: {sorted(VALID_SCENARIOS)}"
        )
    print(f"✅ Scenario values valid ({df['Scenario'].value_counts().to_dict()})")

    # ── 5. Replace infinities with NaN ───────
    inf_count = np.isinf(df.select_dtypes(include="number")).sum().sum()
    if inf_count:
        print(f"⚠️  Replacing {inf_count} infinite values with NaN")
    df = df.replace([np.inf, -np.inf], np.nan)

    # ── 6. Null report ───────────────────────
    null_counts = df.isnull().sum()
    null_cols   = null_counts[null_counts > 0]
    if not null_cols.empty:
        print(f"⚠️  Null values found before dropna:\n{null_cols.to_string()}")

    before = len(df)
    df = df.dropna()
    dropped = before - len(df)
    if dropped:
        print(f"⚠️  Dropped {dropped:,} rows with NaN ({dropped/before*100:.2f}%)")

    # ── 7. Sensor bounds check ───────────────
    for col, (lo, hi) in SENSOR_BOUNDS.items():
        if col not in df.columns:
            continue
        series = df[col]
        violations = pd.Series(False, index=df.index)
        if lo is not None:
            violations |= series < lo
        if hi is not None:
            violations |= series > hi

        n_violations = violations.sum()
        if n_violations:
            if strict:
                raise ValueError(
                    f"❌ {n_violations} out-of-bound values in '{col}' "
                    f"(expected [{lo}, {hi}])"
                )
            # Clip silently in non-strict mode
            df[col] = series.clip(lower=lo, upper=hi)
            print(f"⚠️  Clipped {n_violations} out-of-bound values in '{col}' → [{lo}, {hi}]")

    # ── 8. Target sanity ─────────────────────
    if not df["Potability"].isin([0, 1]).all():
        raise ValueError("❌ Potability must be binary (0 or 1)")

    risk_range = (df["Failure_Risk_Score"].min(), df["Failure_Risk_Score"].max())
    if risk_range[0] < 0 or risk_range[1] > 1:
        raise ValueError(
            f"❌ Failure_Risk_Score out of [0, 1]: min={risk_range[0]}, max={risk_range[1]}"
        )

    # ── 9. Final report ──────────────────────
    print(f"\n✅ VALIDATION PASSED — final shape: {df.shape}")
    print(f"   Potability  : {df['Potability'].value_counts().to_dict()}")
    print(f"   Risk score  : mean={df['Failure_Risk_Score'].mean():.4f}  "
          f"std={df['Failure_Risk_Score'].std():.4f}  "
          f"max={df['Failure_Risk_Score'].max():.4f}")
    print(f"   Sensor faults: {df['Sensor_Fault'].sum():,} "
          f"({df['Sensor_Fault'].mean()*100:.2f}%)")

    return df