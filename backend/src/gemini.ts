import type { GeminiEstimateJson, SymptomEstimate } from "./types.js";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

export function isGeminiConfigured() {
  return Boolean(geminiApiKey);
}

export function getGeminiModel() {
  return geminiModel;
}

export async function estimateSymptomsWithGemini(symptoms: string): Promise<SymptomEstimate> {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(symptoms)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return normalizeEstimate(JSON.parse(text) as GeminiEstimateJson);
}

function buildPrompt(symptoms: string) {
  return `
あなたは日本の大学生向け医療予約アプリの事前見積もり補助です。
ユーザーの症状から、受診前の目安として以下JSONのみを返してください。
診断を断定しないでください。緊急性が高い可能性がある場合は、diagnosisに救急相談や早急な受診を促す文を含めてください。
健康保険3割負担を想定した概算費用レンジを日本円で返してください。

{
  "diagnosis": "想定される傷病名や受診先の目安。断定しない。",
  "tests": "想定される検査・処方・処置の目安。",
  "costRange": [1500, 3500],
  "examExtraMinutes": 4
}

症状:
${symptoms}
`.trim();
}

function normalizeEstimate(value: GeminiEstimateJson): SymptomEstimate {
  const low = Number(value.costRange?.[0] ?? 1600);
  const high = Number(value.costRange?.[1] ?? 3300);

  return {
    diagnosis: value.diagnosis || "一般外来での初診相談として、医師の診察後に検査・処方の要否を判断する想定",
    tests: value.tests || "問診、診察、必要時の基本検査と処方を想定",
    costRange: [Math.max(0, Math.min(low, high)), Math.max(low, high)],
    examExtraMinutes: Math.min(20, Math.max(0, Number(value.examExtraMinutes ?? 3)))
  };
}
