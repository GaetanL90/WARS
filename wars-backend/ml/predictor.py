import joblib
import json
import pandas as pd
try:
    from .feature_engineering import compute_engineered_features
except ImportError:
    from feature_engineering import compute_engineered_features

class WARSPredictor:
    def __init__(self):
        # Load the feature order committed by Gaetan [cite: 51, 55]
        with open('models/feature_columns.json', 'r') as f:
            self.feature_order = json.load(f)
            
        self.classifier = joblib.load('models/WARS_Classifier_RF.pkl')
        self.regressor = joblib.load('models/WARS_Regressor_ET.pkl')

    def get_predictions(self, sensor_data, db_static_data):
        # 1. Assemble full feature set [cite: 41]
        full_data = {**sensor_data, **db_static_data}
        
        # 2. Compute engineered/temporal features [cite: 38, 39]
        processed_data = compute_engineered_features(full_data)
        
        # 3. Ensure EXACT column order 
        df = pd.DataFrame([processed_data])[self.feature_order]
        
        # 4. Generate Outputs [cite: 3, 12, 43, 44]
        potability = self.classifier.predict(df)[0] # "Safe" or "Unsafe"
        confidence = self.classifier.predict_proba(df).max()
        risk_score = self.regressor.predict(df)[0] # 0.0 to 1.0
        
        return {
            "potability": potability,
            "confidence": round(float(confidence), 2),
            "failure_risk_score": round(float(risk_score), 2),
            "alert_triggered": bool(potability == "Unsafe" or risk_score > 0.7 )
        }
        
if __name__ == "__main__":
    predictor = WARSPredictor()
    print("WARS Predictor initialized successfully.")