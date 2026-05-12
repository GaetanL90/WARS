import pandas as pd

df = pd.read_csv(
    "./dataset/WARS_full_sensor_dataset_v4.csv"
)

print("\n📊 SHAPE")
print(df.shape)

print("\n📊 COLUMNS")
print(df.columns.tolist())

print("\n📊 SAMPLE")
print(df.head())

print("\n📊 INFO")
print(df.info())

print("\n📊 MISSING VALUES")
print(df.isnull().sum())

print("\n📊 TARGET DISTRIBUTION")
print(df["Potability"].value_counts())

print("\n📊 RISK SCORE STATS")
print(df["Failure_Risk_Score"].describe())
