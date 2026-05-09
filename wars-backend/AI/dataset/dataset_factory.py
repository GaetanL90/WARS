import numpy as np
import pandas as pd
from pathlib import Path

# ─────────────────────────────────────────────
# PATHS & SEED
# ─────────────────────────────────────────────
BASE_DIR     = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed" / "WARS_full_sensor_dataset_v4.csv"

SEED = 42

# ─────────────────────────────────────────────
# SCENARIO CONFIG
# ─────────────────────────────────────────────
SCENARIOS: dict[str, float] = {
    "normal":                 0.60,
    "heavy_rain":             0.12,
    "pipe_leak":              0.10,
    "chemical_contamination": 0.10,
    "drought":                0.08,
}

SCENARIO_NAMES = list(SCENARIOS.keys())
SCENARIO_PROBS = list(SCENARIOS.values())

# Rwanda climate: two wet seasons (Mar-May, Oct-Nov), two dry seasons (Jun-Sep, Dec-Feb)
# month -> weight for each scenario (12 values, index 0 = January)
_W = {
    #                         J     F     M     A     M     J     J     A     S     O     N     D
    "normal":                [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
    "heavy_rain":            [0.3,  0.4,  1.5,  2.0,  1.5,  0.3,  0.2,  0.2,  0.4,  1.5,  2.0,  0.5],
    "pipe_leak":             [0.8,  0.8,  1.0,  1.2,  1.0,  1.5,  1.5,  1.5,  1.2,  0.8,  0.8,  0.8],
    "chemical_contamination":[1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
    "drought":               [0.5,  0.6,  0.3,  0.2,  0.3,  1.8,  2.0,  2.0,  1.5,  0.3,  0.2,  0.6],
}
SCENARIO_MONTH_WEIGHTS = {k: np.array(v) for k, v in _W.items()}


# ─────────────────────────────────────────────
# STEP 1 — Infrastructure
# ─────────────────────────────────────────────
def generate_infrastructure(n: int, rng: np.random.Generator) -> pd.DataFrame:
    return pd.DataFrame({
        "Infrastructure_Age":             rng.integers(1, 51, n),
        "Distance_to_TreatmentPlant":     rng.uniform(0.5, 30, n),
        "Population_Density":             rng.integers(50, 5001, n),
        "Population_Impacted":            rng.integers(100, 200_001, n),
        "Repair_Team_Availability":       rng.integers(0, 6, n),       # 0–5
        "Local_Authority_Responsiveness": rng.uniform(0, 1, n),
        "Priority_Level":                 rng.integers(1, 6, n),       # 1–5
        "lat":                            rng.uniform(-1.9, -1.5, n),
        "lon":                            rng.uniform(29.5, 30.2, n),
    })


# ─────────────────────────────────────────────
# STEP 2 — Time  (climate-aware, date-coherent)
# ─────────────────────────────────────────────
def generate_time(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """
    Generates realistic timestamps spanning 2022-2026.
    Weekday is derived from the actual date so it's always consistent.
    Hour distribution is skewed toward daytime (peak demand 06-20).
    """
    years  = rng.integers(2022, 2027, n)         # multi-year range
    months = rng.integers(1, 13, n)

    # Safe day: avoid 29/30/31 issues by capping at 28
    days   = rng.integers(1, 29, n)

    # Hour: bimodal — morning peak (06-09) and evening peak (17-20)
    hour_weights = np.array([
        0.5, 0.3, 0.2, 0.2, 0.3, 0.8,   # 00-05
        1.5, 2.0, 2.0, 1.5, 1.2, 1.2,   # 06-11
        1.3, 1.2, 1.2, 1.3, 1.5, 2.0,   # 12-17
        2.0, 1.5, 1.2, 1.0, 0.8, 0.6,   # 18-23
    ])
    hour_weights /= hour_weights.sum()
    hours = rng.choice(24, size=n, p=hour_weights)

    # Derive weekday from actual date (0=Monday … 6=Sunday)
    dates   = pd.to_datetime({
        "year": years, "month": months, "day": days
    })
    weekdays = dates.dt.dayofweek.to_numpy()

    return pd.DataFrame({
        "timestamp_year":  years,
        "timestamp_month": months,
        "timestamp_day":   days,
        "timestamp_hour":  hours,
        "weekday":         weekdays,
    })


# ─────────────────────────────────────────────
# STEP 3 — Scenario assignment (month-aware)
# ─────────────────────────────────────────────
def assign_scenarios(months: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """
    Each row's scenario is sampled using month-specific weights so that,
    e.g., heavy_rain is far more likely in April than July.
    """
    scenarios = np.empty(len(months), dtype=object)

    for month_idx in range(1, 13):
        mask = months == month_idx
        if not mask.any():
            continue

        # Build a properly normalised probability vector for this month
        raw = np.array([
            SCENARIO_MONTH_WEIGHTS[s][month_idx - 1] * SCENARIOS[s]
            for s in SCENARIO_NAMES
        ])
        probs = raw / raw.sum()
        scenarios[mask] = rng.choice(SCENARIO_NAMES, size=mask.sum(), p=probs)

    return scenarios


# ─────────────────────────────────────────────
# STEP 4 — Physics-based sensors (scenario-aware)
# ─────────────────────────────────────────────
def generate_sensors(
    infra: pd.DataFrame,
    scenarios: np.ndarray,
    rng: np.random.Generator,
) -> pd.DataFrame:
    n = len(infra)

    # ── Base readings ────────────────────────
    turbidity      = np.abs(rng.normal(2.0, 1.0, n))
    pH             = rng.normal(7.2, 0.4, n)
    conductivity   = rng.normal(400, 50, n)
    organic_carbon = np.abs(rng.normal(10, 2, n))
    temperature    = rng.normal(25, 3, n)

    # ── Correlated base sensors ──────────────
    # ORP drops as turbidity rises (more particles → more reducing agents)
    ORP            = 300 - turbidity * 15 + rng.normal(0, 5, n)
    # DO drops as organic load rises (bacterial decomposition consumes O₂)
    dissolved_oxygen = np.clip(8 - organic_carbon * 0.25 + rng.normal(0, 0.3, n), 0, 14)
    # Flow proportional to demand (population density)
    flow_rate      = np.clip(
        infra["Population_Density"].to_numpy() * 0.01 + rng.normal(0, 1, n),
        0, None
    )
    # Pressure: higher flow → higher pressure; older pipes → pressure loss
    pressure       = np.clip(
        5 + flow_rate * 0.3 - infra["Infrastructure_Age"].to_numpy() * 0.02
        + rng.normal(0, 0.3, n),
        0, None
    )

    # ── Scenario masks ───────────────────────
    heavy_rain = scenarios == "heavy_rain"
    pipe_leak  = scenarios == "pipe_leak"
    chemical   = scenarios == "chemical_contamination"
    drought    = scenarios == "drought"

    # ── Heavy rain ───────────────────────────
    # Runoff spikes turbidity; rainfall dilutes dissolved salts; slight acid wash
    turbidity[heavy_rain]    += rng.uniform(4, 14, heavy_rain.sum())
    conductivity[heavy_rain] -= rng.uniform(30, 90, heavy_rain.sum())
    pH[heavy_rain]           -= rng.uniform(0.2, 0.7, heavy_rain.sum())
    # Rain also raises flow and pressure transiently
    flow_rate[heavy_rain]    += rng.uniform(1, 4, heavy_rain.sum())
    pressure[heavy_rain]     += rng.uniform(0.2, 1.0, heavy_rain.sum())

    # ── Pipe leak ────────────────────────────
    # Downstream pressure drops; negative-pressure siphon draws in soil → turbidity up
    # Flow at the leak point surges briefly then drops; modelled as net drop here
    pressure[pipe_leak]      -= rng.uniform(1.5, 4.0, pipe_leak.sum())
    turbidity[pipe_leak]     += rng.uniform(2, 10, pipe_leak.sum())
    flow_rate[pipe_leak]     -= rng.uniform(0.5, 3.0, pipe_leak.sum())   # net downstream drop
    flow_rate                 = np.clip(flow_rate, 0, None)              # can't go negative

    # ── Chemical contamination ───────────────
    # ORP crashes (reducing contaminant); pH swings either way; conductivity spikes
    ORP[chemical]            -= rng.uniform(80, 200, chemical.sum())
    ph_swing                  = rng.choice([-1, 1], size=chemical.sum()) * rng.uniform(0.5, 2.5, chemical.sum())
    pH[chemical]             += ph_swing
    conductivity[chemical]   += rng.uniform(100, 500, chemical.sum())
    # High chemical load consumes DO
    dissolved_oxygen[chemical] -= rng.uniform(1, 4, chemical.sum())

    # ── Drought ──────────────────────────────
    # Lower dilution → contaminants concentrate; flow drops; temperature rises
    flow_rate[drought]       -= rng.uniform(1, 4, drought.sum())
    flow_rate                 = np.clip(flow_rate, 0, None)
    turbidity[drought]       += rng.uniform(0.5, 3, drought.sum())
    organic_carbon[drought]  += rng.uniform(2, 7, drought.sum())
    conductivity[drought]    += rng.uniform(20, 80, drought.sum())       # concentration effect
    temperature[drought]     += rng.uniform(1, 4, drought.sum())         # hotter, drier

    # ── Recompute correlated sensors after scenario modifications ────
    # ORP: preserve chemical crash; recalculate from modified turbidity for others
    ORP = np.where(chemical, ORP, 300 - turbidity * 15 + rng.normal(0, 5, n))
    # DO: recalculate from modified organic carbon for all rows
    dissolved_oxygen = np.where(
        chemical,
        np.clip(dissolved_oxygen, 0, 14),
        np.clip(8 - organic_carbon * 0.25 + rng.normal(0, 0.2, n), 0, 14),
    )

    # ── Sensor noise & drift (realistic SCADA imperfection) ─────────
    # Small multiplicative noise on every sensor (~1-2% drift)
    def _drift(arr, pct=0.015):
        return arr * (1 + rng.uniform(-pct, pct, n))

    turbidity      = _drift(turbidity)
    pH             = _drift(pH)
    conductivity   = _drift(conductivity)
    ORP            = _drift(ORP)
    dissolved_oxygen = _drift(dissolved_oxygen)
    flow_rate      = _drift(flow_rate)
    pressure       = _drift(pressure)

    # ── Random sensor fault spikes (~0.5% of readings) ──────────────
    fault_mask     = rng.random(n) < 0.005
    fault_sensor   = rng.integers(0, 5, n)    # which sensor faults
    spike_arrays   = [turbidity, pH, ORP, dissolved_oxygen, pressure]
    for i, arr in enumerate(spike_arrays):
        where = fault_mask & (fault_sensor == i)
        arr[where] = rng.uniform(arr.mean() * 3, arr.mean() * 5, where.sum())

    # ── Final clipping to physical bounds ───────────────────────────
    return pd.DataFrame({
        "Turbidity":        np.clip(turbidity,       0,    None),
        "pH":               np.clip(pH,              2.0,  12.0),
        "Conductivity":     np.clip(conductivity,    50,   None),
        "Organic_Carbon":   np.clip(organic_carbon,  0,    None),
        "ORP":              ORP,
        "Dissolved_Oxygen": np.clip(dissolved_oxygen, 0,   14.0),
        "Flow_Rate":        np.clip(flow_rate,        0,   None),
        "Pressure":         np.clip(pressure,         0,   None),
        "Temperature":      np.clip(temperature,      0,   45.0),
        "Sensor_Fault":     fault_mask.astype(int),
    })


# ─────────────────────────────────────────────
# STEP 5 — Labels
# ─────────────────────────────────────────────
def compute_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Potability: 1 if ALL quality indicators are within safe thresholds.
    Failure_Risk_Score: weighted, normalised [0, 1].
    Sensor_Fault rows are never marked potable.
    """
    flags = pd.DataFrame({
        "high_turbidity":    (df["Turbidity"]      > 4.0).astype(int),
        "low_pH":            (df["pH"]              < 6.5).astype(int),
        "high_pH":           (df["pH"]              > 8.5).astype(int),
        "low_ORP":           (df["ORP"]             < 150).astype(int),
        "low_DO":            (df["Dissolved_Oxygen"] < 5.0).astype(int),
        "high_conductivity": (df["Conductivity"]   > 800).astype(int),
        "high_org_carbon":   (df["Organic_Carbon"]  > 15).astype(int),
        "low_pressure":      (df["Pressure"]        < 0.5).astype(int),
        "sensor_fault":      df["Sensor_Fault"],                           # fault = unsafe
    })

    weights = {
        "high_turbidity":    1.5,
        "low_pH":            1.0,
        "high_pH":           1.0,
        "low_ORP":           2.0,
        "low_DO":            1.5,
        "high_conductivity": 1.0,
        "high_org_carbon":   1.0,
        "low_pressure":      1.5,
        "sensor_fault":      2.0,   # faulty reading is a high-risk event
    }

    max_possible = sum(weights.values())   # 13.5
    weighted_risk = sum(flags[col] * w for col, w in weights.items())

    df["Failure_Risk_Score"] = np.clip(weighted_risk / max_possible, 0, 1)
    df["Potability"]         = (flags.sum(axis=1) == 0).astype(int)

    return df


# ─────────────────────────────────────────────
# STEP 6 — Builder
# ─────────────────────────────────────────────
def build_dataset(n: int = 20_000, seed: int = SEED) -> pd.DataFrame:
    # Independent RNGs per stage — order of calls no longer matters
    rng_infra    = np.random.default_rng(seed)
    rng_time     = np.random.default_rng(seed + 1)
    rng_scenario = np.random.default_rng(seed + 2)
    rng_sensors  = np.random.default_rng(seed + 3)

    infra     = generate_infrastructure(n, rng_infra)
    time      = generate_time(n, rng_time)
    scenarios = assign_scenarios(time["timestamp_month"].to_numpy(), rng_scenario)
    sensors   = generate_sensors(infra, scenarios, rng_sensors)

    df = pd.concat([
        infra,
        pd.Series(scenarios, name="Scenario"),
        sensors,
        time,
    ], axis=1)

    return compute_labels(df)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("Building dataset…")
    df = build_dataset(50_000)

    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATASET_PATH, index=False)

    print(f"Saved {len(df):,} rows → {DATASET_PATH}")
    print(f"Columns ({len(df.columns)}): {df.columns.tolist()}")

    print("\nPotability distribution:")
    print(df["Potability"].value_counts())

    print("\nRisk score stats:")
    print(df["Failure_Risk_Score"].describe())

    print("\nScenario distribution:")
    print(df["Scenario"].value_counts())

    print("\nSensor fault rate:")
    print(f"  {df['Sensor_Fault'].mean()*100:.2f}% of rows")

    print("\nScenario × Month heatmap (counts):")
    pivot = df.pivot_table(
        index="Scenario",
        columns="timestamp_month",
        values="Potability",
        aggfunc="count",
        fill_value=0,
    )
    print(pivot.to_string())