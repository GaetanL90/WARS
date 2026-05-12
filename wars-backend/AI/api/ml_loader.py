import joblib
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

print("🔄 Loading ML models into memory...")
try:
    CLF_PIPELINE = joblib.load(MODEL_DIR / "WARS_Classifier_RF.pkl")
    REG_PIPELINE = joblib.load(MODEL_DIR / "WARS_Regressor_ET.pkl")
    print("✅ Models loaded")
except FileNotFoundError as e:
    CLF_PIPELINE = None
    REG_PIPELINE = None
    print(f"⚠️  Models not found: {e} — predictions will be skipped")