export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type OriginId = "miyazaki_university" | "current_location" | string;

export type TransportMode = "walk" | "bike" | "car" | "bus";

export type MedicalDepartment =
  | "all"
  | "internal"
  | "ent"
  | "dermatology"
  | "orthopedics"
  | "ophthalmology"
  | "dental"
  | "pediatrics"
  | "general";

export type HospitalId = string;

export type Origin = {
  id: OriginId;
  name: string;
  coordinates: Coordinates;
};

export type Hospital = {
  id: HospitalId;
  name: string;
  department: string;
  departments: MedicalDepartment[];
  address: string;
  congestion: "low" | "medium" | "high";
  waitMinutes: number;
  examMinutes: number;
  pharmacyMinutes: number;
  coordinates: Coordinates;
  distanceMeters?: number;
  routes?: Record<string, Record<TransportMode, number>>;
};

export type SymptomEstimate = {
  diagnosis: string;
  tests: string;
  costRange: [number, number];
  examExtraMinutes: number;
};

export type TimelineItem = {
  id: string;
  label: string;
  minutes: number;
  color: string;
};

export type SimulationResult = {
  timeline: TimelineItem[];
  totalMinutes: number;
  marginMinutes: number;
  estimatedCostRange: [number, number];
  remainingPaymentRange: [number, number];
  depositYen: number;
  fit: "ok" | "tight" | "over";
};
