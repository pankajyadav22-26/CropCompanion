const mongoose = require("mongoose");

const FertilizerLogSchema = new mongoose.Schema({
    date: Date,
    type: String,
    quantity: String,
    notes: String,
});

const FertilizerRecommendationSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    needed: { type: Boolean, required: true },
    recommendedType: String, // e.g., "NPK 20-20-20"
});

const IrrigationLogSchema = new mongoose.Schema({
    date: Date,
    method: String,
    notes: String,
});

const IrrigationRecommendationSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    needed: { type: Boolean, required: true },
});

const SprayLogSchema = new mongoose.Schema({
    date: Date,
    pesticide: String,
    quantity: String,
    notes: String,
});

const PestIssueSchema = new mongoose.Schema({
    detectedOn: Date,
    type: String, // e.g., "Powdery Mildew"
    treatment: String, // AI-suggested pesticide
    resolved: Boolean,
    sprayLogs: [SprayLogSchema] // << NESTED HERE
});

const CropCycleSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: "Field", required: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season", required: true },

    cropSelection: {
        recommended: [String],
        selected: String,
        source: String,
        date: Date,
    },

    landPreparation: {
        done: Boolean,
        date: Date,
        notes: String,
    },

    sowing: {
        recommendedDate: {
            from: Date,
            to: Date,
        },
        actualDate: Date,
        method: String,
        notes: String,
    },

    irrigation: {
        logs: [IrrigationLogSchema],
        recommendations: [IrrigationRecommendationSchema],
    },

    fertilization: {
        logs: [FertilizerLogSchema],
        recommendations: [FertilizerRecommendationSchema],
    },

    pestManagement: {
        issues: [PestIssueSchema]
    },

    harvesting: {
        expectedDate: Date,
        actualDate: Date,
        notes: String,
    },

    yield: {
        expected: Number,
        actual: Number,
        unit: String,
        notes: String,
    },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CropCycle", CropCycleSchema);