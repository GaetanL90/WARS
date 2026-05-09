"""
WARS ML Inference Module
------------------------
Loads models once at module import time.
predict() accepts a pre-built feature DataFrame from feature_builder.py.
Do NOT call build_features() inside here — that's the caller's job.
"""

import numpy as np
import joblib
from pathlib import Path
from pandas import DataFrame

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

# ── Load once at startup ──────────────────────────────────────────────
print("🔄 Loading WARS ML models…")
try:
    _clf = joblib.load(MODEL_DIR / "WARS_Classifier_RF.pkl")
    _reg = joblib.load(MODEL_DIR / "WARS_Regressor_ET.pkl")   # fixed: was _RF
    print("✅ Classifier + Regressor loaded")
except FileNotFoundError as e:
    _clf = None
    _reg = None
    print(f"⚠️  Model file not found: {e}")
    print("   Run: python -m ml.train_models")


def _risk_level(score: float) -> str:
    if score < 0.10: return "SAFE"
    if score < 0.25: return "LOW"
    if score < 0.45: return "MEDIUM"
    if score < 0.65: return "HIGH"
    return "CRITICAL"


def predict(feature_df: DataFrame) -> dict:
    """
    Run inference on a pre-built feature DataFrame.

    Parameters
    ----------
    feature_df : DataFrame with exactly the 26 FEATURE_COLS columns.
                 Build it with: feature_builder.build_features(payload)

    Returns
    -------
    dict with keys:
        potability             int   0 or 1
        potability_confidence  float 0.0 – 1.0
        failure_risk_score     float 0.0 – 1.0
        risk_level             str   SAFE / LOW / MEDIUM / HIGH / CRITICAL
    """
    if _clf is None or _reg is None:
        raise RuntimeError(
            "ML models are not loaded. Run python -m ml.train_models first."
        )

    potability        = int(_clf.predict(feature_df)[0])
    confidence        = float(_clf.predict_proba(feature_df)[0][potability])
    risk_score        = float(np.clip(_reg.predict(feature_df)[0], 0.0, 1.0))

    return {
        "potability":            potability,
        "potability_confidence": round(confidence,  4),
        "failure_risk_score":    round(risk_score,  4),
        "risk_level":            _risk_level(risk_score),
    }