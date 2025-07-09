const Season = require("../models/Season");
const Field = require("../models/Field");

const createSeason = async (req, res) => {
  try {
    const { name, year } = req.body;

    if (!name || !year) {
      return res.status(400).json({ error: "Name and year are required" });
    }

    const newSeason = new Season({
      farmerId: req.farmerId,
      name,
      year,
      fields: [],
    });

    await newSeason.save();

    res.status(201).json({
      message: "Season created successfully",
      season: newSeason,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating season" });
  }
};

const getSeasonsByFarmer = async (req, res) => {
  try {
    const seasons = await Season.find({ farmerId: req.farmerId });
    res.status(200).json(seasons);
  } catch (err) {
    res.status(500).json({ error: "Error fetching fields" });
  }
};

const getSeasonFields = async (req, res) => {
  try {
    const season = await Season.findOne({
      _id: req.params.id,
      farmerId: req.farmerId,
    }).populate("fields");                      // ← returns field docs
    if (!season) return res.status(404).json({ error: "Season not found" });

    res.json({ seasonId: season._id, fields: season.fields });
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch fields for season" });
  }
};

const addFieldToSeason = async (req, res) => {
  try {
    const { fieldId } = req.body;

    // 1. Validate field ownership
    const field = await Field.findOne({ _id: fieldId, farmerId: req.farmerId });
    if (!field) return res.status(404).json({ error: "Field not found" });

    // 2. Add fieldId to season if not present
    const season = await Season.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      { $addToSet: { fields: fieldId } },      // prevents duplicates
      { new: true }
    ).populate("fields");

    if (!season) return res.status(404).json({ error: "Season not found" });

    res.json({ message: "Field added to season", season });
  } catch (err) {
    res.status(500).json({ error: "Error adding field to season" });
  }
};

const removeFieldFromSeason = async (req, res) => {
  try {
    const { seasonId, fieldId } = req.params;

    // Ensure season belongs to farmer
    const season = await Season.findOneAndUpdate(
      { _id: seasonId, farmerId: req.farmerId },
      { $pull: { fields: fieldId } },
      { new: true }
    ).populate("fields");

    if (!season) return res.status(404).json({ error: "Season not found" });

    res.json({ message: "Field removed from season", season });
  } catch (err) {
    res.status(500).json({ error: "Error removing field from season" });
  }
}

module.exports = { createSeason, getSeasonsByFarmer, getSeasonFields, addFieldToSeason, removeFieldFromSeason };