import json
import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import warnings

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, ExtraTreesRegressor
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    average_precision_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.inspection import permutation_importance

from ml.validate import validate_dataframe

# Ignore warnings
warnings.filterwarnings(
    "ignore",
    message=".*delayed.*Parallel.*",
    module="sklearn.utils.parallel"
)

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
RANDOM_STATE = 42
TEST_SIZE    = 0.2
CV_FOLDS     = 5
BASE_DIR     = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed" / "WARS_full_sensor_dataset_v4.csv"
MODEL_DIR    = BASE_DIR / "models"

SCENARIO_ORDER = [
    "normal",
    "heavy_rain",
    "pipe_leak",
    "chemical_contamination",
    "drought",
]

# ─────────────────────────────────────────────
# LOAD & VALIDATE
# ─────────────────────────────────────────────
print("📂 Loading dataset…")
df = pd.read_csv(DATASET_PATH)
df = validate_dataframe(df)

# ─────────────────────────────────────────────
# ENCODE SCENARIO
# Must happen before feature engineering so
# any downstream features can use it.
# ─────────────────────────────────────────────
df["Scenario_encoded"] = pd.Categorical(
    df["Scenario"], categories=SCENARIO_ORDER
).codes  # 0=normal 1=heavy_rain 2=pipe_leak 3=chemical 4=drought

# ─────────────────────────────────────────────
# FEATURE ENGINEERING
# Only call if engineer_features is compatible
# with v4 schema — remove this block if it
# references old columns (Chloramines etc.)
# ─────────────────────────────────────────────
try:
    from ml.features import engineer_features
    df = engineer_features(df)
    print("✅ Feature engineering applied")
except Exception as e:
    print(f"⚠️  engineer_features skipped: {e}")

df = df.replace([np.inf, -np.inf], np.nan)

# ─────────────────────────────────────────────
# FEATURE COLUMNS  (v4 schema)
# ─────────────────────────────────────────────
FEATURE_COLS = [
    # Infrastructure
    "Infrastructure_Age",
    "Distance_to_TreatmentPlant",
    "Population_Density",
    "Population_Impacted",
    "Repair_Team_Availability",
    "Local_Authority_Responsiveness",
    "Priority_Level",
    "lat",
    "lon",

    # Scenario
    "Scenario_encoded",

    # Water quality
    "Turbidity",
    "pH",
    "Conductivity",
    "Organic_Carbon",
    "ORP",
    "Dissolved_Oxygen",
    "Temperature",

    # Hydraulic
    "Flow_Rate",
    "Pressure",

    # Operational
    "Sensor_Fault",

    # Time
    "timestamp_year",
    "timestamp_month",
    "timestamp_day",
    "timestamp_hour",
    "weekday",
]

# ─────────────────────────────────────────────
# SAFETY CHECK — catch missing columns before
# pandas raises a cryptic KeyError
# ─────────────────────────────────────────────
missing_cols = [c for c in FEATURE_COLS if c not in df.columns]
if missing_cols:
    raise ValueError(
        f"❌ Feature columns missing from dataframe: {missing_cols}\n"
        f"   Available: {df.columns.tolist()}"
    )

# Drop NaN only on columns we actually use, not the whole df.
# This prevents engineer_features adding NaN columns from the old
# schema and silently wiping all 50,000 rows.
working_cols = FEATURE_COLS + ["Potability", "Failure_Risk_Score"]
df = df[working_cols].dropna()

print(f"   Final shape after dropna on working cols: {df.shape}")

# ─────────────────────────────────────────────
# TARGETS
# ─────────────────────────────────────────────
X       = df[FEATURE_COLS]
y_class = (df["Potability"] > 0).astype(int)
y_reg   = df["Failure_Risk_Score"]

print("\n📊 Class distribution:")
print(y_class.value_counts())
print(f"\n📊 Risk score — mean: {y_reg.mean():.4f}  std: {y_reg.std():.4f}  "
      f"min: {y_reg.min():.4f}  max: {y_reg.max():.4f}")

# ─────────────────────────────────────────────
# TRAIN / TEST SPLIT
# ─────────────────────────────────────────────
(
    X_train, X_test,
    y_cls_train, y_cls_test,
    y_reg_train, y_reg_test,
) = train_test_split(
    X, y_class, y_reg,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y_class,
)

# ═════════════════════════════════════════════
# 1.  CLASSIFIER — Random Forest + Calibration
# ═════════════════════════════════════════════
print("\n" + "═" * 50)
print("🌲 CLASSIFIER  (RandomForest → Potability)")
print("═" * 50)

_base_clf = RandomForestClassifier(
    n_estimators      = 500,
    max_depth         = 20,
    min_samples_split = 5,
    min_samples_leaf  = 2,
    max_features      = "sqrt",
    bootstrap         = True,
    oob_score         = True,
    max_samples       = 0.8,
    class_weight      = "balanced_subsample",
    random_state      = RANDOM_STATE,
    n_jobs            = -1,
)

clf_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("model",   CalibratedClassifierCV(_base_clf, method="isotonic", cv=5)),
])

cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

cv_roc = cross_val_score(clf_pipeline, X_train, y_cls_train,
                         cv=cv, scoring="roc_auc", n_jobs=-1)
cv_ap  = cross_val_score(clf_pipeline, X_train, y_cls_train,
                         cv=cv, scoring="average_precision", n_jobs=-1)

print(f"\n  CV ROC-AUC : {cv_roc.mean():.4f} ± {cv_roc.std():.4f}")
print(f"  CV Avg-Prec: {cv_ap.mean():.4f} ± {cv_ap.std():.4f}")

