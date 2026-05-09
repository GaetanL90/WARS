import joblib
from ml.preprocess_input import build_model_input

clf = joblib.load("models/WARS_Classifier_RF.pkl")
reg = joblib.load("models/WARS_Regressor_RF.pkl")


def predict(sensor_payload: dict):
    X = build_model_input(sensor_payload)

    potability = clf.predict(X)[0]
    risk_score = reg.predict(X)[0]

    return {
        "potability": int(potability),
        "risk_score": float(risk_score)
    }
