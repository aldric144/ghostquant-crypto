"use client";

import { useParams } from "next/navigation";
import EntityExplorerWithEntity from "@/components/entity-explorer/EntityExplorerWithEntity";

export default function EntityPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <EntityExplorerWithEntity
      entityType="entity"
      entityId={id}
    />
  );
}
