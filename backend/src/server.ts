import "dotenv/config";
import cors from "cors";
import express from "express";
import { estimateSymptomsWithGemini, getGeminiModel, isGeminiConfigured } from "./gemini.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: "16kb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        isLocalhostOrigin(origin) ||
        isExpoHostedOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    }
  })
);

function isLocalhostOrigin(origin: string) {
  try {
    const url = new URL(origin);

    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isExpoHostedOrigin(origin: string) {
  try {
    const url = new URL(origin);

    return url.protocol === "https:" && url.hostname.endsWith(".expo.app");
  } catch {
    return false;
  }
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "campus-med-timer-backend",
    geminiConfigured: isGeminiConfigured(),
    geminiModel: getGeminiModel()
  });
});

app.post("/api/symptom-estimate", async (req, res) => {
  const symptoms = typeof req.body?.symptoms === "string" ? req.body.symptoms.trim() : "";

  if (symptoms.length < 5) {
    res.status(400).json({
      error: "症状を5文字以上入力してください。"
    });
    return;
  }

  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: "GEMINI_API_KEY が設定されていません。"
    });
    return;
  }

  try {
    const estimate = await estimateSymptomsWithGemini(symptoms);
    res.json(estimate);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[symptom-estimate]", message);
    res.status(502).json({
      error: "Gemini APIで症状見積もりを実行できませんでした。"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Campus Med-Timer backend listening on http://localhost:${port}`);
  console.log(`Gemini model: ${getGeminiModel()}`);
  if (!isGeminiConfigured()) {
    console.warn("GEMINI_API_KEY is not configured. Symptom estimates will fall back to local estimates in the app.");
  }
});
