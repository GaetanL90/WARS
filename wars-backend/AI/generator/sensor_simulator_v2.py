import time
import json
from datetime import datetime
from ml.predict_stream import predict

try:
    from .realistic_patterns import WaterQualityPatterns
    from .scenarios import heavy_rain_event
except ImportError:
    from .realistic_patterns import WaterQualityPatterns
    from .scenarios import heavy_rain_event

class WARS_SensorNode:
    """Simulates a professional hardware node attached to a Water Point."""
    
    def __init__(self, hardware_id="WP-RWD-7729-101"):
        self.hardware_id = hardware_id
        # Define baseline 'Safe' levels based on IoT metric requirements [cite: 5, 29]
        self.baselines = {
            "Turbidity": 1.2, "pH": 7.1, "Conductivity": 350.0,
            "Solids": 12000.0, "Chloramines": 4.0, "Sulfate": 180.0,
            "Organic_carbon": 10.0, "Trihalomethanes": 45.0, "Hardness": 140.0
        }

    def get_reading(self):
        """Generates readings following natural physics and seasonal drift."""
        now = datetime.now()
        
        # 1. Apply seasonal physics [cite: 25]
        seasonal_baselines = WaterQualityPatterns.apply_seasonal_physics(now.month, self.baselines)
        
        # 2. Generate correlated Gaussian noise for hardware realism
        sensor_data = WaterQualityPatterns.generate_correlated_noise(seasonal_baselines)
        
        payload = {
            "metadata": {
                "hardware_id": self.hardware_id,
                "timestamp": now.isoformat(),
                "firmware_v": "1.2.4"
            },
            "sensors": sensor_data
        }
        
        result = predict(sensor_data)
        print("\n📊 PREDICTION:", result)
        return payload

if __name__ == "__main__":
    node = WARS_SensorNode()
    print(f"--- WARS IoT Node {node.hardware_id} Online ---")
    try:
        while True:
            reading = node.get_reading()
            print(json.dumps(reading, indent=2))
            # Interval set for real-time dashboard polling simulation [cite: 102]
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nNode shutting down.")