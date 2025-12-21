"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import EntitySearch from "./EntitySearch";
import EntityDossier from "./EntityDossier";

export interface EntityInfo {
  id: string;
  type: "wallet" | "token" | "entity" | "contract";
  address?: string;
  symbol?: string;
  name?: string;
}

export default function EntityExplorer() {
  const router = useRouter();
  const [selectedEntity, setSelectedEntity] = useState<EntityInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          {selectedEntity ? (
            <EntityDossier entity={selectedEntity} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-24 h-24 mb-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                Search for an Entity
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                Enter a wallet address, token symbol, contract address, or entity name
                to view their forensic intelligence dossier.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-cyan-400 text-2xl font-bold">6</div>
                  <div className="text-xs text-gray-500">Intel Engines</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-purple-400 text-2xl font-bold">8</div>
                  <div className="text-xs text-gray-500">Dossier Sections</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-green-400 text-2xl font-bold">Live</div>
                  <div className="text-xs text-gray-500">Real-time Updates</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
