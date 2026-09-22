import {
  isSolanaError,
  SOLANA_ERROR__FAILED_TO_SEND_TRANSACTION,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
} from "@solana/kit";

const DEVNET_RATE_LIMIT_MESSAGE =
  "Solana Devnet is busy and rejected this request. Wait a moment and try again.";

export function isRpcRateLimitError(error: unknown): boolean {
  const rpcError = isSolanaError(
    error,
    SOLANA_ERROR__FAILED_TO_SEND_TRANSACTION,
  )
    ? error.cause
    : error;

  return (
    isSolanaError(rpcError, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR) &&
    rpcError.context.statusCode === 429
  );
}

export function normalizeTransactionError(thrownObject: unknown): Error {
  const error =
    thrownObject instanceof Error
      ? thrownObject
      : new Error(`Non-Error thrown: ${String(thrownObject)}`);

  if (isRpcRateLimitError(error)) {
    return new Error(DEVNET_RATE_LIMIT_MESSAGE, { cause: error });
  }

  return error;
}
