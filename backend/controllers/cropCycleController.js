const CropCycle = require("../models/CropCycle.js");
const axios = require('axios');
const FASTAPI_URL = process.env.FASTAPI_URL;
const FormData = require('form-data');

// Create a new crop cycle
const createCropCycle = async (req, res) => {
  try {
    const { fieldId, seasonId, cropSelection } = req.body;
    const farmerId = req.farmerId;

    // Basic validation
    if (
      !cropSelection ||
      !cropSelection.selected ||
      !cropSelection.source ||
      typeof cropSelection.selected !== "string" ||
      typeof cropSelection.source !== "string"
    ) {
      return res.status(400).json({ message: "Invalid cropSelection payload." });
    }

    const existingCycle = await CropCycle.findOne({ fieldId, seasonId });
    if (existingCycle) {
      return res.status(400).json({
        message: "Crop cycle already exists for this field in this season.",
      });
    }

    const newCycle = new CropCycle({
      farmerId,
      fieldId,
      seasonId,
      cropSelection: {
        selected: cropSelection.selected,
        source: cropSelection.source,
        recommended: Array.isArray(cropSelection.recommended)
          ? cropSelection.recommended
          : [],
        date: Date.now(),
      },
    });

    await newCycle.save();
    res.status(201).json(newCycle);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create crop cycle",
      error: err.message,
    });
  }
};

// Get crop cycle for a field and season
const getCropCycleBySeasonField = async (req, res) => {
  try {
    const seasonId = req.params.seasonId;
    const fieldId = req.params.fieldId;

    const cycle = await CropCycle.findOne({ seasonId, fieldId })
      .populate("seasonId")
      .populate("fieldId");

    if (!cycle) return res.status(404).json({ message: "No crop cycle found" });

    // Derive stages
    const deriveStages = (cropCycle) => {
      const harvestingDone = !!cropCycle.harvesting?.actualDate;

      return [
        {
          name: "Crop Selection",
          key: "cropSelection",
          status: cropCycle.cropSelection?.selected ? "done" : "pending",
        },
        {
          name: "Land Preparation",
          key: "landPreparation",
          status: cropCycle.landPreparation?.done ? "done" : "pending",
        },
        {
          name: "Sowing",
          key: "sowing",
          status: cropCycle.sowing?.actualDate ? "done" : "pending",
        },
        {
          name: "Irrigation",
          key: "irrigation",
          status: harvestingDone
            ? "done"
            : cropCycle.irrigation?.length > 0
              ? "in-progress"
              : "pending",
        },
        {
          name: "Fertilization",
          key: "fertilization",
          status: harvestingDone
            ? "done"
            : cropCycle.fertilization?.length > 0
              ? "in-progress"
              : "pending",
        },
        {
          name: "Pest Management",
          key: "pestManagement",
          status: harvestingDone
            ? "done"
            : cropCycle.pestManagement?.issues?.length > 0 ||
              cropCycle.pestManagement?.sprayLogs?.length > 0
              ? "in-progress"
              : "pending",
        },
        {
          name: "Harvesting",
          key: "harvesting",
          status: harvestingDone ? "done" : "pending",
        },
        {
          name: "Yield",
          key: "yield",
          status: cropCycle.yield?.actual ? "done" : "pending",
        },
      ];
    };

    const fullCycle = cycle.toObject();
    fullCycle.stages = deriveStages(fullCycle);

    res.json(fullCycle);
  } catch (err) {
    res.status(500).json({ message: "Failed to get crop cycle", error: err.message });
  }
};

// Update a specific stage (generic patch)
const updateCropCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cycle = await CropCycle.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!cycle) return res.status(404).json({ message: "Crop cycle not found" });

    res.json(cycle);
  } catch (err) {
    res.status(500).json({ message: "Failed to update crop cycle", error: err.message });
  }
};

// Add irrigation entry
// const addIrrigation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, method, reason } = req.body;

//     const cycle = await CropCycle.findById(id);
//     if (!cycle) return res.status(404).json({ message: "Crop cycle not found" });

//     cycle.irrigation.push({ date, method, reason });
//     await cycle.save();
//     res.json(cycle);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add irrigation", error: err.message });
//   }
// };

