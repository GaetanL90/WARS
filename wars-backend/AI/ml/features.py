import pandas as pd
import numpy as np


def engineer_features(df: pd.DataFrame):

    # Standardize names
    df.rename(columns={
        "Latitude": "lat",
        "Longitude": "lon",
        "Report_Year": "timestamp_year",
        "Report_Day": "timestamp_day",
        "Hour_of_Day": "timestamp_hour"
    }, inplace=True)

    # Log transforms
    # df["Turbidity_log1p"] = np.log1p(df["Turbidity"])
    # df["Solids_log1p"] = np.log1p(df["Solids"])
    # df["Conductivity_log1p"] = np.log1p(df["Conductivity"])

    return df
