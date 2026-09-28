import "server-only";

import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const IP_REQUEST_LIMIT = 10;
const WALLET_REQUEST_LIMIT = 5;

export type IdentifyRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function hashBucket(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function consumeBucket(bucket: string, limit: number) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_bucket_hash: hashBucket(bucket),
    p_limit: limit,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (error) throw error;
  const result = data[0];
  if (!result) throw new Error("Rate limit result is missing.");
  return {
    allowed: result.allowed,
    retryAfterSeconds: result.retry_after_seconds,
  };
}

export async function checkIdentifyRateLimit(
  request: Request,
  wallet: string,
): Promise<IdentifyRateLimitResult> {
  const forwardedFor =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const clientAddress = forwardedFor.split(",", 1)[0]!.trim() || "unknown";
  const [ipResult, walletResult] = await Promise.all([
    consumeBucket(`identify:ip:${clientAddress}`, IP_REQUEST_LIMIT),
    consumeBucket(`identify:wallet:${wallet}`, WALLET_REQUEST_LIMIT),
  ]);
  return {
    allowed: ipResult.allowed && walletResult.allowed,
    retryAfterSeconds: Math.max(
      ipResult.retryAfterSeconds,
      walletResult.retryAfterSeconds,
    ),
  };
}
