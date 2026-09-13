export type SymptomEstimate = {
  diagnosis: string;
  tests: string;
  costRange: [number, number];
  examExtraMinutes: number;
};

export type GeminiEstimateJson = {
  diagnosis?: string;
  tests?: string;
  costRange?: [number, number];
  examExtraMinutes?: number;
};
