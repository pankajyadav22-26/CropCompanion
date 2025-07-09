const express = require("express");
const router = express.Router();
const { createField,
    getFieldsByFarmer,
    deleteField,
    updateField, getFieldDetails} = require("../controllers/fieldController");
const authMiddleware = require("../middleware/auth");

router.post("/create", authMiddleware, createField);
router.get("/", authMiddleware, getFieldsByFarmer);
router.delete("/:id", authMiddleware, deleteField);
router.put("/:id", authMiddleware, updateField);
router.get("/fieldDetails", authMiddleware, getFieldDetails);

module.exports = router;