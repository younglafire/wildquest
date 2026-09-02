import { describe, expect, it } from "vitest";
import { parseDiscoveryReservationResult } from "./duplicate";

const malformedReservationResults: unknown[] = [
  [],
  [{ accepted: true, distance: 0 }],
  [{ accepted: false, distance: null }],
  [{ accepted: false, distance: 6 }],
  [{ accepted: false, distance: 2, wallet: "private" }],
];

describe("discovery reservation result", () => {
  it("maps an accepted reservation", () => {
    expect(
      parseDiscoveryReservationResult([{ accepted: true, distance: null }]),
    ).toEqual({ duplicate: false });
  });

  it("maps a duplicate reservation without exposing stored metadata", () => {
    expect(
      parseDiscoveryReservationResult([{ accepted: false, distance: 3 }]),
    ).toEqual({ duplicate: true, distance: 3 });
  });

  it.each(malformedReservationResults)(
    "rejects malformed reservation output",
    (value) => {
      expect(() => parseDiscoveryReservationResult(value)).toThrow();
    },
  );
});
