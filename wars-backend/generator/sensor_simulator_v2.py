import random
import time
import json
from datetime import datetime

class WARS_SensorNode:
    """Simulates a professional hardware node attached to a Water Point."""
    
    def __init__(self, hardware_id="WP-RWD-7729-101"):
        self.hardware_id = hardware_id
        # Define baseline 'Safe' levels
        self.baselines = {
            "Turbidity": 1.2, "pH": 7.1, "Conductivity": 350.0,
            "Solids": 12000.0, "Chloramines": 4.0, "Sulfate": 180.0,
            "Organic_carbon": 10.0, "Trihalomethanes": 45.0, "Hardness": 140.0
        }

    def get_reading(self):
        """Generates readings with realistic sensor noise and seasonal drift."""
        now = datetime.now()
        # Seasonal logic: Wet season increases runoff/turbidity [cite: 25]
        is_wet_season = now.month in [3, 4, 5, 9, 10, 11]
        drift = 2.0 if is_wet_season else 0.0
        
        payload = {
            "metadata": {
                "hardware_id": self.hardware_id,
                "timestamp": now.isoformat(),
                "firmware_v": "1.2.4"
            },
            "sensors": {
                "Turbidity": round(self.baselines["Turbidity"] + drift + random.gauss(0, 0.2), 2),
                "pH": round(self.baselines["pH"] + random.gauss(0, 0.05), 2),
                "Conductivity": round(self.baselines["Conductivity"] + random.gauss(0, 15), 1),
                "Solids": round(self.baselines["Solids"] + random.gauss(0, 500), 0),
                "Chloramines": round(self.baselines["Chloramines"] + random.gauss(0, 0.1), 2),
                "Sulfate": round(self.baselines["Sulfate"] + random.uniform(-5, 5), 2),
                "Organic_carbon": round(self.baselines["Organic_carbon"] + random.uniform(-1, 1), 2),
                "Trihalomethanes": round(self.baselines["Trihalomethanes"] + random.uniform(-2, 2), 2),
                "Hardness": round(self.baselines["Hardness"] + random.uniform(-5, 5), 2)
            }
        }
        return payload

if __name__ == "__main__":
    node = WARS_SensorNode()
    print(f"--- WARS IoT Node {node.hardware_id} Online ---")
    try:
        while True:
            reading = node.get_reading()
            print(json.dumps(reading, indent=2))
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nNode shutting down.")
