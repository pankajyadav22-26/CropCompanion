const express = require("express");
const router = express.Router();
const { createSeason, getSeasonsByFarmer, getSeasonFields, addFieldToSeason, removeFieldFromSeason} = require("../controllers/seasonController");
const authMiddleware = require("../middleware/auth");

router.post("/create", authMiddleware, createSeason);
router.get("/", authMiddleware, getSeasonsByFarmer);
router.get("/:id/fields", authMiddleware, getSeasonFields);
router.post("/:id/add-field", authMiddleware, addFieldToSeason);
router.delete("/:seasonId/fields/:fieldId", authMiddleware, removeFieldFromSeason);


module.exports = router;