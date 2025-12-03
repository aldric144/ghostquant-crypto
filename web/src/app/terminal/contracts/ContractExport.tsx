"use client";

/**
 * GhostQuant Contract Export Component
 * Global Distributor Edition (GDE) v3.0
 *
 * Export functionality for contracts with multiple format options
 */

import React, { useState, useCallback } from "react";
import {
  ContractStatus,
  DistributorTier,
  RegionCode,
  ContractType,
  CONTRACT_STATUS_LABELS,
  DISTRIBUTOR_TIER_LABELS,
  REGION_LABELS,
  CONTRACT_TYPE_LABELS,
} from "./ContractSchema";
import { contractClient, formatDateTime } from "./ContractClient";

interface ContractExportProps {
  onClose?: () => void;
}

type ExportFormat = "json" | "csv" | "pdf";

interface ExportFilters {
  status: ContractStatus | "all";
  tier: DistributorTier | "all";
  region: RegionCode | "all";
  contractType: ContractType | "all";
  dateFrom: string;
  dateTo: string;
}

export default function ContractExport({ onClose }: ContractExportProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExportFilters>({
    status: "all",
    tier: "all",
    region: "all",
    contractType: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [includeOptions, setIncludeOptions] = useState({
    distributor: true,
    terms: true,
    territories: true,
    pricing: true,
    compliance: true,
    amendments: true,
    analytics: false,
  });

  const handleFilterChange = useCallback(
    (field: keyof ExportFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleIncludeToggle = useCallback(
    (field: keyof typeof includeOptions) => {
      setIncludeOptions((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    []
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await contractClient.exportContracts(format);

      if (response.success && response.data) {
        let filteredData = response.data;

        if (filters.status !== "all") {
          filteredData = filteredData.filter(
            (c: Record<string, unknown>) => c.status === filters.status
          );
        }
        if (filters.tier !== "all") {
          filteredData = filteredData.filter(
            (c: Record<string, unknown>) =>
              (c.terms as Record<string, unknown>)?.distributor_tier === filters.tier
          );
        }

        let content: string;
        let mimeType: string;
        let filename: string;

        if (format === "json") {
          content = JSON.stringify(filteredData, null, 2);
          mimeType = "application/json";
          filename = `contracts_export_${Date.now()}.json`;
        } else if (format === "csv") {
          content = convertToCSV(filteredData);
          mimeType = "text/csv";
          filename = `contracts_export_${Date.now()}.csv`;
        } else {
          content = JSON.stringify(filteredData, null, 2);
          mimeType = "application/json";
          filename = `contracts_export_${Date.now()}.json`;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSuccess(
          `Successfully exported ${filteredData.length} contracts as ${format.toUpperCase()}`
        );
      } else {
        setError("Failed to export contracts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [format, filters]);

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return "";

    const headers = [
      "contract_id",
      "contract_number",
      "status",
      "distributor_name",
      "distributor_tier",
      "contract_type",
      "effective_date",
      "expiration_date",
      "currency",
      "total_commitment",
      "created_at",
    ];

    const rows = data.map((contract) => {
      const distributor = contract.distributor as Record<string, unknown>;
      const terms = contract.terms as Record<string, unknown>;
      const commitments = (terms?.commitments as Array<Record<string, number>>) || [];
      const totalCommitment = commitments.reduce(
        (sum, c) => sum + (c.minimum_revenue_commitment || 0),
        0
      );

      return [
        contract.contract_id,
        contract.contract_number,
        contract.status,
        distributor?.company_name || "",
        terms?.distributor_tier || "",
        terms?.contract_type || "",
        terms?.effective_date || "",
        terms?.expiration_date || "",
        terms?.currency || "",
        totalCommitment,
        contract.created_at,
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Export Contracts</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Export Format
          </h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setFormat("json")}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                format === "json"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <svg
                  className={`h-8 w-8 ${
                    format === "json" ? "text-emerald-600" : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <span className="font-medium">JSON</span>
              <p className="text-xs text-gray-500 mt-1">
                Full data with nested objects
              </p>
            </button>

            <button
              onClick={() => setFormat("csv")}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                format === "csv"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <svg
                  className={`h-8 w-8 ${
                    format === "csv" ? "text-emerald-600" : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-medium">CSV</span>
              <p className="text-xs text-gray-500 mt-1">
                Spreadsheet compatible
              </p>
            </button>

            <button
              onClick={() => setFormat("pdf")}
              disabled
              className={`flex-1 p-4 rounded-lg border-2 transition-colors opacity-50 cursor-not-allowed ${
                format === "pdf"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-medium">PDF</span>
              <p className="text-xs text-gray-500 mt-1">Coming soon</p>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tier
              </label>
              <select
                value={filters.tier}
                onChange={(e) => handleFilterChange("tier", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Tiers</option>
                {Object.entries(DISTRIBUTOR_TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Regions</option>
                {Object.entries(REGION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Contract Type
              </label>
              <select
                value={filters.contractType}
                onChange={(e) =>
                  handleFilterChange("contractType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Effective To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Include Sections
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(includeOptions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    handleIncludeToggle(key as keyof typeof includeOptions)
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <div className="text-sm text-gray-500">
          Export will include all matching contracts
        </div>
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
