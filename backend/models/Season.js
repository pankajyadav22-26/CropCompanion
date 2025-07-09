const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },
  name: {
    type: String,
    enum: ["Rabi", "Kharif", "Zaid", "Other"],
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  fields: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Season", seasonSchema);