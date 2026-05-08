import random
import time
from datetime import datetime

def get_base_value(metric):
    """Provides realistic 'baseline' values for Rwandan water standards."""
    baselines = {
        "Turbidity": 1.5,      # NTU
        "pH": 7.2,             # Neutral
        "Conductivity": 400.0, # uS/cm
        "Solids": 15000.0,     # mg/L
        "Chloramines": 3.0,    # mg/L
        "Sulfate": 200.0,      # mg/L
        "Organic_carbon": 12.0,
        "Trihalomethanes": 50.0,
        "Hardness": 150.0
    }
    return baselines.get(metric, 0)

def generate_mock_iot_data():
    """
    Generates the 9 required IoT sensor metrics with realistic drift.
    """
    now = datetime.now()
    # Simulate higher turbidity if it's 'Wet Season' (Sept-Nov/Feb-May)
    is_wet_season = now.month in [2, 3, 4, 5, 9, 10, 11]
    seasonal_drift = 2.5 if is_wet_season else 0.0
    
    return {
        "Turbidity": round(get_base_value("Turbidity") + seasonal_drift + random.uniform(-0.5, 0.5), 2),
        "pH": round(get_base_value("pH") + random.uniform(-0.3, 0.3), 2),
        "Conductivity": round(get_base_value("Conductivity") + random.uniform(-50, 50), 1),
        "Solids": round(get_base_value("Solids") + random.uniform(-1000, 1000), 0),
        "Chloramines": round(get_base_value("Chloramines") + random.uniform(-0.5, 0.5), 2),
        "Sulfate": round(get_base_value("Sulfate") + random.uniform(-20, 20), 2),
        "Organic_carbon": round(get_base_value("Organic_carbon") + random.uniform(-2, 2), 2),
        "Trihalomethanes": round(get_base_value("Trihalomethanes") + random.uniform(-5, 5), 2),
        "Hardness": round(get_base_value("Hardness") + random.uniform(-10, 10), 2)
    }

if __name__ == "__main__":
    print("WARS IoT Mock Generator Started (5s interval)...")
    try:
        while True:
            data = generate_mock_iot_data()
            # In a real scenario, this would POST to your Django API
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Payload: {data}")
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nSimulation stopped.")