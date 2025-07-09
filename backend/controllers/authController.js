const Farmer = require("../models/Farmer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Farmer.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const newFarmer = await Farmer.create({ name, email, password: hash });

    res.status(201).json({ message: "Farmer registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, farmer.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: farmer._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};