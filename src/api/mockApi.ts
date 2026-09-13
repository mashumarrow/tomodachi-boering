import { hospitals, origins } from "@/data/campus";
import type { Coordinates, Hospital, MedicalDepartment } from "@/domain/types";
import { distanceMeters } from "@/lib/simulation";

export async function fetchOrigins() {
  return origins;
}

export async function fetchHospitals() {
  return hospitals;
}

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

export async function fetchNearbyHospitals(origin: Coordinates): Promise<Hospital[]> {
  const radiusMeters = 8000;
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"hospital|clinic|doctors|dentist"](around:${radiusMeters},${origin.latitude},${origin.longitude});
      way["amenity"~"hospital|clinic|doctors|dentist"](around:${radiusMeters},${origin.latitude},${origin.longitude});
      relation["amenity"~"hospital|clinic|doctors|dentist"](around:${radiusMeters},${origin.latitude},${origin.longitude});
    );
    out center tags 20;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: `data=${encodeURIComponent(query)}`
  });

  if (!response.ok) {
    throw new Error("OpenStreetMapから周辺医療機関を取得できませんでした。");
  }

  const data = (await response.json()) as OverpassResponse;
  const mapped = (data.elements ?? [])
    .map((element) => toHospital(element, origin))
    .filter((hospital): hospital is Hospital => Boolean(hospital))
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

  return mapped.length > 0 ? mapped : fallbackHospitals(origin);
}

export function fallbackHospitals(origin: Coordinates): Hospital[] {
  return hospitals
    .map((hospital) => ({
      ...hospital,
      distanceMeters: distanceMeters(origin, hospital.coordinates)
    }))
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
}

export function filterHospitalsByDepartment(
  hospitalList: Hospital[],
  department: MedicalDepartment
) {
  if (department === "all") {
    return hospitalList;
  }

  return hospitalList.filter((hospital) => hospital.departments.includes(department));
}

function toHospital(element: OverpassElement, origin: Coordinates): Hospital | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const name = element.tags?.name ?? element.tags?.["name:ja"];

  if (!latitude || !longitude || !name) {
    return null;
  }

  const amenity = element.tags?.amenity;
  const departments = inferDepartments(element.tags ?? {}, name);
  const department =
    departmentLabel(departments) ??
    element.tags?.healthcare ??
    (amenity === "hospital" ? "病院" : amenity === "clinic" ? "クリニック" : amenity === "dentist" ? "歯科" : "医療機関");
  const address = [
    element.tags?.["addr:city"],
    element.tags?.["addr:suburb"],
    element.tags?.["addr:neighbourhood"],
    element.tags?.["addr:street"]
  ]
    .filter(Boolean)
    .join(" ");
  const meters = distanceMeters(origin, { latitude, longitude });

  return {
    id: `osm-${element.id}`,
    name,
    department,
    departments,
    address: address || "OpenStreetMap登録地点",
    congestion: meters < 2500 ? "medium" : "low",
    waitMinutes: meters < 2500 ? 26 : 34,
    examMinutes: 16,
    pharmacyMinutes: 12,
    coordinates: {
      latitude,
      longitude
    },
    distanceMeters: meters
  };
}

function inferDepartments(tags: Record<string, string>, name: string): MedicalDepartment[] {
  const source = `${name} ${tags.healthcare ?? ""} ${tags.speciality ?? ""} ${tags["healthcare:speciality"] ?? ""}`;
  const departments: MedicalDepartment[] = [];

  if (/内科|internal|clinic|doctors/i.test(source)) departments.push("internal");
  if (/耳鼻|咽喉|ent|otolaryngology/i.test(source)) departments.push("ent");
  if (/皮膚|dermatology/i.test(source)) departments.push("dermatology");
  if (/整形|orthopedic|orthopaedic/i.test(source)) departments.push("orthopedics");
  if (/眼科|ophthalmology/i.test(source)) departments.push("ophthalmology");
  if (/歯科|dent|dental/i.test(source) || tags.amenity === "dentist") departments.push("dental");
  if (/小児|pediatric|paediatric/i.test(source)) departments.push("pediatrics");
  if (tags.amenity === "hospital") departments.push("general");

  const inferred: MedicalDepartment[] = departments.length > 0 ? departments : ["general"];

  return [...new Set<MedicalDepartment>(inferred)];
}

function departmentLabel(departments: MedicalDepartment[]) {
  const labels: Partial<Record<MedicalDepartment, string>> = {
    general: "総合・その他",
    internal: "内科",
    ent: "耳鼻科",
    dermatology: "皮膚科",
    orthopedics: "整形外科",
    ophthalmology: "眼科",
    dental: "歯科",
    pediatrics: "小児科"
  };

  return departments.map((department) => labels[department]).filter(Boolean).join("・");
}
