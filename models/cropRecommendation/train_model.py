import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

# 1. Load data
df = pd.read_csv("crop_data.csv")

# 2. Encode crop labels
le = LabelEncoder()
df['label'] = le.fit_transform(df['label'])

# 3. Feature and target split
X = df.drop('label', axis=1)
y = df['label']

# 4. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 6. Save model and encoder
joblib.dump(model, "crop_model.pkl")
joblib.dump(le, "label_encoder.pkl")

print("✅ Model and label encoder saved successfully.")