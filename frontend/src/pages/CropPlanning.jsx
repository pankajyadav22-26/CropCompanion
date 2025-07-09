import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import SeasonList from "../components/CropPlanning/SeasonList";
import FieldList from "../components/CropPlanning/FieldList";
import CropCycleDisplay from "../components/CropPlanning/CropCycleDisplay";

const CropPlanning = () => {
  const { token } = useSelector((state) => state.farmer);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonFields, setSeasonFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [allFields, setAllFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);
  const [fieldToAdd, setFieldToAdd] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [cropCycle, setCropCycle] = useState(null);
  const [manualCrop, setManualCrop] = useState("");
  const [landPrepNotes, setLandPrepNotes] = useState("");

  const fetchSeasons = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/seasons`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSeasons(res.data);
    } catch (err) {
      console.error("Failed to fetch seasons", err);
    }
  };

  const fetchAllFields = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/fields/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllFields(res.data);
    } catch (err) {
      console.error("Failed to fetch all fields", err);
    }
  };

  const fetchFieldsForSeason = async (seasonId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/seasons/${seasonId}/fields`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSeasonFields(res.data.fields);
    } catch (err) {
      console.error("Failed to fetch fields", err);
    }
  };

  const handleSeasonClick = (season) => {
    setSelectedSeason(season);
    setSelectedField(null);
    fetchFieldsForSeason(season._id);
    fetchAllFields();
  };

  const handleFieldClick = async (field) => {
    setSelectedField(field);
    const cycle = await fetchCropCycle(selectedSeason._id, field._id);
    setCropCycle(cycle);
  };

  const handleBackToSeasons = () => {
    setSelectedSeason(null);
    setSeasonFields([]);
  };

  const handleBackToFields = () => {
    setSelectedField(null);
  };

  const getUnassignedFields = () =>
    allFields.filter((field) => !seasonFields.find((f) => f._id === field._id));

  const addFieldToSeason = async () => {
    if (!fieldToAdd) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/seasons/${
          selectedSeason._id
        }/add-field`,
        { fieldId: fieldToAdd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFieldsForSeason(selectedSeason._id);
      setFieldToAdd("");
      setShowAddField(false);
    } catch (err) {
      console.error("Failed to add field", err);
    }
  };

  const removeFieldFromSeason = async (fieldId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/seasons/${
          selectedSeason._id
        }/fields/${fieldId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFieldsForSeason(selectedSeason._id);
      if (selectedField && selectedField._id === fieldId)
        setSelectedField(null);
    } catch (err) {
      console.error("Failed to remove field", err);
    }
  };

  const fetchRecommendations = async () => {
    if (!selectedField) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/recommend`,
        {
          fieldId: selectedField._id,
          N: selectedField.soilData?.nitrogen || 0,
          P: selectedField.soilData?.phosphorous || 0,
          K: selectedField.soilData?.potassium || 0,
          temperature: 27.5,
          humidity: 60,
          ph: selectedField.soilData?.pH || 6.5,
          rainfall: 100,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error("Failed to fetch AI recommendations", err);
    }
  };

  const fetchCropCycle = async (seasonId, fieldId) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/crop-cycles/${seasonId}/${fieldId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data;
    } catch (err) {
      console.error("No crop cycle found for this field.", err);
      return null;
    }
  };

  const createCropCycle = async (cropName, source, recommended = []) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles`,
        {
          cropSelection: {
            selected: cropName,
            source,
            recommended,
          },
          seasonId: selectedSeason._id,
          fieldId: selectedField._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
      alert("Crop cycle created!");
    } catch (err) {
      console.error("Failed to create crop cycle", err);
      alert("Error creating crop cycle.");
    }
  };

  const markLandPreparationDone = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/crop-cycles/${
          cropCycle._id
        }/land-preparation`,
        {
          notes: landPrepNotes,
          date: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      alert("Updated Land Preparation");
      const cycle = await fetchCropCycle(selectedSeason._id, selectedField._id);
      setCropCycle(cycle);
    } catch (error) {
      console.error("Failed to update Land Preparation", error);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const glassButton =
    "px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-gray-300 hover:bg-white/40 transition";

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-green-800 mb-6 md:mb-8 flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Sprout size={32} className="text-green-700" />
        Crop Planning
      </motion.h1>

      {/* Step 1: Show seasons */}
      {!selectedSeason && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SeasonList seasons={seasons} onSelectSeason={handleSeasonClick} />
        </motion.div>
      )}

      {/* Step 2: Show fields for selected season */}
      {selectedSeason && !selectedField && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FieldList
            season={selectedSeason}
            fields={seasonFields}
            onBack={handleBackToSeasons}
            onFieldClick={handleFieldClick}
            onRemoveField={removeFieldFromSeason}
            unassignedFields={getUnassignedFields()}
            showAddField={showAddField}
            setShowAddField={setShowAddField}
            fieldToAdd={fieldToAdd}
            setFieldToAdd={setFieldToAdd}
            onAddField={addFieldToSeason}
          />
        </motion.div>
      )}

      {/* Step 3: Show crop cycle for selected field */}
      {selectedField && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CropCycleDisplay
            selectedField={selectedField}
            selectedSeason={selectedSeason}
            cropCycle={cropCycle}
            handleBackToFields={handleBackToFields}
            fetchRecommendations={fetchRecommendations}
            recommendations={recommendations}
            createCropCycle={createCropCycle}
            manualCrop={manualCrop}
            setManualCrop={setManualCrop}
            setLandPrepNotes={setLandPrepNotes}
            markLandPreparationDone={markLandPreparationDone}
            landPrepNotes={landPrepNotes}
            fetchCropCycle={fetchCropCycle}
            setCropCycle={setCropCycle}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CropPlanning;