// Add fertilization entry
// const addFertilization = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { stage, fertilizer, quantity, date, notes } = req.body;

//     const cycle = await CropCycle.findById(id);
//     if (!cycle) return res.status(404).json({ message: "Crop cycle not found" });

//     cycle.fertilization.push({ stage, fertilizer, quantity, date, notes });
//     await cycle.save();
//     res.json(cycle);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add fertilization", error: err.message });
//   }
// };

// Delete a crop cycle
const deleteCropCycle = async (req, res) => {
  try {
    const { id } = req.params;

    await CropCycle.findByIdAndDelete(id);
    res.json({ message: "Crop cycle deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete crop cycle", error: err.message });
  }
};

const getCropRecommendation = async (req, res) => {
  try {
    const { fieldId } = req.body;

    if (!fieldId) {
      return res.status(400).json({
        message: "Missing required fieldId)"
      });
    }

    const fieldDetailsRes = await axios.get("http://192.168.0.143:5050/api/fields/fieldDetails", {
      params: {
        fieldId,
        farmerId: req.farmerId,
      },
      headers: {
        Authorization: req.headers.authorization,
      }
    });

    const { nitrogen: N, phosphorous: P, potassium: K, pH: ph } = fieldDetailsRes.data.soilData;

    const locationString = fieldDetailsRes.data.location;
    if (!locationString) {
      return res.status(400).json({ message: "Missing location in field data" });
    }

    const [latStr, lonStr] = locationString.split(",");
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const { temperature, humidity } = await getWeatherData(lat, lon);

    const nasaRes = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR&community=AG&longitude=${lon}&latitude=${lat}&format=JSON`
    );

    const rainfallPerDay = nasaRes.data.properties.parameter.PRECTOTCORR[
      new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()
    ];

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const rainfall = Math.round(rainfallPerDay * daysInMonth);

    const fastApiRes = await axios.post(`${FASTAPI_URL}/ml/croprecommendation`, {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall
    });

    const recommendations = fastApiRes.data.top_3_recommendations;

    res.status(200).json({ recommendations });
  } catch (err) {
    console.error("Crop recommendation failed:", err.message);
    res.status(500).json({
      message: "Failed to fetch crop recommendations",
      error: err.message
    });
  }
};

const getWeatherData = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const response = await axios.get(url);
  const data = response.data;

  return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
  };
};

const landPreparation = async (req, res) => {
  try {
    const { notes, date } = req.body;
    const updated = await CropCycle.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "landPreparation.done": true,
          "landPreparation.date": date,
          "landPreparation.notes": notes,
        },
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update land preparation", error: err.message });
  }
}

const saveRecommendatedSowingDate = async (req, res) => {
  try {
    const fromDate = new Date().toISOString();
    const toDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ahead

    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) {
      return res.status(404).json({ message: "Crop cycle not found." });
    }

    cropCycle.sowing.recommendedDate = {
      from: fromDate,
      to: toDate,
    };

    await cropCycle.save();

    res.status(200).json({
      message: "Recommended sowing date saved successfully.",
      // recommendedDate: cropCycle.sowing.recommendedDate,
    });
  } catch (error) {
    console.error("Error fetching AI dates:", error);
    res.status(500).json({ message: "Server error." });
  }
}

const sowing = async (req, res) => {
  const { actualDate, method, notes } = req.body;

  if (!actualDate || !method) {
    return res.status(400).json({ message: "Actual date and method are required." });
  }

  try {
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) {
      return res.status(404).json({ message: "Crop cycle not found." });
    }

    cropCycle.sowing.actualDate = new Date(actualDate);
    cropCycle.sowing.method = method;
    cropCycle.sowing.notes = notes;

    await cropCycle.save();

    res.status(200).json({
      message: "Sowing details updated successfully.",
    });
  } catch (error) {
    console.error("Error updating sowing info:", error);
    res.status(500).json({ message: "Server error." });
  }
}

const getIrrigationSuggestion = async (req, res) => {
  try {
    const cycle = await CropCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ error: "Crop cycle not found" });

    const { fieldId } = req.body;
    if (!fieldId) {
      return res.status(400).json({ message: "Missing required fieldId" });
    }

    const fieldDetailsRes = await axios.get("http://192.168.0.143:5050/api/fields/fieldDetails", {
      params: {
        fieldId,
        farmerId: req.farmerId,
      },
      headers: {
        Authorization: req.headers.authorization,
      }
    });

    const locationString = fieldDetailsRes.data.location;
    if (!locationString) {
      return res.status(400).json({ message: "Missing location in field data" });
    }

    const [latStr, lonStr] = locationString.split(",");
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const sowingDate = new Date(cycle.sowing.actualDate);
    const today = new Date();
    const days_after_sowing = Math.floor((today - sowingDate) / (1000 * 60 * 60 * 24));

    let crop_stage = "Initial";
    let Kc = 1.0;

    if (days_after_sowing < 20) {
      crop_stage = "Initial"; Kc = 1.0;
    } else if (days_after_sowing < 40) {
      crop_stage = "Vegetative"; Kc = 1.1;
    } else if (days_after_sowing < 70) {
      crop_stage = "Flowering"; Kc = 1.2;
    } else {
      crop_stage = "Maturity"; Kc = 0.8;
    }

    // 4. Fetch weather data
    const weatherRes = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/today`,
      {
        params: {
          key: process.env.WEATHER_API_KEY,
          unitGroup: "metric"
        }
      }
    );

    const weather = weatherRes.data.days[0];
    const ET0_mm = weather.et0 || 5.0;
    const rainfall_mm = weather.precip || 0.0;
    const temp_max_C = weather.tempmax || 35.0;
    const temp_min_C = weather.tempmin || 25.0;
    const humidity = weather.humidity || 50.0;
    const wind_speed_m_s = weather.windspeed || 3.0;
    const soil_type = fieldDetailsRes.data.soilType;
    const soil_moisture = 18.0;

    // 7. Send request to FastAPI ML model
    const aiRes = await axios.post(`${FASTAPI_URL}/ml/irrigationRecommendation`, {
      crop_type: String(cycle.cropSelection.selected),
      days_after_sowing: Number(days_after_sowing),
      crop_stage: String(crop_stage),
      Kc: Number(Kc),
      ET0_mm: Number(ET0_mm),
      rainfall_mm: Number(rainfall_mm),
      temp_max_C: Number(temp_max_C),
      temp_min_C: Number(temp_min_C),
      humidity: Number(humidity),
      wind_speed_m_s: Number(wind_speed_m_s),
      soil_type: String(soil_type),
      soil_moisture: Number(soil_moisture)
    });
    const irrigationNeeded = aiRes.data.irrigation_required === 1;

    // 8. Save recommendation in DB
    const suggestion = {
      date: new Date(),
      needed: irrigationNeeded,
    };

    cycle.irrigation.recommendations.push(suggestion);
    await cycle.save();

    // 9. Return response
    res.json(suggestion);
  } catch (err) {
    console.error("Irrigation Suggestion Error:", err.message);
    res.status(500).json({ error: "Failed to fetch irrigation recommendation" });
  }
}

