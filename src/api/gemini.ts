import { Platform } from "react-native";
import type { SymptomEstimate } from "@/domain/types";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export function canUseGemini() {
  if (!apiBaseUrl) {
    return false;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const isHostedPage = !["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isLocalApi = apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1");

    return !(isHostedPage && isLocalApi);
  }

  return true;
}

export async function estimateSymptomsWithGemini(symptoms: string): Promise<SymptomEstimate> {
  if (!apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${apiBaseUrl}/api/symptom-estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ symptoms })
  });

  if (!response.ok) {
    throw new Error(`Symptom estimate API error: ${response.status}`);
  }

  return (await response.json()) as SymptomEstimate;
}
