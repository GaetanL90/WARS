import joblib
import json
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier, ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error, r2_score

from .training_data_builder import generate_dataset


# --------------------------
# LOAD DATA
# --------------------------
df = generate_dataset()

# --------------------------
# FEATURES
# --------------------------
feature_cols = [
    "Chloramines", "Conductivity", "Distance_to_TreatmentPlant",
    "Elevation", "Hardness", "Historical_Issue_Frequency",
    "Infrastructure_Age", "Local_Authority_Responsiveness",
    "Organic_carbon", "Ph", "Population_Density",
    "Population_Impacted", "Priority_Level",
    "Repair_Team_Availability", "Season", "Solids",
    "Sulfate", "Temperature", "Trihalomethanes", "Turbidity",
    "lat", "lon", "timestamp_year", "timestamp_day",
    "timestamp_hour", "timestamp_weekday",
    "Conductivity_log1p", "Solids_log1p", "Turbidity_log1p",
    "Issue_Frequency_per_Year", "Distance_vs_Response"
]

X = df[feature_cols]

y_class = df["target_potability"]
y_reg = df["target_risk"]

# --------------------------
# TRAIN/TEST SPLIT
# --------------------------
X_train, X_test, y_class_train, y_class_test = train_test_split(
    X, y_class, test_size=0.2, random_state=42, stratify=y_class
)

_, _, y_reg_train, y_reg_test = train_test_split(
    X, y_reg, test_size=0.2, random_state=42
)

# --------------------------
# CLASSIFIER
# --------------------------
clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)

clf.fit(X_train, y_class_train)

# Evaluation
y_class_pred = clf.predict(X_test)
print("\n📊 CLASSIFIER REPORT")
print(classification_report(y_class_test, y_class_pred))

# --------------------------
# REGRESSOR
# --------------------------
reg = ExtraTreesRegressor(
    n_estimators=200,
    max_depth=12,
    random_state=42
)

reg.fit(X_train, y_reg_train)

# Evaluation
y_reg_pred = reg.predict(X_test)

print("\n📊 REGRESSOR METRICS")
print("MAE:", round(mean_absolute_error(y_reg_test, y_reg_pred), 4))
print("R2 :", round(r2_score(y_reg_test, y_reg_pred), 4))

# --------------------------
# SAVE MODELS
# --------------------------
joblib.dump(clf, "models/WARS_Classifier_RF.pkl")
joblib.dump(reg, "models/WARS_Regressor_ET.pkl")

with open("models/feature_columns.json", "w") as f:
    json.dump(feature_cols, f, indent=2)

print("\n✅ Training complete ✔")