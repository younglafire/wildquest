import { redirect } from "next/navigation";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchAddress: string }>;
}) {
  const { matchAddress } = await params;
  redirect(`/match/${matchAddress}`);
}