const saveIrrigationLogs = async (req, res) => {
  try {
    const { date, method, notes } = req.body;

    const cycle = await CropCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ error: "Crop cycle not found" });

    cycle.irrigation.logs.push({ date, method, notes });
    await cycle.save();

    res.json({ message: "Irrigation log saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log irrigation" });
  }
}

const getFertilizerSuggestion = async (req, res) => {
  try {
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) return res.status(404).json({ message: "Crop cycle not found" });

    const { fieldId } = req.body;
    if (!fieldId) {
      return res.status(400).json({ message: "Missing required fieldId" });
    }

    const fieldDetailsRes = await axios.get("http://192.168.0.143:5050/api/fields/fieldDetails", {
      params: {
        fieldId,
        farmerId: req.farmerId,
      },
      headers: {
        Authorization: req.headers.authorization,
      }
    });

    const { nitrogen, phosphorous, potassium } = fieldDetailsRes.data.soilData;

    const locationString = fieldDetailsRes.data.location;
    if (!locationString) {
      return res.status(400).json({ message: "Missing location in field data" });
    }

    const [latStr, lonStr] = locationString.split(",");
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const { temperature, humidity } = await getWeatherData(lat, lon);

    const soil_type = fieldDetailsRes.data.soilType;
    const moisture = 18.0;

    const fastApiRes = await axios.post(`${FASTAPI_URL}/ml/fertilizerRecommendation`, {
      temperature: Number(temperature),
      humidity: Number(humidity),
      moisture: Number(moisture),
      soil_type: String(soil_type),
      crop_type: String(cropCycle.cropSelection.selected),
      nitrogen: Number(nitrogen),
      phosphorous: Number(phosphorous),
      potassium: Number(potassium)
    });

    const recommendation = {
      date: new Date(),
      needed: true,
      recommendedType: fastApiRes.data.recommended_fertilizer,
    };

    cropCycle.fertilization.recommendations.push(recommendation);
    await cropCycle.save();

    res.json(recommendation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fertilizer recommendation" });
  }
}

