import { describe, expect, it } from "vitest";
import { getCaptureTransactionError } from "./capture-experience";

describe("capture ownership recovery messages", () => {
  it("keeps a rejected-wallet result retryable", () => {
    expect(
      getCaptureTransactionError(new Error("User rejected the request")),
    ).toMatch(/saved here.*try again/i);
  });

  it("explains the one-per-species ownership rule", () => {
    expect(
      getCaptureTransactionError(new Error("account already in use")),
    ).toMatch(/already own this exact Creature/i);
  });

  it("preserves a specific unknown failure", () => {
    expect(getCaptureTransactionError(new Error("RPC unavailable"))).toBe(
      "RPC unavailable",
    );
  });

  it("surfaces the simulation cause instead of the RPC wrapper", () => {
    expect(
      getCaptureTransactionError(
        new Error("Transaction simulation failed", {
          cause: new Error("insufficient funds for rent"),
        }),
      ),
    ).toBe(
      "Your wallet does not have enough Devnet SOL to create the Creature account.",
    );
  });
});
