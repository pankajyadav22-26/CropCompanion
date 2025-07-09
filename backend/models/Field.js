const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  soilType: {
    type: String,
    enum: ["Sandy", "Clay", "Silt", "Peaty", "Chalky", "Loamy", "Other"],
    required: true,
  },
  soilData: {
    nitrogen: { type: Number, required: true },
    phosphorous: { type: Number, required: true },
    potassium: { type: Number, required: true },
    pH: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Field", fieldSchema);