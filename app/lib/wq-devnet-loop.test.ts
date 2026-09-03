import { describe, expect, it } from "vitest";
import {
  assertReliability,
  extractTransactionSignature,
  requiredSuccessfulRuns,
} from "../../scripts/wq-devnet-loop";

function results(successes: number, total: number) {
  return Array.from({ length: total }, (_, index) => ({
    run: index + 1,
    fixture: `fixture-${index + 1}`,
    succeeded: index < successes,
    durationMs: 1,
  }));
}

describe("WQ-29 reliability threshold", () => {
  it("requires nine successful runs out of ten", () => {
    expect(requiredSuccessfulRuns(10)).toBe(9);
    expect(() => assertReliability(results(9, 10))).not.toThrow();
  });

  it("fails when fewer than 90 percent of runs succeed", () => {
    expect(() => assertReliability(results(8, 10))).toThrow(
      "Devnet reliability was 8/10; 9/10 successful runs are required.",
    );
  });

  it("requires the single WQ-28 loop to succeed", () => {
    expect(requiredSuccessfulRuns(1)).toBe(1);
    expect(() => assertReliability(results(0, 1))).toThrow();
  });
});

describe("transaction reconciliation", () => {
  it("extracts a valid signature from a throttled send error", () => {
    const signature =
      "2P1wtPkTs7eNbjSpz7rRc9CesftA9oDSX5wmm9BCTCu9GvtwR4qAFRNHB1MpbkHK3PBaXbefpkQQSEfcjNpBvsx7";
    expect(
      extractTransactionSignature(
        `Failed to send transaction (${signature}): HTTP error (429)`,
      ),
    ).toBe(signature);
  });

  it("rejects messages without a valid transaction signature", () => {
    expect(extractTransactionSignature("HTTP error (429)")).toBeNull();
  });
});
