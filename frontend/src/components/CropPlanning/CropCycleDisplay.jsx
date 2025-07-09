import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import StageCard from "./StageCard";
import axios from "axios";

const CropCycleDisplay = ({
  selectedField,
  selectedSeason,
  cropCycle,
  handleBackToFields,
  fetchRecommendations,
  recommendations,
  createCropCycle,
  manualCrop,
  setManualCrop,
  setLandPrepNotes,
  markLandPreparationDone,
  landPrepNotes,
  fetchCropCycle,
  setCropCycle,
}) => {
  const glassButton =
    "px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-gray-300 hover:bg-white/40 transition";

  const [sowingInput, setSowingInput] = useState({
    actualDate: "",
    method: "",
    notes: "",
  });

  const [lastRecommendation, setLastRecommendation] = useState(null);
  const [irrigationForm, setIrrigationForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    method: "",
    notes: "",
  });

  const [fertilizerForm, setFertilizerForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "",
    quantity: "",
    notes: "",
  });

  const [lastFertilizerRecommendation, setLastFertilizerRecommendation] =
    useState(null);

  const [sprayForm, setSprayForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    pesticide: "",
    quantity: "",
    notes: "",
  });

  const [pestImage, setPestImage] = useState(null);

  const [lastPestSuggestion, setLastPestSuggestion] = useState(null);

  const [cropImage, setCropImage] = useState(null);

  const [harvestForm, setHarvestForm] = useState({
    actualDate: "",
    notes: "",
  });
  const [harvestExpected, setHarvestExpected] = useState(null);

  const [yieldForm, setYieldForm] = useState({
    actual: "",
    unit: "kg/acre",
    notes: "",
  });

  const { token } = useSelector((state) => state.farmer);

  const handleSowingRecommendation = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/sowing/recommendatedDates`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (error) {
      console.error("Failed to get AI recommended sowing date:", error);
    }
  };

  const submitSowingDetails = async () => {
    const { actualDate, method, notes } = sowingInput;
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/sowing/save`,
        {
          actualDate,
          method,
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Updated Sowing Stage");
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (error) {
      console.error("Failed to update Sowing Stage", error);
    }
  };

  const handleGetIrrigationRecommendation = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/irrigation/AiSuggestion`,
        {fieldId: selectedField._id,},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastRecommendation(res.data);
    } catch (err) {
      console.error("Error getting irrigation recommendation:", err);
      alert("Failed to get irrigation recommendation.");
    }
  };

  const submitIrrigationLog = async () => {
    if (!irrigationForm.date || !irrigationForm.method) {
      alert("Please fill in required fields");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/irrigation/logs/save`,
        irrigationForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Irrigation logged successfully");
      setIrrigationForm({ date: "", method: "", notes: "" });
      setLastRecommendation(null);
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error logging irrigation:", err);
      alert("Failed to save irrigation log.");
    }
  };

  const handleGetFertilizerRecommendation = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/fertilizer/AiSuggestion`,
        {fieldId: selectedField._id,},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastFertilizerRecommendation(res.data);
    } catch (err) {
      console.error("Error getting irrigation recommendation:", err);
      alert("Failed to get irrigation recommendation.");
    }
  };

  const submitFertilizerLog = async () => {
    if (
      !fertilizerForm.date ||
      !fertilizerForm.type ||
      !fertilizerForm.quantity
    ) {
      alert("Please fill in required fields");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/fertilizer/logs/save`,
        fertilizerForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Fertilizer log saved");
      setFertilizerForm({
        date: new Date().toISOString().slice(0, 10),
        type: "",
        quantity: "",
        notes: "",
      });
      setLastFertilizerRecommendation(null);
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error saving fertilizer log:", err);
      alert("Failed to save log");
    }
  };

  const handleGetPestSuggestion = async () => {
    if (!pestImage) {
      alert("Please select an image for AI pest detection.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", pestImage);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/pest/AiSuggestion`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.pestDetected) {
        alert("🚨 Pest detected and treatment suggested.");
      } else {
        alert("✅ No pest detected.");
      }

      // Refresh crop cycle after suggestion
      const updatedCycle = await fetchCropCycle(
        selectedSeason._id,
        selectedField._id
      );
      setCropCycle(updatedCycle);
      setPestImage(null);
    } catch (err) {
      console.error("Error getting pest recommendation:", err);
      alert("❌ Failed to get pest recommendation.");
    }
  };

  const submitSprayLog = async (issueId) => {
    if (!sprayForm.date || !sprayForm.pesticide || !sprayForm.quantity) {
      alert("Please fill in required fields");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/pestSpray/logs/save/${issueId}`,
        sprayForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Spray log saved");

      setSprayForm({
        date: new Date().toISOString().slice(0, 10),
        pesticide: "",
        quantity: "",
        notes: "",
      });
      setLastPestSuggestion(null);
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error saving spray log:", err);
      alert("Failed to save spray log");
    }
  };

  const handleGetHarvestPrediction = async () => {
    if (!cropImage) {
      alert("Please select an image for AI Harvesting Prediction.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", cropImage);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/harvesting/ai-predict`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setHarvestExpected(res.data.expectedDate);

      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("AI harvest prediction error:", err);
      alert("Failed to get prediction.");
    }
  };

  const submitHarvestForm = async () => {
    console.log(harvestForm);
    if (!harvestForm.actualDate) {
      alert("Please enter the actual harvest date.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/harvesting/save`,
        harvestForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Harvest saved");

      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setHarvestForm({ actualDate: "", notes: "" });
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error saving harvest form:", err);
      alert("Failed to save harvest data");
    }
  };

  const handleGetYieldPrediction = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/yield/ai-predict`,
        {fieldId: selectedField._id},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error predicting yield:", err);
      alert("Failed to get yield prediction.");
    }
  };

  const submitYieldForm = async () => {
    if (!yieldForm.actual) {
      alert("Please enter actual yield");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/yield/save`,
        yieldForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Yield info saved");
      setYieldForm({ actual: "", unit: "kg/acre", notes: "" });

      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (err) {
      console.error("Error saving yield:", err);
      alert("Failed to save yield");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      {/* Back Button */}
      <button
        onClick={handleBackToFields}
        className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-gray-300 hover:bg-white/40 transition"
      >
        ← Back to Fields
      </button>

      {/* Header */}
      <h2 className="text-2xl font-bold mt-4 text-green-800">
        🌱 Crop Cycle for {selectedField.name}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        (Season: {selectedSeason.name})
      </p>

      {/* No Cycle Started */}
      {!cropCycle ? (
        <div className="bg-white/90 p-6 rounded-2xl shadow space-y-5">
          <h3 className="text-lg font-bold">🚀 Start Crop Cycle</h3>

          <button onClick={fetchRecommendations} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            🤖 Get AI Crop Recommendations
          </button>

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <ul className="list-disc pl-5 mt-1 text-sm text-gray-700 space-y-2">
              {recommendations.map((rec) => (
                <li key={rec.crop}>
                  <strong>{rec.crop}</strong> (
                  {(rec.confidence * 100).toFixed(1)}%)
                  <button
                    className="ml-2 bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full text-xs"
                    onClick={() =>
                      createCropCycle(
                        rec.crop,
                        "AI",
                        recommendations.map((r) => r.crop)
                      )
                    }
                  >
                    Use This
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Manual Selection */}
          <div className="pt-4 border-t">
            <label className="block font-semibold mb-2">
              🌿 Or select crop manually:
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <select
                className="input p-2 border rounded-lg flex-1"
                value={manualCrop}
                onChange={(e) => setManualCrop(e.target.value)}
              >
                <option value="">-- Select Crop --</option>
                {[
                  "Wheat",
                  "Rice",
                  "Maize",
                  "Sugarcane",
                  "Millet",
                  "Cotton",
                  "Groundnut",
                ].map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              <button
                className="btn-success"
                disabled={!manualCrop}
                onClick={() => createCropCycle(manualCrop, "Manual")}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Crop Cycle Started
        <div className="space-y-6">
          <p className="text-green-700 text-lg font-semibold">
            Crop cycle started with:{" "}
            <strong>
              {cropCycle.cropSelection?.selected.charAt(0).toUpperCase()}
              {cropCycle.cropSelection?.selected.slice(1)}
            </strong>
          </p>

          {/* Stages Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Stages
            </h4>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1">
              {(cropCycle.stages || []).map((stage, index) => (
                <StageCard
                  key={stage.key}
                  stage={stage}
                  index={index}
                  cropCycle={cropCycle}
                  landPrepNotes={landPrepNotes}
                  setLandPrepNotes={setLandPrepNotes}
                  markLandPreparationDone={markLandPreparationDone}
                  handleSowingRecommendation={handleSowingRecommendation}
                  sowingInput={sowingInput}
                  setSowingInput={setSowingInput}
                  submitSowingDetails={submitSowingDetails}
                  lastRecommendation={lastRecommendation}
                  irrigationForm={irrigationForm}
                  setIrrigationForm={setIrrigationForm}
                  handleGetIrrigationRecommendation={
                    handleGetIrrigationRecommendation
                  }
                  submitIrrigationLog={submitIrrigationLog}
                  lastFertilizerRecommendation={lastFertilizerRecommendation}
                  fertilizerForm={fertilizerForm}
                  setFertilizerForm={setFertilizerForm}
                  handleGetFertilizerRecommendation={
                    handleGetFertilizerRecommendation
                  }
                  submitFertilizerLog={submitFertilizerLog}
                  lastPestSuggestion={lastPestSuggestion}
                  sprayForm={sprayForm}
                  setSprayForm={setSprayForm}
                  handleGetPestSuggestion={handleGetPestSuggestion}
                  submitSprayLog={submitSprayLog}
                  setPestImage={setPestImage}
                  harvestExpected={harvestExpected}
                  handleGetHarvestPrediction={handleGetHarvestPrediction}
                  submitHarvestForm={submitHarvestForm}
                  setHarvestForm={setHarvestForm}
                  harvestForm={harvestForm}
                  setCropImage={setCropImage}
                  handleGetYieldPrediction={handleGetYieldPrediction}
                  submitYieldForm={submitYieldForm}
                  setYieldForm={setYieldForm}
                  yieldForm={yieldForm}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CropCycleDisplay;
