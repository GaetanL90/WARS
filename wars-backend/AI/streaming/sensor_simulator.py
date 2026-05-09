"""
WARS Sensor Node Simulator v2
Simulates a physical IoT hardware node attached to a WaterPoint.
Aligned with v4 dataset schema and real sensor physics.
"""

import time
import json
import requests
import numpy as np
from datetime import datetime
from pathlib import Path
from streaming.kafka_producer import WARSKafkaProducer

# ─────────────────────────────────────────────
# SCENARIO DEFINITIONS
# Rwanda climate-aware probabilities per month
# ─────────────────────────────────────────────
SCENARIOS = {
    "normal":                 0.60,
    "heavy_rain":             0.12,
    "pipe_leak":              0.10,
    "chemical_contamination": 0.10,
    "drought":                0.08,
}

# Month-aware scenario weights (Rwanda climate)
# Index 0 = January … 11 = December
_SCENARIO_MONTH_WEIGHTS = {
    #                          J     F     M     A     M     J     J     A     S     O     N     D
    "normal":                [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
    "heavy_rain":            [0.3,  0.4,  1.5,  2.0,  1.5,  0.3,  0.2,  0.2,  0.4,  1.5,  2.0,  0.5],
    "pipe_leak":             [0.8,  0.8,  1.0,  1.2,  1.0,  1.5,  1.5,  1.5,  1.2,  0.8,  0.8,  0.8],
    "chemical_contamination":[1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
    "drought":               [0.5,  0.6,  0.3,  0.2,  0.3,  1.8,  2.0,  2.0,  1.5,  0.3,  0.2,  0.6],
}

SCENARIO_NAMES  = list(SCENARIOS.keys())
SCENARIO_PROBS  = list(SCENARIOS.values())

# Scenario encoding must match training script
SCENARIO_ENCODING = {
    "normal":                 0,
    "heavy_rain":             1,
    "pipe_leak":              2,
    "chemical_contamination": 3,
    "drought":                4,
}

# ─────────────────────────────────────────────
# PHYSICAL SENSOR BOUNDS
# ─────────────────────────────────────────────
SENSOR_BOUNDS = {
    "Turbidity":        (0,    None),
    "pH":               (2.0,  12.0),
    "Conductivity":     (50,   None),
    "Organic_Carbon":   (0,    None),
    "ORP":              (None, None),
    "Dissolved_Oxygen": (0,    14.0),
    "Flow_Rate":        (0,    None),
    "Pressure":         (0,    None),
    "Temperature":      (0,    45.0),
}

# WHO / WARS risk thresholds (must match compute_labels in dataset_factory)
RISK_THRESHOLDS = {
    "Turbidity":        ("gt", 4.0),
    "pH_low":           ("lt", 6.5),
    "pH_high":          ("gt", 8.5),
    "ORP":              ("lt", 150.0),
    "Dissolved_Oxygen": ("lt", 5.0),
    "Conductivity":     ("gt", 800.0),
    "Organic_Carbon":   ("gt", 15.0),
    "Pressure":         ("lt", 0.5),
}


class SensorDriftTracker:
    """
    Tracks cumulative sensor drift per node.
    Real sensors drift gradually — this prevents
    readings jumping discontinuously between polls.
    """
    def __init__(self, rng: np.random.Generator):
        self.rng = rng
        self.drift = {
            "Turbidity":      0.0,
            "pH":             0.0,
            "Conductivity":   0.0,
            "ORP":            0.0,
            "Dissolved_Oxygen": 0.0,
            "Flow_Rate":      0.0,
            "Pressure":       0.0,
            "Temperature":    0.0,
        }

    def step(self):
        """Advance drift by a small random walk each reading cycle."""
        for key in self.drift:
            self.drift[key] += self.rng.normal(0, 0.005)   # ~0.5% drift per step
            self.drift[key]  = np.clip(self.drift[key], -0.05, 0.05)


def _pick_scenario(month: int, rng: np.random.Generator) -> str:
    """Sample scenario using month-weighted probabilities."""
    raw = np.array([
        _SCENARIO_MONTH_WEIGHTS[s][month - 1] * SCENARIOS[s]
        for s in SCENARIO_NAMES
    ])
    probs = raw / raw.sum()
    return rng.choice(SCENARIO_NAMES, p=probs)


def _clip_sensor(value: float, key: str) -> float:
    lo, hi = SENSOR_BOUNDS.get(key, (None, None))
    return float(np.clip(value, lo if lo is not None else -np.inf,
                                hi if hi is not None else  np.inf))


def _detect_sensor_fault(sensors: dict, rng: np.random.Generator) -> int:
    """
    0.5% chance of a random spike fault on one sensor.
    Matches the fault rate in the v4 training dataset.
    """
    if rng.random() < 0.005:
        fault_key = rng.choice(["Turbidity", "pH", "ORP", "Dissolved_Oxygen", "Pressure"])
        val = sensors[fault_key]
        sensors[fault_key] = float(val * rng.uniform(3.0, 5.0))
        return 1
    return 0


class WARS_SensorNode:
    """
    Simulates a professional IoT hardware node at a WaterPoint.

    Each node has:
      - 9 physical sensors (water quality + hydraulic)
      - Admin-configured infrastructure metadata
      - Scenario-aware physics aligned with v4 dataset
      - Sensor drift + fault detection

    The payload produced matches exactly what the WARS backend
    expects at POST /api/waterpoints/{id}/reading
    """

    FIRMWARE_VERSION = "2.0.0"

    def __init__(
        self,
        hardware_id: str = "WP-RWD-7729-101",
        infrastructure: dict | None = None,
        seed: int | None = None,
    ):
        self.hardware_id = hardware_id
        self.rng         = np.random.default_rng(seed)
        self.drift       = SensorDriftTracker(self.rng)

        # Admin-configured fields (set at WaterPoint registration)
        # These mirror the infrastructure columns in the v4 dataset
        self.infrastructure = infrastructure or {
            "Infrastructure_Age":             10,
            "Distance_to_TreatmentPlant":     5.0,
            "Population_Density":             800,
            "Population_Impacted":            3200,
            "Repair_Team_Availability":       2,
            "Local_Authority_Responsiveness": 0.7,
            "Priority_Level":                 3,
            "lat":                            -1.7,
            "lon":                            29.85,
        }

        # Running state
        self._current_scenario: str  = "normal"
        self._reading_count:    int  = 0

    # ─────────────────────────────────────────
    # INTERNAL PHYSICS ENGINE
    # ─────────────────────────────────────────
    def _base_readings(self) -> dict:
        """Generate correlated baseline sensor readings."""
        rng = self.rng
        infra = self.infrastructure

        turbidity      = float(np.abs(rng.normal(2.0, 1.0)))
        pH             = float(rng.normal(7.2, 0.4))
        conductivity   = float(rng.normal(400, 50))
        organic_carbon = float(np.abs(rng.normal(10, 2)))
        temperature    = float(rng.normal(25, 3))

        # Physics correlations
        ORP            = float(300 - turbidity * 15 + rng.normal(0, 5))
        dissolved_O2   = float(np.clip(8 - organic_carbon * 0.25 + rng.normal(0, 0.3), 0, 14))
        flow_rate      = float(np.clip(infra["Population_Density"] * 0.01 + rng.normal(0, 1), 0, None))
        pressure       = float(np.clip(
            5 + flow_rate * 0.3 - infra["Infrastructure_Age"] * 0.02 + rng.normal(0, 0.3),
            0, None
        ))

        return {
            "Turbidity":        turbidity,
            "pH":               pH,
            "Conductivity":     conductivity,
            "Organic_Carbon":   organic_carbon,
            "ORP":              ORP,
            "Dissolved_Oxygen": dissolved_O2,
            "Flow_Rate":        flow_rate,
            "Pressure":         pressure,
            "Temperature":      temperature,
        }

    def _apply_scenario(self, sensors: dict, scenario: str) -> dict:
        """Apply scenario-specific physics modifications."""
        rng = self.rng
        s   = sensors  # alias for brevity

        if scenario == "heavy_rain":
            s["Turbidity"]      += float(rng.uniform(4, 14))
            s["Conductivity"]   -= float(rng.uniform(30, 90))
            s["pH"]             -= float(rng.uniform(0.2, 0.7))
            s["Flow_Rate"]      += float(rng.uniform(1, 4))
            s["Pressure"]       += float(rng.uniform(0.2, 1.0))

        elif scenario == "pipe_leak":
            s["Pressure"]       -= float(rng.uniform(1.5, 4.0))
            s["Turbidity"]      += float(rng.uniform(2, 10))
            s["Flow_Rate"]      -= float(rng.uniform(0.5, 3.0))

        elif scenario == "chemical_contamination":
            s["ORP"]            -= float(rng.uniform(80, 200))
            ph_swing             = float(rng.choice([-1, 1]) * rng.uniform(0.5, 2.5))
            s["pH"]             += ph_swing
            s["Conductivity"]   += float(rng.uniform(100, 500))
            s["Dissolved_Oxygen"] -= float(rng.uniform(1, 4))

        elif scenario == "drought":
            s["Flow_Rate"]      -= float(rng.uniform(1, 4))
            s["Turbidity"]      += float(rng.uniform(0.5, 3))
            s["Organic_Carbon"] += float(rng.uniform(2, 7))
            s["Conductivity"]   += float(rng.uniform(20, 80))
            s["Temperature"]    += float(rng.uniform(1, 4))

        # Recompute correlated sensors after scenario mods
        if scenario != "chemical_contamination":
            s["ORP"] = float(300 - s["Turbidity"] * 15 + rng.normal(0, 5))
        s["Dissolved_Oxygen"] = float(np.clip(
            8 - s["Organic_Carbon"] * 0.25 + rng.normal(0, 0.2), 0, 14
        ))
        s["Flow_Rate"] = max(0.0, s["Flow_Rate"])

        return s

    def _apply_drift(self, sensors: dict) -> dict:
        """Apply accumulated sensor drift to all readings."""
        self.drift.step()
        for key, drift_val in self.drift.drift.items():
            if key in sensors:
                sensors[key] = sensors[key] * (1 + drift_val)
        return sensors

    def _clip_all(self, sensors: dict) -> dict:
        return {k: _clip_sensor(v, k) for k, v in sensors.items()}

    # ─────────────────────────────────────────
    # RISK ASSESSMENT  (local, no ML call)
    # ─────────────────────────────────────────
    def _local_risk_flags(self, sensors: dict) -> dict:
        """
        Compute risk flags locally on the node.
        Matches the threshold logic in dataset_factory.compute_labels().
        This is a pre-filter before sending to the ML inference endpoint.
        """
        flags = {
            "high_turbidity":    sensors["Turbidity"]        > 4.0,
            "low_pH":            sensors["pH"]                < 6.5,
            "high_pH":           sensors["pH"]                > 8.5,
            "low_ORP":           sensors["ORP"]               < 150.0,
            "low_DO":            sensors["Dissolved_Oxygen"]  < 5.0,
            "high_conductivity": sensors["Conductivity"]      > 800.0,
            "high_org_carbon":   sensors["Organic_Carbon"]    > 15.0,
            "low_pressure":      sensors["Pressure"]          < 0.5,
        }
        any_flag = any(flags.values())
        return {
            "flags":          flags,
            "local_potable":  not any_flag,
            "flag_count":     sum(flags.values()),
        }

    def _compute_risk_score(self, sensors: dict, sensor_fault: int) -> float:
        score = 0.0

        if sensors["Turbidity"] > 4: score += 0.15
        if sensors["pH"] < 6.5 or sensors["pH"] > 8.5: score += 0.10
        if sensors["ORP"] < 150: score += 0.20
        if sensors["Dissolved_Oxygen"] < 5: score += 0.15
        if sensors["Conductivity"] > 800: score += 0.10
        if sensors["Organic_Carbon"] > 15: score += 0.10
        if sensors["Pressure"] < 0.5: score += 0.10
        if sensor_fault: 
            score += 0.10

        return float(min(score, 1.0))
    
    # ─────────────────────────────────────────
    # PUBLIC: GET READING
    # ─────────────────────────────────────────
    def get_reading(self, force_scenario: str | None = None) -> dict:
        """
        Generate one complete sensor reading cycle.

        Returns a payload dict ready to POST to the WARS backend.
        Schema matches POST /api/waterpoints/{id}/reading exactly.
        """
        now      = datetime.now()
        scenario = force_scenario or _pick_scenario(now.month, self.rng)
        self._current_scenario = scenario
        self._reading_count   += 1

        # Physics pipeline
        sensors = self._base_readings()
        sensors = self._apply_scenario(sensors, scenario)
        sensors = self._apply_drift(sensors)
        sensors = self._clip_all(sensors)

        # Fault detection
        sensor_fault = _detect_sensor_fault(sensors, self.rng)

        # Local risk assessment
        risk = self._local_risk_flags(sensors)

        payload = {
            # ── Metadata ────────────────────────────────
            "metadata": {
                "hardware_id":   self.hardware_id,
                "firmware_v":    self.FIRMWARE_VERSION,
                "timestamp":     now.isoformat(),
                "reading_index": self._reading_count,
                "scenario":      scenario,
                "scenario_encoded": SCENARIO_ENCODING[scenario],
            },

            # ── 9 Physical sensors ───────────────────────
            # These map 1:1 to dataset columns the ML model was trained on
            "sensors": {
                # Water quality
                "Turbidity":        round(sensors["Turbidity"],        4),
                "pH":               round(sensors["pH"],               4),
                "Conductivity":     round(sensors["Conductivity"],     4),
                "Organic_Carbon":   round(sensors["Organic_Carbon"],   4),
                "ORP":              round(sensors["ORP"],              4),
                "Dissolved_Oxygen": round(sensors["Dissolved_Oxygen"], 4),
                "Temperature":      round(sensors["Temperature"],      4),
                # Hydraulic
                "Flow_Rate":        round(sensors["Flow_Rate"],        4),
                "Pressure":         round(sensors["Pressure"],         4),
                # Operational
                "Sensor_Fault":     sensor_fault,
            },

            # ── Admin-configured infrastructure ──────────
            # Set once at WaterPoint registration; not measured by sensors
            "infrastructure": self.infrastructure,

            # ── Time features ────────────────────────────
            "time_features": {
                "timestamp_year":  now.year,
                "timestamp_month": now.month,
                "timestamp_day":   now.day,
                "timestamp_hour":  now.hour,
                "weekday":         now.weekday(),   # 0=Mon … 6=Sun
            },

            # ── Local pre-assessment ─────────────────────
            # Computed on-node before ML inference.
            # Backend uses this for fast alerting without waiting for ML.
            "local_assessment": {
                "local_potable":  risk["local_potable"],
                "flag_count":     risk["flag_count"],
                "flags":          risk["flags"],
                "sensor_fault":   bool(sensor_fault),
                "risk_score" : self._compute_risk_score(sensors, sensor_fault),
            },
        }

        return payload

    def print_summary(self, payload: dict) -> None:
        """Pretty-print a reading summary to stdout."""
        m  = payload["metadata"]
        s  = payload["sensors"]
        la = payload["local_assessment"]

        potable_str = "✅ POTABLE" if la["local_potable"] else "❌ NOT POTABLE"
        fault_str   = " ⚠️  SENSOR FAULT" if la["sensor_fault"] else ""

        print(f"\n{'─'*55}")
        print(f"  Node      : {m['hardware_id']}  (fw {m['firmware_v']})")
        print(f"  Time      : {m['timestamp']}")
        print(f"  Scenario  : {m['scenario'].upper()}")
        print(f"  Status    : {potable_str}{fault_str}")
        print(f"  Flags     : {la['flag_count']}/8 triggered")
        if la["flag_count"]:
            for flag, val in la["flags"].items():
                if val:
                    print(f"              ⚠  {flag}")
                    
        print(f"\n  Turbidity : {s['Turbidity']:.3f} NTU")
        print(f"  pH        : {s['pH']:.3f}")
        print(f"  Conductivity: {s['Conductivity']:.1f} µS/cm")
        print(f"  ORP       : {s['ORP']:.1f} mV")
        print(f"  DO        : {s['Dissolved_Oxygen']:.3f} mg/L")
        print(f"  Org Carbon: {s['Organic_Carbon']:.3f} mg/L")
        print(f"  Flow Rate : {s['Flow_Rate']:.3f} L/s")
        print(f"  Pressure  : {s['Pressure']:.3f} bar")
        print(f"  Temp      : {s['Temperature']:.2f} °C")
        print(f"{'─'*55}")


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # Example with admin-configured infrastructure
    infra = {
        "Infrastructure_Age":             15,
        "Distance_to_TreatmentPlant":     8.5,
        "Population_Density":             1200,
        "Population_Impacted":            4800,
        "Repair_Team_Availability":       3,
        "Local_Authority_Responsiveness": 0.75,
        "Priority_Level":                 4,
        "lat":                            -1.7234,
        "lon":                            29.8821,
    }

    node = WARS_SensorNode(
        hardware_id="WP-RWD-7729-101",
        infrastructure=infra,
        seed=42,
    )
    producer = WARSKafkaProducer(bootstrap_servers="localhost:9092")

    SENSOR_TOPIC = "wars.sensor.readings"
    PRED_TOPIC   = "wars.ml.predictions"  # future ML output stream

    print(f"--- WARS IoT Node {node.hardware_id} Online (fw {WARS_SensorNode.FIRMWARE_VERSION}) ---")
    print("Polling every 5 seconds. Ctrl+C to stop.\n")

    try:
        while True:
            reading = node.get_reading()
            
            # 1. Send RAW sensor stream
            producer.send(
                SENSOR_TOPIC, 
                reading,
                key=node.hardware_id
                )

            # 2. Print debug summary
            node.print_summary(reading)
            
            # Hit the API
            response =  requests.post(
                "http://127.0.0.1:8000/sensors/sensor",
                json=reading,
                timeout=30
            )
            print(f"  API → {response.status_code}: {response.json()}")

            # 3. Optional ML prediction stream (future)
            #producer.send(PRED_TOPIC, reading)

            # 4. JSON log (optional debug only)
            # print(json.dumps(reading))
            
            # Optionally call ML inference endpoint:
            # from ml.predict_stream import predict
            # result = predict(reading)
            # print("ML prediction:", result)

            # Full JSON payload (what gets POSTed to backend)
            # print(json.dumps(reading, indent=2))

            time.sleep(5)

    except KeyboardInterrupt:
        print(f"\nNode {node.hardware_id} shutting down after {node._reading_count} readings.")
        producer.close()