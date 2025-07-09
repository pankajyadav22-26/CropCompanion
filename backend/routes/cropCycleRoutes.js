const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
    createCropCycle,
    getCropCycleBySeasonField,
    updateCropCycle,
    deleteCropCycle,
    addIrrigation,
    addFertilization,
    getCropRecommendation,
    landPreparation,
    saveRecommendatedSowingDate,
    sowing,
    getIrrigationSuggestion,
    saveIrrigationLogs,
    getFertilizerSuggestion,
    saveFertilizerLogs,
    getPestSuggestion,
    saveSprayLog,
    getAIHarvestPrediction,
    saveActualHarvest,
    predictYield,
    saveActualYield
} = require("../controllers/cropCycleController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, createCropCycle);
router.get("/:seasonId/:fieldId", authMiddleware, getCropCycleBySeasonField);
router.patch("/:id", authMiddleware, updateCropCycle);
router.delete("/:id", authMiddleware, deleteCropCycle);

// router.patch("/:id/add-irrigation", authMiddleware, addIrrigation);
// router.patch("/:id/add-fertilization", authMiddleware, addFertilization);

router.post("/recommend", authMiddleware, getCropRecommendation);


router.put("/:id/land-preparation", authMiddleware, landPreparation);

router.patch("/:id/sowing/recommendatedDates", authMiddleware, saveRecommendatedSowingDate);
router.patch("/:id/sowing/save", authMiddleware, sowing);

router.post("/:id/irrigation/AiSuggestion", authMiddleware, getIrrigationSuggestion);
router.post("/:id/irrigation/logs/save", authMiddleware, saveIrrigationLogs);

router.post("/:id/fertilizer/AiSuggestion", authMiddleware, getFertilizerSuggestion);
router.post("/:id/fertilizer/logs/save", authMiddleware, saveFertilizerLogs);

router.post(
    "/:id/pest/AiSuggestion",
    authMiddleware,
    upload.single("image"),
    getPestSuggestion
);
router.post("/:id/pestSpray/logs/save/:issueId", authMiddleware, saveSprayLog);

router.post("/:id/harvesting/ai-predict", authMiddleware, upload.single("image"), getAIHarvestPrediction);
router.post("/:id/harvesting/save", authMiddleware, saveActualHarvest);

router.post("/:id/yield/ai-predict", authMiddleware, predictYield);
router.post("/:id/yield/save", authMiddleware, saveActualYield);

module.exports = router;