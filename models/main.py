from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import io
import numpy as np
import pandas as pd
import joblib
# import tensorflow as tf

# --------- MODEL LOADING ---------
# Crop Recommendation
cropModel = joblib.load("cropRecommendation/crop_model.pkl")
label_encoder = joblib.load("cropRecommendation/label_encoder.pkl")

# Irrigation Recommendation
irrigationModel = joblib.load("irrigationRecommendation/irrigation_model.pkl")

# Fertilizer Recommendation
fertilizerModel = joblib.load("fertilizerRecommendation/xgb_fertilizer_model.pkl")
fertilizerScaler = joblib.load("fertilizerRecommendation/scaler.pkl")
le_soil = joblib.load("fertilizerRecommendation/le_soil.pkl")
le_crop = joblib.load("fertilizerRecommendation/le_crop.pkl")
le_fert = joblib.load("fertilizerRecommendation/le_fert.pkl")

# Yield Prediction
# yieldModel = joblib.load("yieldPredictor/rf_yield_model.joblib")

# Pest Detection (TensorFlow)
pestModel = tf.keras.models.load_model("pestDetection/crop_pest_model.keras")
IMG_SIZE = (224, 224)
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry___Powdery_mildew", "Cherry___healthy", "Corn___Cercospora_leaf_spot",
    "Corn___Common_rust", "Corn___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy", "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy", "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy",
    "Soybean___healthy", "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

# --------- FASTAPI SETUP ---------
app = FastAPI(title="Agri Recommendation API")

# --------- DATA MODELS ---------
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class IrrigationRequest(BaseModel):
    crop_type: str
    days_after_sowing: int
    crop_stage: str
    Kc: float
    ET0_mm: float
    rainfall_mm: float
    temp_max_C: float
    temp_min_C: float
    humidity: float
    wind_speed_m_s: float
    soil_type: str
    soil_moisture: float

class FertilizerInput(BaseModel):
    temperature: float
    humidity: float
    moisture: float
    soil_type: str
    crop_type: str
    nitrogen: float
    potassium: float
    phosphorous: float

# class YieldInput(BaseModel):
#     Soil_Type: str
#     crop: str
#     Rainfall_mm: float
#     Temperature_Celsius: float
#     Fertilizer_Used: bool
#     Irrigation_Used: bool
#     Days_to_Harvest: int

# --------- ENDPOINTS ---------
@app.post("/ml/croprecommendation")
def recommend_crop(data: CropInput):
    input_data = [[
        data.N, data.P, data.K,
        data.temperature, data.humidity,
        data.ph, data.rainfall
    ]]

    probs = cropModel.predict_proba(input_data)[0]
    top_3_indices = np.argsort(probs)[::-1][:3]
    top_3_crops = label_encoder.inverse_transform(top_3_indices)
    top_3_probs = probs[top_3_indices]

    recommendations = [
        {"crop": crop, "confidence": round(float(prob), 3)}
        for crop, prob in zip(top_3_crops, top_3_probs)
    ]

    return {"top_3_recommendations": recommendations}

@app.post("/ml/irrigationRecommendation")
def predict_irrigation(data: IrrigationRequest):
    input_dict = data.dict()
    input_dict["crop_type"] = input_dict["crop_type"].lower()
    input_dict["crop_stage"] = input_dict["crop_stage"].lower()
    input_dict["soil_type"] = input_dict["soil_type"].lower()

    df = pd.DataFrame([input_dict])
    prediction = irrigationModel.predict(df)[0]
    return {"irrigation_required": int(prediction)}

@app.post("/ml/fertilizerRecommendation")
def predict_fertilizer(data: FertilizerInput):
    try:
        soil_encoded = le_soil.transform([data.soil_type])[0]
        crop_encoded = le_crop.transform([data.crop_type])[0]

        input_data = np.array([[
            data.temperature,
            data.humidity,
            data.moisture,
            soil_encoded,
            crop_encoded,
            data.nitrogen,
            data.potassium,
            data.phosphorous
        ]])

        input_scaled = fertilizerScaler.transform(input_data)
        pred_encoded = fertilizerModel.predict(input_scaled)[0]
        predicted_fert = le_fert.inverse_transform([pred_encoded])[0]

        return {"recommended_fertilizer": predicted_fert}

    except Exception as e:
        return {"error": str(e)}

# @app.post("/ml/yield/predict")
# def predict_yield(data: YieldInput):
#     input_df = pd.DataFrame([data.dict()])
#     prediction = yieldModel.predict(input_df)[0]
#     return {
#         "predicted_yield_tons_per_hectare": round(prediction, 2)
#     }

@app.post("/ml/pestPredict")
async def predict_pest(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(IMG_SIZE)
        image_array = np.expand_dims(np.array(image) / 255.0, axis=0)

        predictions = pestModel.predict(image_array)[0]
        predicted_class = CLASS_NAMES[np.argmax(predictions)]
        confidence = float(np.max(predictions))

        return JSONResponse({
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4)
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})