const saveFertilizerLogs = async (req, res) => {
  try {
    const { date, type, quantity, notes } = req.body;

    const cycle = await CropCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ error: "Crop cycle not found" });

    cycle.fertilization.logs.push({ date, type, quantity, notes });
    await cycle.save();

    res.json({ message: "Fertilizer log saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log fertilizer" });
  }
}

const getPestSuggestion = async (req, res) => {
  try {
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) return res.status(404).json({ message: "Crop cycle not found" });

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageBuffer = req.file.buffer;
    const imageMime = req.file.mimetype;

    // Use form-data correctly
    const form = new FormData();
    form.append("file", imageBuffer, {
      filename: "image.jpg", // or req.file.originalname
      contentType: imageMime,
      knownLength: imageBuffer.length,
    });

    const response = await axios.post("http://localhost:8000/ml/pestPredict", form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const prediction = response.data;

    const aiResult = {
      detectedOn: new Date(),
      type: prediction.predicted_class,
      treatment: getTreatment(prediction.predicted_class),
      resolved: false,
      sprayLogs: [],
    };

    cropCycle.pestManagement.issues.push(aiResult);
    await cropCycle.save();

    const savedIssue = cropCycle.pestManagement.issues.at(-1);
    res.json({ pestDetected: true, issue: savedIssue });

  } catch (err) {
    console.error("Pest detection error:", err);
    res.status(500).json({ error: "AI pest detection failed" });
  }
};

// Optional helper for treatment based on class
const getTreatment = (diseaseName) => {
  const treatments = {
    "Apple___Apple_scab": "Captan fungicide spray",
    "Apple___Black_rot": "Prune infected branches + Mancozeb",
    "Corn___Cercospora_leaf_spot": "Propiconazole",
    // Add other mappings
  };
  return treatments[diseaseName] || "General pesticide recommended";
};

const saveSprayLog = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { date, pesticide, quantity, notes } = req.body;

    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) return res.status(404).json({ message: "Crop cycle not found" });

    const pestIssue = cropCycle.pestManagement.issues.id(issueId);
    if (!pestIssue) return res.status(404).json({ message: "Pest issue not found" });

    pestIssue.sprayLogs.push({
      date: date || new Date(),
      pesticide,
      quantity,
      notes,
    });

    // Optional: if at least 1 spray log, mark resolved
    pestIssue.resolved = true;

    await cropCycle.save();
    res.json({ message: "Spray log saved successfully", sprayLog: pestIssue.sprayLogs.at(-1) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save spray log" });
  }
};

const getAIHarvestPrediction = async (req, res) => {
  try {
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle || !cropCycle.sowing?.actualDate) {
      return res.status(400).json({ message: "Sowing must be completed first." });
    }

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageBuffer = req.file.buffer;
    const imageMime = req.file.mimetype;

    // Fake logic — you can replace this with ML model
    const sowingDate = new Date(cropCycle.sowing.actualDate);
    const expectedDate = new Date(sowingDate);
    expectedDate.setDate(sowingDate.getDate() + 120); // Example: 120 days crop

    cropCycle.harvesting = {
      ...cropCycle.harvesting,
      expectedDate,
    };

    await cropCycle.save();

    res.json({ expectedDate });
  } catch (err) {
    console.error("Error predicting harvest:", err);
    res.status(500).json({ message: "Failed to predict harvest date" });
  }
};

