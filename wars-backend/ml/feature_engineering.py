import numpy as np
from datetime import datetime

def get_season(month):
    # Example: 0=dry (June-Aug), 1=wet (Sept-Nov) etc. [cite: 25]
    if month in [6, 7, 8]: return 0 
    return 1

def compute_engineered_features(data):
    """
    Computes log1p transforms and temporal features[cite: 6, 16].
    """
    # 1. Log1p Transformations [cite: 8, 9, 10]
    data['Turbidity_log1p'] = np.log1p(data['Turbidity'])
    data['Solids_log1p'] = np.log1p(data['Solids'])
    data['Conductivity_log1p'] = np.log1p(data['Conductivity'])
    
    # 2. Temporal Features [cite: 19-26]
    now = datetime.now()
    data['Date_Time_hour'] = now.hour
    data['Date_Time_day'] = now.day
    data['Date_Time_month'] = now.month
    data['Date_Time_weekday'] = now.weekday()
    data['Date_Time_year'] = now.year
    data['Season'] = get_season(now.month)
    
    return data