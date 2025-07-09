const Field = require("../models/Field");

const createField = async (req, res) => {
  try {
    const { name, location, area, soilType, soilData } = req.body;

    if (!name || !location || !area || !soilType || !soilData) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newField = new Field({
      farmerId: req.farmerId,
      name,
      location,
      area,
      soilType,
      soilData,
    });

    await newField.save();

    res.status(201).json({
      message: "Field created successfully",
      field: newField,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating field" });
  }
};

const getFieldsByFarmer = async (req, res) => {
  try {
    const fields = await Field.find({ farmerId: req.farmerId });
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ error: "Error fetching fields" });
  }
};

const deleteField = async (req, res) => {
  try {
    const field = await Field.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.farmerId,
    });

    if (!field) {
      return res.status(404).json({ error: "Field not found or not authorized" });
    }

    res.json({ message: "Field deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting field" });
  }
};

const updateField = async (req, res) => {
  try {
    const updatedField = await Field.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      req.body,
      { new: true }
    );

    if (!updatedField) {
      return res.status(404).json({ error: "Field not found or not authorized" });
    }

    res.json(updatedField);
  } catch (err) {
    res.status(500).json({ error: "Error updating field" });
  }
};

const getFieldDetails = async (req, res) => {
  try {
    const { fieldId } = req.query;
    const farmerId = req.farmerId;

    if (!fieldId || !farmerId) {
      return res.status(400).json({ error: "Missing fieldId or farmerId" });
    }

    const field = await Field.findOne({
      _id: fieldId,
      farmerId,
    });

    if (!field) {
      return res.status(404).json({ error: "Field not found" });
    }

    res.status(200).json({
      soilData: field.soilData,
      location: field.location,
      soilType: field.soilType
    });
  } catch (error) {
    console.error("Error in getFieldDetails:", error.message);
    res.status(500).json({ error: "Error fetching field details" });
  }
};


module.exports = {
  createField, getFieldsByFarmer,
  deleteField,
  updateField,
  getFieldDetails
};