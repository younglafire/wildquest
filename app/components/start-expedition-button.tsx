"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "../lib/wallet/context";
import { WalletChooser } from "./wallet-chooser";

export function StartExpeditionButton() {
  const router = useRouter();
  const { status } = useWallet();
  const [chooserOpen, setChooserOpen] = useState(false);

  const start = () => {
    if (status === "connected") {
      router.push("/capture");
    } else {
      setChooserOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        Start Expedition
      </button>
      <WalletChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        onConnected={() => router.push("/capture")}
      />
    </>
  );
}
