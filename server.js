import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as tf from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" })); // smaller for free plan

let model;
let modelReady = false;

// Load MobileNet once at startup
(async () => {
  console.log("Loading MobileNet...");
  model = await mobilenet.load();
  modelReady = true;
  console.log("✅ Model loaded successfully!");
})();

// Convert base64 image to tensor
function base64ToTensor(base64) {
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  return tf.node.decodeImage(buffer, 3);
}

// Leaf analysis
app.post("/api/leaf", async (req, res) => {
  if (!modelReady) return res.status(503).json({ error: "Model loading. Try again in a few seconds." });

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });

  try {
    const tensor = base64ToTensor(image);
    const predictions = await model.classify(tensor);
    tensor.dispose(); // free memory
    res.json({ result: predictions[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze leaf" });
  }
});

// Soil analysis (mock for now)
app.post("/api/soil", (req, res) => {
  res.json({ result: "✅ Soil analysis placeholder (implement ML model later)" });
});

// Pest analysis (mock for now)
app.post("/api/pest", (req, res) => {
  const { temperature, humidity, lat, lon } = req.body;
  if ((temperature && humidity) || (lat && lon)) {
    res.json({ result: "⚠️ Pest risk analysis placeholder (implement ML model later)" });
  } else {
    res.status(400).json({ error: "Provide temperature+humidity or location" });
  }
});

// Health check
app.get("/", (req, res) => res.send("🌱 Smart Farming Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
