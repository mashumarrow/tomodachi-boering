import { describe, expect, it } from "vitest";
import { hospitals } from "@/data/campus";
import { origins } from "@/data/campus";
import { estimateSymptoms } from "@/lib/symptomEstimate";
import { simulateVisit } from "@/lib/simulation";

describe("simulateVisit", () => {
  it("adds travel, wait, exam, pharmacy, and return minutes", () => {
    const result = simulateVisit({
      hospital: hospitals[0],
      origin: origins[0],
      transportMode: "bike",
      availableMinutes: 90,
      needsPharmacy: true,
      symptomEstimate: estimateSymptoms("38度の熱とのどの痛み")
    });

    expect(result.totalMinutes).toBeGreaterThan(0);
    expect(result.marginMinutes).toBeLessThan(90);
    expect(result.remainingPaymentRange).toEqual([800, 2600]);
    expect(result.fit).toBe("over");
  });
});
