const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // store in memory

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const fieldRoutes = require("./routes/field");
const seasonRoutes = require("./routes/seasonRoutes");
const cropCycleRoutes = require("./routes/cropCycleRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/crop-cycles", cropCycleRoutes);


// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.get("/", (req, res) => {
  res.send("Smart Agriculture Backend is Running");
});

// Start server
app.listen(process.env.PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${process.env.PORT}`)
);