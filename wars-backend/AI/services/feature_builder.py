import pandas as pd

FEATURE_COLUMNS = [
    "Infrastructure_Age",
    "Distance_to_TreatmentPlant",
    "Population_Density",
    "Population_Impacted",
    "Repair_Team_Availability",
    "Local_Authority_Responsiveness",
    "Priority_Level",
    "lat",
    "lon",
    "Scenario_encoded",
    "Turbidity",
    "pH",
    "Conductivity",
    "Organic_Carbon",
    "ORP",
    "Dissolved_Oxygen",
    "Temperature",
    "Flow_Rate",
    "Pressure",
    "Sensor_Fault",
    "timestamp_year",
    "timestamp_month",
    "timestamp_day",
    "timestamp_hour",
    "weekday",
]


def build_features(msg: dict) -> pd.DataFrame:
    s = msg["sensors"]
    infra = msg["infrastructure"]
    t = msg["time_features"]

    row = {
        "Infrastructure_Age": infra["Infrastructure_Age"],
        "Distance_to_TreatmentPlant": infra["Distance_to_TreatmentPlant"],
        "Population_Density": infra["Population_Density"],
        "Population_Impacted": infra["Population_Impacted"],
        "Repair_Team_Availability": infra["Repair_Team_Availability"],
        "Local_Authority_Responsiveness": infra["Local_Authority_Responsiveness"],
        "Priority_Level": infra["Priority_Level"],
        "lat": infra["lat"],
        "lon": infra["lon"],
        "Scenario_encoded": msg["metadata"]["scenario_encoded"],
        "Turbidity": s["Turbidity"],
        "pH": s["pH"],
        "Conductivity": s["Conductivity"],
        "Organic_Carbon": s["Organic_Carbon"],
        "ORP": s["ORP"],
        "Dissolved_Oxygen": s["Dissolved_Oxygen"],
        "Temperature": s["Temperature"],
        "Flow_Rate": s["Flow_Rate"],
        "Pressure": s["Pressure"],
        "Sensor_Fault": s["Sensor_Fault"],
        "timestamp_year": t["timestamp_year"],
        "timestamp_month": t["timestamp_month"],
        "timestamp_day": t["timestamp_day"],
        "timestamp_hour": t["timestamp_hour"],
        "weekday": t["weekday"],
    }

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)