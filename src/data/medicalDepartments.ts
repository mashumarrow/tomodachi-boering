import type { MedicalDepartment } from "@/domain/types";

export const medicalDepartmentOptions: Array<{ label: string; value: MedicalDepartment }> = [
  { label: "すべて", value: "all" },
  { label: "内科", value: "internal" },
  { label: "耳鼻科", value: "ent" },
  { label: "皮膚科", value: "dermatology" },
  { label: "整形外科", value: "orthopedics" },
  { label: "眼科", value: "ophthalmology" },
  { label: "歯科", value: "dental" },
  { label: "小児科", value: "pediatrics" }
];
