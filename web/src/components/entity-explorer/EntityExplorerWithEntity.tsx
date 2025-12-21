"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import EntitySearch from "./EntitySearch";
import EntityDossier from "./EntityDossier";
import { EntityInfo } from "./index";

interface EntityExplorerWithEntityProps {
  entityType: "wallet" | "token" | "entity" | "contract";
  entityId: string;
  entityAddress?: string;
  entitySymbol?: string;
}

export default function EntityExplorerWithEntity({
  entityType,
  entityId,
  entityAddress,
  entitySymbol,
}: EntityExplorerWithEntityProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Create initial entity from URL params
  const initialEntity: EntityInfo = {
    id: entityId,
    type: entityType,
    address: entityAddress,
    symbol: entitySymbol,
    name: entityAddress
      ? `${entityAddress.slice(0, 8)}...${entityAddress.slice(-6)}`
      : entitySymbol || entityId,
  };

  const [selectedEntity, setSelectedEntity] = useState<EntityInfo>(initialEntity);

  useEffect(() => {
    // Update selected entity when URL params change
    setSelectedEntity({
      id: entityId,
      type: entityType,
      address: entityAddress,
      symbol: entitySymbol,
      name: entityAddress
        ? `${entityAddress.slice(0, 8)}...${entityAddress.slice(-6)}`
        : entitySymbol || entityId,
    });
  }, [entityId, entityType, entityAddress, entitySymbol]);

  const handleEntitySelect = useCallback(
    (entity: EntityInfo) => {
      setSelectedEntity(entity);

      // Update URL based on entity type
      if (entity.type === "wallet" || entity.type === "contract") {
        router.push(`/entity-explorer/wallet/${entity.address}`);
      } else if (entity.type === "token") {
        router.push(`/entity-explorer/token/${entity.symbol}`);
      } else {
        router.push(`/entity-explorer/entity/${entity.id}`);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen">
        {/* Left Panel - Search */}
        <div className="w-80 border-r border-slate-700 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white mb-1">Entity Explorer</h1>
            <p className="text-sm text-gray-400">Forensic Intelligence Dossiers</p>
          </div>

          <EntitySearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEntitySelect={handleEntitySelect}
            selectedEntity={selectedEntity}
          />
        </div>

        {/* Main Panel - Dossier */}
        <div className="flex-1 overflow-hidden">
          <EntityDossier entity={selectedEntity} />
        </div>
      </div>
    </div>
  );
}
