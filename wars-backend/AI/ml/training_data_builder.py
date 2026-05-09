import pandas as pd
import numpy as np
import random
from generator.sensor_simulator_v2 import WARS_SensorNode
from ml.feature_engineering import compute_engineered_features


def fake_static_context():
    return {
        "Distance_to_TreatmentPlant": random.uniform(0.5, 10),
        "Elevation": random.uniform(1000, 2000),
        "Infrastructure_Age": random.randint(1, 30),
        "Local_Authority_Responsiveness": random.randint(1, 5),
        "Population_Density": random.randint(100, 5000),
        "Population_Impacted": random.randint(1000, 50000),
        "Priority_Level": random.randint(1, 3),
        "Repair_Team_Availability": random.randint(1, 10),
        "Temperature": random.uniform(15, 30),
        "lat": -1.95,
        "lon": 30.06
    }


def generate_dataset(n=5000):
    node = WARS_SensorNode()
    rows = []

    for _ in range(n):

        # --------------------------
        # SENSOR + STATIC DATA
        # --------------------------
        sensor = node.get_reading()["sensors"]
        static = fake_static_context()
        full = {**sensor, **static}

        # --------------------------
        # LABEL: POTABILITY (clear rule)
        # --------------------------
        t = sensor["Turbidity"]

        prob_safe = 1 / (1 + np.exp((t - 3.5) * 1.5))

        potability = 1 if random.random() < prob_safe else 0

        # --------------------------
        # BASE RISK (continuous signal)
        # --------------------------
        risk = (
            0.30 * (sensor["Turbidity"] / 10) +
            0.25 * (sensor["Conductivity"] / 1200) +
            0.20 * (sensor["Solids"] / 20000) +
            0.15 * max(0, (7 - sensor["pH"]) / 7)
        )

        # --------------------------
        # MEDIUM STRESS CONDITIONS
        # --------------------------
        if sensor["Turbidity"] > 3:
            risk += 0.15

        if sensor["pH"] < 6.8:
            risk += 0.10

        # --------------------------
        # RARE CRITICAL EVENTS
        # --------------------------
        if sensor["Turbidity"] > 8 and random.random() < 0.25:
            risk += 0.45

        if sensor["Conductivity"] > 900 and random.random() < 0.20:
            risk += 0.35

        if sensor["pH"] < 6.0 and random.random() < 0.15:
            risk += 0.40

        # --------------------------
        # NOISE (sensor realism)
        # --------------------------
        risk += np.random.normal(0, 0.03)

        # --------------------------
        # FINAL CLAMP
        # --------------------------
        risk = max(0, min(risk, 1))

        # --------------------------
        # FEATURE ENGINEERING
        # --------------------------
        full = compute_engineered_features(full)

        full["target_potability"] = potability
        full["target_risk"] = risk

        rows.append(full)

    return pd.DataFrame(rows)