// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Utility function to return random results
function getRandomResult(type) {
  const options = {
    leaf: ["✅ Leaf is healthy", "⚠️ Leaf shows signs of disease", "❌ Leaf is damaged"],
    soil: ["✅ Soil is fertile", "⚠️ Soil needs nutrients", "❌ Soil condition is poor"],
    pest: ["✅ Low pest risk", "⚠️ Moderate pest risk", "❌ High pest risk detected"],
  };
  const arr = options[type];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Leaf API
app.post("/api/leaf", (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });
  return res.json({ result: getRandomResult("leaf") });
});

// Soil API
app.post("/api/soil", (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });
  return res.json({ result: getRandomResult("soil") });
});

// Pest API
app.post("/api/pest", (req, res) => {
  const { temperature, humidity, lat, lon } = req.body;
  if (temperature && humidity) {
    return res.json({ result: `Pest risk (Manual): ${getRandomResult("pest")}`, details: { temperature, humidity } });
  }
  if (lat && lon) {
    return res.json({ result: `Pest risk (Location): ${getRandomResult("pest")}`, details: { lat, lon } });
  }
  return res.status(400).json({ error: "Provide temperature+humidity or location" });
});

// Root endpoint
app.get("/", (req, res) => res.send("🌱 Smart Farming Backend Running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
