from pathlib import Path
import joblib

from services.feature_builder import build_features


BASE_DIR = Path(__file__).resolve().parent.parent

CLASSIFIER_PATH = BASE_DIR / "models" / "WARS_Classifier_RF.pkl"
REGRESSOR_PATH = BASE_DIR / "models" / "WARS_Regressor_ET.pkl"


class WARSPredictor:
    def __init__(self):
        self.classifier = joblib.load(CLASSIFIER_PATH)
        self.regressor = joblib.load(REGRESSOR_PATH)

    def predict(self, payload: dict):
        X = build_features(payload)

        potability = self.classifier.predict(X)[0]
        risk_score = self.regressor.predict(X)[0]

        return {
            "ml_potability": int(potability),
            "ml_risk_score": float(risk_score),
            "edge_risk_score": payload["local_assessment"]["risk_score"]
        }