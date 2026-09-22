import {
  SolanaError,
  SOLANA_ERROR__FAILED_TO_SEND_TRANSACTION,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
} from "@solana/kit";
import { describe, expect, it } from "vitest";
import {
  isRpcRateLimitError,
  normalizeTransactionError,
} from "./transaction-error";

describe("transaction error messages", () => {
  it("turns a wrapped RPC rate limit into a useful message", () => {
    const rpcError = new SolanaError(SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR, {
      headers: new Headers(),
      message: "Too Many Requests",
      statusCode: 429,
    });
    const sendError = new SolanaError(
      SOLANA_ERROR__FAILED_TO_SEND_TRANSACTION,
      {
        cause: rpcError,
        causeMessage: `: ${rpcError.message}`,
        logs: undefined,
        preflightData: undefined,
        transactionPlanResult: {},
      },
    );

    const normalized = normalizeTransactionError(sendError);

    expect(normalized.message).toBe(
      "Solana Devnet is busy and rejected this request. Wait a moment and try again.",
    );
    expect(normalized.cause).toBe(sendError);
    expect(isRpcRateLimitError(sendError)).toBe(true);
    expect(isRpcRateLimitError(rpcError)).toBe(true);
  });

  it("preserves other transaction errors", () => {
    const error = new Error("Wallet request rejected.");

    expect(normalizeTransactionError(error)).toBe(error);
  });
});
