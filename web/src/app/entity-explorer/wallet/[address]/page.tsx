"use client";

import { useParams } from "next/navigation";
import EntityExplorerWithEntity from "@/components/entity-explorer/EntityExplorerWithEntity";

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <EntityExplorerWithEntity
      entityType="wallet"
      entityId={address}
      entityAddress={address}
    />
  );
}
