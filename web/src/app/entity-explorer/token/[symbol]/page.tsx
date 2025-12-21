"use client";

import { useParams } from "next/navigation";
import EntityExplorerWithEntity from "@/components/entity-explorer/EntityExplorerWithEntity";

export default function TokenPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  return (
    <EntityExplorerWithEntity
      entityType="token"
      entityId={symbol}
      entitySymbol={symbol}
    />
  );
}
