import type { Hospital, Origin } from "@/domain/types";

export const origins: Origin[] = [
  {
    id: "miyazaki_university",
    name: "宮崎大学 木花キャンパス",
    coordinates: {
      latitude: 31.8304,
      longitude: 131.4141
    }
  }
];

export const hospitals: Hospital[] = [
  {
    id: "miyazaki_university_hospital",
    name: "宮崎大学医学部附属病院",
    department: "総合病院",
    departments: ["general", "internal", "orthopedics", "ophthalmology", "pediatrics"],
    address: "宮崎市清武町木原",
    congestion: "medium",
    waitMinutes: 42,
    examMinutes: 20,
    pharmacyMinutes: 16,
    coordinates: {
      latitude: 31.8394,
      longitude: 131.3984
    }
  },
  {
    id: "kiyotake_internal_fallback",
    name: "清武エリア内科クリニック",
    department: "内科",
    departments: ["internal"],
    address: "宮崎市清武町周辺",
    congestion: "medium",
    waitMinutes: 28,
    examMinutes: 16,
    pharmacyMinutes: 12,
    coordinates: {
      latitude: 31.858,
      longitude: 131.389
    }
  },
  {
    id: "kibana_clinic_fallback",
    name: "木花エリアクリニック",
    department: "内科・小児科",
    departments: ["internal", "pediatrics"],
    address: "宮崎市学園木花台周辺",
    congestion: "low",
    waitMinutes: 22,
    examMinutes: 18,
    pharmacyMinutes: 10,
    coordinates: {
      latitude: 31.833,
      longitude: 131.42
    }
  }
];
