from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import tensorflow as tf
import io
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

# Load the trained model
model = tf.keras.models.load_model("crop_pest_model.keras")

# You must define class names in the same order as the model was trained
# Update this list based on your dataset
CLASS_NAMES = list(model.classes) if hasattr(model, 'classes') else [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Corn___Cercospora_leaf_spot",  # etc...
]

IMG_SIZE = (224, 224)

@app.get("/")
def read_root():
    return {"message": "Crop Pest Detection API is running."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image bytes
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)
    image_array = np.expand_dims(np.array(image) / 255.0, axis=0)

    # Predict
    predictions = model.predict(image_array)[0]
    predicted_class = CLASS_NAMES[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    return JSONResponse({
        "predicted_class": predicted_class,
        "confidence": round(confidence, 4)
    })