const saveActualHarvest = async (req, res) => {
  try {
    const { actualDate, notes } = req.body;

    if (!actualDate) {
      return res.status(400).json({ message: "Actual date is required." });
    }

    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) {
      return res.status(404).json({ message: "Crop cycle not found" });
    }

    cropCycle.harvesting = {
      ...cropCycle.harvesting,
      actualDate: new Date(actualDate), // ensure it's a valid date
      notes: notes?.trim() || "",       // sanitize notes
    };

    await cropCycle.save();
    res.json({ message: "Harvest info saved successfully" });
  } catch (err) {
    console.error("Error saving harvest:", err);
    res.status(500).json({ message: "Failed to save harvest info" });
  }
};

const predictYield = async (req, res) => {
  try {
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle || !cropCycle.harvesting?.actualDate) {
      return res.status(400).json({ message: "Harvesting must be completed." });
    }

    const { fieldId } = req.body;
    if (!fieldId) {
      return res.status(400).json({ message: "Missing required fieldId" });
    }

    const fieldDetailsRes = await axios.get("http://192.168.0.143:5050/api/fields/fieldDetails", {
      params: {
        fieldId,
        farmerId: req.farmerId,
      },
      headers: {
        Authorization: req.headers.authorization,
      }
    });

    const locationString = fieldDetailsRes.data.location;
    if (!locationString) {
      return res.status(400).json({ message: "Missing location in field data" });
    }

    const [latStr, lonStr] = locationString.split(",");
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    const Soil_Type = fieldDetailsRes.data.soilType;
    const crop = cropCycle.cropSelection.selected;
    const Fertilizer_Used = cropCycle.fertilization.logs.length > 0 ? true : false;
    const Irrigation_Used = false;
    const Days_to_Harvest = Math.floor((new Date(cropCycle.harvesting.actualDate) - new Date(cropCycle.sowing.actualDate)) / (1000 * 60 * 60 * 24))
    const Temperature_Celsius = 30
    const Rainfall_mm = 60

    const fastApiRes = await axios.post(`${FASTAPI_URL}/ml/yield/predict`, {
      Soil_Type: String(Soil_Type),
      crop: String(crop),
      Rainfall_mm: Number(Rainfall_mm),
      Temperature_Celsius: Number(Temperature_Celsius),
      Fertilizer_Used: Boolean(Fertilizer_Used),
      Irrigation_Used: Boolean(Irrigation_Used),
      Days_to_Harvest: Days_to_Harvest
    });

    const expected = fastApiRes.data.predicted_yield_tons_per_hectare;
    const unit = "tons per hectare";

    cropCycle.yield = {
      ...cropCycle.yield,
      expected,
      unit,
    };

    await cropCycle.save();

    res.json({ expected, unit });
  } catch (err) {
    console.error("Yield prediction error:", err);
    res.status(500).json({ message: "Failed to predict yield" });
  }
};

const saveActualYield = async (req, res) => {
  try {
    const { actual, unit, notes } = req.body;
    const cropCycle = await CropCycle.findById(req.params.id);
    if (!cropCycle) return res.status(404).json({ message: "Cycle not found" });

    cropCycle.yield = {
      ...cropCycle.yield,
      actual,
      unit,
      notes,
    };

    await cropCycle.save();
    res.json({ message: "Actual yield saved successfully" });
  } catch (err) {
    console.error("Save yield error:", err);
    res.status(500).json({ message: "Failed to save actual yield" });
  }
};

module.exports = { createCropCycle, getCropCycleBySeasonField, updateCropCycle, deleteCropCycle, getCropRecommendation, landPreparation, saveRecommendatedSowingDate, sowing, getIrrigationSuggestion, saveIrrigationLogs, getFertilizerSuggestion, saveFertilizerLogs, getPestSuggestion, saveSprayLog, getAIHarvestPrediction, saveActualHarvest, predictYield, saveActualYield };