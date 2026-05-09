import numpy as np
from datetime import datetime

def compute_engineered_features(data):

    # 1. Standardize casing for Ph
    if 'pH' in data:
        data['Ph'] = data.pop('pH')

    # 2. Log1p Transformations
    data['Turbidity_log1p'] = np.log1p(data['Turbidity'])
    data['Solids_log1p'] = np.log1p(data['Solids'])
    data['Conductivity_log1p'] = np.log1p(data['Conductivity'])

    # 3. Computed Ratios
    resp = data.get('Local_Authority_Responsiveness', 1)

    data['Distance_vs_Response'] = (
        data.get('Distance_to_TreatmentPlant', 0)
        / (resp if resp > 0 else 1)
    )

    # 4. Temporal Features
    now = datetime.now()

    data['timestamp_hour'] = now.hour
    data['timestamp_day'] = now.day
    data['timestamp_year'] = now.year
    data['timestamp_weekday'] = now.weekday()

    data['Season'] = 1 if now.month in [2,3,4,5,9,10,11] else 0

    # 5. Schema compatibility
    historical = data.get(
        'Historical_Issue_Frequency',
        data.get('Issue_Frequency_per_Year', 0)
    )

    data['Historical_Issue_Frequency'] = historical
    data['Issue_Frequency_per_Year'] = historical

    return data