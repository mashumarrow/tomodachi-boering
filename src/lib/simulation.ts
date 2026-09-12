import type {
  Coordinates,
  Hospital,
  Origin,
  SimulationResult,
  SymptomEstimate,
  TransportMode
} from "@/domain/types";

const depositYen = 1000;

const transportLabels: Record<TransportMode, string> = {
  walk: "徒歩",
  bike: "自転車",
  car: "自動車・原付",
  bus: "路線バス"
};

export function simulateVisit(params: {
  hospital: Hospital;
  origin: Origin;
  transportMode: TransportMode;
  availableMinutes: number;
  needsPharmacy: boolean;
  symptomEstimate: SymptomEstimate;
}): SimulationResult {
  const {
    hospital,
    origin,
    transportMode,
    availableMinutes,
    needsPharmacy,
    symptomEstimate
  } = params;

  const outboundMinutes =
    hospital.routes?.[origin.id]?.[transportMode] ??
    estimateTravelMinutes(distanceMeters(origin.coordinates, hospital.coordinates), transportMode);
  const returnMinutes = Math.max(4, outboundMinutes + 2);
  const pharmacyMinutes = needsPharmacy ? hospital.pharmacyMinutes : 0;
  const examMinutes = hospital.examMinutes + symptomEstimate.examExtraMinutes;

  const timeline = [
    {
      id: "outbound",
      label: `往路 ${transportLabels[transportMode]}`,
      minutes: outboundMinutes,
      color: "#28836f"
    },
    {
      id: "wait",
      label: "病院の予測待ち時間",
      minutes: hospital.waitMinutes,
      color: "#f0a13a"
    },
    {
      id: "exam",
      label: "診察・処置",
      minutes: examMinutes,
      color: "#376996"
    },
    {
      id: "pharmacy",
      label: "薬局受け取り",
      minutes: pharmacyMinutes,
      color: "#8c6fbe"
    },
    {
      id: "return",
      label: `復路 ${transportLabels[transportMode]}`,
      minutes: returnMinutes,
      color: "#c95064"
    }
  ];

  const totalMinutes = timeline.reduce((sum, item) => sum + item.minutes, 0);
  const marginMinutes = availableMinutes - totalMinutes;
  const estimatedCostRange = symptomEstimate.costRange;
  const remainingPaymentRange: [number, number] = [
    Math.max(0, estimatedCostRange[0] - depositYen),
    Math.max(0, estimatedCostRange[1] - depositYen)
  ];

  return {
    timeline,
    totalMinutes,
    marginMinutes,
    estimatedCostRange,
    remainingPaymentRange,
    depositYen,
    fit: marginMinutes >= 15 ? "ok" : marginMinutes >= 0 ? "tight" : "over"
  };
}

export function distanceMeters(from: Coordinates, to: Coordinates) {
  const earthRadiusMeters = 6371000;
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function estimateTravelMinutes(meters: number, transportMode: TransportMode) {
  const routeFactor = 1.28;
  const adjustedMeters = meters * routeFactor;
  const speedsMetersPerMinute: Record<TransportMode, number> = {
    walk: 75,
    bike: 220,
    car: 430,
    bus: 260
  };
  const fixedOverhead: Record<TransportMode, number> = {
    walk: 0,
    bike: 2,
    car: 6,
    bus: 10
  };

  return Math.max(4, Math.ceil(adjustedMeters / speedsMetersPerMinute[transportMode]) + fixedOverhead[transportMode]);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
