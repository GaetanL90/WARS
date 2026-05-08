import time
from generator.sensor_simulator_v2 import WARS_SensorNode
from ml.predictor import WARSPredictor

def run_full_system_test():
    # Initialize the two core systems
    node = WARS_SensorNode(hardware_id="WP-RWD-7729-101")
    predictor = WARSPredictor()
    
    print(f"🚀 WARS INTEGRATION STARTING...")
    print(f"Target Hardware: {node.hardware_id}\n" + "-"*40)

    try:
        while True:
            # STEP 1: Simulate Hardware Data Capture [cite: 31]
            raw_payload = node.get_reading()
            iot_data = raw_payload["sensors"]
            
            # STEP 2: Simulate Database Fetch (Static Metadata) [cite: 35, 36]
            # This data is normally stored in your WaterPoint Django model
            db_static_context = {
                "Infrastructure_Age": 12, 
                "Distance_to_TreatmentPlant": 4.5,
                "Population_Impacted": 1200,
                "Population_Density": 450,
                "Priority_Level": 3,
                "Repair_Team_Availability": 1,
                "Local_Authority_Responsiveness": 4,
                "Historical_Issue_Frequency": 2,
                "Elevation": 1490,      # Added
                "Temperature": 24.5,    # Added
                "lat": -2.15, # Mock coordinate for Nyamata area
                "lon": 30.08
            }
            
            # STEP 3: Execute Full AI Pipeline [cite: 30, 41-44]
            # Includes log1p transforms, temporal engineering, and dual-model inference
            results = predictor.get_predictions(iot_data, db_static_context)
            
            # STEP 4: Output to Dashboard (Console) [cite: 48]
            timestamp = raw_payload["metadata"]["timestamp"].split("T")[1][:8]
            print(f"[{timestamp}] STATUS: {results['potability']} | RISK: {results['failure_risk_score']}")
            
            if results['alert_triggered']:
                print(f"⚠️  ALERT: High Risk or Unsafe Water detected at {node.hardware_id}!")
            
            print("-" * 40)
            time.sleep(5) # Match dashboard polling interval [cite: 102]

    except KeyboardInterrupt:
        print("\nIntegration test stopped.")

if __name__ == "__main__":
    run_full_system_test()
