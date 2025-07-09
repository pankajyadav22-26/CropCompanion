import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Load dataset
df = pd.read_csv("irrigation_dataset_multi_crop.csv")

# Split features and target
X = df.drop("irrigation_required", axis=1)
y = df["irrigation_required"]

# Define categorical and numeric features
categorical = ["crop_type", "crop_stage", "soil_type"]
numerical = [col for col in X.columns if col not in categorical]

# Preprocessing pipeline
preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical)
], remainder='passthrough')

# Full pipeline
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", RandomForestClassifier(n_estimators=100, random_state=42))
])

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
pipeline.fit(X_train, y_train)

# Save model
joblib.dump(pipeline, "irrigation_model.pkl")

print("✅ Model trained and saved to model.pkl")