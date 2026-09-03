import { describe, expect, it } from "vitest";
import { identificationSchema } from "./schema";

const validIdentification = {
  catalogue_id: "3",
  species_id: "bee",
  common_name: "Bee",
  confidence: 0.85,
  explanation: 'ResNet-50 matched the ImageNet label "bee".',
  rarity: "Common",
  rarity_code: 0,
  base_xp: 50,
  facts: ["Honey bees collect nectar and pollen from flowers."],
  target_for_quest: true,
  grade: "Silver",
  grade_code: 2,
  awarded_xp: 75,
  proof_hash:
    "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81",
} as const;

describe("identification response schema", () => {
  it("accepts a consistent strict result", () => {
    expect(identificationSchema.safeParse(validIdentification).success).toBe(
      true,
    );
  });

  it.each([
    ["rarity code", { rarity_code: 1 }],
    ["grade", { grade: "Gold" }],
    ["grade code", { grade_code: 3 }],
    ["awarded XP", { awarded_xp: 76 }],
    ["proof hash", { proof_hash: "ABC" }],
    ["catalogue ID", { catalogue_id: "0" }],
    ["quest eligibility", { target_for_quest: false }],
    ["extra property", { unexpected: true }],
  ])("rejects an inconsistent %s", (_field, invalidValue) => {
    expect(
      identificationSchema.safeParse({
        ...validIdentification,
        ...invalidValue,
      }).success,
    ).toBe(false);
  });

  it("rejects low confidence without throwing from cross-field validation", () => {
    expect(
      identificationSchema.safeParse({
        ...validIdentification,
        confidence: 0.699999,
        grade: "Bronze",
        grade_code: 1,
        awarded_xp: 50,
      }).success,
    ).toBe(false);
  });

  it("allows image quality to downgrade a high-confidence capture", () => {
    expect(
      identificationSchema.safeParse({
        ...validIdentification,
        confidence: 0.95,
        grade: "Bronze",
        grade_code: 1,
        awarded_xp: 50,
      }).success,
    ).toBe(true);
  });
});
