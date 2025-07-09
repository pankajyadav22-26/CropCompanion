import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
import os

# Paths
DATA_PATH = "FertilizerPrediction.csv"
MODEL_PATH = "xgb_fertilizer_model.pkl"
ENCODERS_PATH = ""
SCALER_PATH = "scaler.pkl"

def load_data(path):
    df = pd.read_csv(path)
    df.dropna(inplace=True)
    return df

def preprocess_data(df):
    # Label encode categorical features
    le_soil = LabelEncoder()
    le_crop = LabelEncoder()
    le_fert = LabelEncoder()

    df['Soil Type'] = le_soil.fit_transform(df['Soil Type'])
    df['Crop Type'] = le_crop.fit_transform(df['Crop Type'])
    df['Fertilizer Name'] = le_fert.fit_transform(df['Fertilizer Name'])

    # Save encoders
    joblib.dump(le_soil, os.path.join(ENCODERS_PATH, "le_soil.pkl"))
    joblib.dump(le_crop, os.path.join(ENCODERS_PATH, "le_crop.pkl"))
    joblib.dump(le_fert, os.path.join(ENCODERS_PATH, "le_fert.pkl"))

    # Split features and target
    X = df.drop("Fertilizer Name", axis=1)
    y = df["Fertilizer Name"]

    # Scale numeric features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, SCALER_PATH)

    return X_scaled, y

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    os.makedirs("models", exist_ok=True)

    print("Loading data...")
    df = load_data(DATA_PATH)

    print("Preprocessing data...")
    X, y = preprocess_data(df)

    print("Training model...")
    train_model(X, y)