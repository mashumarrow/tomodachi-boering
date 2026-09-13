import type { SymptomEstimate } from "@/domain/types";

const symptomRules: Array<SymptomEstimate & { keywords: string[] }> = [
  {
    keywords: ["熱", "発熱", "38", "39", "のど", "咳", "せき", "頭痛"],
    diagnosis: "急性上気道炎、インフルエンザ、新型コロナ等の可能性を想定",
    tests: "抗原検査、解熱鎮痛薬、咳止め、のどの薬を想定",
    costRange: [1800, 3600],
    examExtraMinutes: 4
  },
  {
    keywords: ["腹", "お腹", "下痢", "吐き気", "嘔吐", "胃", "便"],
    diagnosis: "感染性胃腸炎、過敏性腸症候群、食あたり等の可能性を想定",
    tests: "整腸剤、吐き気止め、必要時の血液検査・点滴を想定",
    costRange: [1700, 4200],
    examExtraMinutes: 6
  },
  {
    keywords: ["花粉", "鼻水", "くしゃみ", "かゆい", "目"],
    diagnosis: "アレルギー性鼻炎、結膜炎等の可能性を想定",
    tests: "抗アレルギー薬、点鼻薬、点眼薬を想定",
    costRange: [1400, 2900],
    examExtraMinutes: 2
  },
  {
    keywords: ["けが", "怪我", "痛め", "捻挫", "打撲", "切った"],
    diagnosis: "捻挫、打撲、創傷等の外科的処置が必要な症状を想定",
    tests: "視診、消毒・処置、必要時のレントゲンを想定",
    costRange: [1900, 5200],
    examExtraMinutes: 8
  }
];

export function estimateSymptoms(input: string): SymptomEstimate {
  const text = input.trim();

  if (!text) {
    return {
      diagnosis: "症状を入力すると、想定される診療内容と概算費用を更新します。",
      tests: "未入力の場合は一般的な初診として計算しています。",
      costRange: [1500, 2500],
      examExtraMinutes: 0
    };
  }

  const match = symptomRules.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );

  if (match) {
    return {
      diagnosis: match.diagnosis,
      tests: match.tests,
      costRange: match.costRange,
      examExtraMinutes: match.examExtraMinutes
    };
  }

  return {
    diagnosis: "一般内科での初診相談として、問診後に検査・処方の要否を判断する想定",
    tests: "問診、診察、必要時の基本検査と処方を想定",
    costRange: [1600, 3300],
    examExtraMinutes: 3
  };
}
