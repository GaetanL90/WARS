import pandas as pd

FEATURE_COLS = [
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
    "Scenario_encoded",

    # Water quality
    "Turbidity",
    "pH",
    "Conductivity",
    "Organic_Carbon",
    "ORP",
    "Dissolved_Oxygen",
    "Temperature",

    # Hydraulic
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
]


def build_model_input(sensor_data: dict) -> pd.DataFrame:
    """
    Converts IoT sensor payload → ML model input format
    """

    df = pd.DataFrame([sensor_data])

    # Fill missing features (since simulator doesn't send all)
    for col in FEATURE_COLS:
        if col not in df.columns:
            df[col] = 0  # or realistic default

    return df[FEATURE_COLS]