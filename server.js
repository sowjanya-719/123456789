import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as tf from "@tensorflow/tfjs-node";
import * as mobilenet from "@tensorflow-models/mobilenet";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Load the MobileNet model once at server start
let model;
(async () => {
  console.log("Loading MobileNet...");
  model = await mobilenet.load();
  console.log("Model loaded successfully!");
})();

// Convert base64 to tensor
function base64ToTensor(base64) {
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  return tf.node.decodeImage(buffer);
}

// Leaf Analysis
app.post("/api/leaf", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });

  try {
    const tensor = base64ToTensor(image);
    const predictions = await model.classify(tensor);
    res.json({ result: predictions[0] }); // top prediction
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze leaf" });
  }
});

// Root endpoint
app.get("/", (req, res) => res.send("🌱 Smart Farming Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
