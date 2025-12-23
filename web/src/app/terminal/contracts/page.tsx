'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
/**
 * GhostQuant Contracts Page
 * Global Distributor Edition (GDE) v3.0
 *
 * Main contracts management page with dashboard, builder, viewer, and export
 */

import React, { useState, useCallback } from "react";
import { DistributorContract } from "./ContractSchema";
import ContractDashboard from "./ContractDashboard";
import ContractBuilder from "./ContractBuilder";
import ContractViewer from "./ContractViewer";
import ContractNegotiation from "./ContractNegotiation";
import ContractExport from "./ContractExport";

type ViewMode =
  | "dashboard"
  | "builder"
  | "viewer"
  | "negotiation"
  | "export";

export default function ContractsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );

  const handleSelectContract = useCallback((contractId: string) => {
    setSelectedContractId(contractId);
    setViewMode("viewer");
  }, []);

  const handleCreateContract = useCallback(() => {
    setViewMode("builder");
  }, []);

  const handleContractCreated = useCallback((contract: DistributorContract) => {
    setSelectedContractId(contract.contract_id);
    setViewMode("viewer");
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedContractId(null);
    setViewMode("dashboard");
  }, []);

  const handleOpenNegotiation = useCallback(() => {
    if (selectedContractId) {
      setViewMode("negotiation");
    }
  }, [selectedContractId]);

  const handleOpenExport = useCallback(() => {
    setViewMode("export");
  }, []);

  const handleNegotiationComplete = useCallback(() => {
    setViewMode("viewer");
  }, []);

  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <TerminalBackButton className="mb-4" />
          <h1 className="text-xl font-bold text-gray-900">
                Contract Management
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={handleBackToDashboard}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  viewMode === "dashboard"
                    ? "border-emerald-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={handleCreateContract}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  viewMode === "builder"
                    ? "border-emerald-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                New Contract
              </button>
              {selectedContractId && (
                <>
                  <button
                    onClick={() => setViewMode("viewer")}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      viewMode === "viewer"
                        ? "border-emerald-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    View Contract
                  </button>
                  <button
                    onClick={handleOpenNegotiation}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      viewMode === "negotiation"
                        ? "border-emerald-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Negotiation
                  </button>
                </>
              )}
              <button
                onClick={handleOpenExport}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  viewMode === "export"
                    ? "border-emerald-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Export
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                GDE v3.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden border-t border-gray-200">
        <div className="pt-2 pb-3 space-y-1">
          <button
            onClick={handleBackToDashboard}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
              viewMode === "dashboard"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={handleCreateContract}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
              viewMode === "builder"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            New Contract
          </button>
          {selectedContractId && (
            <>
              <button
                onClick={() => setViewMode("viewer")}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                  viewMode === "viewer"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                View Contract
              </button>
              <button
                onClick={handleOpenNegotiation}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                  viewMode === "negotiation"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Negotiation
              </button>
            </>
          )}
          <button
            onClick={handleOpenExport}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
              viewMode === "export"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Export
          </button>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (viewMode) {
      case "dashboard":
        return (
          <ContractDashboard
            onSelectContract={handleSelectContract}
            onCreateContract={handleCreateContract}
          />
        );

      case "builder":
        return (
          <ContractBuilder
            onContractCreated={handleContractCreated}
            onCancel={handleBackToDashboard}
          />
        );

      case "viewer":
        if (!selectedContractId) {
          return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No contract selected</p>
              <button
                onClick={handleBackToDashboard}
                className="mt-4 text-emerald-600 hover:text-emerald-700"
              >
                Go to Dashboard
              </button>
            </div>
          );
        }
        return (
          <ContractViewer
            contractId={selectedContractId}
            onClose={handleBackToDashboard}
            onStatusChange={() => {}}
          />
        );

      case "negotiation":
        if (!selectedContractId) {
          return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No contract selected</p>
              <button
                onClick={handleBackToDashboard}
                className="mt-4 text-emerald-600 hover:text-emerald-700"
              >
                Go to Dashboard
              </button>
            </div>
          );
        }
        return (
          <ContractNegotiation
            contractId={selectedContractId}
            onClose={() => setViewMode("viewer")}
            onNegotiationComplete={handleNegotiationComplete}
          />
        );

      case "export":
        return <ContractExport onClose={handleBackToDashboard} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderNavigation()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderContent()}
      </main>
    </div>
  );
}