clf_pipeline.fit(X_train, y_cls_train)

y_cls_pred  = clf_pipeline.predict(X_test)
y_cls_proba = clf_pipeline.predict_proba(X_test)[:, 1]

print("\n  Hold-out metrics:")
print(classification_report(y_cls_test, y_cls_pred,
                             target_names=["Not Potable", "Potable"]))
print(f"  ROC-AUC       : {roc_auc_score(y_cls_test, y_cls_proba):.4f}")
print(f"  Avg Precision : {average_precision_score(y_cls_test, y_cls_proba):.4f}")

# ═════════════════════════════════════════════
# 2.  REGRESSOR — Extra Trees
# ═════════════════════════════════════════════
print("\n" + "═" * 50)
print("🌳 REGRESSOR  (ExtraTrees → Failure_Risk_Score)")
print("═" * 50)

reg_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("model",   ExtraTreesRegressor(
        n_estimators      = 500,
        max_depth         = 25,
        min_samples_split = 4,
        min_samples_leaf  = 2,
        max_features      = 0.6,
        bootstrap         = True,
        oob_score         = True,
        max_samples       = 0.8,
        random_state      = RANDOM_STATE,
        n_jobs            = -1,
    )),
])

cv_mae = cross_val_score(reg_pipeline, X_train, y_reg_train,
                         cv=CV_FOLDS, scoring="neg_mean_absolute_error", n_jobs=-1)
cv_r2  = cross_val_score(reg_pipeline, X_train, y_reg_train,
                         cv=CV_FOLDS, scoring="r2", n_jobs=-1)

print(f"\n  CV MAE : {-cv_mae.mean():.4f} ± {cv_mae.std():.4f}")
print(f"  CV R²  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")

reg_pipeline.fit(X_train, y_reg_train)

print(f"\n  OOB R² : {reg_pipeline.named_steps['model'].oob_score_:.4f}")

y_reg_pred = np.clip(reg_pipeline.predict(X_test), 0, 1)

mae  = mean_absolute_error(y_reg_test, y_reg_pred)
rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred))
r2   = r2_score(y_reg_test, y_reg_pred)

print(f"\n  Hold-out metrics:")
print(f"  MAE  : {mae:.4f}")
print(f"  RMSE : {rmse:.4f}")
print(f"  R²   : {r2:.4f}")

# ═════════════════════════════════════════════
# 3.  FEATURE IMPORTANCE
# ═════════════════════════════════════════════
print("\n" + "═" * 50)
print("🔍 FEATURE IMPORTANCE")
print("═" * 50)

def _top_features(pipeline, X, y, scoring, n=10):
    result = permutation_importance(
        pipeline, X, y,
        scoring=scoring,
        n_repeats=10,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    idx = result.importances_mean.argsort()[::-1][:n]
    return [(FEATURE_COLS[i], round(result.importances_mean[i], 4)) for i in idx]

print("\n  Top 10 — Classifier (ROC-AUC drop):")
for feat, score in _top_features(clf_pipeline, X_test, y_cls_test, "roc_auc"):
    print(f"    {feat:<35} {score:+.4f}")

print("\n  Top 10 — Regressor (R² drop):")
for feat, score in _top_features(reg_pipeline, X_test, y_reg_test, "r2"):
    print(f"    {feat:<35} {score:+.4f}")

# ═════════════════════════════════════════════
# 4.  SAVE ARTEFACTS
# ═════════════════════════════════════════════
print("\n" + "═" * 50)
print("💾 SAVING MODELS")
print("═" * 50)

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(clf_pipeline, MODEL_DIR / "WARS_Classifier_RF.pkl", compress=3)
joblib.dump(reg_pipeline, MODEL_DIR / "WARS_Regressor_ET.pkl",  compress=3)

with open(MODEL_DIR / "feature_columns.json", "w") as f:
    json.dump(FEATURE_COLS, f, indent=2)

model_card = {
    "classifier": {
        "file":             "WARS_Classifier_RF.pkl",
        "model":            "RandomForestClassifier + IsotonicCalibration",
        "target":           "Potability",
        "type":             "binary_classification",
        "cv_roc_auc":       round(float(cv_roc.mean()), 4),
        "cv_roc_auc_std":   round(float(cv_roc.std()),  4),
        "holdout_roc_auc":  round(roc_auc_score(y_cls_test, y_cls_proba), 4),
        "holdout_avg_prec": round(average_precision_score(y_cls_test, y_cls_proba), 4),
    },
    "regressor": {
        "file":      "WARS_Regressor_ET.pkl",
        "model":     "ExtraTreesRegressor",
        "target":    "Failure_Risk_Score",
        "type":      "regression",
        "cv_mae":    round(float(-cv_mae.mean()), 4),
        "cv_r2":     round(float(cv_r2.mean()),   4),
        "holdout_mae":  round(mae,  4),
        "holdout_rmse": round(rmse, 4),
        "holdout_r2":   round(r2,   4),
    },
    "scenario_encoding": {s: i for i, s in enumerate(SCENARIO_ORDER)},
    "features": FEATURE_COLS,
}

with open(MODEL_DIR / "model_card.json", "w") as f:
    json.dump(model_card, f, indent=2)

print(f"\n  Saved → {MODEL_DIR / 'WARS_Classifier_RF.pkl'}")
print(f"  Saved → {MODEL_DIR / 'WARS_Regressor_ET.pkl'}")
print(f"  Saved → {MODEL_DIR / 'feature_columns.json'}")
print(f"  Saved → {MODEL_DIR / 'model_card.json'}")
print("\n✅ Training Complete ✔")